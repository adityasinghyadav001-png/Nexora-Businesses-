const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Project must belong to a user"],
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
    },
    requirements: {
      type: Object,
      required: [true, "Project requirements data is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    budget: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
