// ============================================================
// dashboard.js — NEXORA Premium Client Dashboard
// ============================================================

const API_URL = "http://localhost:5000/api";
let currentToken = localStorage.getItem("nexora_token");
let currentUserData = null;
let userProjects = [];
let chatHistory = [];

// ── Parse user data ──────────────────────────────────────────
try {
  const raw = localStorage.getItem("nexora_user");
  if (raw) currentUserData = JSON.parse(raw);
} catch (e) { console.error("No user data found"); }

// ── Auth guard ───────────────────────────────────────────────
if (!currentToken) {
  window.location.href = "index.html";
}

// ── Notification Toast ───────────────────────────────────────
function showNotification(message, type = "success") {
  const notif = document.getElementById("notification");
  if (!notif) return;
  notif.textContent = message;
  notif.className = `notification-toast ${type}`;
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 3500);
}

// ── SPA Navigation ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const viewSections = document.querySelectorAll(".view-section");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      if (!target) return;

      navLinks.forEach(l => l.classList.remove("active"));
      viewSections.forEach(s => s.classList.remove("active"));
      link.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });

  // User greeting
  const nameEl = document.getElementById("user-name");
  if (nameEl && currentUserData) {
    nameEl.textContent = currentUserData.name.split(" ")[0];
  }

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("nexora_user");
    window.location.href = "index.html";
  });

  // Init
  loadProjects();
  initModal();
  initChat();
});

// ============================================================
// PROJECT MANAGEMENT
// ============================================================
async function loadProjects() {
  try {
    const res = await fetch(`${API_URL}/project/user`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    const data = await res.json();

    if (res.ok && data.data?.projects) {
      userProjects = data.data.projects;
      renderStats();
      renderRecentProjects();
      renderAllProjects();
    } else {
      renderEmptyState("recent-projects-grid");
      renderEmptyState("all-projects-grid");
    }
  } catch (err) {
    console.error(err);
    showNotification("Failed to load projects. Is the backend running?", "error");
  }
}

function renderStats() {
  const total = userProjects.length;
  const active = userProjects.filter(p => p.status === "Pending" || p.status === "In Progress").length;
  const completed = userProjects.filter(p => p.status === "Completed").length;

  animateCounter("stat-total", total);
  animateCounter("stat-active", active);
  animateCounter("stat-completed", completed);
}

function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 30);
}

function renderRecentProjects() {
  const grid = document.getElementById("recent-projects-grid");
  const recent = userProjects.slice(0, 3);

  if (recent.length === 0) {
    renderEmptyState("recent-projects-grid");
    return;
  }
  grid.innerHTML = "";
  recent.forEach(p => grid.appendChild(createProjectCard(p)));
}

function renderAllProjects() {
  const grid = document.getElementById("all-projects-grid");

  if (userProjects.length === 0) {
    renderEmptyState("all-projects-grid");
    return;
  }
  grid.innerHTML = "";
  userProjects.forEach(p => grid.appendChild(createProjectCard(p)));
}

function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = "project-card";

  const statusClass = project.status.replace(" ", "");
  const dateStr = new Date(project.createdAt).toLocaleDateString();
  const progress = getProgress(project.status);
  const description = project.requirements?.description || "No description provided";

  card.innerHTML = `
    <div class="project-card-header">
      <h3>${project.serviceName}</h3>
      <span class="status-badge status-${statusClass}">${project.status}</span>
    </div>
    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 14px; line-height: 1.5;">
      ${truncate(description, 100)}
    </p>
    <div class="project-card-meta">
      <span>📅 ${dateStr}</span>
      <span>${progress}% complete</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${progress}%"></div>
    </div>
    ${renderTimeline(project.status)}
  `;

  return card;
}

function getProgress(status) {
  switch (status) {
    case "Pending": return 15;
    case "In Progress": return 55;
    case "Completed": return 100;
    case "Cancelled": return 0;
    default: return 0;
  }
}

function renderTimeline(status) {
  const steps = ["Submitted", "In Progress", "Review", "Completed"];
  const activeIndex = status === "Pending" ? 0
    : status === "In Progress" ? 1
    : status === "Completed" ? 3
    : -1;

  let html = '<div class="timeline">';
  steps.forEach((step, i) => {
    const dotClass = i < activeIndex ? "completed" : i === activeIndex ? "active" : "";
    const lineClass = i < activeIndex ? "filled" : "";

    html += `<div class="timeline-step">
      <div class="timeline-dot ${dotClass}"></div>
      <div class="timeline-label">${step}</div>
    </div>`;

    if (i < steps.length - 1) {
      html += `<div class="timeline-line ${lineClass}"></div>`;
    }
  });
  html += '</div>';
  return html;
}

function renderEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="icon">📭</div>
      <h3>No projects yet</h3>
      <p>Submit your first project request to get started with NEXORA.</p>
      <button class="btn-primary" onclick="openModal()">+ New Project</button>
    </div>
  `;
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

// ============================================================
// CREATE PROJECT MODAL
// ============================================================
function initModal() {
  const modal = document.getElementById("create-project-modal");
  const form = document.getElementById("create-project-form");
  const closeBtn = document.getElementById("close-modal-btn");

  document.getElementById("header-create-btn")?.addEventListener("click", openModal);
  document.getElementById("projects-create-btn")?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);

  // Close on overlay click
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const serviceName = document.getElementById("service-name").value;
    const requirements = document.getElementById("project-requirements").value;

    try {
      const res = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          serviceName,
          requirements: { description: requirements },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("🚀 Project submitted successfully!");
        closeModal();
        form.reset();
        loadProjects();
      } else {
        showNotification(data.error || "Submission failed.", "error");
      }
    } catch (err) {
      showNotification("Server error. Please try again.", "error");
    }
  });
}

function openModal() {
  document.getElementById("create-project-modal")?.classList.add("active");
}

function closeModal() {
  document.getElementById("create-project-modal")?.classList.remove("active");
}

// ============================================================
// AI CHAT WIDGET
// ============================================================
function initChat() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");

  sendBtn?.addEventListener("click", sendChatMessage);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
}

async function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const messagesDiv = document.getElementById("chat-messages");

  const message = input.value.trim();
  if (!message) return;

  // Add user message
  appendChatMessage(message, "user");
  chatHistory.push({ role: "user", content: message });
  input.value = "";
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = document.createElement("div");
  typingEl.className = "chat-msg bot typing";
  typingEl.id = "typing-indicator";
  typingEl.textContent = "NEXORA AI is thinking...";
  messagesDiv.appendChild(typingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-20),
      }),
    });

    const data = await res.json();

    // Remove typing indicator
    document.getElementById("typing-indicator")?.remove();

    if (data.success && data.data?.reply) {
      appendChatMessage(data.data.reply, "bot");
      chatHistory.push({ role: "assistant", content: data.data.reply });
    } else {
      appendChatMessage("Sorry, I couldn't process that. Please try again.", "bot");
    }
  } catch (err) {
    document.getElementById("typing-indicator")?.remove();
    appendChatMessage("Connection error. Please check if the server is running.", "bot");
  }

  sendBtn.disabled = false;
  input.focus();
}

function appendChatMessage(text, sender) {
  const messagesDiv = document.getElementById("chat-messages");
  const msg = document.createElement("div");
  msg.className = `chat-msg ${sender}`;
  msg.textContent = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
