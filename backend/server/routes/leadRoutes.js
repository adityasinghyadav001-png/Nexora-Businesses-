// ============================================================
// server/routes/leadRoutes.js
// Lead capture endpoint routing
// ============================================================

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { captureLead, getLeads } = require("../controllers/leadController");

// ── Rate limiter for lead submission ─────────────────────────
// Prevents form spam — 5 submissions per 15 minutes per IP
const leadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again later.",
  },
  skip: (req) => process.env.NODE_ENV === "test",
});

// POST /api/lead  — capture a new lead
router.post("/", leadRateLimit, captureLead);

// GET  /api/lead  — list leads (add auth middleware in production!)
// Example: router.get("/", requireAdminAuth, getLeads);
router.get("/", getLeads);

module.exports = router;
