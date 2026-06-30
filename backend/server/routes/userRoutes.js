const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// Restrict all routes in this router to admin only
router.use(auth.protect);
router.use(auth.restrictTo("admin"));

router.get("/", userController.getAllUsers);
router.patch("/:id/role", userController.updateUserRole);
router.delete("/:id", userController.deleteUser);

module.exports = router;
