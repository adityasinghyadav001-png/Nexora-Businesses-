const express = require("express");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth.protect);
router.use(auth.restrictTo("admin"));

router.get("/analytics", adminController.getAnalytics);

module.exports = router;
