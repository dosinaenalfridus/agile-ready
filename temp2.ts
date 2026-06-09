import { getNeo4jDriver } from "./lib/neo4j";

async function run() {
  const driver = getNeo4jDriver();
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (emp:User {role: 'employee'})-[:BELONGS_TO]->(c:Company)
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
    `);

    let totalSaafPercent = 0;
    let totalAiPercent = 0;
    let completedAssessments = 0;

    result.records.forEach(record => {
      const hasSubmitted = record.get("hasSubmitted");
      const saafScore = record.get("saafScore").toNumber();
      const aiScore = record.get("aiScore").toNumber();

      if (hasSubmitted) {
        completedAssessments++;
        totalSaafPercent += (saafScore / 225) * 100;
        totalAiPercent += (aiScore / 50) * 100;
      }
    });

    const avgSaaf = completedAssessments > 0 ? totalSaafPercent / completedAssessments : 0;
    const avgAi = completedAssessments > 0 ? totalAiPercent / completedAssessments : 0;

    console.log(`Avg SAAF: ${avgSaaf.toFixed(1)}%`);
    console.log(`Avg AI: ${avgAi.toFixed(1)}%`);
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}
run();
