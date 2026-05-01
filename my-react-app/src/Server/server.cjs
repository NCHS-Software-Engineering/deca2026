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

    const ensureUsersLoginColumnSql = `
      SELECT COUNT(*) AS column_count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Users'
        AND COLUMN_NAME = 'last_login_at'
    `;
    const [loginColumnRows] = await connection.query(ensureUsersLoginColumnSql);
    if (loginColumnRows[0].column_count === 0) {
      await connection.query(`ALTER TABLE Users ADD COLUMN last_login_at DATETIME NULL DEFAULT NULL`);
    }

    const createReportsTableSql = `
      CREATE TABLE IF NOT EXISTS flashcard_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_google_id VARCHAR(255) NULL,
        reporter_name VARCHAR(255) NULL,
        reporter_email VARCHAR(255) NULL,
        career_cluster VARCHAR(255) NOT NULL,
        performance_indicator TEXT NOT NULL,
        meaning TEXT NULL,
        issue_type VARCHAR(100) NOT NULL,
        notes TEXT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'open',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.query(createReportsTableSql);

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
      INSERT INTO Users (google_id, name, email, picture_url, role, last_login_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        email = VALUES(email),
        picture_url = VALUES(picture_url),
        role = VALUES(role),
        last_login_at = CURRENT_TIMESTAMP
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
      SELECT google_id, name, email, role, last_login_at
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
      SELECT
        u.email AS email,
        u.name,
        u.last_login_at AS lastLoginAt,
        s.Time,
        s.NumCards,
        ROUND(s.AvgTime, 3) AS AvgTime,
        s.stat_date
      FROM Users u
      LEFT JOIN Stats s ON u.google_id = s.ID
      ORDER BY (s.stat_date IS NULL), s.stat_date DESC, u.name ASC
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

app.post('/api/flashcard-reports', async (req, res) => {
  try {
    const {
      reporterGoogleId,
      reporterName,
      reporterEmail,
      careerCluster,
      performanceIndicator,
      meaning,
      issueType,
      notes,
    } = req.body;

    if (!careerCluster || !performanceIndicator || !issueType || !notes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertSql = `
      INSERT INTO flashcard_reports
      (reporter_google_id, reporter_name, reporter_email, career_cluster, performance_indicator, meaning, issue_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertSql, [
      reporterGoogleId || null,
      reporterName || null,
      reporterEmail || null,
      careerCluster,
      performanceIndicator,
      meaning || null,
      issueType,
      notes,
    ]);

    res.status(201).json({ id: result.insertId, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error submitting flashcard report:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/flashcard-reports', async (req, res) => {
  try {
    const status = req.query.status;

    let sql = `
      SELECT id, reporter_google_id, reporter_name, reporter_email, career_cluster,
             performance_indicator, meaning, issue_type, notes, status, created_at
      FROM flashcard_reports
    `;
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT 200';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching flashcard reports:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.patch('/api/flashcard-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestedStatus = typeof req.body?.status === 'string' ? req.body.status.toLowerCase().trim() : '';

    if (!['open', 'resolved'].includes(requestedStatus)) {
      return res.status(400).json({ error: 'Status must be open or resolved' });
    }

    const updateSql = `
      UPDATE flashcard_reports
      SET status = ?
      WHERE id = ?
      LIMIT 1
    `;

    const [updateResult] = await pool.query(updateSql, [requestedStatus, id]);
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const [rows] = await pool.query(
      `SELECT id, status, created_at FROM flashcard_reports WHERE id = ? LIMIT 1`,
      [id]
    );

    res.json(rows[0] || { id, status: requestedStatus });
  } catch (err) {
    console.error('Error updating flashcard report status:', err);
    res.status(500).json({ error: 'Database error' });
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
