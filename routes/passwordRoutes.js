const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { encrypt, decrypt } = require("../config/encryption");
const { requireLogin } = require("../middleware/auth");

// Dashboard
router.get("/dashboard", requireLogin, (req, res) => {
  db.query("SELECT id, service, username, password FROM passwords WHERE user_id = ?", [req.session.userId], (err, results) => {
    if (err) throw err;
    const decryptedResults = results.map(p => ({
      ...p,
      password: decrypt(p.password),

    }));
    res.render("index", { passwords: decryptedResults, role: req.session.role });
  });
});

// Free plan error
router.get("/add_error", requireLogin, (req, res) => {
  res.render("add_error", { role: req.session.role });
});

// Add (with free-plan limit)
router.post("/add", requireLogin, (req, res) => {
  const { service, username, password } = req.body;

  // Determine role reliably (session might be different depending on your code)
  const role = req.session?.role || req.session?.user?.role || "free";

  // If free, enforce 5-password limit
  if (role === "free") {
    db.query(
      "SELECT COUNT(*) AS count FROM passwords WHERE user_id = ?",
      [req.session.userId],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Server error");
        }

        if (rows[0].count >= 5) {
          return res.redirect("/add_error");
        }

        // allowed -> insert
        const encrypted = encrypt(password);
        db.query(
          "INSERT INTO passwords (service, username, password, user_id) VALUES (?, ?, ?, ?)",
          [service, username, encrypted, req.session.userId],
          (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).send("Error saving password");
            }
            res.redirect("/dashboard");
          }
        );
      }
    );
    return;
  }

  // Paid plans -> unlimited
  const encrypted = encrypt(password);
  db.query(
    "INSERT INTO passwords (service, username, password, user_id) VALUES (?, ?, ?, ?)",
    [service, username, encrypted, req.session.userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving password");
      }
      res.redirect("/dashboard");
    }
  );
});


// Edit
router.get("/edit/:id", requireLogin, (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM passwords WHERE id = ? AND user_id = ?",
    [id, req.session.userId],
    (err, results) => {
      if (err) throw err;
      if (!results.length) return res.redirect("/dashboard");

      const decryptedPassword = decrypt(results[0].password);
      res.render("edit", {
        password: { ...results[0], password: decryptedPassword },
        role: req.session.role,
      });
    }
  );
});

router.post("/edit/:id", requireLogin, (req, res) => {
  const id = req.params.id;
  const { service, username, password } = req.body;
  const encrypted = encrypt(password);

  db.query("UPDATE passwords SET service=?, username=?, password=? WHERE id=? AND user_id=?",
    [service, username, encrypted, id, req.session.userId],
    (err) => {
      if (err) throw err;
      res.redirect("/dashboard");
    });
});

// Delete
router.post("/delete/:id", requireLogin, (req, res) => {
  db.query("DELETE FROM passwords WHERE id=? AND user_id=?", [req.params.id, req.session.userId], (err) => {
    if (err) throw err;
    res.redirect("/dashboard");
  });
});

module.exports = router;
