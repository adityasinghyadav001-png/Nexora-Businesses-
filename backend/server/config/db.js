// ============================================================
// server/config/db.js
// MongoDB connection using Mongoose
// ============================================================

const mongoose = require("mongoose");

// Disable buffering to prevent timeout hangs if disconnected
mongoose.set('bufferCommands', false);

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000; // 3 seconds between retries

/**
 * Helper: pause execution for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Diagnose common MongoDB connection errors and log helpful hints.
 */
const diagnoseError = (error) => {
  const msg = error.message || "";

  if (msg.includes("<db_password>") || msg.includes("%3C") || msg.includes("%3E")) {
    console.error("💡 Hint: Your MONGODB_URI still contains the <db_password> placeholder.");
    console.error("   → Open your .env file and replace <db_password> with your actual password.");
  } else if (msg.includes("ECONNREFUSED") || msg.includes("querySrv")) {
    console.error("💡 Hint: DNS/SRV lookup failed. Common causes:");
    console.error("   → Your IP address is NOT whitelisted in MongoDB Atlas → Network Access.");
    console.error("   → Your internet connection or DNS resolver is blocking the lookup.");
    console.error("   → The cluster hostname in MONGODB_URI may be incorrect.");
  } else if (msg.includes("Authentication failed") || msg.includes("bad auth")) {
    console.error("💡 Hint: Wrong username or password in MONGODB_URI.");
    console.error("   → Go to MongoDB Atlas → Database Access and verify credentials.");
  } else if (msg.includes("ENOTFOUND")) {
    console.error("💡 Hint: The MongoDB host was not found. Check your cluster hostname.");
  }
};

/**
 * Connects to MongoDB using the URI from environment variables.
 * Retries up to MAX_RETRIES times before giving up.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // ── Pre-flight checks ────────────────────────────────────────
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in your .env file.");
    console.error("   → Copy .env.example to .env and fill in your MongoDB connection string.");
    process.exit(1);
  }

  if (uri.includes("<db_password>") || uri.includes("<password>")) {
    console.error("❌ MONGODB_URI still contains a placeholder password.");
    console.error("   → Open .env and replace <db_password> with your actual MongoDB password.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");

  // ── Connection with retry logic ──────────────────────────────
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB connected ✅`);
      return; // success — stop retrying
    } catch (error) {
      console.error(
        `MongoDB connection failed ❌ (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        diagnoseError(error);
        console.error("🛑 All connection attempts failed. The server will continue running");
        console.error("   but database-dependent routes will not work.");
        return; // don't crash — let non-DB routes still serve
      }

      console.log(`   ↻ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
};

// ── Mongoose event listeners ──────────────────────────────────
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

module.exports = connectDB;
