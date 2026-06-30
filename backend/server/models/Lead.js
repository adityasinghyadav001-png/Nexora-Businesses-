// ============================================================
// server/models/Lead.js
// Mongoose schema + model for captured leads
// ============================================================

const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // Full name of the prospect
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Type of business (e.g. "E-commerce", "Consultancy", "Restaurant")
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      trim: true,
      maxlength: [100, "Business type cannot exceed 100 characters"],
    },

    // WhatsApp number — stored as string to preserve leading zeros / country codes
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
      match: [
        /^\+?[1-9]\d{6,14}$/,
        "Please provide a valid WhatsApp number (7–15 digits, optional + prefix)",
      ],
    },

    // Optional: track which page/source captured this lead
    source: {
      type: String,
      default: "website",
      trim: true,
    },

    // CRM status for internal use
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Index for fast querying by status and date
leadSchema.index({ status: 1, createdAt: -1 });

// Mask WhatsApp number in JSON output (last 4 digits visible)
leadSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  const num = obj.whatsapp;
  obj.whatsapp =
    num.length > 4 ? "*".repeat(num.length - 4) + num.slice(-4) : "****";
  return obj;
};

module.exports = mongoose.model("Lead", leadSchema);
