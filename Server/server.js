const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// enums for status
const lazy_ass = "Lazy-Ass";
const aiml = "AIML";
const course = "DSA / WebD";
const grind = "LeetCode / GFG";

// Define a global variable for the server URL
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite connection
const db = new sqlite3.Database('./healthy_competition.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

// Create users table if it doesn't exist
const createTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  leetcode TEXT,
  gfg TEXT,
  status TEXT
)`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  }
});

// Create activities table if it doesn't exist
const createActivitiesTableQuery = `CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  UNIQUE(username, date)
)`;

db.run(createActivitiesTableQuery, (err) => {
  if (err) {
    console.error('Error creating activities table:', err);
  }
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, username, password, leetcode, gfg } = req.body;

  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(checkUserQuery, [email], (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }
    if (row) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    const insertUserQuery = 'INSERT INTO users (email, username, password, leetcode, gfg, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(insertUserQuery, [email, username, password, leetcode, gfg, lazy_ass], function (err) {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error signing up user' });
      }
      res.status(200).json({ message: 'Signup successful. Please login.' });
    });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  const query = 'SELECT * FROM users WHERE (email = ? OR username = ?)';
  db.get(query, [identifier, identifier], (err, row) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ message: 'Error logging in user' });
    }

    if (row) {
      if (row.password === password) {
        return res.status(200).json({ message: 'Login successful.' });
      } else {
        return res.status(400).json({ message: 'Username/Password wrong' });
      }
    } else {
      return res.status(400).json({ message: 'Username/Password wrong' });
    }
  });
});

// get-user endpoint
app.get('/user/:username', (req, res) => {
  const { username } = req.params;

  db.get('SELECT email, username, leetcode, status FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(row);
  });
});

// get-leetcode endpoint
app.get('/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch('https://leetfetch.vercel.app/api/leetcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query userProblemsSolved($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
        }
        `,
        variables: { username }
      })
    });
    const data = await response.json();
    const stats = data.data.matchedUser;
    const result = {
      ranking: stats.profile.ranking,
      easy: stats.submitStats.acSubmissionNum[1].count,
      medium: stats.submitStats.acSubmissionNum[2].count,
      hard: stats.submitStats.acSubmissionNum[3].count,
      total:
        stats.submitStats.acSubmissionNum[1].count +
        stats.submitStats.acSubmissionNum[2].count +
        stats.submitStats.acSubmissionNum[3].count
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch LeetCode data" });
  }
});

// set-status endpoint
app.post('/update-status', (req, res) => {
  const { username, status } = req.body;
  const query = 'UPDATE users SET status = ? WHERE username = ?';
  db.run(query, [status, username], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating status' });
    }
    res.json({ message: 'Status updated successfully' });
  });
});

// log-activity endpoint
app.post('/log-activity', (req, res) => {
  const { username } = req.body;

  const query = "INSERT INTO activities (username, date, count) VALUES (?, date('now'), 1) ON CONFLICT(username, date) DO UPDATE SET count = count + 1;";
  db.run(query, [username], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error logging activity' });
    }
    res.json({ message: 'Activity logged' });
  });
});

// get-activities endpoint
app.get('/activities/:username', (req, res) => {
  const { username } = req.params;
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const dateStr = yearStart.toISOString().split('T')[0];

  const query = 'SELECT date, count FROM activities WHERE username = ? AND date >= ? ORDER BY date';
  db.all(query, [username, dateStr], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching activities' });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${SERVER_URL}`);
});