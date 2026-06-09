import { NextResponse } from "next/server";
import { getNeo4jDriver } from "@/lib/neo4j";

export async function POST(request: Request) {
  try {
    const { companyCode } = await request.json();

    if (!companyCode) {
      return NextResponse.json(
        { error: "Company code is required" },
        { status: 400 }
      );
    }

    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const result = await session.run(
        'MATCH (c:Company {companyCode: $companyCode}) RETURN c.name AS companyName',
        { companyCode }
      );

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: "Invalid company code" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, companyName: result.records[0].get("companyName") },
        { status: 200 }
      );
    } finally {
      await session.close();
    }
  } catch (error: any) {
    console.error("Verify company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
