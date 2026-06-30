// ============================================================
// server/utils/emailService.js
// NEXORA Email Automation — Nodemailer SMTP Service
// ============================================================

const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Base HTML template ──────────────────────────────────────
const baseTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; background:#0A0A0B; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; }
    .container { max-width:600px; margin:0 auto; padding:40px 20px; }
    .card { background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius:16px; padding:40px; border:1px solid rgba(124,58,237,0.3); }
    .logo { font-size:28px; font-weight:700; background:linear-gradient(135deg,#7C3AED,#3B82F6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:24px; }
    h1 { color:#fff; font-size:24px; margin:0 0 16px 0; }
    p { color:#9CA3AF; font-size:15px; line-height:1.7; margin:0 0 16px 0; }
    .highlight { color:#fff; font-weight:600; }
    .badge { display:inline-block; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; }
    .badge-pending { background:rgba(245,158,11,0.2); color:#F59E0B; }
    .badge-progress { background:rgba(59,130,246,0.2); color:#3B82F6; }
    .badge-completed { background:rgba(16,185,129,0.2); color:#10B981; }
    .badge-cancelled { background:rgba(239,68,68,0.2); color:#EF4444; }
    .divider { border:none; border-top:1px solid rgba(255,255,255,0.08); margin:24px 0; }
    .cta { display:inline-block; padding:12px 32px; background:linear-gradient(135deg,#7C3AED,#3B82F6); color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
    .footer { text-align:center; color:#6B7280; font-size:12px; margin-top:32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">NEXORA</div>
      <h1>${title}</h1>
      ${body}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NEXORA — AI-Powered Business Solutions</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Email Templates ──────────────────────────────────────────

const welcomeEmail = (userName) => {
  const title = "Welcome to NEXORA 🚀";
  const body = `
    <p>Hi <span class="highlight">${userName}</span>,</p>
    <p>Welcome aboard! You've just joined the most powerful AI-driven business solutions platform.</p>
    <p>Here's what you can do next:</p>
    <p>✨ Submit your first project request<br>
       🤖 Chat with our AI assistant<br>
       📊 Track project progress in real-time</p>
    <hr class="divider">
    <p>Your account is ready. Log in to your dashboard and get started.</p>
    <a href="#" class="cta">Go to Dashboard</a>
  `;
  return baseTemplate(title, body);
};

const projectSubmittedEmail = (userName, serviceName) => {
  const title = "Project Request Received ✅";
  const body = `
    <p>Hi <span class="highlight">${userName}</span>,</p>
    <p>Your project request has been successfully submitted!</p>
    <hr class="divider">
    <p><strong>Service:</strong> <span class="highlight">${serviceName}</span></p>
    <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
    <hr class="divider">
    <p>Our team will review your request and get back to you shortly. You can track your project status from your dashboard.</p>
    <a href="#" class="cta">View Dashboard</a>
  `;
  return baseTemplate(title, body);
};

const statusUpdateEmail = (userName, serviceName, newStatus) => {
  const title = "Project Status Updated 📋";
  const statusMap = {
    "Pending": "badge-pending",
    "In Progress": "badge-progress",
    "Completed": "badge-completed",
    "Cancelled": "badge-cancelled",
  };
  const badgeClass = statusMap[newStatus] || "badge-pending";
  const body = `
    <p>Hi <span class="highlight">${userName}</span>,</p>
    <p>There's an update on your project!</p>
    <hr class="divider">
    <p><strong>Service:</strong> <span class="highlight">${serviceName}</span></p>
    <p><strong>New Status:</strong> <span class="badge ${badgeClass}">${newStatus}</span></p>
    <hr class="divider">
    <p>Log in to your dashboard for full details and to track progress.</p>
    <a href="#" class="cta">View Project</a>
  `;
  return baseTemplate(title, body);
};

// ── Send Email Function ──────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  // Skip if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[EMAIL] Skipping email — EMAIL_USER or EMAIL_PASS not set in .env");
    return null;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"NEXORA Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, err.message);
    return null; // Don't throw — email failure shouldn't break the API flow
  }
};

// ── Convenience Methods ──────────────────────────────────────
const sendWelcomeEmail = (email, name) =>
  sendEmail(email, "Welcome to NEXORA 🚀", welcomeEmail(name));

const sendProjectSubmittedEmail = (email, name, serviceName) =>
  sendEmail(email, "Project Request Received — NEXORA", projectSubmittedEmail(name, serviceName));

const sendStatusUpdateEmail = (email, name, serviceName, newStatus) =>
  sendEmail(email, `Project Update: ${newStatus} — NEXORA`, statusUpdateEmail(name, serviceName, newStatus));

module.exports = {
  sendWelcomeEmail,
  sendProjectSubmittedEmail,
  sendStatusUpdateEmail,
};
