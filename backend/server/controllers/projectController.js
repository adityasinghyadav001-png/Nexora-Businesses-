const Project = require("../models/Project");
const User = require("../models/User");
const { sendProjectSubmittedEmail, sendStatusUpdateEmail } = require("../utils/emailService");

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { serviceName, requirements } = req.body;

    if (!serviceName || !requirements) {
      return res.status(400).json({ error: "Service name and requirements data are required" });
    }

    const newProject = await Project.create({
      userId: req.user._id,
      serviceName,
      requirements,
    });

    // Send project submission email (non-blocking)
    sendProjectSubmittedEmail(req.user.email, req.user.name, serviceName)
      .catch(err => console.error("[EMAIL]", err.message));

    res.status(201).json({
      status: "success",
      data: {
        project: newProject,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "An error occurred while submitting project request",
    });
  }
};

// Get all projects for logged-in user
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: projects.length,
      data: {
        projects,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while fetching your projects",
    });
  }
};

// (ADMIN) Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    // Populate the user information (name and email) for the admin view
    const projects = await Project.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: projects.length,
      data: {
        projects,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while fetching all projects",
    });
  }
};

// (ADMIN) Update project status and details
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status, adminNotes, budget } = req.body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (budget !== undefined) updateFields.budget = budget;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: "No project found with that ID" });
    }

    // Send status update email if status changed (non-blocking)
    if (status !== undefined) {
      const projectUser = await User.findById(project.userId);
      if (projectUser) {
        sendStatusUpdateEmail(projectUser.email, projectUser.name, project.serviceName, status)
          .catch(err => console.error("[EMAIL]", err.message));
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "An error occurred while updating the project",
    });
  }
};

// (ADMIN) Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "No project found with that ID" });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      error: "An error occurred while deleting the project",
    });
  }
};
