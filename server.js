// ===== DEPENDENCIES =====
const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

dotenv.config();
const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(helmet());

// ===== SESSION STORE =====
const sessionStore = new MySQLStore({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
app.use(
  session({
    secret: "super-secret", // put in .env in production
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

// ===== DB CONNECTION =====
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ===== HELPERS =====
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

// ===== AUTH ROUTES =====
app.get("/", (req, res) => {
  res.render("welcome");
});
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("❌ Error registering user");
      }
      res.redirect("/login");
    }
  );
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.send("User not found");

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Invalid password");

    req.session.userId = user.id;
    req.session.role = user.role;
    res.redirect("/dashboard");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ===== PASSWORDS ROUTES =====
app.get("/dashboard", requireLogin, (req, res) => {
  db.query(
    "SELECT service, username FROM passwords WHERE user_id = ?",
    [req.session.userId],
    (err, results) => {
      if (err) throw err;
      res.render("index", { passwords: results, role: req.session.role });
    }
  );
});

app.post("/add", requireLogin, (req, res) => {
  const { service, username, password } = req.body;

  // Check free plan limit
  if (req.session.role === "free") {
    db.query(
      "SELECT COUNT(*) AS count FROM passwords WHERE user_id = ?",
      [req.session.userId],
      async (err, results) => {
        if (err) throw err;
        if (results[0].count >= 5) {
          return res.send("⚠️ Free plan limit reached! Upgrade to add more.");
        }
        savePassword();
      }
    );
  } else {
    savePassword();
  }

  function savePassword() {
    bcrypt.hash(password, 10).then((hashed) => {
      db.query(
        "INSERT INTO passwords (service, username, password, user_id) VALUES (?, ?, ?, ?)",
        [service, username, hashed, req.session.userId],
        (err) => {
          if (err) throw err;
          res.redirect("/");
        }
      );
    });
  }
});

// ===== SERVER START =====
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
