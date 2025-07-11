const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "connectedisme1234",
  database: "tick_syz", // Replace with your DB name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// 🔐 Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ status: "error", message: "Database error" });

    if (result.length > 0) {
      return res.status(200).json({ status: "success", message: "Login successful" });
    } else {
      return res.status(401).json({ status: "fail", message: "Invalid email or password" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
app.get("/users", (req, res) => {
  const query = "SELECT id, name, email FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(results);
  });
});
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting user" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
});
app.post("/ticket", (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description || !priority) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "INSERT INTO tickets (title, description, priority) VALUES (?, ?, ?)";
  db.query(query, [title, description, priority], (err, result) => {
    if (err) {
      console.error("Error submitting ticket:", err);
      return res.status(500).json({ message: "Failed to submit ticket" });
    }

    res.status(201).json({ message: "Ticket submitted successfully" });
  });
});

app.get("/ticketsadmin", (req, res) => {
  const query = "SELECT * FROM tickets ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ message: "Error fetching tickets" });
    }
    res.json(results);
  });
});

