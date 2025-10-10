const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const passwordRoutes = require("./passwordRoutes");

router.get("/", (req, res) => res.render("welcome"));
router.use("/", authRoutes);
router.use("/", passwordRoutes);

module.exports = router;
