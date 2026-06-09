import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const username = process.env.NEO4J_USERNAME || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

async function run() {
  const session = driver.session();
  try {
    // 1. Get all questions
    const qResult = await session.run(`MATCH (q:Question) RETURN q.id AS id`);
    const questions = qResult.records.map((r) => r.get("id"));

    if (questions.length === 0) {
      console.log("No questions found in the database. Run seed.ts first.");
      return;
    }

    // 2. Get all employees who have NOT submitted an assessment
    const empResult = await session.run(`
      MATCH (u:User {role: 'employee'})
      WHERE NOT (u)-[:SUBMITTED]->(:Submission)
      RETURN u.username AS username
    `);

    const unsubmittedEmployees = empResult.records.map((r) => r.get("username"));

    if (unsubmittedEmployees.length === 0) {
      console.log("All employees have already submitted an assessment!");
      return;
    }

    console.log(`Found ${unsubmittedEmployees.length} employees who need mock submissions.`);

    // 3. For each employee, generate random responses and save
    let successCount = 0;
    for (const empUsername of unsubmittedEmployees) {
      const responses = questions.map((qId) => ({
        questionId: qId,
        score: Math.floor(Math.random() * 4) + 2, // Random score between 2 and 5
      }));

      await session.run(
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
        { username: empUsername, responses }
      );
      
      console.log(`Mocked assessment for employee: ${empUsername}`);
      successCount++;
    }

    console.log(`\nSuccessfully mocked assessments for ${successCount} employees.`);
  } catch (err) {
    console.error("Error mocking submissions:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
