// server/server.js
// NEXORA Backend — Entry Point
// ============================================================

// Load environment variables FIRST before any other imports
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const express = require("express");
const cors    = require("cors");
const mongoose = require("mongoose");
const helmet  = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB      = require("./config/db");
const chatRoutes     = require("./routes/chatRoutes");
const leadRoutes     = require("./routes/leadRoutes");
const authRoutes     = require("./routes/authRoutes");
const projectRoutes  = require("./routes/projectRoutes");
const userRoutes     = require("./routes/userRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

// ── App initialization ────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────────
connectDB().then(() => {
  console.log("Database connection initialized. Starting server setup...");

  // ── Security middleware ───────────────────────────────────────

  // Helmet sets secure HTTP headers (XSS protection, no sniff, etc.)
  app.use(helmet());

  // CORS — only allow requests from trusted frontend origins
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ── Body parsing ──────────────────────────────────────────────
  app.use(express.json({ limit: "10kb" }));     // Reject payloads > 10 KB
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // ── Global rate limiter ───────────────────────────────────────
  // A broad safety net; per-route limiters are more specific
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests from this IP. Please try again later.",
    },
  });
  app.use(globalLimiter);

  // ── Request logger (development) ──────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // ── Health check ─────────────────────────────────────────────
  // Used by Render / Railway / load balancers to verify the server is alive
  app.get("/api/health", (_req, res) => {
    res.json({ status: "OK" });
  });

  // ── API Routes ────────────────────────────────────────────────
  app.use("/api/chat", chatRoutes);
  app.use("/api/lead", leadRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/project", projectRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/proposal", proposalRoutes);

  // ── 404 handler ───────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found. Check the API documentation.",
    });
  });

  // ── Global error handler ──────────────────────────────────────
  // Must have 4 parameters for Express to treat it as error middleware
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[UNHANDLED ERROR]", err.stack || err.message);

    // CORS errors are 403
    if (err.message?.startsWith("CORS policy")) {
      return res.status(403).json({ success: false, message: err.message });
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred. Please try again."
          : err.message,
    });
  });

  // ── Start server ──────────────────────────────────────────────
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║          NEXORA Backend is running           ║
  ║                                              ║
  ║  🌐  http://localhost:${PORT}                  ║
  ║  🏥  Health: /health                         ║
  ║  🤖  Chat:   POST /api/chat                  ║
  ║  📩  Leads:  POST /api/lead                  ║
  ║                                              ║
  ║  ENV: ${(process.env.NODE_ENV || "development").padEnd(36)}║
  ╚══════════════════════════════════════════════╝
    `);
  });

  // ── Graceful shutdown ─────────────────────────────────────────
  // Ensures in-flight requests finish before the process exits
  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("\nSIGINT received — shutting down");
    server.close(() => process.exit(0));
  });

});

// Catch unhandled promise rejections (e.g. forgot await)
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

module.exports = app; // exported for testing frameworks
