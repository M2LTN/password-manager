const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const passwordRoutes = require("./passwordRoutes");

router.get("/", (req, res) => res.render("welcome"));
router.use("/", authRoutes);
router.use("/", passwordRoutes);
router.get("/plans", (req, res) => res.render("plans"));
router.get("/contact", (req, res) => res.render("contact"));
router.get("/payment", (req, res) => res.render("payment"));


module.exports = router;
