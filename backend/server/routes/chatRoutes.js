// ============================================================
// server/routes/chatRoutes.js
// Chat endpoint routing
// ============================================================

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { handleChat } = require("../controllers/chatController");

// ── Rate limiter specific to chat (more restrictive) ─────────
// Prevents API abuse / runaway OpenAI costs
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1-minute window
  max: 15,                    // Max 15 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please slow down and try again in a minute.",
  },
  skip: (req) => process.env.NODE_ENV === "test", // Skip during testing
});

// POST /api/chat
router.post("/", chatRateLimit, handleChat);

module.exports = router;
