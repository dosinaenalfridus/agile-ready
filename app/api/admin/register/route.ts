import { NextResponse } from "next/server";
import { getNeo4jDriver } from "@/lib/neo4j";
import bcrypt from "bcryptjs";

// Helper to generate random 6-character string
function generateCompanyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const { companyName, username, password } = await request.json();

    if (!companyName || !username || !password) {
      return Response.json(
        { error: "Company name, username, and password are required" },
        { status: 400 }
      );
    }

    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      // Check if username already exists
      const userCheck = await session.run(
        'MATCH (u:User {username: $username}) RETURN u',
        { username }
      );

      if (userCheck.records.length > 0) {
        return Response.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      let companyCode = generateCompanyCode();
      
      // Ensure company code is unique (basic implementation)
      let codeUnique = false;
      while (!codeUnique) {
        const codeCheck = await session.run(
          'MATCH (c:Company {companyCode: $companyCode}) RETURN c',
          { companyCode }
        );
        if (codeCheck.records.length === 0) {
          codeUnique = true;
        } else {
          companyCode = generateCompanyCode();
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create Company and User, and link them
      await session.run(
        `
        CREATE (c:Company {
          name: $companyName,
          companyCode: $companyCode,
          createdAt: datetime()
        })
        CREATE (u:User {
          username: $username,
          passwordHash: $passwordHash,
          role: 'admin',
          createdAt: datetime()
        })
        CREATE (u)-[:BELONGS_TO]->(c)
        `,
        { companyName, companyCode, username, passwordHash }
      );

      return Response.json(
        { success: true, message: "Admin registered successfully", companyCode },
        { status: 201 }
      );
    } finally {
      await session.close();
    }
  } catch (error: any) {
    console.error("Admin registration error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
