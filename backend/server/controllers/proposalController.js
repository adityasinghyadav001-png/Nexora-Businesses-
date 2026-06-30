// ============================================================
// server/controllers/proposalController.js
// AI Proposal Generator — OpenAI-powered business proposals
// ============================================================

const openai = require("../config/openai");
const Proposal = require("../models/Proposal");
const Project = require("../models/Project");

const PROPOSAL_SYSTEM_PROMPT = `
You are a professional business consultant at NEXORA — an AI-powered business solutions company.
Generate a detailed, high-converting project proposal based on the client's requirements.

OUTPUT FORMAT (use markdown):

# Project Proposal: [Project Title]

## Executive Overview
Brief summary of the project and its value proposition.

## Scope of Work
Detailed description of what will be delivered.

## Features & Deliverables
- Feature 1
- Feature 2
- (list all relevant features)

## Technology Stack
List the technologies, frameworks, and tools that will be used.

## Project Timeline
| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | Week 1-2 | ... |
| Phase 2 | Week 3-4 | ... |

## Pricing Breakdown
| Item | Cost |
|------|------|
| Development | $X,XXX |
| Design | $X,XXX |
| Total | $X,XXX |

## Why Choose NEXORA
- AI-powered development
- Dedicated project management
- 24/7 support
- Scalable solutions

## Next Steps
Clear call-to-action for the client.

RULES:
- Be professional and persuasive
- Use specific details based on the project requirements
- Make pricing realistic based on the budget provided
- Keep the proposal between 500-800 words
- Format beautifully with markdown
`.trim();

/**
 * POST /api/proposal/generate
 * Body: { projectId }
 * Generates an AI proposal for a specific project
 */
exports.generateProposal = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // Fetch project with user data
    const project = await Project.findById(projectId).populate("userId", "name email");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Build context for AI
    const requirementsText = typeof project.requirements === "object"
      ? Object.entries(project.requirements).map(([k, v]) => `${k}: ${v}`).join("\n")
      : String(project.requirements);

    const userPrompt = `
Generate a professional proposal for this project:

Client: ${project.userId?.name || "Client"}
Service: ${project.serviceName}
Budget: $${project.budget || "To be discussed"}
Requirements:
${requirementsText}
    `.trim();

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROPOSAL_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const proposalText = completion.choices[0]?.message?.content || "Failed to generate proposal.";

    // Save to DB
    const proposal = await Proposal.create({
      userId: project.userId._id,
      projectId: project._id,
      proposalText,
      serviceName: project.serviceName,
    });

    res.status(201).json({
      status: "success",
      data: {
        proposal,
      },
    });
  } catch (err) {
    console.error("[PROPOSAL ERROR]", err.message);
    res.status(500).json({
      error: "Failed to generate proposal. Please try again.",
    });
  }
};

/**
 * GET /api/proposal/:projectId
 * Get proposals for a specific project
 */
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: proposals.length,
      data: { proposals },
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch proposals" });
  }
};
