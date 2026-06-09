import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";
import bcrypt from "bcryptjs";

// === CREATE EMPLOYEE ===
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password, name, nip, division } = await request.json();

    if (!username || !password || !name || !nip || !division) {
      return Response.json(
        { error: "Username, password, name, nip, and division are required" },
        { status: 400 }
      );
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      const userCheck = await dbSession.run(
        'MATCH (u:User {username: $username}) RETURN u',
        { username }
      );

      if (userCheck.records.length > 0) {
        return Response.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const adminUsername = session.user.id || session.user.name;
      const companyCode = session.user.companyCode;

      await dbSession.run(
        `
        MATCH (admin:User {username: $adminUsername})
        MATCH (c:Company {companyCode: $companyCode})
        CREATE (emp:User {
          username: $username,
          passwordHash: $passwordHash,
          rawPassword: $rawPassword,
          name: $name,
          nip: $nip,
          division: $division,
          role: 'employee',
          createdAt: datetime()
        })
        CREATE (emp)-[:CREATED_BY]->(admin)
        CREATE (emp)-[:BELONGS_TO]->(c)
        `,
        { 
          username, 
          passwordHash, 
          rawPassword: password, // SAVED AS PLAINTEXT FOR DEMO PURPOSES
          name, 
          nip, 
          division, 
          adminUsername, 
          companyCode 
        }
      );

      return Response.json(
        { success: true, message: "Employee created successfully" },
        { status: 201 }
      );
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Employee creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// === GET EMPLOYEES ===
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      const companyCode = session.user.companyCode;

      const result = await dbSession.run(
        `
        MATCH (emp:User {role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
        RETURN 
          emp.username AS username, 
          emp.name AS name,
          emp.nip AS nip,
          emp.division AS division,
          emp.rawPassword AS rawPassword,
          emp.createdAt AS createdAt
        ORDER BY emp.createdAt DESC
        `,
        { companyCode }
      );

      const employees = result.records.map(record => ({
        username: record.get("username"),
        name: record.get("name") || "",
        nip: record.get("nip") || "",
        division: record.get("division") || "",
        rawPassword: record.get("rawPassword") || "Hidden",
        createdAt: record.get("createdAt").toString(),
      }));

      return Response.json({ employees }, { status: 200 });
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Fetch employees error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// === UPDATE EMPLOYEE ===
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldUsername, username, password, name, nip, division } = await request.json();

    if (!oldUsername || !username || !name || !nip || !division) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      const companyCode = session.user.companyCode;
      
      // If updating username, check uniqueness
      if (oldUsername !== username) {
        const checkResult = await dbSession.run('MATCH (u:User {username: $username}) RETURN u', { username });
        if (checkResult.records.length > 0) {
          return Response.json({ error: "New username already exists" }, { status: 400 });
        }
      }

      let cypher = `
        MATCH (emp:User {username: $oldUsername, role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
        SET emp.username = $username, emp.name = $name, emp.nip = $nip, emp.division = $division
      `;
      
      const params: any = { oldUsername, username, name, nip, division, companyCode };

      if (password && password.trim() !== "") {
        const passwordHash = await bcrypt.hash(password, 10);
        cypher += `, emp.passwordHash = $passwordHash, emp.rawPassword = $rawPassword`;
        params.passwordHash = passwordHash;
        params.rawPassword = password;
      }

      cypher += ` RETURN emp.username`;

      const result = await dbSession.run(cypher, params);

      if (result.records.length === 0) {
        return Response.json({ error: "Employee not found or unauthorized" }, { status: 404 });
      }

      return Response.json({ success: true, message: "Employee updated successfully" }, { status: 200 });
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Update employee error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// === DELETE EMPLOYEE ===
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      const companyCode = session.user.companyCode;
      
      const result = await dbSession.run(
        `
        MATCH (emp:User {username: $username, role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
        OPTIONAL MATCH (emp)-[:SUBMITTED]->(s:Submission)-[:HAS_RESPONSE]->(r:Response)
        DETACH DELETE emp, s, r
        RETURN count(emp) as deleted
        `,
        { username, companyCode }
      );

      if (result.records[0].get("deleted").toNumber() === 0) {
        return Response.json({ error: "Employee not found or unauthorized" }, { status: 404 });
      }

      return Response.json({ success: true, message: "Employee deleted successfully" }, { status: 200 });
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
