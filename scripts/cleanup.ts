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
    // Delete all submissions and responses to clean up corrupted state from reseeding
    await session.run(`MATCH (s:Submission) DETACH DELETE s`);
    await session.run(`MATCH (r:Response) DETACH DELETE r`);
    console.log("Cleaned up orphaned submissions and responses.");
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
