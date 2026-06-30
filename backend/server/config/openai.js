// ============================================================
// server/config/openai.js
// OpenAI client — initialized once, imported everywhere needed
// ============================================================

const OpenAI = require("openai");

// Guard: fail loud if API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "❌ OPENAI_API_KEY is not defined. Add it to your .env file."
  );
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
