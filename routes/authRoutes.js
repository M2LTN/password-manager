const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");
const nodemailer = require("nodemailer")

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

router.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // create Gmail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New contact form message from ${name}`,
    text: `
Name: ${name}
Email: ${email}
Message:
${message}
`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/send");
  } catch (err) {
    console.error(err);
    res.send("Error sending message.");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
