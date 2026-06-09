const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = process.env.MCP_PORT || 3001;

app.use(express.json());

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

// Endpoint to run a Cypher query
app.post('/mcp/query', async (req, res) => {
  const { query, params } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const session = driver.session();
  try {
    const result = await session.run(query, params || {});
    const records = result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        obj[key] = record.get(key);
      });
      return obj;
    });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

// Endpoint to fetch schema (Node labels and Relationship types)
app.get('/mcp/schema', async (req, res) => {
  const session = driver.session();
  try {
    const labelsResult = await session.run('CALL db.labels() YIELD label RETURN label');
    const labels = labelsResult.records.map(r => r.get('label'));

    const relsResult = await session.run('CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType');
    const relationships = relsResult.records.map(r => r.get('relationshipType'));

    res.json({ success: true, schema: { labels, relationships } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`Neo4j MCP Server running at http://localhost:${port}`);
  console.log(`- POST /mcp/query { query: string, params: object }`);
  console.log(`- GET /mcp/schema`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});
