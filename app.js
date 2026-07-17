const API_URL = "https://trademaster.f-klavun.workers.dev/";
let equityChartInstance = null;
let currentFilteredTrades = [];

const i18n = {
    de: {
        login_sub: "Verbinde dein MT5 Konto für KI Analysen.",
        username_ph: "Benutzername",
        password_ph: "Passwort",
        login_btn: "Einloggen & Analysieren",
        disconnect_btn: "Trennen",
        refresh_btn: "↻ Aktualisieren",
        reset_btn: "⚠ Reset",
        filter_today: "Heute",
        filter_yesterday: "Gestern",
        filter_week: "Diese Woche",
        filter_all: "Alle Trades",
        kpi_profit: "Nettogewinn",
        kpi_winrate: "Gewinnrate",
        kpi_trades: "Gesamt Trades",
        kpi_pf: "Profit Faktor",
        kpi_payoff: "Payoff Ratio",
        kpi_hold_win: "Ø Haltezeit (Gewinner)",
        kpi_hold_loss: "Ø Haltezeit (Verlierer)",
        kpi_drawdown: "Max Drawdown",
        chart_title: "Kapitalkurve",
        trade_list_title: "Letzte Trades (Gefiltert)",
        profile_title: "Trader Profil",
        profile_sub: "Vor der KI-Analyse einstellen",
        prof_style_scalper: "Scalper",
        prof_style_day: "Day Trader",
        prof_style_swing: "Swing Trader",
        prof_risk_cons: "Konservativ",
        prof_risk_mod: "Moderates Risiko",
        prof_risk_agg: "Aggressiv",
        ai_title: "KI Trading Coach",
        ai_btn: "Coach nach Analyse fragen",
        ai_placeholder: "Klicke auf den Button, um eine ehrliche und hilfreiche Analyse deiner letzten Trades zu erhalten.",
        ai_loading: "Konsultiere den KI Coach..."
    },
    en: {
        login_sub: "Connect your MT5 account to view AI insights.",
        username_ph: "Username",
        password_ph: "Password",
        login_btn: "Login & Analyze",
        disconnect_btn: "Disconnect",
        refresh_btn: "↻ Refresh",
        reset_btn: "⚠ Reset",
        filter_today: "Today",
        filter_yesterday: "Yesterday",
        filter_week: "This Week",
        filter_all: "All Trades",
        kpi_profit: "Net Profit",
        kpi_winrate: "Win Rate",
        kpi_trades: "Total Trades",
        kpi_pf: "Profit Factor",
        kpi_payoff: "Payoff Ratio",
        kpi_hold_win: "Avg Hold (Win)",
        kpi_hold_loss: "Avg Hold (Loss)",
        kpi_drawdown: "Max Drawdown",
        chart_title: "Equity Curve",
        trade_list_title: "Recent Trades (Filtered)",
        profile_title: "Trader Profile",
        profile_sub: "Set this before asking the AI",
        prof_style_scalper: "Scalper",
        prof_style_day: "Day Trader",
        prof_style_swing: "Swing Trader",
        prof_risk_cons: "Conservative",
        prof_risk_mod: "Moderate Risk",
        prof_risk_agg: "Aggressive",
        ai_title: "AI Trading Coach",
        ai_btn: "Ask Coach for Analysis",
        ai_placeholder: "Click the button above to get a harsh but helpful AI analysis of your recent trades.",
        ai_loading: "Consulting the AI Coach..."
    },
    es: {
        login_sub: "Conecta tu cuenta MT5 para análisis de IA.",
        username_ph: "Usuario",
        password_ph: "Contraseña",
        login_btn: "Iniciar sesión",
        disconnect_btn: "Desconectar",
        refresh_btn: "↻ Actualizar",
        reset_btn: "⚠ Reset",
        filter_today: "Hoy",
        filter_yesterday: "Ayer",
        filter_week: "Esta Semana",
        filter_all: "Todas",
        kpi_profit: "Beneficio Neto",
        kpi_winrate: "Tasa de Acierto",
        kpi_trades: "Total",
        kpi_pf: "Factor de Beneficio",
        kpi_payoff: "Ratio Payoff",
        kpi_hold_win: "Duración Media (Gana)",
        kpi_hold_loss: "Duración Media (Pierde)",
        kpi_drawdown: "Drawdown Máximo",
        chart_title: "Curva de Capital",
        trade_list_title: "Operaciones Recientes",
        profile_title: "Perfil de Trader",
        profile_sub: "Configura antes de consultar",
        prof_style_scalper: "Scalper",
        prof_style_day: "Day Trader",
        prof_style_swing: "Swing Trader",
        prof_risk_cons: "Conservador",
        prof_risk_mod: "Moderado",
        prof_risk_agg: "Agresivo",
        ai_title: "Coach de Trading IA",
        ai_btn: "Pedir Análisis al Coach",
        ai_placeholder: "Haz clic en el botón de arriba para obtener un análisis honesto de tus operaciones recientes.",
        ai_loading: "Consultando al Coach IA..."
    },
    tr: {
        login_sub: "Yapay zeka analizi için MT5 hesabınızı bağlayın.",
        username_ph: "Kullanıcı Adı",
        password_ph: "Şifre",
        login_btn: "Giriş Yap",
        disconnect_btn: "Çıkış Yap",
        refresh_btn: "↻ Yenile",
        reset_btn: "⚠ Sıfırla",
        filter_today: "Bugün",
        filter_yesterday: "Dün",
        filter_week: "Bu Hafta",
        filter_all: "Tüm İşlemler",
        kpi_profit: "Net Kar",
        kpi_winrate: "Kazanma Oranı",
        kpi_trades: "Toplam İşlem",
        kpi_pf: "Kar Faktörü",
        kpi_payoff: "Ödül Oranı",
        kpi_hold_win: "Ort. Süre (Kazanç)",
        kpi_hold_loss: "Ort. Süre (Kayıp)",
        kpi_drawdown: "Maks. Düşüş",
        chart_title: "Sermaye Eğrisi",
        trade_list_title: "Son İşlemler (Filtrelenmiş)",
        profile_title: "Trader Profili",
        profile_sub: "Yapay zekaya sormadan önce ayarlayın",
        prof_style_scalper: "Scalper",
        prof_style_day: "Day Trader",
        prof_style_swing: "Swing Trader",
        prof_risk_cons: "Muhafazakar",
        prof_risk_mod: "Orta Risk",
        prof_risk_agg: "Agresif",
        ai_title: "Yapay Zeka Koçu",
        ai_btn: "Koçtan Analiz İste",
        ai_placeholder: "Son işlemlerinizin dürüst ve faydalı bir analizini almak için yukarıdaki düğmeye tıklayın.",
        ai_loading: "Yapay Zeka Koçuna Danışılıyor..."
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById("login-screen");
    const dashboard = document.getElementById("dashboard");
    const connectBtn = document.getElementById("connect-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const refreshBtn = document.getElementById("refresh-btn");
    const resetBtn = document.getElementById("reset-btn");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("login-error");

    const globalLang = document.getElementById("global-lang");

    // Profile Elements
    const profStyle = document.getElementById("prof-style");
    const profRisk = document.getElementById("prof-risk");
    const profSessionCheckboxes = document.querySelectorAll(".session-cb");

    // Timeframe state
    let currentTimeframe = "today";
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentTimeframe = e.target.getAttribute("data-timeframe");
            
            const key = localStorage.getItem("tm_license_key");
            if (key) loadDashboard(key);
        });
    });

    // Language Handling
    function setLanguage(lang) {
        if (!i18n[lang]) return;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (i18n[lang][key]) el.innerText = i18n[lang][key];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (i18n[lang][key]) el.placeholder = i18n[lang][key];
        });
    }

    if (globalLang) {
        const savedLang = localStorage.getItem("tm_global_lang") || "de";
        globalLang.value = savedLang;
        setLanguage(savedLang);

        globalLang.addEventListener("change", (e) => {
            const newLang = e.target.value;
            localStorage.setItem("tm_global_lang", newLang);
            setLanguage(newLang);
        });
    }

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

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            const key = localStorage.getItem("tm_license_key");
            if (key) {
                refreshBtn.innerText = "↻ ...";
                loadDashboard(key).then(() => {
                    const lang = globalLang ? globalLang.value : "en";
                    refreshBtn.innerText = i18n[lang] && i18n[lang].refresh_btn ? i18n[lang].refresh_btn : "↻ Refresh";
                });
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
            const key = localStorage.getItem("tm_license_key");
            if (!key) return;
            
            const lang = globalLang ? globalLang.value : "de";
            const msg = lang === "de" 
                ? "Bist du sicher? Alle Trades im Dashboard werden gelöscht (dein MT5 bleibt unangetastet!). Der EA wird in 60s neu synchronisieren."
                : "Are you sure? All trades in the dashboard will be deleted (your MT5 is untouched!). The EA will resync in 60s.";
                
            if (confirm(msg)) {
                resetBtn.innerText = "⏳...";
                try {
                    const response = await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, {
                        method: "DELETE"
                    });
                    if(response.ok) {
                        alert(lang === "de" ? "Dashboard geleert! Warte 60s auf den nächsten EA Sync." : "Dashboard cleared! Wait 60s for the next EA sync.");
                        window.location.reload();
                    } else {
                        alert("Error resetting dashboard.");
                    }
                } catch(err) {
                    alert(err.message);
                } finally {
                    resetBtn.innerText = i18n[lang] && i18n[lang].reset_btn ? i18n[lang].reset_btn : "⚠ Reset";
                }
            }
        });
    }

    // Auto-refresh every 60 seconds
    setInterval(() => {
        const key = localStorage.getItem("tm_license_key");
        if (key && !dashboard.classList.contains("hidden")) {
            loadDashboard(key);
        }
    }, 60000);

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
            
            // Load Settings once
            loadSettings(key);
            
            // Filter trades based on timeframe
            const now = new Date();
            let startTime = 0;
            let endTime = 2000000000;

            // MT5 timestamps represent Server Time as if it were UTC.
            // Therefore, we must construct our boundaries using Date.UTC but with local year/month/date.
            if (currentTimeframe === "today") {
                startTime = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000);
            } else if (currentTimeframe === "yesterday") {
                startTime = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1) / 1000);
                endTime = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000) - 1;
            } else if (currentTimeframe === "week") {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
                startTime = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), diff) / 1000);
            }

            const filteredTrades = trades.filter(t => t.close_time >= startTime && t.close_time <= endTime);
            currentFilteredTrades = filteredTrades;

            // Extract currency and gross profit
            let accCurrency = "USD";
            filteredTrades.forEach(t => {
                // Parse Side, Currency and Gross Profit from side string (e.g. "Buy_EUR_5.50")
                const sideParts = t.side.split('_');
                t.side = sideParts[0]; 
                
                if (sideParts.length > 1) {
                    accCurrency = sideParts[1];
                }
                
                let grossProfit = parseFloat(t.net_profit); // fallback
                if (sideParts.length > 2) {
                    grossProfit = parseFloat(sideParts[2]);
                }
                
                t.gross_profit = grossProfit;
            });

            // Map standard currency codes to symbols
            const currencyMap = {
                "EUR": "€", "USD": "$", "GBP": "£", "JPY": "¥", "CHF": "CHF", "AUD": "A$", "CAD": "C$", "NZD": "NZ$"
            };
            const curSym = currencyMap[accCurrency] || accCurrency;

            processData(filteredTrades, curSym);
        } catch (err) {
            showError(err.message);
        } finally {
            connectBtn.innerText = "Connect & Analyze";
        }
    }

    function formatCurrency(num) {
        return num >= 0 ? "+$" + num.toFixed(2) : "-$" + Math.abs(num).toFixed(2);
    }

    // --- Profile Settings Auto-Save ---
    function loadProfileSettings() {
        if(profStyle && localStorage.getItem("tm_prof_style")) profStyle.value = localStorage.getItem("tm_prof_style");
        if(profRisk && localStorage.getItem("tm_prof_risk")) profRisk.value = localStorage.getItem("tm_prof_risk");
        
        const savedSessions = localStorage.getItem("tm_prof_session");
        if(savedSessions) {
            const sessions = savedSessions.split(",");
            profSessionCheckboxes.forEach(cb => {
                cb.checked = sessions.includes(cb.value);
            });
        }
    }
    
    loadProfileSettings();

    const profileSelects = [profStyle, profRisk];
    profileSelects.forEach(select => {
        if(select) {
            select.addEventListener("change", (e) => {
                localStorage.setItem("tm_" + e.target.id.replace("-", "_"), e.target.value);
            });
        }
    });

    profSessionCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const selected = Array.from(profSessionCheckboxes).filter(c => c.checked).map(c => c.value);
            localStorage.setItem("tm_prof_session", selected.join(","));
        });
    });

    function showError(msg) {
        errorMsg.innerText = msg;
        errorMsg.classList.remove("hidden");
    }

    function processData(trades, curSym) {
        let totalProfit = 0;
        let wins = 0;
        let losses = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        
        let totalHoldWins = 0;
        let totalHoldLosses = 0;
        let peakBalance = 0;
        let maxDrawdown = 0;
        
        let balance = 0;
        const equityCurve = [0];
        const labels = ["Start"];

        const ascendingTrades = [...trades].reverse();
        let revengeTrades = 0;
        const heatmapData = new Array(7).fill(0).map(() => new Array(24).fill(0));

        ascendingTrades.forEach((trade, index) => {
            const netP = parseFloat(trade.net_profit);
            const grossP = trade.gross_profit !== undefined ? trade.gross_profit : netP;
            const holdSec = trade.close_time - trade.open_time;
            
            // Revenge trade check
            if (index > 0) {
                const prevTrade = ascendingTrades[index - 1];
                const prevGross = prevTrade.gross_profit !== undefined ? prevTrade.gross_profit : parseFloat(prevTrade.net_profit);
                if (prevGross < 0 && (trade.open_time - prevTrade.close_time) < 900) {
                    revengeTrades++;
                }
            }
            
            // Heatmap aggregation
            const date = new Date(trade.close_time * 1000);
            heatmapData[date.getDay()][date.getHours()] += grossP;
            
            totalProfit += netP;
            
            // Win Rate and Profit Factor based on Gross Profit (Market Movement) to match MT5
            if (grossP > 0) {
                wins++;
                grossProfit += grossP;
                totalHoldWins += holdSec;
            } else if (grossP <= 0) {
                losses++;
                grossLoss += Math.abs(grossP);
                totalHoldLosses += Math.max(0, holdSec);
            }

            balance += netP;
            if (balance > peakBalance) peakBalance = balance;
            const drawdown = peakBalance - balance;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;

            equityCurve.push(balance);
            labels.push(`Trade ${index + 1}`);
        });

        const totalWinLoss = wins + losses;
        const winrate = totalWinLoss > 0 ? (wins / totalWinLoss) * 100 : 0;
        const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);
        
        const avgWin = wins > 0 ? (grossProfit / wins) : 0;
        const avgLoss = losses > 0 ? (grossLoss / losses) : 0;
        const payoffRatio = avgLoss > 0 ? (avgWin / avgLoss) : avgWin;
        
        const avgHoldWin = wins > 0 ? (totalHoldWins / wins) : 0;
        const avgHoldLoss = losses > 0 ? (totalHoldLosses / losses) : 0;

        function formatHoldTime(sec) {
            if (sec < 60) return `${Math.round(sec)}s`;
            const m = Math.floor(sec / 60);
            if (m < 60) return `${m}m`;
            const h = Math.floor(m / 60);
            const rm = m % 60;
            return `${h}h ${rm}m`;
        }

        // Update UI
        updateKPI("kpi-profit", `${curSym}${totalProfit.toFixed(2)}`, totalProfit >= 0);
        updateKPI("kpi-winrate", `${winrate.toFixed(1)}%`, winrate >= 50);
        document.getElementById("kpi-trades").innerText = trades.length;
        updateKPI("kpi-pf", profitFactor.toFixed(2), profitFactor >= 1.5);
        
        // Advanced UI
        updateKPI("kpi-payoff", payoffRatio.toFixed(2), payoffRatio >= 1.0);
        updateKPI("kpi-hold-win", formatHoldTime(avgHoldWin), true);
        updateKPI("kpi-hold-loss", formatHoldTime(avgHoldLoss), false);
        updateKPI("kpi-drawdown", `-${curSym}${maxDrawdown.toFixed(2)}`, false);

        // Revenge Trades & Discipline
        const discScore = trades.length > 0 ? Math.max(0, 100 - (revengeTrades / trades.length) * 100) : 100;
        document.getElementById("kpi-revenge").innerText = revengeTrades;
        document.getElementById("kpi-discipline").innerText = `Disziplin: ${discScore.toFixed(0)}%`;
        document.getElementById("kpi-discipline").style.color = discScore > 80 ? "#10b981" : (discScore > 50 ? "#f59e0b" : "#ef4444");

        renderChart(labels, equityCurve);
        renderHeatmap(heatmapData, curSym);
    }

    function renderHeatmap(data, curSym) {
        const grid = document.getElementById("heatmap-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        // Add Header Row
        grid.appendChild(document.createElement("div")); // Empty top-left
        for (let h = 0; h < 24; h++) {
            const hDiv = document.createElement("div");
            hDiv.innerText = h;
            hDiv.style.textAlign = "center";
            grid.appendChild(hDiv);
        }
        
        for (let d = 0; d < 7; d++) {
            const rowLabel = document.createElement("div");
            rowLabel.className = "heatmap-label";
            rowLabel.innerText = days[d];
            grid.appendChild(rowLabel);
            
            for (let h = 0; h < 24; h++) {
                const val = data[d][h];
                const cell = document.createElement("div");
                cell.className = "heatmap-cell";
                if (val > 0) {
                    const intensity = Math.min(1, val / 50); // Scale up to $50
                    cell.style.background = `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`;
                } else if (val < 0) {
                    const intensity = Math.min(1, Math.abs(val) / 50);
                    cell.style.background = `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;
                }
                if (val !== 0) {
                    cell.title = `${days[d]} ${h}:00 -> ${curSym}${val.toFixed(2)}`;
                }
                grid.appendChild(cell);
            }
        }
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
            if (globalLang) {
                const lang = globalLang.value;
                aiContent.innerHTML = `<div class="skeleton-loader"></div><div class="skeleton-loader" style="width: 80%"></div><p class="ai-placeholder-text">${i18n[lang] ? i18n[lang].ai_loading : "Consulting the AI Coach..."}</p>`;
            }

            try {
                const selectedSessions = Array.from(profSessionCheckboxes).filter(c => c.checked).map(c => c.value);
                const profileData = {
                    style: profStyle ? profStyle.value : "Unknown",
                    session: selectedSessions.length > 0 ? selectedSessions.join(", ") : "Any",
                    risk: profRisk ? profRisk.value : "Unknown",
                    language: globalLang ? globalLang.value : "de",
                    timeframe: currentTimeframe,
                    trades: currentFilteredTrades.map(t => ({
                        symbol: t.symbol,
                        side: t.side,
                        net_profit: t.net_profit,
                        gross_profit: t.gross_profit,
                        open_time: t.open_time,
                        close_time: t.close_time
                    }))
                };

                const response = await fetch(`${API_URL}?action=ai_coach`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": key
                    },
                    body: JSON.stringify(profileData)
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
                if (globalLang) {
                    aiBtn.innerText = i18n[globalLang.value] ? i18n[globalLang.value].ai_btn : "Ask Coach for Analysis";
                }
                aiBtn.disabled = false;
            }
        });
        });
    }

    // --- Kill-Switch Settings ---
    async function loadSettings(key) {
        try {
            const response = await fetch(`${API_URL}?action=settings`, {
                method: "GET",
                headers: { "Authorization": key }
            });
            if (response.ok) {
                const settings = await response.json();
                const ksToggle = document.getElementById("kill-switch-toggle");
                const ksLimit = document.getElementById("kill-switch-limit");
                if(ksToggle) ksToggle.checked = settings.kill_switch_active === 1;
                if(ksLimit) ksLimit.value = settings.max_daily_loss;
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }

    async function saveSettings(key) {
        try {
            await fetch(`${API_URL}?action=settings`, {
                method: "POST",
                headers: { "Authorization": key, "Content-Type": "application/json" },
                body: JSON.stringify({
                    kill_switch_active: document.getElementById("kill-switch-toggle").checked,
                    max_daily_loss: parseFloat(document.getElementById("kill-switch-limit").value) || 0
                })
            });
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    }

    const ksToggle = document.getElementById("kill-switch-toggle");
    const ksSaveBtn = document.getElementById("kill-switch-save");
    const ksModal = document.getElementById("kill-switch-modal");
    const ksCancel = document.getElementById("modal-cancel-btn");
    const ksConfirm = document.getElementById("modal-confirm-btn");

    if (ksToggle && ksSaveBtn) {
        ksToggle.addEventListener("change", (e) => {
            if (!e.target.checked) {
                ksModal.classList.remove("hidden");
                e.target.checked = true; // revert until confirmed
            } else {
                saveSettings(localStorage.getItem("tm_license_key"));
            }
        });

        ksCancel.addEventListener("click", () => {
            ksModal.classList.add("hidden");
        });

        ksConfirm.addEventListener("click", () => {
            ksToggle.checked = false;
            saveSettings(localStorage.getItem("tm_license_key"));
            ksModal.classList.add("hidden");
        });

        ksSaveBtn.addEventListener("click", () => {
            saveSettings(localStorage.getItem("tm_license_key"));
            ksSaveBtn.innerText = "Saved!";
            setTimeout(() => ksSaveBtn.innerText = "Save", 2000);
        });
    }

    // Attach loadSettings to window so it can be called from loadDashboard
    window.loadSettings = loadSettings;
});
