// stripe.js
const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.BASE_URL;

// --- Create Stripe Checkout Session (server redirect) ---
router.get("/pay", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/payment/cancel`,
      // customer_email: req.session?.user?.email,
      // metadata: { userId: String(req.session?.user?.id || "") },
      allow_promotion_codes: true,
    });

    return res.redirect(303, session.url);
  } catch (err) {
    console.error("Stripe Checkout error:", err);
    return res.status(500).send("Unable to create checkout session");
  }
});

// API for front-end fetch style redirect ---
router.post("/api/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      allow_promotion_codes: true,
    });
    res.json({ ok: true, url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});


// --- Success Page ---
router.get("/payment/success", (req, res) => {
  res.render("payment-success");
});

// --- Cancel Page ---
router.get("/payment/cancel", (req, res) => {
  res.render("payment-cancel");
});

//fetch session details for success page diagnostics ---
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
