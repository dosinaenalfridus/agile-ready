import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNeo4jDriver } from "@/lib/neo4j";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      const result = await dbSession.run(
        `MATCH (q:Question) RETURN q.id AS id, q.text AS text, q.type AS type, q.dimension AS dimension ORDER BY q.id ASC`
      );

      const questions = result.records.map(record => ({
        id: record.get("id"),
        text: record.get("text"),
        type: record.get("type"),
        dimension: record.get("dimension")
      }));

      return Response.json({ questions }, { status: 200 });
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Fetch questions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await request.json(); // answers is { [questionId]: score }
    const username = session.user.id || session.user.name;

    if (!answers || Object.keys(answers).length === 0) {
      return Response.json({ error: "Answers are required" }, { status: 400 });
    }

    const driver = getNeo4jDriver();
    const dbSession = driver.session();

    try {
      // Map answers to an array of objects
      const responses = Object.entries(answers).map(([questionId, score]) => ({
        questionId,
        score: Number(score)
      }));

      // Create submission and all responses in one transaction
      await dbSession.run(
        `
        MATCH (u:User {username: $username})
        CREATE (s:Submission {createdAt: datetime()})
        CREATE (u)-[:SUBMITTED]->(s)
        WITH s
        UNWIND $responses AS resp
        MATCH (q:Question {id: resp.questionId})
        CREATE (r:Response {score: toInteger(resp.score)})
        CREATE (s)-[:HAS_RESPONSE]->(r)
        CREATE (r)-[:ANSWERS]->(q)
        `,
        { username, responses }
      );

      return Response.json({ success: true, message: "Assessment submitted" }, { status: 201 });
    } finally {
      await dbSession.close();
    }
  } catch (error: any) {
    console.error("Submit assessment error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
