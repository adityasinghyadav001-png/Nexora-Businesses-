const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A proposal must belong to a user"],
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: [true, "A proposal must belong to a project"],
    },
    proposalText: {
      type: String,
      required: [true, "Proposal text is required"],
    },
    serviceName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Proposal = mongoose.model("Proposal", proposalSchema);
module.exports = Proposal;
