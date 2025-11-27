// ===== DEPENDENCIES =====
const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const routes = require("./routes/index");
const db = require("./config/db");
const path = require("path");
const stripeRoutes = require("./stripe");

// ===== APP CONFIGURATION =====
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(helmet());

// ===== SESSION STORE =====
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { secure: false }
  })
);

// ===== ROUTES =====
app.use("/", routes);
app.use("/", stripeRoutes);

// ===== SERVER START =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
