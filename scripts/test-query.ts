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
    const dbResult = await session.run(
      `
      MATCH (emp:User {role: 'employee'})
      OPTIONAL MATCH (emp)-[:SUBMITTED]->(s:Submission)
      OPTIONAL MATCH (s)-[:HAS_RESPONSE]->(r:Response)-[:ANSWERS]->(q:Question)
      WITH emp, s, q.type AS qType, sum(r.score) AS rawScore
      WITH emp, s, 
           sum(CASE WHEN qType = 'SAAF' THEN rawScore ELSE 0 END) AS saafScore,
           sum(CASE WHEN qType = 'AI' THEN rawScore ELSE 0 END) AS aiScore
      RETURN emp.username AS username, 
             s IS NOT NULL AS hasSubmitted, 
             saafScore, 
             aiScore
      LIMIT 3
      `
    );

    console.log(dbResult.records.map(rec => ({
      username: rec.get("username"),
      hasSubmitted: rec.get("hasSubmitted"),
      saafScore: rec.get("saafScore") ? rec.get("saafScore").toNumber() : null,
      aiScore: rec.get("aiScore") ? rec.get("aiScore").toNumber() : null
    })));
  } catch(e) {
    console.error(e);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
