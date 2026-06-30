const express = require("express");
const projectController = require("../controllers/projectController");
const auth = require("../middleware/auth");

const router = express.Router();

// User Routes
router.post("/", auth.protect, projectController.createProject);
router.get("/user", auth.protect, projectController.getUserProjects);

// Admin Routes (restricted to admin)
router.get("/all", auth.protect, auth.restrictTo("admin"), projectController.getAllProjects);
router.put("/:id", auth.protect, auth.restrictTo("admin"), projectController.updateProjectStatus);
router.delete("/:id", auth.protect, auth.restrictTo("admin"), projectController.deleteProject);

module.exports = router;
