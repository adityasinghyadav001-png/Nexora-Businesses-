// admin.js - NEXORA Admin Logic
const API_URL = "http://localhost:5000/api";
let currentProjects = [];
let currentUsers = [];
let token = localStorage.getItem("nexora_token");

// Auth Check
if (!token) {
    window.location.href = "index.html"; // Not logged in
}

// ----------------------------------------------------
// UI & Navigation Logic
// ----------------------------------------------------
const navLinks = document.querySelectorAll(".nav-link");
const viewSections = document.querySelectorAll(".view-section");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        viewSections.forEach(s => s.classList.remove("active"));
        
        link.classList.add("active");
        const targetId = link.getAttribute("data-target");
        document.getElementById(targetId).classList.add("active");
        
        // Refresh specific view data if needed
        if(targetId === "projects-view") fetchProjects();
        if(targetId === "users-view") fetchUsers();
        if(targetId === "analytics-view" || targetId === "dashboard-view") fetchAnalytics();
    });
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("nexora_token");
    window.location.href = "index.html";
});

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    if (isError) toast.classList.add("error");
    else toast.classList.remove("error");
    
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// ----------------------------------------------------
// Fetch Data
// ----------------------------------------------------
async function fetchAnalytics() {
    try {
        const res = await fetch(`${API_URL}/admin/analytics`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.status === "success") {
            const m = result.data.metrics;
            document.getElementById("card-users").textContent = m.totalUsers;
            document.getElementById("card-projects").textContent = m.totalProjects;
            document.getElementById("card-active").textContent = m.activeProjects;
            document.getElementById("card-completed").textContent = m.completedProjects;
            document.getElementById("card-revenue").textContent = `$${m.revenue.toLocaleString()}`;
            
            renderCharts(result.data.charts);
        } else {
            console.error(result.message || "Failed to load analytics");
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchProjects() {
    try {
        const res = await fetch(`${API_URL}/project/all`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status === "success") {
            currentProjects = result.data.projects;
            renderProjects();
        }
    } catch (err) {
        console.error(err);
        showToast("Error loading projects", true);
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status === "success") {
            currentUsers = result.data.users;
            renderUsers();
        }
    } catch (err) {
        console.error(err);
        showToast("Error loading users", true);
    }
}

// ----------------------------------------------------
// Rendering
// ----------------------------------------------------
function renderProjects() {
    const tbody = document.getElementById("projects-tbody");
    const filterStatus = document.getElementById("project-status-filter").value;
    const searchTerm = document.getElementById("project-search").value.toLowerCase();
    
    tbody.innerHTML = "";
    
    const filtered = currentProjects.filter(p => {
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        const matchSearch = (p.userId?.name || "Unknown").toLowerCase().includes(searchTerm) || 
                            (p.userId?.email || "").toLowerCase().includes(searchTerm);
        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No projects found.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const badgeClass = p.status.toLowerCase().replace(" ", "-");
        const dateStr = new Date(p.createdAt).toLocaleDateString();
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="font-weight:600">${p.userId?.name || "Unknown"}</div>
                <div style="font-size:12px;color:var(--text-muted)">${p.userId?.email || ""}</div>
            </td>
            <td>${p.serviceName}</td>
            <td>$${p.budget ? p.budget.toLocaleString() : 0}</td>
            <td><span class="status-badge ${badgeClass}">${p.status}</span></td>
            <td>${dateStr}</td>
            <td>
                <button class="btn-primary" style="padding: 6px 12px; font-size:12px" onclick="openProjectModal('${p._id}')">Manage</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUsers() {
    const tbody = document.getElementById("users-tbody");
    tbody.innerHTML = "";
    
    if (currentUsers.length === 0) {
        return tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No users found.</td></tr>`;
    }

    currentUsers.forEach(u => {
        const dateStr = new Date(u.createdAt).toLocaleDateString();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
                <select class="filter-select" style="padding: 4px 8px; font-size:12px" onchange="updateUserRole('${u._id}', this.value)">
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>${dateStr}</td>
            <td>
                <button class="action-btn delete" onclick="deleteUser('${u._id}')">❌ Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ----------------------------------------------------
// Analytics Charts
// ----------------------------------------------------
let sysChart1, sysChart2;
function renderCharts(chartData) {
    // Quick Overview Chart (Bar)
    const ctx1 = document.getElementById('quickChart').getContext('2d');
    if(sysChart1) sysChart1.destroy();
    
    sysChart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: chartData.projectsPerService.labels,
            datasets: [{
                label: 'Projects by Service',
                data: chartData.projectsPerService.data,
                backgroundColor: 'rgba(124, 58, 237, 0.5)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    // Detailed Service Chart (Doughnut)
    const ctx2 = document.getElementById('serviceChart').getContext('2d');
    if(sysChart2) sysChart2.destroy();
    sysChart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: chartData.projectsPerService.labels,
            datasets: [{
                data: chartData.projectsPerService.data,
                backgroundColor: [ '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444' ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff' } }
            }
        }
    });
}

// ----------------------------------------------------
// Actions
// ----------------------------------------------------
async function updateUserRole(id, role) {
    if(!confirm(`Change role to ${role}?`)) return fetchUsers();
    try {
        const res = await fetch(`${API_URL}/users/${id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ role })
        });
        if (res.ok) {
            showToast("Role updated");
            fetchUsers();
        } else showToast("Failed to update role", true);
    } catch {
        showToast("Error updating role", true);
    }
}

async function deleteUser(id) {
    if(!confirm("Are you sure you want to delete this user?")) return;
    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            showToast("User deleted");
            fetchUsers();
        } else showToast("Failed to delete user", true);
    } catch {
        showToast("Error deleting user", true);
    }
}

// ----------------------------------------------------
// Events & Export
// ----------------------------------------------------
document.getElementById("project-status-filter").addEventListener("change", renderProjects);
document.getElementById("project-search").addEventListener("input", renderProjects);

document.getElementById("export-projects-btn").addEventListener("click", () => {
    let csv = 'Client Name,Email,Service,Budget,Status,Date\n';
    currentProjects.forEach(p => {
        csv += `"${p.userId?.name||''}","${p.userId?.email||''}","${p.serviceName}",${p.budget||0},"${p.status}","${new Date(p.createdAt).toLocaleDateString()}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'nexora_projects.csv');
    a.click();
    showToast("Export completed");
});

// ----------------------------------------------------
// Project Modal Logic
// ----------------------------------------------------
let activeProjectId = null;
const modal = document.getElementById("project-modal");

function openProjectModal(id) {
    const p = currentProjects.find(x => x._id === id);
    if (!p) return;
    activeProjectId = id;
    
    let reqHtml = '';
    if(p.requirements) {
        for(const [key, value] of Object.entries(p.requirements)) {
            reqHtml += `<div class="detail-row"><div class="detail-label">${key}</div><div class="detail-value">${value}</div></div>`;
        }
    }
    
    document.getElementById("modal-project-content").innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div>
                <div class="detail-row"><div class="detail-label">Client Name</div><div class="detail-value">${p.userId?.name}</div></div>
                <div class="detail-row"><div class="detail-label">Client Email</div><div class="detail-value">${p.userId?.email}</div></div>
            </div>
            <div>
                <div class="detail-row"><div class="detail-label">Service</div><div class="detail-value">${p.serviceName}</div></div>
                <div class="detail-row"><div class="detail-label">Date Submitted</div><div class="detail-value">${new Date(p.createdAt).toLocaleString()}</div></div>
            </div>
        </div>
        <h3 style="margin-top:16px; border-top:1px solid var(--admin-border); padding-top:16px;">Requirements & Details</h3>
        ${reqHtml}
    `;
    
    document.getElementById("modal-status-select").value = p.status;
    document.getElementById("modal-budget-input").value = p.budget || 0;
    document.getElementById("modal-admin-notes").value = p.adminNotes || "";
    
    modal.classList.add("active");
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
    modal.classList.remove("active");
});

document.getElementById("modal-save-btn").addEventListener("click", async () => {
    if(!activeProjectId) return;
    
    const status = document.getElementById("modal-status-select").value;
    const budget = Number(document.getElementById("modal-budget-input").value);
    const adminNotes = document.getElementById("modal-admin-notes").value;
    
    try {
        const res = await fetch(`${API_URL}/project/${activeProjectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ status, budget, adminNotes })
        });
        
        if (res.ok) {
            showToast("Project updated successfully");
            modal.classList.remove("active");
            fetchProjects();
            fetchAnalytics(); // Refresh counters
        } else {
            showToast("Failed to update project", true);
        }
    } catch (err) {
        showToast("Error updating project", true);
    }
});

// ----------------------------------------------------
// AI Proposal Generator
// ----------------------------------------------------
let currentProposalText = "";

document.getElementById("modal-proposal-btn").addEventListener("click", async () => {
    if (!activeProjectId) return;

    const proposalBtn = document.getElementById("modal-proposal-btn");
    const proposalArea = document.getElementById("modal-proposal-area");
    const proposalText = document.getElementById("modal-proposal-text");

    proposalBtn.textContent = "⏳ Generating...";
    proposalBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/proposal/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ projectId: activeProjectId })
        });

        const result = await res.json();

        if (result.status === "success" && result.data?.proposal) {
            currentProposalText = result.data.proposal.proposalText;
            proposalText.textContent = currentProposalText;
            proposalArea.style.display = "block";
            showToast("Proposal generated successfully!");
        } else {
            showToast(result.error || "Failed to generate proposal", true);
        }
    } catch (err) {
        showToast("Error generating proposal", true);
    }

    proposalBtn.textContent = "🤖 Generate AI Proposal";
    proposalBtn.disabled = false;
});

// Copy proposal to clipboard
document.getElementById("copy-proposal-btn").addEventListener("click", () => {
    if (!currentProposalText) return;
    navigator.clipboard.writeText(currentProposalText).then(() => {
        showToast("📋 Proposal copied to clipboard!");
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = currentProposalText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("📋 Proposal copied!");
    });
});

// Download proposal as text file
document.getElementById("download-proposal-btn").addEventListener("click", () => {
    if (!currentProposalText) return;

    const project = currentProjects.find(x => x._id === activeProjectId);
    const fileName = `NEXORA_Proposal_${project?.serviceName?.replace(/\s+/g, "_") || "Project"}.txt`;

    const blob = new Blob([currentProposalText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("📥 Proposal downloaded!");
});

// Reset proposal area when modal closes
const originalCloseHandler = document.getElementById("modal-close-btn").onclick;
document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("modal-proposal-area").style.display = "none";
    currentProposalText = "";
});

// Init
fetchAnalytics();
fetchProjects();
fetchUsers();

