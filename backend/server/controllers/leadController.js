// ============================================================
// server/controllers/leadController.js
// Handles lead capture — validates, deduplicates, and stores leads
// ============================================================

const Lead = require("../models/Lead");
const { sendSuccess, sendError } = require("../utils/helpers");

/**
 * POST /api/lead
 * Body: { name, businessType, whatsapp, source? }
 *
 * Validates input, checks for duplicates, and saves the lead.
 */
const captureLead = async (req, res) => {
  try {
    const { name, businessType, whatsapp, source } = req.body;

    // ── Manual validation ─────────────────────────────────
    // (Mongoose will also validate, but we give friendlier messages here)
    const errors = {};

    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!businessType || businessType.trim().length === 0) {
      errors.businessType = "Business type is required";
    }
    if (!whatsapp) {
      errors.whatsapp = "WhatsApp number is required";
    } else {
      const cleaned = whatsapp.replace(/[\s\-().]/g, ""); // strip common formatting chars
      if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
        errors.whatsapp = "Enter a valid WhatsApp number (e.g. +919876543210)";
      }
    }

    if (Object.keys(errors).length > 0) {
      return sendError(res, "Validation failed", 422, errors);
    }

    // Normalize the WhatsApp number (remove spaces/dashes)
    const normalizedWhatsapp = whatsapp.replace(/[\s\-().]/g, "");

    // ── Duplicate check ───────────────────────────────────
    // Prevent the same WhatsApp number from being stored twice
    const existing = await Lead.findOne({ whatsapp: normalizedWhatsapp });
    if (existing) {
      // Still return 200 so frontend shows success — no need to expose this
      return sendSuccess(
        res,
        { leadId: existing._id },
        "Thanks! We already have your details and will reach out soon."
      );
    }

    // ── Create & save lead ────────────────────────────────
    const lead = await Lead.create({
      name: name.trim(),
      businessType: businessType.trim(),
      whatsapp: normalizedWhatsapp,
      source: source?.trim() || "website",
    });

    console.log(`[LEAD] New lead captured — ${lead._id} | ${lead.businessType}`);

    // Return safe data (masked WhatsApp)
    return sendSuccess(
      res,
      {
        leadId: lead._id,
        name: lead.name,
      },
      "Thank you! Our team will contact you on WhatsApp within 24 hours.",
      201
    );

  } catch (error) {
    console.error("[LEAD ERROR]", error.message);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.fromEntries(
        Object.entries(error.errors).map(([key, val]) => [key, val.message])
      );
      return sendError(res, "Validation failed", 422, errors);
    }

    return sendError(res, "Failed to save your details. Please try again.", 500);
  }
};

/**
 * GET /api/lead
 * Returns all leads — protected in production (add auth middleware)
 * Query params: ?status=new&limit=50&page=1
 */
const getLeads = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v"), // exclude Mongoose version key
      Lead.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, `${leads.length} lead(s) retrieved`);

  } catch (error) {
    console.error("[LEAD GET ERROR]", error.message);
    return sendError(res, "Failed to retrieve leads", 500);
  }
};

module.exports = { captureLead, getLeads };
