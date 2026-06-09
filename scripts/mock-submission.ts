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
    // Get an employee
    const empResult = await session.run(`MATCH (u:User {role: 'employee'}) RETURN u.username AS username LIMIT 1`);
    if (empResult.records.length === 0) {
      console.log("No employees found to mock.");
      return;
    }
    const empUsername = empResult.records[0].get("username");

    // Check if already submitted
    const checkResult = await session.run(`MATCH (u:User {username: $username})-[:SUBMITTED]->(s:Submission) RETURN s`, { username: empUsername });
    if (checkResult.records.length > 0) {
      console.log(`Employee ${empUsername} already has a submission.`);
      return;
    }

    // Get all questions
    const qResult = await session.run(`MATCH (q:Question) RETURN q.id AS id`);
    const questions = qResult.records.map(r => r.get("id"));

    if (questions.length === 0) {
      console.log("No questions found.");
      return;
    }

    const responses = questions.map(qId => ({
      questionId: qId,
      // random score between 3 and 5
      score: Math.floor(Math.random() * 3) + 3
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

    console.log(`Successfully mocked assessment submission for employee: ${empUsername}`);
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
