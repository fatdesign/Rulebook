const API_URL = "https://Rulebook.f-klavun.workers.dev/api";
const ADMIN_PW_KEY = "rb_admin_pw";

const STAT_DEFS = [
  { key: "total_users", label: "Nutzer gesamt" },
  { key: "new_users_7d", label: "Neue Nutzer (7T)" },
  { key: "new_users_30d", label: "Neue Nutzer (30T)" },
  { key: "total_accounts", label: "Verknüpfte Konten" },
  { key: "active_accounts_7d", label: "Aktive Konten (7T)", sub: "mind. 1 Trade in 7 Tagen" },
  { key: "total_trades", label: "Trades gesamt" },
  { key: "trades_24h", label: "Trades (24h)" },
  { key: "trades_7d", label: "Trades (7T)" },
  { key: "community_posts_total", label: "Community-Posts" },
  { key: "community_posts_7d", label: "Community-Posts (7T)" },
  { key: "kill_switch_active_accounts", label: "Kill-Switch aktiv" },
  { key: "ai_coach_analyses_total", label: "AI Coach Analysen" },
  { key: "weekly_reports_total", label: "Wochenrückblicke erzeugt" },
];

let currentOffset = 0;
const PAGE_SIZE = 50;
let currentQuery = "";
let searchDebounce = null;

function getStoredPassword() {
  return sessionStorage.getItem(ADMIN_PW_KEY);
}

function showLogin(errorMsg) {
  document.getElementById("admin-login-screen").classList.remove("hidden");
  document.getElementById("admin-dashboard").classList.add("hidden");
  const err = document.getElementById("admin-login-error");
  if (err) err.innerText = errorMsg || "";
}

function showDashboard() {
  document.getElementById("admin-login-screen").classList.add("hidden");
  document.getElementById("admin-dashboard").classList.remove("hidden");
}

async function adminFetch(action, params, method) {
  const password = getStoredPassword();
  const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
  const response = await fetch(`${API_URL}?${qs}`, {
    method: method || "GET",
    headers: { Authorization: password || "" },
  });
  if (response.status === 401) {
    sessionStorage.removeItem(ADMIN_PW_KEY);
    showLogin("Sitzung abgelaufen. Bitte erneut einloggen.");
    throw new Error("Unauthorized");
  }
  if (!response.ok) throw new Error("Request failed: " + response.status);
  return response.json();
}

function formatTimestamp(sec) {
  if (!sec) return "—";
  const d = new Date(sec * 1000);
  return d.toLocaleDateString("de-DE") + " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

async function handleDeleteUser(btn) {
  const userId = btn.getAttribute("data-user-id");
  const email = btn.getAttribute("data-email");

  const typed = prompt(
    `Diese Aktion löscht den Nutzer "${email}" und ALLE zugehörigen Daten (Trades, Journal, Community-Posts, Strategien, ...) UNWIDERRUFLICH.\n\nTippe die E-Mail-Adresse zur Bestätigung ein:`,
  );
  if (typed === null) return; // cancelled
  if (typed.trim().toLowerCase() !== (email || "").trim().toLowerCase()) {
    alert("E-Mail stimmt nicht überein. Löschung abgebrochen.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "...";
  try {
    const data = await adminFetch(
      "admin_delete_user",
      { user_id: userId },
      "DELETE",
    );
    if (data.success) {
      loadStats();
      loadUsers();
    } else {
      alert("Fehler: " + (data.error || "Unbekannter Fehler"));
      btn.disabled = false;
      btn.innerText = "Löschen";
    }
  } catch (e) {
    alert("Fehler beim Löschen: " + e.message);
    btn.disabled = false;
    btn.innerText = "Löschen";
  }
}

async function handleResetPassword(btn) {
  const userId = btn.getAttribute("data-user-id");
  const email = btn.getAttribute("data-email");

  const newPw = prompt(`Neues Passwort für ${email} eingeben:`);
  if (!newPw) return;

  btn.disabled = true;
  btn.innerText = "...";
  try {
    const data = await adminFetch(
      "admin_reset_password",
      { user_id: userId, new_password: newPw },
      "POST"
    );
    if (data.success) {
      alert(`Passwort für ${email} wurde erfolgreich geändert.`);
    } else {
      alert("Fehler: " + (data.error || "Unbekannter Fehler"));
    }
  } catch (e) {
    alert("Fehler beim Ändern: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="ph ph-key"></i> PW setzen`;
  }
}

function renderStats(data) {
  const grid = document.getElementById("admin-stats-grid");
  grid.innerHTML = STAT_DEFS.map((def) => {
    const value = data[def.key];
    const displayValue = typeof value === "number" ? value.toLocaleString("de-DE") : (value ?? "—");
    return `
      <div class="admin-stat-card glass-panel">
        <h4>${def.label}</h4>
        <div class="val">${displayValue}</div>
        ${def.sub ? `<div class="sub">${def.sub}</div>` : ""}
      </div>
    `;
  }).join("");
}

function renderUsers(data) {
  const tbody = document.getElementById("admin-users-tbody");
  const users = data.users || [];

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 20px;">Keine Nutzer gefunden.</td></tr>`;
  } else {
    tbody.innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${escapeHtml(u.email || "—")}</td>
          <td>${escapeHtml(u.username || "—")}</td>
          <td>${formatTimestamp(u.created_at)}</td>
          <td>${u.linked_accounts ?? 0}</td>
          <td>${formatTimestamp(u.last_trade_at)}</td>
          <td>
            <button
              class="secondary-btn admin-reset-pw-btn"
              data-user-id="${u.id}"
              data-email="${escapeHtml(u.email || "")}"
              style="padding: 4px 10px; margin-right: 5px; font-size: 0.78rem;"
            >
              <i class="ph ph-key"></i> PW setzen
            </button>
            <button
              class="secondary-btn admin-delete-user-btn"
              data-user-id="${u.id}"
              data-email="${escapeHtml(u.email || "")}"
              style="padding: 4px 10px; border-color: var(--danger); color: var(--danger); font-size: 0.78rem;"
            >
              <i class="ph ph-trash"></i> Löschen
            </button>
          </td>
        </tr>
      `,
      )
      .join("");

    tbody.querySelectorAll(".admin-reset-pw-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleResetPassword(btn));
    });

    tbody.querySelectorAll(".admin-delete-user-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleDeleteUser(btn));
    });
  }

  const pagination = document.getElementById("admin-users-pagination");
  const total = data.total || 0;
  const from = total === 0 ? 0 : currentOffset + 1;
  const to = Math.min(currentOffset + PAGE_SIZE, total);
  pagination.innerHTML = `
    <button id="admin-prev-page" class="secondary-btn" style="padding: 4px 12px;" ${currentOffset === 0 ? "disabled" : ""}>&larr; Zurück</button>
    <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">${from}–${to} von ${total}</span>
    <button id="admin-next-page" class="secondary-btn" style="padding: 4px 12px;" ${to >= total ? "disabled" : ""}>Weiter &rarr;</button>
  `;
  document.getElementById("admin-prev-page").addEventListener("click", () => {
    currentOffset = Math.max(0, currentOffset - PAGE_SIZE);
    loadUsers();
  });
  document.getElementById("admin-next-page").addEventListener("click", () => {
    currentOffset += PAGE_SIZE;
    loadUsers();
  });
}

async function loadStats() {
  try {
    const data = await adminFetch("admin_stats");
    renderStats(data);
  } catch (e) {
    console.error("Failed to load admin stats", e);
  }
}

async function loadUsers() {
  try {
    const data = await adminFetch("admin_users", {
      q: currentQuery,
      limit: PAGE_SIZE,
      offset: currentOffset,
    });
    renderUsers(data);
  } catch (e) {
    console.error("Failed to load admin users", e);
  }
}

async function loadAll() {
  showDashboard();
  await Promise.all([loadStats(), loadUsers()]);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("admin-login-btn");
  const pwInput = document.getElementById("admin-password-input");
  const logoutBtn = document.getElementById("admin-logout-btn");
  const refreshBtn = document.getElementById("admin-refresh-btn");
  const searchInput = document.getElementById("admin-user-search");

  async function attemptLogin() {
    const password = pwInput.value;
    if (!password) return;
    loginBtn.disabled = true;
    loginBtn.innerText = "...";
    try {
      const response = await fetch(`${API_URL}?action=admin_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        sessionStorage.setItem(ADMIN_PW_KEY, password);
        pwInput.value = "";
        loadAll();
      } else {
        showLogin("Falsches Passwort.");
      }
    } catch (e) {
      showLogin("Fehler beim Login: " + e.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "Einloggen";
    }
  }

  loginBtn.addEventListener("click", attemptLogin);
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_PW_KEY);
    showLogin();
  });

  refreshBtn.addEventListener("click", loadAll);

  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      currentQuery = searchInput.value.trim();
      currentOffset = 0;
      loadUsers();
    }, 300);
  });

  if (getStoredPassword()) {
    loadAll();
  } else {
    showLogin();
  }
});
