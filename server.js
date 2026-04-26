const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const URI = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/?authSource=admin';
let db;

MongoClient.connect(URI)
  .then(c => { db = c.db('assetsDB'); console.log('✅ MongoDB · assetsDB'); })
  .catch(e => { console.error('❌', e.message); process.exit(1); });

app.get('/api/stats', async (req, res) => {
  try {
    const total = await db.collection('models').countDocuments();
    res.json({ total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/query', async (req, res) => {
  const { operation, filter = {}, options = {} } = req.body;
  const t0 = Date.now();
  try {
    const col = db.collection('models');
    let result;
    if (operation === 'find') {
      let cur = col.find(filter);
      if (options.sort) cur = cur.sort(options.sort);
      cur = cur.limit(options.limit || 12);
      result = await cur.toArray();
    } else if (operation === 'aggregate') {
      result = await col.aggregate(filter).toArray();
    } else if (operation === 'count') {
      result = await col.countDocuments(filter);
    } else {
      return res.status(400).json({ success: false, error: 'Unknown operation' });
    }
    res.json({
      success: true,
      result,
      count: Array.isArray(result) ? result.length : result,
      elapsed: Date.now() - t0
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API → http://localhost:${PORT}`);
  console.log('   Run seed first: node seed.js');
});
