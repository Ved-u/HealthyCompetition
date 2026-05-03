const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

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
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  leetcode TEXT,
  gfg TEXT
)`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  }
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, username, password, leetcode, gfg } = req.body;

  const query = 'INSERT INTO users (email, username, password, leetcode, gfg) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [email, username, password, leetcode, gfg], function (err) {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Error signing up user' });
    }
    res.status(200).json({ message: 'Signup successful' });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  const query = 'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?';
  db.get(query, [identifier, identifier, password], (err, row) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ message: 'Error logging in user' });
    }

    if (row) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${SERVER_URL}`);
});