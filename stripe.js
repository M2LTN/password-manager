const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.BASE_URL;

// --------------------------------------------------------
// 1. Centralized function to create Stripe checkout session
// --------------------------------------------------------
async function createStripeSession(userId) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/payment/cancel`,
    allow_promotion_codes: true,

    // Always include metadata
    metadata: { userId: String(userId || "") },
  });
}


// --------------------------------------------------------
// 2. GET /pay — redirect version
// --------------------------------------------------------
router.get("/pay", async (req, res) => {
  try {
    const userId = req.session?.user?.id;

    const session = await createStripeSession(userId);

    return res.redirect(303, session.url);
  } catch (err) {
    console.error("Stripe Checkout error:", err);
    res.status(500).send("Unable to create checkout session");
  }
});


// --------------------------------------------------------
// 3. POST /api/create-checkout-session — JS fetch version
// --------------------------------------------------------
router.post("/api/create-checkout-session", async (req, res) => {
  try {
    const userId = req.session?.user?.id;

    const session = await createStripeSession(userId);
    console.log("SESSION CONTENT:", req.session);
    res.json({ ok: true, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});


// --------------------------------------------------------
// 4. Payment success handler
// --------------------------------------------------------
router.get("/payment/success", async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "subscription"],
    });
    console.log("SESSION CONTENT:", req.session);
    
    if (session.payment_status === "paid") {
      const userId = req.session?.userId;

      if (!userId) {
        console.error("❌ ERROR: Missing userId in metadata");
        return res.status(400).send("Invalid payment session");
      }

      db.query(
        "UPDATE users SET role = 'personal' WHERE id = ?",
        [userId],
        (err, results) => {
          if (err) {
            console.error("Error updating user role:", err);
            return res.status(500).send("Database error");
          }

          if (results.affectedRows === 0) {
            console.warn("⚠️ No user found with id:", userId);
          }

          if (req.session?.user) {
            req.session.user.role = "personal";
          }

          req.session.save(() => {
            console.log("User role updated successfully!");
            res.render("payment-success", { message: "Payment successful! You are now a premium member!" });
          });
        }
      );
    } else {
      res.status(400).send("Payment incomplete");
    }
  } catch (err) {
    console.error("Stripe session retrieval error:", err);
    res.status(500).send("Error verifying payment");
  }
});


// --------------------------------------------------------
// 5. Cancel page
// --------------------------------------------------------
router.get("/payment/cancel", (req, res) => {
  res.render("payment-cancel");
});


// --------------------------------------------------------
// 6. Diagnostic session viewer
// --------------------------------------------------------
router.get("/payment/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["line_items", "subscription"],
    });
    res.json({ ok: true, session });
  } catch {
    res.json({ ok: false });
  }
});


module.exports = router;
