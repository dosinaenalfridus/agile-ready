import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const username = process.env.NEO4J_USERNAME || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const DIVISIONS = [
  "DIREKTUR",
  "GENERAL MANAGER",
  "MANAGER",
  "PROCESS OWNER",
  "BUSINESS ANALYST",
  "USER REPRESENTATIVE",
  "DEVELOPER",
  "QA",
  "SYSTEM ANALYST",
  "DEVOPS",
  "PROJECT MANAGER",
  "PMO",
];

const FIRST_NAMES = [
  "Budi", "Andi", "Siti", "Dewi", "Rina", "Agus", "Hendra", "Ayu", "Putri", "Dian",
  "Fajar", "Gilang", "Rizky", "Eko", "Bambang", "Rini", "Wati", "Arif", "Joko", "Tari"
];

const LAST_NAMES = [
  "Santoso", "Wijaya", "Kusuma", "Lestari", "Pratama", "Sari", "Setiawan", "Saputra", "Wahyudi", "Nugroho",
  "Putra", "Hidayat", "Purnama", "Siregar", "Harahap", "Simanjuntak", "Prabowo", "Wibowo", "Susanto", "Gunawan"
];

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  const session = driver.session();
  try {
    // Get the existing company
    const compResult = await session.run(`MATCH (c:Company) RETURN c.companyCode AS code LIMIT 1`);
    if (compResult.records.length === 0) {
      console.log("No company found in the database to assign employees to!");
      return;
    }
    const companyCode = compResult.records[0].get("code");
    console.log(`Targeting Company Code: ${companyCode}`);

    const rawPass = "password123";
    const hashedPass = await bcrypt.hash(rawPass, 10);

    for (let i = 0; i < 30; i++) {
      const fName = getRandomItem(FIRST_NAMES);
      const lName = getRandomItem(LAST_NAMES);
      const name = `${fName} ${lName}`;
      // Combined lowercase without space
      const empUsername = name.toLowerCase().replace(/\s/g, "");
      const division = getRandomItem(DIVISIONS);
      const nip = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;

      await session.run(
        `
        MATCH (c:Company {companyCode: $companyCode})
        MERGE (emp:User {username: $username})
        ON CREATE SET 
          emp.password = $hashedPassword,
          emp.rawPassword = $rawPassword,
          emp.name = $name,
          emp.nip = $nip,
          emp.division = $division,
          emp.role = 'employee',
          emp.createdAt = datetime()
        MERGE (emp)-[:BELONGS_TO]->(c)
        `,
        {
          companyCode,
          username: empUsername,
          hashedPassword: hashedPass,
          rawPassword: rawPass,
          name,
          nip,
          division
        }
      );
      
      console.log(`Inserted: ${name} (${empUsername}) - ${division}`);
    }

    console.log("Successfully inserted 30 dummy employees.");
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
  }
}

run();
