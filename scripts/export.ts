import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import fs from "fs";
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
    let mdContent = `# AREA 52: Database Migration Script\n`;
    mdContent += `*Gunakan query Cypher di bawah ini pada Neo4j Browser atau Cypher Shell di server Production Anda untuk memigrasikan seluruh struktur dan data dummy.*\n\n`;
    mdContent += `> **PENTING**: Pastikan Neo4j Production Anda dalam keadaan KOSONG sebelum menjalankan query ini untuk menghindari duplikasi data.\n\n`;

    // 1. Companies
    const compRes = await session.run(`MATCH (n:Company) RETURN properties(n) AS props`);
    const companies = compRes.records.map(r => r.get('props'));

    // 2. Users
    const userRes = await session.run(`MATCH (n:User) RETURN properties(n) AS props`);
    const users = userRes.records.map(r => r.get('props'));

    // 3. Questions
    const qRes = await session.run(`MATCH (n:Question) RETURN properties(n) AS props`);
    const questions = qRes.records.map(r => r.get('props'));

    // 4. Submissions (needs ID tracking for rels)
    const subRes = await session.run(`MATCH (n:Submission) RETURN id(n) as internalId, properties(n) AS props`);
    const submissions = subRes.records.map(r => ({ internalId: r.get('internalId').toNumber(), props: r.get('props') }));

    // 5. Responses (needs ID tracking)
    const respRes = await session.run(`MATCH (n:Response) RETURN id(n) as internalId, properties(n) AS props`);
    const responses = respRes.records.map(r => ({ internalId: r.get('internalId').toNumber(), props: r.get('props') }));

    // 6. Relationships
    const relUserComp = await session.run(`MATCH (u:User)-[:BELONGS_TO]->(c:Company) RETURN u.username as username, c.companyCode as code`);
    const relSub = await session.run(`MATCH (u:User)-[:SUBMITTED]->(s:Submission) RETURN u.username as username, id(s) as sId`);
    const relHasResp = await session.run(`MATCH (s:Submission)-[:HAS_RESPONSE]->(r:Response) RETURN id(s) as sId, id(r) as rId`);
    const relAns = await session.run(`MATCH (r:Response)-[:ANSWERS]->(q:Question) RETURN id(r) as rId, q.id as qId`);

    mdContent += `## 1. Create Companies & Questions\n`;
    mdContent += `Jalankan query ini pertama:\n\`\`\`cypher\n`;
    if (companies.length > 0) {
      mdContent += `UNWIND ${JSON.stringify(companies)} AS cProps\n`;
      mdContent += `CREATE (c:Company) SET c = cProps;\n`;
    }
    if (questions.length > 0) {
      mdContent += `UNWIND ${JSON.stringify(questions)} AS qProps\n`;
      mdContent += `CREATE (q:Question) SET q = qProps;\n`;
    }
    mdContent += `\`\`\`\n\n`;

    mdContent += `## 2. Create Users & BELONGS_TO Relationships\n`;
    mdContent += `\`\`\`cypher\n`;
    if (users.length > 0) {
      mdContent += `UNWIND ${JSON.stringify(users)} AS uProps\n`;
      mdContent += `CREATE (u:User) SET u = uProps;\n`;
    }
    const belongsTo = relUserComp.records.map(r => ({ username: r.get('username'), code: r.get('code') }));
    if (belongsTo.length > 0) {
      mdContent += `WITH 1 AS dummy\nUNWIND ${JSON.stringify(belongsTo)} AS rel\n`;
      mdContent += `MATCH (u:User {username: rel.username}), (c:Company {companyCode: rel.code})\n`;
      mdContent += `CREATE (u)-[:BELONGS_TO]->(c);\n`;
    }
    mdContent += `\`\`\`\n\n`;

    mdContent += `## 3. Create Submissions & Responses (Massive Transaction)\n`;
    mdContent += `Karena Neo4j tidak memiliki auto-increment string ID pada Submission/Response, kita mem-bundle data relasinya langsung. Script ini akan me-rekonstruksi hirarki submission per user.\n`;
    mdContent += `\`\`\`cypher\n`;

    // Map responses to submissions to users
    const submissionTree = [];
    const relSubArr = relSub.records.map(r => ({ username: r.get('username'), sId: r.get('sId').toNumber() }));
    const relHasRespArr = relHasResp.records.map(r => ({ sId: r.get('sId').toNumber(), rId: r.get('rId').toNumber() }));
    const relAnsArr = relAns.records.map(r => ({ rId: r.get('rId').toNumber(), qId: r.get('qId') }));

    for (const subLink of relSubArr) {
      const subNode = submissions.find(s => s.internalId === subLink.sId);
      const childHasResp = relHasRespArr.filter(r => r.sId === subLink.sId);
      
      const responsesForSub = [];
      for (const hr of childHasResp) {
        const respNode = responses.find(r => r.internalId === hr.rId);
        const ansLink = relAnsArr.find(a => a.rId === hr.rId);
        if(respNode && ansLink) {
           responsesForSub.push({
             score: respNode.props.score,
             qId: ansLink.qId
           });
        }
      }

      submissionTree.push({
        username: subLink.username,
        createdAt: subNode ? subNode.props.createdAt.toString() : new Date().toISOString(),
        responses: responsesForSub
      });
    }

    // Dump massive array
    mdContent += `UNWIND ${JSON.stringify(submissionTree)} AS tree\n`;
    mdContent += `MATCH (u:User {username: tree.username})\n`;
    mdContent += `CREATE (s:Submission {createdAt: tree.createdAt})\n`;
    mdContent += `CREATE (u)-[:SUBMITTED]->(s)\n`;
    mdContent += `WITH s, tree.responses AS resps\n`;
    mdContent += `UNWIND resps AS resp\n`;
    mdContent += `MATCH (q:Question {id: resp.qId})\n`;
    mdContent += `CREATE (r:Response {score: toInteger(resp.score)})\n`;
    mdContent += `CREATE (s)-[:HAS_RESPONSE]->(r)\n`;
    mdContent += `CREATE (r)-[:ANSWERS]->(q);\n`;

    mdContent += `\`\`\`\n`;

    fs.writeFileSync(path.resolve(__dirname, "../area52.md"), mdContent);
    console.log("area52.md has been generated!");

  } catch(e) {
    console.error(e);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
