// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  disableLosslessIntegers: true
});

app.post('/api/cypher', async (req, res) => {
  const { cypher, params } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(cypher, params || {});
    // 将 neo4j result.records 转化为简单数组对象
    const records = result.records.map(record => {
      const obj = {};
      record.keys.forEach(k => {
        const v = record.get(k);
        obj[k] = v;
      });
      return obj;
    });
    // 你可以直接返回 records，或者在后端做更复杂的适配
    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Neo4j proxy listening on http://localhost:${port}`);
});