import { getNeo4jDriver } from "./lib/neo4j";

async function run() {
  const driver = getNeo4jDriver();
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User)-[:SUBMITTED]->(s:Submission)-[:HAS_RESPONSE]->(r:Response)-[:ANSWERS]->(q:Question)
      RETURN u.username AS username, count(r) AS count
    `);
    console.log(result.records.map(rec => ({ username: rec.get("username"), count: rec.get("count").toNumber() })));
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}
run();
