import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import path from "path";

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const username = process.env.NEO4J_USERNAME || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const SAAF_DIMENSIONS = [
  "Collaborative",
  "Evolutionary",
  "Integrated",
  "Adaptive",
  "Encompassing",
];

const AI_DIMENSIONS = ["Infrastructure", "Skills", "Policy"];

const questions: Array<{ id: string; text: string; type: string; dimension: string }> = [];

let qId = 1;

// Generate 45 SAAF Questions (9 per dimension)
SAAF_DIMENSIONS.forEach((dim) => {
  for (let i = 1; i <= 9; i++) {
    questions.push({
      id: `Q${qId++}`,
      text: `Apakah tim Anda menjalankan prinsip Agile ${dim} ke-${i} dengan efektif?`,
      type: "SAAF",
      dimension: dim,
    });
  }
});

// Generate 10 AI Questions (distributed)
for (let i = 1; i <= 10; i++) {
  const dim = AI_DIMENSIONS[i % AI_DIMENSIONS.length];
  questions.push({
    id: `Q${qId++}`,
    text: `Seberapa siap organisasi Anda terkait faktor ${dim} AI ke-${i}?`,
    type: "AI",
    dimension: dim,
  });
}

async function seed() {
  const session = driver.session();
  try {
    console.log("Clearing existing questions...");
    await session.run("MATCH (q:Question) DETACH DELETE q");

    console.log(`Seeding ${questions.length} questions...`);

    for (const q of questions) {
      await session.run(
        `
        CREATE (q:Question {
          id: $id,
          text: $text,
          type: $type,
          dimension: $dimension
        })
        `,
        q
      );
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
