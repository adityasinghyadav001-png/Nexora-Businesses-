const express = require("express");
const proposalController = require("../controllers/proposalController");
const auth = require("../middleware/auth");

const router = express.Router();

// Admin only — generate and view proposals
router.use(auth.protect);
router.use(auth.restrictTo("admin"));

router.post("/generate", proposalController.generateProposal);
router.get("/:projectId", proposalController.getProposals);

module.exports = router;
