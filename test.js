const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config();

async function runTests() {
  console.log("🔍 Running project health checks...\n");

  // 1. ENV VARIABLES
  if (!process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
    console.error("❌ Missing database credentials in .env");
    process.exit(1);
  } else {
    console.log("✅ .env variables loaded");
  }

  // 2. DATABASE CONNECTION
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ Database connection successful");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }

  // 3. REQUIRED TABLES
  try {
    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);
    if (!tableNames.includes("users") || !tableNames.includes("passwords")) {
      console.error("❌ Required tables missing. Found:", tableNames);
      process.exit(1);
    }
    console.log("✅ Required tables exist:", tableNames.join(", "));
  } catch (err) {
    console.error("❌ Error checking tables:", err.message);
    process.exit(1);
  }

  // 4. SERVER CHECK
  try {
    const res = await fetch("http://localhost:3000");
    if (res.status === 200) {
      console.log("✅ Server is running and returned /login page");
    } else {
      console.error("❌ Server responded with status:", res.status);
    }
  } catch (err) {
    console.error("❌ Cannot reach server at http://localhost:3000");
    console.error("   Make sure you run: node server.js");
  }

  console.log("\n🎉 Tests finished.");
  process.exit(0);
}

runTests();
