const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashed], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error registering user");
    }
    res.redirect("/login");
  });
});

router.get("/login", (req, res) => res.render("login"));

router.post("/login", (req, res) => {
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

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
