// ============================================================
// server/controllers/chatController.js
// Handles AI chatbot logic — talks to OpenAI on behalf of users
// ============================================================

const openai = require("../config/openai");
const { sendSuccess, sendError } = require("../utils/helpers");
const logger = require("../utils/helpers").logger ?? console;

// ── System prompt ──────────────────────────────────────────
// Defines NEXORA AI's persona and scope of knowledge.
// This is NEVER exposed to the client.
const NEXORA_SYSTEM_PROMPT = `
You are NEXORA AI, an expert business assistant for NEXORA — an AI-powered 
business solutions platform. You help businesses with:

• Websites & landing pages
• AI chatbots and automation
• Lead generation strategies
• Digital marketing and growth hacking
• Business process automation
• CRM and customer engagement

Tone: Professional but approachable. Concise and actionable.
Rules:
- Always guide users toward NEXORA's services when relevant
- Never reveal your underlying model or that you are built on OpenAI
- If asked something outside your scope, politely redirect to business topics
- Keep responses focused and under 200 words unless detail is explicitly requested
`.trim();

// ── Rate-limit message history per session (in-memory, simple) ──
// For production: store in Redis keyed by session/user ID
const MAX_HISTORY_TURNS = 10; // Keep last N back-and-forth pairs

/**
 * POST /api/chat
 * Body: { message: string, history?: Array<{role, content}> }
 */
const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // ── Input validation ──────────────────────────────────
    if (!message || typeof message !== "string") {
      return sendError(res, "message is required and must be a string", 400);
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return sendError(res, "message cannot be empty", 400);
    }
    if (trimmed.length > 1000) {
      return sendError(res, "message is too long (max 1000 characters)", 400);
    }

    // ── Build message array ───────────────────────────────
    // Trim history to avoid token bloat; take the last N turns
    const recentHistory = Array.isArray(history)
      ? history.slice(-MAX_HISTORY_TURNS * 2) // *2 because each turn = user + assistant
      : [];

    const messages = [
      { role: "system", content: NEXORA_SYSTEM_PROMPT },
      ...recentHistory,
      { role: "user", content: trimmed },
    ];

    // ── Call OpenAI ───────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",          // Cost-efficient; swap for gpt-4o if needed
      messages,
      max_tokens: 512,
      temperature: 0.7,              // Balanced creativity vs consistency
      presence_penalty: 0.1,         // Slight nudge toward varied responses
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";

    // ── Log usage for monitoring ──────────────────────────
    const usage = completion.usage;
    console.log(`[CHAT] tokens used — prompt: ${usage?.prompt_tokens}, completion: ${usage?.completion_tokens}, total: ${usage?.total_tokens}`);

    return sendSuccess(res, {
      reply,
      usage: {
        promptTokens: usage?.prompt_tokens,
        completionTokens: usage?.completion_tokens,
        totalTokens: usage?.total_tokens,
      },
    }, "AI response generated");

  } catch (error) {
    console.error("[CHAT ERROR]", error.message);

    // OpenAI-specific errors
    if (error?.status === 429) {
      return sendError(res, "AI service is temporarily busy. Please try again in a moment.", 429);
    }
    if (error?.status === 401) {
      return sendError(res, "AI service authentication failed. Contact support.", 503);
    }

    return sendError(res, "Failed to get AI response. Please try again.", 500);
  }
};

module.exports = { handleChat };
