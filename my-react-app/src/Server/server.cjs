const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.Host,
  user: process.env.User, 
  password: process.env.Password,
  database: 'deca',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to the database.");
    connection.release();
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  }
})();

app.get('/api/PIs', async (req, res) => {
  try {
    const sql = 'SELECT PerformanceIndicator, Meaning FROM PIs WHERE CareerCluster = ?';
    const event = req.query.event;
    const [data] = await pool.query(sql, [event]);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/api/last-index', async (req, res) => {
  try {
    const sql = 'SELECT last_index FROM deca.Users WHERE google_id = ?';
    const id = req.query.googleId;
    const [data] = await pool.query(sql, [id]);
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

app.post('/api/last-index', async (req, res) => {
  try {
    const sql = 'UPDATE Users SET last_index=? WHERE google_id = ?';
    const { googleId, lastIndex } = req.body;
    const [data] = await pool.query(sql, [lastIndex, googleId]);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/PIs', async (req, res) => {
  try {
    const { pis, careerCluster } = req.body;
    const values = pis.map(({ pi, meaning }) => [pi, meaning, careerCluster]);
    const sql = 'INSERT INTO PIs (PerformanceIndicator, Meaning, CareerCluster) VALUES ?';
    const [result] = await pool.query(sql, [values]);
    res.json({ message: 'Performance Indicators inserted successfully!', result });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/PIs/replace', async (req, res) => {
  try {
    const { pis, careerCluster } = req.body;
    const values = pis.map(({ pi, meaning }) => [pi, meaning, careerCluster]);
    await pool.query('DELETE FROM PIs WHERE CareerCluster = ?', [careerCluster]);
    const [result] = await pool.query('INSERT INTO PIs (PerformanceIndicator, Meaning, CareerCluster) VALUES ?', [values]);
    res.json({ message: 'Performance Indicators replaced successfully!', result });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/PIs/update', async (req, res) => {
  const { pis, careerCluster } = req.body;
  try {
    const updates = pis.map(({ pi, meaning, originalPi }) => {
      const sql = `
        UPDATE PIs
        SET PerformanceIndicator = ?, Meaning = ?
        WHERE PerformanceIndicator = ? AND CareerCluster = ?
      `;
      return pool.query(sql, [pi, meaning, originalPi, careerCluster]);
    });
    await Promise.all(updates);
    res.json({ message: "PIs updated successfully" });
  } catch (err) {
    console.error("Error updating PIs:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.post('/api/know-this', async (req, res) => {
  const { GoogleId, PerformanceIndicator, CareerCluster } = req.body;
  if (!GoogleId || !PerformanceIndicator || !CareerCluster) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const sql = `
      INSERT INTO I_Know_This_Terms (GoogleId, PerformanceIndicator, Career_Cluster)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [GoogleId, PerformanceIndicator, CareerCluster]);
    console.log("✅ Inserted into I_Know_This_Terms:", result.insertId);
    res.status(200).json({ message: "Successfully added" });
  } catch (err) {
    console.error("Error inserting into I_Know_This_Terms:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/know-this', async (req, res) => {
  const { googleId, careerCluster } = req.query;
  if (!googleId || !careerCluster) {
    return res.status(400).json({ error: 'Missing googleId or cluster' });
  }
  try {
    const sql = `SELECT PerformanceIndicator FROM I_Know_This_Terms WHERE GoogleId = ? AND Career_Cluster = ?`;
    const [results] = await pool.query(sql, [googleId, careerCluster]);
    const knownIndicators = results.map(row => row.PerformanceIndicator);
    res.json(knownIndicators);
  } catch (err) {
    console.error("Error fetching known terms:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete('/api/know-this', async (req, res) => {
  const { googleId } = req.query;
  if (!googleId) {
    return res.status(400).json({ error: 'Missing googleId' });
  }
  try {
    const sql = `DELETE FROM I_Know_This_Terms WHERE GoogleId = ?`;
    const [result] = await pool.query(sql, [googleId]);
    res.status(200).json({ message: "Known terms reset successfully" });
  } catch (err) {
    console.error("Error deleting known terms:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/update-stats', async (req, res) => {
  try {
    const { googleId, timeSpent } = req.body;
    const sql = `
      INSERT INTO Stats (ID, Time, NumCards, stat_date)
      VALUES (?, ?, 1, CURDATE())
      ON DUPLICATE KEY UPDATE
        Time = Time + VALUES(Time),
        NumCards = NumCards + VALUES(NumCards),
        AvgTime = (Time + VALUES(Time)) / (NumCards + VALUES(NumCards))
    `;
    const [result] = await pool.query(sql, [googleId, timeSpent]);
    res.json({ message: "Stats updated" });
  } catch (err) {
    console.error("Error updating stats:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/get-stats", async (req, res) => {
  try {
    const googleId = req.query.googleId;
    if (!googleId) {
      return res.status(400).json({ error: "googleId required" });
    }
    const sql = `
      SELECT Time, NumCards, AvgTime, stat_date
      FROM Stats
      WHERE google_id = ?
      ORDER BY stat_date DESC
      LIMIT 1
    `;
    const [results] = await pool.query(sql, [googleId]);
    if (results.length === 0) return res.json({ Time: 0, NumCards: 0, AvgTime: 0 });
    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json(err);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { googleId, name, email, pictureUrl, role } = req.body;
    if (!googleId || !email || !name) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const sql = `
      INSERT INTO Users (google_id, name, email, picture_url, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        email = VALUES(email),
        picture_url = VALUES(picture_url),
        role = VALUES(role)
    `;

    await pool.query(sql, [googleId, name, email, pictureUrl, role]);

    const fetchSql = `SELECT * FROM Users WHERE google_id = ?`;
    const [results] = await pool.query(fetchSql, [googleId]);
    res.status(200).json({ message: "User saved", user: results[0] });
  } catch (err) {
    console.error("Error inserting/fetching user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/password', async (req, res) => {
  try {
    const sql = `SELECT Password FROM Password WHERE Password IS NOT NULL LIMIT 1`;
    const [results] = await pool.query(sql);
    if (results.length === 0) {
      return res.status(404).json({ error: "No password found" });
    }
    res.json({ password: results[0].Password });
  } catch (err) {
    console.error("Error fetching password:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const sql = `
      SELECT google_id, name, email, role
      FROM Users
    `;
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const sql = `
      SELECT ID, Time, NumCards, AvgTime, stat_date
      FROM Stats
    `;
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "Password required" });
    }
    const sql = `UPDATE Password SET Password = ?`;
    const [results] = await pool.query(sql, [newPassword]);
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Database error" });
  }
});

const path = require('path');



app.use(express.static(path.join(__dirname, 'public')));

// Catch-all to handle React routes (reloads, deep links)
app.get('{*splat}', (req, res) => {
  // If the request is not for an API route, serve the React app
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(3000, () => {
  console.log(`Server is running on port 3000.`);
});
