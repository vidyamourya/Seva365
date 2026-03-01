const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("../fronted folder"));

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "booking_system"
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// =======================
// Booking API
// =======================
app.post("/book", (req, res) => {
  const { name, email, phone, service, sub_service, booking_date, message } = req.body;

  const sql = `
    INSERT INTO bookings 
    (name, email, phone, service, sub_service, booking_date, message) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, phone, service, sub_service, booking_date, message], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      res.status(500).send("Error saving booking");
    } else {
      res.send("Booking saved successfully");
    }
  });
});

// =======================
// SIGNUP ROUTE
// =======================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.send("All fields required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Email already exists");
      }
      res.send("Signup successful");
    });
  } catch (error) {
    console.log(error);
    res.send("Error in signup");
  }
});

// =======================
// LOGIN ROUTE
// =======================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length === 0) return res.status(400).json({ message: "User not found" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      role: user.role
    });
  });
});

// =======================
// ADMIN — GET ALL USERS
// =======================
app.get("/admin/users", (req, res) => {
  // Also returns total bookings count per user
  const sql = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role,
      COUNT(b.id) AS total_bookings
    FROM users u
    LEFT JOIN bookings b ON b.email = u.email
    GROUP BY u.id
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(result);
  });
});

// =======================
// ADMIN — GET ALL BOOKINGS
// =======================
app.get("/admin/bookings", (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      phone,
      service,
      sub_service,
      booking_date,
      message,
      status
    FROM bookings
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch bookings error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(result);
  });
});

// =======================
// ADMIN — ACCEPT OR DENY BOOKING
// =======================
app.patch("/admin/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'denied'

  // Safety check — only allow valid values
  if (!["accepted", "denied"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const sql = "UPDATE bookings SET status = ? WHERE id = ?";

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: `Booking ${status} successfully` });
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});