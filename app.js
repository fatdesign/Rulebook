const API_URL = "https://trademaster.f-klavun.workers.dev/";
let equityChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById("login-screen");
    const dashboard = document.getElementById("dashboard");
    const connectBtn = document.getElementById("connect-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("login-error");

    // Check if already logged in
    const savedKey = localStorage.getItem("tm_license_key");
    if (savedKey) {
        // Automatically try to login if we have a saved key
        loadDashboard(savedKey);
    }

    connectBtn.addEventListener("click", () => {
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();
        
        if (!user || !pass) {
            showError("Please enter Username and Password.");
            return;
        }
        
        // We combine them just like the EA does
        const key = user + ":" + pass;
        loadDashboard(key);
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("tm_license_key");
        dashboard.classList.add("hidden");
        loginScreen.classList.add("active");
    });

    async function loadDashboard(key) {
        connectBtn.innerText = "Loading...";
        errorMsg.classList.add("hidden");

        try {
            // Fetch data from Cloudflare Worker
            const response = await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Invalid License Key or Server Error.");
            }

            const trades = await response.json();
            
            if (trades.length === 0) {
                throw new Error("No trades found for this License Key.");
            }

            // Success! Save key and show dashboard
            localStorage.setItem("tm_license_key", key);
            
            const displayUser = key.split(":")[0];
            document.getElementById("display-key").innerText = `User: ${displayUser}`;
            
            loginScreen.classList.remove("active");
            dashboard.classList.remove("hidden");
            
            processData(trades);

        } catch (err) {
            showError(err.message);
        } finally {
            connectBtn.innerText = "Connect & Analyze";
        }
    }

    function showError(msg) {
        errorMsg.innerText = msg;
        errorMsg.classList.remove("hidden");
    }

    function processData(trades) {
        let totalProfit = 0;
        let wins = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        
        let balance = 0;
        const equityCurve = [0];
        const labels = ["Start"];

        trades.forEach((trade, index) => {
            const p = parseFloat(trade.net_profit);
            totalProfit += p;
            
            if (p > 0) {
                wins++;
                grossProfit += p;
            } else {
                grossLoss += Math.abs(p);
            }

            balance += p;
            equityCurve.push(balance);
            labels.push(`Trade ${index + 1}`);
        });

        const winrate = (wins / trades.length) * 100;
        const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);

        // Update UI
        updateKPI("kpi-profit", `$${totalProfit.toFixed(2)}`, totalProfit >= 0);
        updateKPI("kpi-winrate", `${winrate.toFixed(1)}%`, winrate >= 50);
        document.getElementById("kpi-trades").innerText = trades.length;
        updateKPI("kpi-pf", profitFactor.toFixed(2), profitFactor >= 1.5);

        renderChart(labels, equityCurve);
    }

    function updateKPI(id, text, isPositive) {
        const el = document.getElementById(id);
        el.innerText = text;
        el.className = "kpi-value " + (isPositive ? "positive" : "negative");
    }

    function renderChart(labels, data) {
        const ctx = document.getElementById('equityChart').getContext('2d');
        
        if (equityChartInstance) {
            equityChartInstance.destroy();
        }

        equityChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Net Equity',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

    const aiBtn = document.getElementById("ai-btn");
    const aiContent = document.getElementById("ai-content");

    if (aiBtn) {
        aiBtn.addEventListener("click", async () => {
            const key = localStorage.getItem("tm_license_key");
            if (!key) return;

            aiBtn.innerText = "Analyzing...";
            aiBtn.disabled = true;
            aiContent.innerHTML = `<div class="skeleton-loader"></div><div class="skeleton-loader" style="width: 80%"></div><p class="ai-placeholder-text">Consulting the AI Coach...</p>`;

            try {
                const response = await fetch(`${API_URL}?action=ai_coach`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": key
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to get AI analysis.");
                }

                // Format markdown simple
                let htmlContent = data.analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');

                aiContent.innerHTML = `<div style="font-size: 0.95rem; line-height: 1.5; color: #f8fafc;">${htmlContent}</div>`;
                
                if (data.limitLeft !== undefined) {
                    document.getElementById("ai-limit").innerText = `${data.limitLeft} analyzes left today`;
                }

            } catch (err) {
                aiContent.innerHTML = `<p class="error-msg">${err.message}</p>`;
            } finally {
                aiBtn.innerText = "Ask Coach for Analysis";
                aiBtn.disabled = false;
            }
        });
    }
});
