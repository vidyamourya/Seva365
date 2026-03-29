const express = require("express");
const session = require("express-session"); //for handling user session.
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const frontendPath = path.join(__dirname, "../fronted folder");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // VERY IMPORTANT for fetch JSON
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "vidya",
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(frontendPath));
//middleware function used for page restrication 
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
}
//route
app.use((req, res, next) => {
  if (req.path.endsWith(".html")) {
    return res.redirect("/");
  }
  next();
});
app.get("/", (req, res) => {

  if (req.session.user) {

    if (req.session.user.role === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/user_home");
    }
  }
  // Not logged in → show index.html
  res.sendFile(path.join(frontendPath, "index.html"));
});
app.get("/user_home", isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "user_home.html"));
});
app.get("/contact", isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "contact.html"));
});
app.get("/SignUp", (req, res) => {
  res.sendFile(path.join(frontendPath, "SignUp.html"));
});
app.get('/booking',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, 'booking.html'));
});
app.get('/cooking',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, 'cooking.html'));
});
app.get('/cleaning',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, 'cleaning.html'));
});
app.get('/event_management',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, 'event_management.html'));
});
app.get('/about',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, 'about.html'));
});
app.get('/admin',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, "admin/admin.html"));
});
app.get('/admin_user_page',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, "admin/admin_user_page.html"));
});
app.get('/admin_booking_page',isAuthenticated, (req, res)=>{
  res.sendFile(path.join(frontendPath, "admin/admin_booking_page.html"));
});
app.get('/admin_cooking', isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "admin/admin_cooking.html"));
});
app.get('/admin_cleaning', isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "admin/admin_cleaning.html"));
});
app.get('/admin_event_management', isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "admin/admin_event_management.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.redirect("/");
  });
});

//allow only css and js file direct access
app.use("/css", express.static(path.join(frontendPath, "css")));
app.use("/js", express.static(path.join(frontendPath, "js")));
app.use("/images", express.static(path.join(frontendPath, "images")));
// app.use(express.static("../fronted folder"));

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
app.post("/login", async (req, res) => {

  // console.log("BODY:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing fields");
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {

    console.log("DB RESULT:", result);

    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      console.log("User not found in DB");
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.json({ message: "Login successful", role: user.role });

  });

});
// contact route //
app.post("/contact", (req, res) => {

    const { name, email, message } = req.body;

    const sql = "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)";

    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Message sent successfully!" });
    });
});
app.get("/all-bookings", (req, res) => {

    const sql = "SELECT * FROM bookings ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });

});
app.get("/admin-users", (req, res) => {

    const sql = `
        SELECT id, name, email, role
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
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
// Get only Cooking bookings
app.get("/admin/cooking-bookings",  isAuthenticated, (req, res) => {
    const query = "SELECT * FROM bookings WHERE service = 'Cooking'";

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching cooking bookings");
        }
        res.json(result);
    });
});
app.get("/admin/cleaning-bookings",  isAuthenticated, (req, res) => {
    const query = "SELECT * FROM bookings WHERE service = 'Cleaning'";

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching cleaning bookings");
        }
        res.json(result);
    });
});
app.get("/admin/event-bookings",  isAuthenticated, (req, res) => {
    const query = "SELECT * FROM bookings WHERE service = 'Event'";

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching Event bookings");
        }
        res.json(result);
    });
});
module.exports = { app, db };

// =======================
// START SERVER
// =======================
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}