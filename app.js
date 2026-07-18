const API_URL = "https://Rulebook.f-klavun.workers.dev/";
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
        kpi_edge: "Long vs. Short",
        kpi_hold_win: "Ø Haltezeit (Gewinner)",
        kpi_hold_loss: "Ø Haltezeit (Verlierer)",
        kpi_drawdown: "Max Drawdown",
        chart_title: "Kapitalkurve",
        chart_symbols: "Symbol Performance",
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
        ai_loading: "Konsultiere den KI Coach...",
        tilt_sub: "Revenge Trades (< 15 mins nach Verlust)",
        killswitch_sub: "EA blockiert Trades bei Tagesverlust-Limit",
        heatmap_sub: "Wann verdienst du am meisten?",
        save_btn: "Speichern",
        limit_lbl: "Limit: ",
        modal_warn: "WARNUNG",
        modal_desc: "Das Deaktivieren des Kill-Switches ist hochriskant. Du bist dabei, deinen Schutzmechanismus abzuschalten und könntest deinen Tagesverlust überschreiten!",
        modal_cancel: "Abbrechen (Sicher bleiben)",
        modal_confirm: "Trotzdem deaktivieren",
        discipline_lbl: "Disziplin",
        setup_btn: "Wie richte ich den EA ein?",
        setup_step1: "Lade den Rulebook Exporter EA im MQL5 Market herunter.",
        setup_step2: "Ziehe ihn auf genau EINEN Chart in deinem MetaTrader 5.",
        setup_step3: "Trage in den EA-Einstellungen deine Dashboard E-Mail & Passwort ein.",
        setup_step4: "Der EA verbindet sich nun automatisch mit deinem Workspace!",
        mql5_link: "Rulebook auf MQL5 ansehen",
        master_login_sub: "Logge dich in deinen Rulebook Workspace ein.",
        email_ph: "E-Mail Adresse",
        master_register_sub: "Erstelle deinen Rulebook Workspace.",
        no_account: "Noch keinen Account?",
        have_account: "Bereits einen Account?",
        register_link: "Hier registrieren",
        login_link: "Hier einloggen",
        register_btn: "Workspace erstellen",
        link_account_title: "MT5 Account verknüpfen",
        link_account_desc: "Gib den Benutzernamen und das Passwort ein, die du im MetaTrader EA verwendest.",
        mt5_user_ph: "MT5 Benutzername",
        mt5_pass_ph: "MT5 Passwort",
        link_btn: "Verknüpfen",
        cancel_btn: "Abbrechen",
        kpi_best_day: "Bester Tag",
        kpi_worst_day: "Schlechtester Tag",
        days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        journal_title: "Mental Journal",
        journal_save: "Eintrag speichern",
        journal_ph: "Wie fühlst du dich heute bei deinen Trades? Hast du deinen Plan befolgt?",
        heatmap_title: "Profit Heatmap",
        tilt_title: "Tilt-Meter",
        killswitch_title: "Kill-Switch",
        trades_title: "Letzte Trades & Tags",
        th_symbol: "Symbol",
        th_side: "Seite",
        th_profit: "Gewinn",
        th_close: "Haltezeit",
        th_note: "Tag / Notiz",
        note_ph: "Notiz oder #Tag hinzufügen...",
        th_gain: "% Gain",
        strategy_title: "STRATEGIE DEFINITIONEN // SYSTEME",
        strategy_add_btn: "+ Neue Strategie",
        th_strategy: "Strategie",
        strategy_name_lbl: "Strategie Name",
        strategy_desc_lbl: "Regeln / Beschreibung"
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
        kpi_edge: "Long vs. Short Edge",
        kpi_hold_win: "Avg Hold (Win)",
        kpi_hold_loss: "Avg Hold (Loss)",
        kpi_drawdown: "Max Drawdown",
        chart_title: "Equity Curve",
        chart_symbols: "Symbol Performance",
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
        ai_loading: "Consulting the AI Coach...",
        tilt_sub: "Revenge Trades (< 15 mins after loss)",
        killswitch_sub: "EA blocks trades at daily loss limit",
        heatmap_sub: "When do you earn the most?",
        save_btn: "Save",
        limit_lbl: "Limit: ",
        modal_warn: "WARNING",
        modal_desc: "Deactivating the Kill-Switch is highly risky. You are about to disable your protection mechanism and could exceed your daily loss limit!",
        modal_cancel: "Cancel (Stay Safe)",
        modal_confirm: "Deactivate anyway",
        discipline_lbl: "Discipline",
        setup_btn: "How to Setup & Get the EA",
        setup_step1: "Download the Rulebook Exporter EA from MQL5 Market.",
        setup_step2: "Attach it to exactly ONE chart in your MetaTrader 5 terminal.",
        setup_step3: "Enter your Dashboard Email & Password in the EA inputs.",
        setup_step4: "The EA will now automatically link to your Workspace!",
        mql5_link: "Get Rulebook on MQL5",
        master_login_sub: "Login to your Rulebook Workspace.",
        email_ph: "Email Address",
        master_register_sub: "Create your Rulebook Workspace.",
        no_account: "Don't have an account?",
        have_account: "Already have an account?",
        register_link: "Register here",
        login_link: "Login here",
        register_btn: "Create Workspace",
        link_account_title: "Link MT5 Account",
        link_account_desc: "Enter the username and password you use in the MetaTrader EA.",
        mt5_user_ph: "MT5 Username",
        mt5_pass_ph: "MT5 Password",
        link_btn: "Link Account",
        cancel_btn: "Cancel",
        kpi_best_day: "Best Day",
        kpi_worst_day: "Worst Day",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        journal_title: "Mental Journal",
        journal_save: "Save Entry",
        journal_ph: "How are you feeling about your trades today? Did you follow your plan?",
        heatmap_title: "Profit Heatmap",
        tilt_title: "Tilt-Meter",
        killswitch_title: "Kill-Switch",
        trades_title: "Recent Trades & Tags",
        th_symbol: "Symbol",
        th_side: "Side",
        th_profit: "Profit",
        th_close: "Duration",
        th_note: "Tag / Note",
        note_ph: "Add note or #tag...",
        th_gain: "% Gain",
        strategy_title: "STRATEGY DEFINITIONS // SYSTEMS",
        strategy_add_btn: "+ New Strategy",
        th_strategy: "Strategy",
        strategy_name_lbl: "Strategy Name",
        strategy_desc_lbl: "Rules / Description"
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
        kpi_edge: "Long vs. Short",
        kpi_hold_win: "Duración Media (Gana)",
        kpi_hold_loss: "Duración Media (Pierde)",
        kpi_drawdown: "Drawdown Máximo",
        chart_title: "Curva de Capital",
        chart_symbols: "Rendimiento del Símbolo",
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
        ai_loading: "Consultando al Coach IA...",
        tilt_sub: "Operaciones de Revancha (< 15 mins post-pérdida)",
        killswitch_sub: "El EA bloquea trades al llegar al límite diario",
        heatmap_sub: "¿Cuándo ganas más?",
        save_btn: "Guardar",
        limit_lbl: "Límite: ",
        modal_warn: "ADVERTENCIA",
        modal_desc: "Desactivar el Kill-Switch es muy arriesgado. ¡Estás a punto de deshabilitar tu protección y podrías superar tu límite de pérdida diaria!",
        modal_cancel: "Cancelar (Mantener Seguro)",
        modal_confirm: "Desactivar de todos modos",
        discipline_lbl: "Disciplina",
        setup_btn: "Cómo configurar y obtener el EA",
        setup_step1: "Descarga el EA Rulebook Exporter desde MQL5 Market.",
        setup_step2: "Añádelo a UN SOLO gráfico en tu MetaTrader 5.",
        setup_step3: "Introduce tu Correo y Contraseña del Dashboard en los ajustes del EA.",
        setup_step4: "¡El EA se vinculará automáticamente a tu Workspace!",
        mql5_link: "Ver Rulebook en MQL5",
        master_login_sub: "Inicia sesión en tu Workspace de Rulebook.",
        email_ph: "Correo Electrónico",
        master_register_sub: "Crea tu Workspace de Rulebook.",
        no_account: "¿No tienes cuenta?",
        have_account: "¿Ya tienes cuenta?",
        register_link: "Regístrate aquí",
        login_link: "Inicia sesión aquí",
        register_btn: "Crear Workspace",
        link_account_title: "Vincular Cuenta MT5",
        link_account_desc: "Introduce el usuario y contraseña que usas en el EA de MetaTrader.",
        mt5_user_ph: "Usuario MT5",
        mt5_pass_ph: "Contraseña MT5",
        link_btn: "Vincular",
        cancel_btn: "Cancelar",
        kpi_best_day: "Mejor Día",
        kpi_worst_day: "Peor Día",
        days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        journal_title: "Diario Mental",
        journal_save: "Guardar Entrada",
        journal_ph: "¿Cómo te sientes con tus operaciones hoy? ¿Seguiste tu plan?",
        heatmap_title: "Mapa de Calor",
        tilt_title: "Medidor de Tilt",
        killswitch_title: "Kill-Switch",
        trades_title: "Operaciones Recientes",
        th_symbol: "Símbolo",
        th_side: "Lado",
        th_profit: "Beneficio",
        th_close: "Duración",
        th_note: "Etiqueta / Nota",
        note_ph: "Añadir nota o #etiqueta...",
        th_gain: "% Gain",
        strategy_title: "DEFINICIONES DE ESTRATEGIA // SISTEMAS",
        strategy_add_btn: "+ Nueva Estrategia",
        th_strategy: "Estrategia",
        strategy_name_lbl: "Nombre de Estrategia",
        strategy_desc_lbl: "Reglas / Descripción"
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
        kpi_edge: "Long vs. Short",
        kpi_hold_win: "Ort. Süre (Kazanç)",
        kpi_hold_loss: "Ort. Süre (Kayıp)",
        kpi_drawdown: "Maks. Düşüş",
        chart_title: "Sermaye Eğrisi",
        chart_symbols: "Sembol Performansı",
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
        ai_loading: "Yapay Zeka Koçuna Danışılıyor...",
        tilt_sub: "İntikam İşlemleri (Kayıptan < 15 dk sonra)",
        killswitch_sub: "Günlük kayıp limitinde işlemleri durdurur",
        heatmap_sub: "En çok ne zaman kazanıyorsun?",
        save_btn: "Kaydet",
        limit_lbl: "Limit: ",
        modal_warn: "UYARI",
        modal_desc: "Kill-Switch'i devre dışı bırakmak yüksek risklidir. Koruma mekanizmanızı kapatmak üzeresiniz ve günlük kayıp limitinizi aşabilirsiniz!",
        modal_cancel: "İptal (Güvende Kal)",
        modal_confirm: "Yine de Kapat",
        discipline_lbl: "Disiplin",
        setup_btn: "Kurulum ve EA'yı İndirme",
        setup_step1: "Rulebook Exporter EA'yı MQL5 Market'ten indirin.",
        setup_step2: "MetaTrader 5'inizde SADECE BİR grafiğe ekleyin.",
        setup_step3: "EA ayarlarına Dashboard E-posta ve Şifrenizi girin.",
        setup_step4: "EA artık Workspace'inize otomatik olarak bağlanacaktır!",
        mql5_link: "MQL5'te Rulebook'ı İncele",
        master_login_sub: "Rulebook Workspace'inize giriş yapın.",
        email_ph: "E-posta Adresi",
        master_register_sub: "Rulebook Workspace'inizi oluşturun.",
        no_account: "Hesabınız yok mu?",
        have_account: "Zaten bir hesabınız var mı?",
        register_link: "Buradan kayıt olun",
        login_link: "Buradan giriş yapın",
        register_btn: "Workspace Oluştur",
        link_account_title: "MT5 Hesabını Bağla",
        link_account_desc: "MetaTrader EA'da kullandığınız kullanıcı adı ve şifreyi girin.",
        mt5_user_ph: "MT5 Kullanıcı Adı",
        mt5_pass_ph: "MT5 Şifresi",
        link_btn: "Bağla",
        cancel_btn: "İptal",
        kpi_best_day: "En İyi Gün",
        kpi_worst_day: "En Kötü Gün",
        days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
        journal_title: "Zihinsel Günlük",
        journal_save: "Kaydı Kaydet",
        journal_ph: "Bugünkü işlemleriniz hakkında nasıl hissediyorsunuz? Planınıza uydunuz mu?",
        heatmap_title: "Kâr Isı Haritası",
        tilt_title: "Tilt Ölçer",
        killswitch_title: "Kill-Switch",
        trades_title: "Son İşlemler & Etiketler",
        th_symbol: "Sembol",
        th_side: "Yön",
        th_profit: "Kâr",
        th_close: "Süre",
        th_note: "Etiket / Not",
        note_ph: "Not veya #etiket ekle...",
        th_gain: "% Gain",
        strategy_title: "STRATEJİ TANIMLARI // SİSTEMLER",
        strategy_add_btn: "+ Yeni Strateji",
        th_strategy: "Strateji",
        strategy_name_lbl: "Strateji Adı",
        strategy_desc_lbl: "Kurallar / Açıklama"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById("login-screen");
    const dashboard = document.getElementById("dashboard");
    const connectBtn = document.getElementById("connect-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const refreshBtn = document.getElementById("refresh-btn");
    const resetBtn = document.getElementById("reset-btn");
    const deleteAccountBtn = document.getElementById("delete-account-btn");
    const accountSwitcher = document.getElementById("account-switcher");
    const addAccountBtn = document.getElementById("add-account-btn");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("login-error");

    const globalLang = document.getElementById("global-lang");
    const loginLang = document.getElementById("login-lang");
    
    // Accordion Logic
    const accordionBtn = document.getElementById("setup-accordion-btn");
    const accordionContent = document.getElementById("setup-accordion-content");
    const setupCaret = document.getElementById("setup-caret");
    
    if (accordionBtn) {
        accordionBtn.addEventListener("click", () => {
            accordionContent.classList.toggle("hidden");
            if (accordionContent.classList.contains("hidden")) {
                setupCaret.style.transform = "rotate(0deg)";
            } else {
                setupCaret.style.transform = "rotate(180deg)";
            }
        });
    }

    // Profile Elements
    const profStyle = document.getElementById("prof-style");
    const profRisk = document.getElementById("prof-risk");
    const profSessionCheckboxes = document.querySelectorAll(".session-cb");

    // Timeframe state
    let currentTimeframe = "current_month";
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

    const monthSelector = document.getElementById("month-selector");
    if(monthSelector) {
        monthSelector.addEventListener("change", (e) => {
            currentTimeframe = e.target.value;
            filterBtns.forEach(b => b.classList.remove("active"));
            
            const key = localStorage.getItem("tm_license_key");
            if (key) loadDashboard(key);
        });
    }

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
        
        const discSpan = document.getElementById("kpi-discipline");
        if(discSpan) {
            const currentText = discSpan.innerText;
            const scoreMatch = currentText.match(/:\s*(\d+)%/);
            if(scoreMatch) {
                 discSpan.innerText = `${i18n[lang].discipline_lbl}: ${scoreMatch[1]}%`;
            }
        }
    }

    if (globalLang) {
        const savedLang = localStorage.getItem("tm_global_lang") || "de";
        globalLang.value = savedLang;
        if (loginLang) loginLang.value = savedLang;
        setLanguage(savedLang);

        globalLang.addEventListener("change", (e) => {
            const newLang = e.target.value;
            localStorage.setItem("tm_global_lang", newLang);
            if (loginLang) loginLang.value = newLang;
            setLanguage(newLang);
            
            const key = localStorage.getItem("tm_license_key");
            if (key) loadDashboard(key);
        });
    }
    
    if (loginLang) {
        loginLang.addEventListener("change", (e) => {
            const newLang = e.target.value;
            localStorage.setItem("tm_global_lang", newLang);
            if (globalLang) globalLang.value = newLang;
            setLanguage(newLang);
        });
    }

    // Theme Toggle Logic
    const themeSelects = document.querySelectorAll(".theme-select");
    const savedTheme = localStorage.getItem("tm_theme") || "neo-retro";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    themeSelects.forEach(sel => {
        sel.value = savedTheme;
        sel.addEventListener("change", (e) => {
            const t = e.target.value;
            document.documentElement.setAttribute("data-theme", t);
            localStorage.setItem("tm_theme", t);
            themeSelects.forEach(s => s.value = t);
        });
    });

    // --- Master Account Logic ---
    const loginFormView = document.getElementById("login-form-view");
    const registerFormView = document.getElementById("register-form-view");
    const showRegisterLink = document.getElementById("show-register-link");
    const showLoginLink = document.getElementById("show-login-link");
    const masterLoginBtn = document.getElementById("master-login-btn");
    const masterRegisterBtn = document.getElementById("master-register-btn");
    
    function showError(msg) {
        if (!errorMsg) return;
        errorMsg.innerText = msg;
        errorMsg.classList.remove("hidden");
    }
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginFormView.classList.add("hidden");
            registerFormView.classList.remove("hidden");
            errorMsg.classList.add("hidden");
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            registerFormView.classList.add("hidden");
            loginFormView.classList.remove("hidden");
            errorMsg.classList.add("hidden");
        });
    }

    async function handleMasterAuth(action, email, password, btn) {
        if (!email || !password) {
            showError("Please enter Email and Password.");
            return;
        }
        btn.disabled = true;
        const oldText = btn.innerText;
        btn.innerText = "Loading...";
        errorMsg.classList.add("hidden");
        try {
            const res = await fetch(`${API_URL}?action=${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" , "Authorization": localStorage.getItem("tm_master_token") },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Authentication failed");
            
            localStorage.setItem("tm_master_token", data.token);
            await fetchLinkedAccounts();
        } catch (err) {
            showError(err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = oldText;
        }
    }

    function setupEnterKey(inputId, btn) {
        const el = document.getElementById(inputId);
        if (el && btn) {
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btn.click();
                }
            });
        }
    }

    if (masterLoginBtn) {
        masterLoginBtn.addEventListener("click", () => handleMasterAuth("login", document.getElementById("login-email").value, document.getElementById("login-password").value, masterLoginBtn));
        setupEnterKey("login-email", masterLoginBtn);
        setupEnterKey("login-password", masterLoginBtn);
    }
    if (masterRegisterBtn) {
        masterRegisterBtn.addEventListener("click", () => handleMasterAuth("register", document.getElementById("reg-email").value, document.getElementById("reg-password").value, masterRegisterBtn));
        setupEnterKey("reg-email", masterRegisterBtn);
        setupEnterKey("reg-password", masterRegisterBtn);
    }

    async function fetchLinkedAccounts() {
        const token = localStorage.getItem("tm_master_token");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}?action=accounts`, {
                method: "GET",
                headers: { "Authorization": token }
            });
            if (!res.ok) {
                localStorage.removeItem("tm_master_token");
                return;
            }
            const accounts = await res.json();
            
            if (!accountSwitcher) return;
            accountSwitcher.innerHTML = "";
            
            if (accounts.length === 0) {
                const opt = document.createElement("option");
                opt.value = "";
                opt.innerText = "-- Waiting for EA Data --";
                accountSwitcher.appendChild(opt);
                
                loginScreen.classList.remove("active");
                dashboard.classList.remove("hidden");
                const llc = document.getElementById("login-lang-container");
                if (llc) llc.style.display = "none";
            } else {
                accounts.forEach(acc => {
                    const opt = document.createElement("option");
                    opt.value = acc.license_key;
                    opt.innerText = acc.alias;
                    accountSwitcher.appendChild(opt);
                });
                
                let currentKey = localStorage.getItem("tm_license_key");
                if (!accounts.some(a => a.license_key === currentKey)) {
                    currentKey = accounts[0].license_key;
                    localStorage.setItem("tm_license_key", currentKey);
                }
                accountSwitcher.value = currentKey;
                
                loginScreen.classList.remove("active");
                dashboard.classList.remove("hidden");
                const llc = document.getElementById("login-lang-container");
                if (llc) llc.style.display = "none";
                
                loadDashboard(currentKey);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Account Switcher Logic
    if (accountSwitcher) {
        accountSwitcher.addEventListener("change", (e) => {
            if (e.target.value) {
                localStorage.setItem("tm_license_key", e.target.value);
                loadDashboard(e.target.value);
            }
        });
    }

    // Check if already logged in
    const savedToken = localStorage.getItem("tm_master_token");
    if (savedToken) {
        fetchLinkedAccounts();
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("tm_master_token");
        localStorage.removeItem("tm_license_key");
        dashboard.classList.add("hidden");
        loginScreen.classList.remove("active"); // wait, should add 'active' to show it
        loginScreen.classList.add("active");
        const llc = document.getElementById("login-lang-container");
        if (llc) llc.style.display = "flex";
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
                    const response = await fetch(`${API_URL}?account_id=${encodeURIComponent(key)}`, {
                        method: "DELETE", headers: { "Authorization": localStorage.getItem("tm_master_token") }
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

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", async () => {
            const key = localStorage.getItem("tm_license_key");
            if (!key) return;
            
            const lang = globalLang ? globalLang.value : "de";
            const msg = lang === "de" 
                ? "Bist du sicher? Dieser Trading Account und ALLE zugehörigen Daten (Trades, Journal, Notizen) werden permanent gelöscht! Der Account verschwindet aus der Liste."
                : "Are you sure? This trading account and ALL associated data (trades, journal, notes) will be permanently deleted! The account will be removed from the list.";
                
            if (confirm(msg)) {
                deleteAccountBtn.innerText = "⏳";
                try {
                    const response = await fetch(`${API_URL}?action=account&account_id=${encodeURIComponent(key)}`, {
                        method: "DELETE", headers: { "Authorization": localStorage.getItem("tm_master_token") }
                    });
                    if(response.ok) {
                        alert(lang === "de" ? "Account erfolgreich gelöscht." : "Account successfully deleted.");
                        localStorage.removeItem("tm_license_key"); // Clear current key so it picks the next one
                        window.location.reload();
                    } else {
                        alert("Error deleting account.");
                    }
                } catch(err) {
                    alert(err.message);
                } finally {
                    deleteAccountBtn.innerText = "🗑️";
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
        errorMsg.classList.add("hidden");

        try {
            // Fetch data from Cloudflare Worker
            const response = await fetch(`${API_URL}?account_id=${encodeURIComponent(key)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                , "Authorization": localStorage.getItem("tm_master_token") }
            });

            if (!response.ok) {
                throw new Error("Invalid License Key or Server Error.");
            }

            const payload = await response.json();
            const trades = payload.trades || payload;
            let currentBalance = payload.current_balance || 0;
            

            
            let runningBalance = parseFloat(currentBalance);
            window.accCurrency = "USD";
            trades.forEach(t => {
                // Parse side
                if (t.side.includes('_')) {
                    const sideParts = t.side.split('_');
                    t.side = sideParts[0]; 
                    
                    if (sideParts.length > 1) {
                        window.accCurrency = sideParts[1];
                    }
                    
                    let grossProfit = parseFloat(t.net_profit); // fallback
                    if (sideParts.length > 2) {
                        grossProfit = parseFloat(sideParts[2]);
                    }
                    t.gross_profit = grossProfit;
                    
                    let balanceAfter = null;
                    if (sideParts.length > 3) {
                        balanceAfter = parseFloat(sideParts[3]);
                    }
                    t.balance_after = balanceAfter;
                } else if (t.gross_profit === undefined) {
                    t.gross_profit = parseFloat(t.net_profit);
                }
                
                // Calculate balances
                const netP = parseFloat(t.net_profit);
                if (t.balance_after !== undefined && t.balance_after !== null && !isNaN(t.balance_after)) {
                    t.balance_before = t.balance_after - netP;
                    runningBalance = t.balance_before;
                } else {
                    t.balance_after = runningBalance;
                    runningBalance -= netP;
                    t.balance_before = runningBalance;
                }
            });
            
            // Empty array is valid for accounts with no trades. Process it normally to clear the dashboard.


            // Success! Save key and show dashboard
            localStorage.setItem("tm_license_key", key);
            
            loginScreen.classList.remove("active");
            dashboard.classList.remove("hidden");
            const llc = document.getElementById("login-lang-container");
            if (llc) llc.style.display = "none";
            
            // Load Settings once
            loadSettings(key);
            
            // Note: Journal is now loaded dynamically when opening the modal for a specific day.

            // Load Trade Notes
            fetch(`${API_URL}?action=notes&account_id=${encodeURIComponent(key)}`, { headers: { 'Authorization': localStorage.getItem('tm_master_token') } })
                .then(r => r.json())
                .then(d => {
                    window.tradeNotesMap = {};
                    d.forEach(n => { window.tradeNotesMap[n.ticket] = n.note; });
                    // Re-render table if data already processed
                    if (currentFilteredTrades && currentFilteredTrades.length > 0) {
                        if (typeof renderTradesTable === "function") {
                            renderTradesTable(currentFilteredTrades, window.currentCurSym);
                        } else {
                            processData(currentFilteredTrades, window.currentCurSym);
                        }
                    }
                }).catch(e => console.error(e));

            // Load Trade Strategy Assignments
            fetch(`${API_URL}?action=trade_strategy&account_id=${encodeURIComponent(key)}`, { headers: { 'Authorization': localStorage.getItem('tm_master_token') } })
                .then(r => r.json())
                .then(d => {
                    window.tradeStrategyMap = {};
                    d.forEach(n => { window.tradeStrategyMap[n.ticket] = n.strategy_id; });
                    if (currentFilteredTrades && currentFilteredTrades.length > 0) {
                        renderStrategyPerformance(currentFilteredTrades);
                        if (typeof renderTradesTable === "function") renderTradesTable(currentFilteredTrades, window.currentCurSym);
                    }
                }).catch(e => console.error(e));

            // Load Strategy Definitions
            fetch(`${API_URL}?action=strategies`, { headers: { 'Authorization': localStorage.getItem('tm_master_token') } })
                .then(r => r.json())
                .then(d => {
                    window.strategyDefs = d || [];
                    renderStrategyCards();
                    renderStrategyPerformance(currentFilteredTrades);
                    if (currentFilteredTrades && currentFilteredTrades.length > 0) {
                        if (typeof renderTradesTable === "function") renderTradesTable(currentFilteredTrades, window.currentCurSym);
                    }
                }).catch(e => console.error(e));
            
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
            } else if (currentTimeframe === "current_month") {
                const y = now.getFullYear();
                const m = now.getMonth();
                startTime = Math.floor(Date.UTC(y, m, 1) / 1000);
                endTime = Math.floor(Date.UTC(y, m + 1, 1) / 1000) - 1;
            } else if (currentTimeframe.match(/^\d{4}-\d{1,2}$/)) {
                const [y, m] = currentTimeframe.split('-').map(Number);
                startTime = Math.floor(Date.UTC(y, m, 1) / 1000);
                endTime = Math.floor(Date.UTC(y, m + 1, 1) / 1000) - 1;
            } else if (currentTimeframe === "all") {
                startTime = 0;
                endTime = 2000000000;
            }

            // Extract currency and gross profit from all trades
            let accCurrency = window.accCurrency || "USD";

            const currencyMap = {
                "EUR": "€", "USD": "$", "GBP": "£", "JPY": "¥", "CHF": "CHF", "AUD": "A$", "CAD": "C$", "NZD": "NZ$"
            };
            const curSym = currencyMap[accCurrency] || accCurrency;
            window.currentCurSym = curSym;

            const monthSel = document.getElementById("month-selector");
            if (monthSel) {
                const uniqueMonths = new Set();
                trades.forEach(t => {
                    const d = new Date(t.close_time * 1000);
                    uniqueMonths.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
                });
                
                uniqueMonths.add(`${now.getFullYear()}-${now.getMonth()}`);
                
                const sortedMonths = Array.from(uniqueMonths).sort((a,b) => {
                    const [yA, mA] = a.split('-').map(Number);
                    const [yB, mB] = b.split('-').map(Number);
                    if(yA !== yB) return yB - yA;
                    return mB - mA;
                });
                
                const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                let optionsHtml = `<option value="all" data-i18n="filter_all">All Time</option>`;
                
                sortedMonths.forEach(mStr => {
                    const [y, m] = mStr.split('-').map(Number);
                    optionsHtml += `<option value="${mStr}">${monthNames[m]} ${y}</option>`;
                });
                
                monthSel.innerHTML = optionsHtml;
                
                if (currentTimeframe === "current_month") {
                    monthSel.value = `${now.getFullYear()}-${now.getMonth()}`;
                    currentTimeframe = monthSel.value;
                } else if (currentTimeframe === "all" || currentTimeframe.match(/^\d{4}-\d{1,2}$/)) {
                    monthSel.value = currentTimeframe;
                }
            }

            renderCalendarAndMonthly(trades, curSym);

            const filteredTrades = trades.filter(t => t.close_time >= startTime && t.close_time <= endTime);
            currentFilteredTrades = filteredTrades;

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

    let symbolChartInstance = null;
    function renderSymbolChart(symbolProfits, curSym) {
        const ctx = document.getElementById('symbolChart').getContext('2d');
        if (symbolChartInstance) symbolChartInstance.destroy();
        
        // Sort symbols by absolute profit (descending) so biggest movers are at the top
        const sortedSymbols = Object.keys(symbolProfits).sort((a, b) => Math.abs(symbolProfits[b]) - Math.abs(symbolProfits[a]));
        
        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];
        
        sortedSymbols.slice(0, 8).forEach(sym => { // Top 8 symbols
            labels.push(sym);
            const val = symbolProfits[sym];
            data.push(val);
            if(val >= 0) {
                backgroundColors.push('rgba(16, 185, 129, 0.5)'); // Green
                borderColors.push('#10b981');
            } else {
                backgroundColors.push('rgba(239, 68, 68, 0.5)'); // Red
                borderColors.push('#ef4444');
            }
        });

        symbolChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Net Profit',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return ` ${curSym}${context.parsed.x.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    }

    function formatHoldTime(sec) {
        if (sec < 60) return `${Math.round(sec)}s`;
        const m = Math.floor(sec / 60);
        if (m < 60) return `${m}m`;
        const h = Math.floor(m / 60);
        const rm = m % 60;
        return `${h}h ${rm}m`;
    }

    function saveTradeNote(inputEl) {
        const ticket = inputEl.getAttribute("data-ticket");
        const note = inputEl.value.trim();
        const key = localStorage.getItem("tm_license_key");
        if (!key) return;
        
        const origBorder = inputEl.style.borderColor;
        inputEl.style.borderColor = "#f59e0b"; // Yellow = saving
        
        fetch(`${API_URL}?action=notes`, {
            method: "POST",
            headers: { "Authorization": localStorage.getItem("tm_master_token"), "Content-Type": "application/json" },
            body: JSON.stringify({ account_id: key, ticket: String(ticket), note })
        }).then(res => {
            if (res.ok) {
                if (window.tradeNotesMap) window.tradeNotesMap[ticket] = note;
                inputEl.style.borderColor = "#10b981"; // Green = saved
                setTimeout(() => { inputEl.style.borderColor = origBorder; }, 1500);
            } else {
                console.error("Note save failed:", res.status);
                inputEl.style.borderColor = "#ef4444"; // Red = error
                setTimeout(() => { inputEl.style.borderColor = origBorder; }, 2000);
            }
        }).catch(err => {
            console.error("Note save err", err);
            inputEl.style.borderColor = "#ef4444";
            setTimeout(() => { inputEl.style.borderColor = origBorder; }, 2000);
        });
    }

    window.renderTradesTable = function(trades, curSym) {
        const tbody = document.querySelector("#trades-table tbody");
        if (!tbody) return;
        
        tbody.innerHTML = "";
        trades.slice(0, 50).forEach(t => {
            const tr = document.createElement("tr");
            const sideStr = t.side || "";
            const sideColor = sideStr.startsWith("Buy") ? "var(--success)" : "var(--danger)";
            const netProfitNum = parseFloat(t.net_profit || 0);
            const profitColor = netProfitNum >= 0 ? "var(--success)" : "var(--danger)";
            const holdSec = (t.close_time || 0) - (t.open_time || 0);
            const durationStr = formatHoldTime(holdSec);
            const strategyId = window.tradeStrategyMap ? (window.tradeStrategyMap[t.ticket] || "") : "";
            const stratDefs = window.strategyDefs || [];
            const assignedStrat = stratDefs.find(s => s.id === strategyId);
            const stratColor = assignedStrat ? getStrategyColor(assignedStrat.id) : null;
            const stratRgb = stratColor ? hexToRgb(stratColor) : null;
            const stratBadgeHtml = assignedStrat
                ? `<span class="strategy-badge" style="--s-color:${stratColor};--s-rgb:${stratRgb};" data-ticket="${t.ticket}" onclick="openStrategyPicker(this, '${t.ticket}')">${assignedStrat.name}</span>`
                : `<button class="strategy-select-dropdown" style="opacity:0.5;" onclick="openStrategyPicker(this, '${t.ticket}')">+ Assign</button>`;
            const currentNote = window.tradeNotesMap ? (window.tradeNotesMap[t.ticket] || "") : "";

            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${t.symbol || "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: ${sideColor}">${sideStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: ${profitColor}">${curSym}${netProfitNum.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted); font-size: 0.85rem;">${durationStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${stratBadgeHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">
                    <input type="text" class="trade-note-input profile-select" data-ticket="${t.ticket}" value="${currentNote}" placeholder="${(i18n[localStorage.getItem('tm_global_lang') || 'de'] || {}).note_ph || 'Add note or #tag...'}" style="width: 100%; max-width: 250px; padding: 4px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--border-dark);">
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll(".trade-note-input").forEach(inp => {
            inp.addEventListener("blur", (e) => saveTradeNote(e.target));
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur(); // triggers blur → saveTradeNote
                }
            });
        });
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
        
        let longWins = 0, longLosses = 0;
        let shortWins = 0, shortLosses = 0;
        const symbolProfits = {};

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
            heatmapData[date.getUTCDay()][date.getUTCHours()] += grossP;
            
            totalProfit += netP;
            
            const isBuy = trade.side.startsWith("Buy");
            const isSell = trade.side.startsWith("Sell");
            
            if (!symbolProfits[trade.symbol]) symbolProfits[trade.symbol] = 0;
            symbolProfits[trade.symbol] += netP;
            
            // Win Rate and Profit Factor based on Gross Profit (Market Movement) to match MT5
            if (grossP > 0) {
                wins++;
                if (isBuy) longWins++;
                if (isSell) shortWins++;
                grossProfit += grossP;
                totalHoldWins += holdSec;
            } else if (grossP <= 0) {
                losses++;
                if (isBuy) longLosses++;
                if (isSell) shortLosses++;
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
        
        const longWinrate = (longWins + longLosses) > 0 ? (longWins / (longWins + longLosses)) * 100 : 0;
        const shortWinrate = (shortWins + shortLosses) > 0 ? (shortWins / (shortWins + shortLosses)) * 100 : 0;
        
        let edgeText = "-";
        if (longWinrate > shortWinrate + 5) edgeText = `Long (+${(longWinrate - shortWinrate).toFixed(0)}%)`;
        else if (shortWinrate > longWinrate + 5) edgeText = `Short (+${(shortWinrate - longWinrate).toFixed(0)}%)`;
        else if (totalWinLoss > 0) edgeText = `Balanced`;
        
        const avgHoldWin = wins > 0 ? (totalHoldWins / wins) : 0;
        const avgHoldLoss = losses > 0 ? (totalHoldLosses / losses) : 0;

        // Update UI
        updateKPI("kpi-profit", `${curSym}${totalProfit.toFixed(2)}`, totalProfit >= 0);
        updateKPI("kpi-winrate", `${winrate.toFixed(1)}%`, winrate >= 50);
        document.getElementById("kpi-trades").innerText = trades.length;
        updateKPI("kpi-pf", profitFactor.toFixed(2), profitFactor >= 1.5);
        
        // Advanced UI
        updateKPI("kpi-edge", edgeText, true);
        updateKPI("kpi-hold-win", formatHoldTime(avgHoldWin), true);
        updateKPI("kpi-hold-loss", formatHoldTime(avgHoldLoss), false);
        updateKPI("kpi-drawdown", `-${curSym}${maxDrawdown.toFixed(2)}`, false);

        // Revenge Trades & Discipline
        const discScore = trades.length > 0 ? Math.max(0, 100 - (revengeTrades / trades.length) * 100) : 100;
        document.getElementById("kpi-revenge").innerText = revengeTrades;
        const lang = globalLang ? globalLang.value : "en";
        const discLbl = i18n[lang] && i18n[lang].discipline_lbl ? i18n[lang].discipline_lbl : "Disziplin";
        document.getElementById("kpi-discipline").innerText = `${discLbl}: ${discScore.toFixed(0)}%`;
        document.getElementById("kpi-discipline").style.color = discScore > 80 ? "#10b981" : (discScore > 50 ? "#f59e0b" : "#ef4444");

        // Best / Worst Trading Day KPI
        const dayTotals = heatmapData.map(hours => hours.reduce((a,b)=>a+b, 0));
        let bestDayIdx = 1, worstDayIdx = 1;
        for (let i = 1; i < 7; i++) {
            if (dayTotals[i] > dayTotals[bestDayIdx]) bestDayIdx = i;
            if (dayTotals[i] < dayTotals[worstDayIdx]) worstDayIdx = i;
        }
        if (dayTotals[0] > dayTotals[bestDayIdx]) bestDayIdx = 0;
        if (dayTotals[0] < dayTotals[worstDayIdx]) worstDayIdx = 0;
        
        const curLang = localStorage.getItem("tm_global_lang") || "de";
        const dayNames = (i18n[curLang] && i18n[curLang].days) ? i18n[curLang].days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        document.getElementById("kpi-best-day").innerText = dayTotals[bestDayIdx] === 0 ? "-" : `${dayNames[bestDayIdx]} (${curSym}${dayTotals[bestDayIdx].toFixed(2)})`;
        document.getElementById("kpi-worst-day").innerText = dayTotals[worstDayIdx] === 0 ? "-" : `${dayNames[worstDayIdx]} (${curSym}${dayTotals[worstDayIdx].toFixed(2)})`;

        // Capture stats for AI Coach
        window.coachStats = {
            totalTrades: trades.length,
            winrate: winrate,
            profitFactor: profitFactor,
            maxDrawdown: maxDrawdown,
            avgHoldWin: formatHoldTime(avgHoldWin),
            avgHoldLoss: formatHoldTime(avgHoldLoss),
            bestDay: dayNames[bestDayIdx],
            worstDay: dayNames[worstDayIdx],
            strategyPerformance: {}
        };

        // Reset trades table title
        const tradesTable = document.querySelector("#trades-table");
        if (tradesTable) {
            const glassPanel = tradesTable.closest(".glass-panel");
            if (glassPanel) {
                const titleSpan = glassPanel.querySelector("h3 span");
                if (titleSpan) {
                    titleSpan.innerHTML = i18n[curLang] && i18n[curLang].trades_title ? i18n[curLang].trades_title : "Recent Trades &amp; Tags";
                }
            }
        }

        // Trades Table rendering
        if (typeof window.renderTradesTable === "function") {
            window.renderTradesTable(trades, curSym);
        }

        renderChart(labels, equityCurve);
        renderHeatmap(heatmapData, curSym);
        renderSymbolChart(symbolProfits, curSym);
        renderDailyStatsTable(trades, curSym);
    }

    function renderCalendarAndMonthly(trades, curSym) {
        const dailyProfit = {};
        const monthlyProfit = {};
        
        trades.forEach(t => {
            const date = new Date(t.close_time * 1000);
            const y = date.getUTCFullYear();
            const m = date.getUTCMonth(); // 0-11
            const d = date.getUTCDate();
            
            const dayKey = `${y}-${m}-${d}`;
            const monthKey = `${y}-${m}`;
            
            if(!dailyProfit[dayKey]) dailyProfit[dayKey] = 0;
            dailyProfit[dayKey] += parseFloat(t.net_profit);
            
            if(!monthlyProfit[monthKey]) monthlyProfit[monthKey] = 0;
            monthlyProfit[monthKey] += parseFloat(t.net_profit);
        });
        
        // --- Monthly Overview ---
        const monthlyContainer = document.getElementById("monthly-overview-container");
        if(monthlyContainer) {
            const cacheKey = trades.length + "_" + curSym;
            
            if (monthlyContainer.dataset.cacheKey !== cacheKey) {
                monthlyContainer.innerHTML = '<div id="monthly-overview-content" style="transform-origin: top center; width: 100%;"></div>';
                const innerContainer = document.getElementById("monthly-overview-content");
                const years = [...new Set(Object.keys(monthlyProfit).map(k => parseInt(k.split('-')[0])))].sort((a,b) => b - a);
                
                const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                
                const now = new Date();
                const currY = now.getFullYear();
                const currM = now.getMonth();
                
                years.forEach(year => {
                    const yearDiv = document.createElement("div");
                    yearDiv.className = "monthly-year-group";
                    yearDiv.innerHTML = `<div class="monthly-year-title">${year}</div><div class="monthly-grid"></div>`;
                    const grid = yearDiv.querySelector(".monthly-grid");
                    
                    for(let m = 0; m < 12; m++) {
                        const mKey = `${year}-${m}`;
                        if(monthlyProfit[mKey] !== undefined) {
                            const val = monthlyProfit[mKey];
                            const isCurrent = (year === currY && m === currM);
                            const cls = val > 0 ? "positive" : (val < 0 ? "negative" : "");
                            const displayVal = val >= 0 ? `+${curSym}${val.toFixed(0)}` : `-${curSym}${Math.abs(val).toFixed(0)}`;
                            grid.innerHTML += `
                                <div class="month-card clickable-month ${cls} ${isCurrent ? 'current' : ''}" data-month="${mKey}">
                                    <span class="m-name">${monthNames[m]} ${year}</span>
                                    <span class="m-val">${displayVal}</span>
                                </div>
                            `;
                        }
                    }
                    if(grid.innerHTML !== "") {
                        innerContainer.appendChild(yearDiv);
                    }
                });
                
                // Add click listeners to month cards
                innerContainer.querySelectorAll(".clickable-month").forEach(card => {
                    card.addEventListener("click", () => {
                        const mKey = card.getAttribute("data-month");
                        currentTimeframe = mKey;
                        
                        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                        
                        const monthSel = document.getElementById("month-selector");
                        if (monthSel) monthSel.value = mKey;
                        
                        const key = localStorage.getItem("tm_license_key");
                        if (key) loadDashboard(key);
                    });
                });
                
                // Auto-scale content to fit container height
                setTimeout(() => {
                    const cHeight = monthlyContainer.clientHeight || 460;
                    const iHeight = innerContainer.scrollHeight;
                    if (iHeight > cHeight && iHeight > 0) {
                        const scale = (cHeight - 10) / iHeight; // slightly smaller than max to leave a tiny gap
                        innerContainer.style.transform = `scale(${scale})`;
                        innerContainer.style.width = `${100 / scale}%`;
                        innerContainer.style.transformOrigin = `top left`;
                    } else {
                        innerContainer.style.transform = `scale(1)`;
                        innerContainer.style.width = `100%`;
                        innerContainer.style.transformOrigin = `top left`;
                    }
                }, 50);
                
                monthlyContainer.dataset.cacheKey = cacheKey;
            }
            
            // ALWAYS UPDATE ACTIVE CLASS
            const innerContainer = document.getElementById("monthly-overview-content");
            if (innerContainer) {
                innerContainer.querySelectorAll(".clickable-month").forEach(card => {
                    if (card.getAttribute("data-month") === currentTimeframe) {
                        card.classList.add("active-month");
                    } else {
                        card.classList.remove("active-month");
                    }
                });
            }
        }
        
        // --- Daily Calendar ---
        const calContainer = document.getElementById("daily-calendar-container");
        const monthTitle = document.getElementById("cal-month-title");
        if(calContainer && monthTitle) {
            calContainer.innerHTML = "";
            let y, m;
            const nowD = new Date();
            
            if (currentTimeframe && currentTimeframe.match(/^\d{4}-\d{1,2}$/)) {
                [y, m] = currentTimeframe.split('-').map(Number);
            } else {
                y = nowD.getFullYear();
                m = nowD.getMonth();
            }
            
            const fullMonthNames = ["JANUAR", "FEBRUAR", "MÄRZ", "APRIL", "MAI", "JUNI", "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DEZEMBER"];
            monthTitle.innerText = `${fullMonthNames[m]} ${y}`;
            
            let gridHtml = `<div class="cal-grid">`;
            const daysHeader = ["M", "D", "M", "D", "F", "S", "S"];
            daysHeader.forEach(dh => {
                gridHtml += `<div class="cal-header">${dh}</div>`;
            });
            
            const firstDay = new Date(y, m, 1).getDay(); // 0 (Sun) - 6 (Sat)
            let startOffset = firstDay === 0 ? 6 : firstDay - 1; // Make Monday 0
            const daysInMonth = new Date(y, m + 1, 0).getDate();
            
            for(let i = 0; i < startOffset; i++) {
                gridHtml += `<div class="cal-day empty"></div>`;
            }
            
            for(let d = 1; d <= daysInMonth; d++) {
                const dayKey = `${y}-${m}-${d}`;
                const val = dailyProfit[dayKey];
                let content = `<span class="cal-date">${d}</span>`;
                let cls = "";
                if(val !== undefined) {
                    cls = val > 0 ? "positive" : (val < 0 ? "negative" : "");
                    const displayVal = val >= 0 ? `+${curSym}${val.toFixed(0)}` : `-${curSym}${Math.abs(val).toFixed(0)}`;
                    content += `<span class="cal-val">${displayVal}</span>`;
                }
                gridHtml += `<div class="cal-day ${cls}">${content}</div>`;
            }
            
            gridHtml += `</div>`;
            calContainer.innerHTML = gridHtml;
        }
    }

    function renderDailyStatsTable(trades, curSym) {
        const tbody = document.querySelector("#daily-stats-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        const daysMap = {};
        
        trades.forEach(t => {
            const dateObj = new Date(t.close_time * 1000);
            const y = dateObj.getUTCFullYear();
            const m = dateObj.getUTCMonth() + 1;
            const d = dateObj.getUTCDate();
            
            const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            if (!daysMap[dateKey]) {
                daysMap[dateKey] = {
                    dateKey: dateKey,
                    dateStr: `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`,
                    timestamp: Date.UTC(y, m-1, d),
                    netProfit: 0,
                    grossProfit: 0,
                    grossLoss: 0,
                    tradesCount: 0,
                    wins: 0,
                    losses: 0,
                    maxWin: 0,
                    maxLoss: 0,
                    commission: 0,
                    longs: 0,
                    shorts: 0,
                    startingBalance: t.balance_before
                };
            } else {
                daysMap[dateKey].startingBalance = t.balance_before;
            }
            
            const day = daysMap[dateKey];
            const netP = parseFloat(t.net_profit);
            const grossP = t.gross_profit !== undefined ? parseFloat(t.gross_profit) : netP;
            
            day.netProfit += netP;
            day.tradesCount++;
            
            if (t.side && t.side.startsWith("Buy")) day.longs++;
            if (t.side && t.side.startsWith("Sell")) day.shorts++;
            
            if (grossP > 0) {
                day.grossProfit += grossP;
                day.wins++;
                if (grossP > day.maxWin) day.maxWin = grossP;
            } else if (grossP < 0) {
                day.grossLoss += Math.abs(grossP);
                day.losses++;
                if (grossP < day.maxLoss) day.maxLoss = grossP;
            } else {
                if (netP > 0) {
                    day.wins++;
                    if (netP > day.maxWin) day.maxWin = netP;
                } else if (netP < 0) {
                    day.losses++;
                    if (netP < day.maxLoss) day.maxLoss = netP;
                }
            }
            
            if (t.commission) {
                day.commission += parseFloat(t.commission);
            }
        });
        
        const sortedDays = Object.values(daysMap).sort((a, b) => b.timestamp - a.timestamp);
        
        if (sortedDays.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 20px; color: var(--text-muted);" data-i18n="no_trades_found">No trades found for this period.</td></tr>`;
            return;
        }
        
        sortedDays.forEach(day => {
            const tr = document.createElement("tr");
            
            const pf = day.grossLoss === 0 ? (day.grossProfit > 0 ? day.grossProfit : 0) : (day.grossProfit / day.grossLoss);
            const winRate = day.tradesCount > 0 ? ((day.wins / day.tradesCount) * 100) : 0;
            const avgWin = day.wins > 0 ? (day.grossProfit / day.wins) : 0;
            const avgLoss = day.losses > 0 ? (day.grossLoss / day.losses) : 0;
            
            let percentGainDisplay = "-";
            let percentGainColor = "";
            if (day.startingBalance > 0) {
                const pGain = (day.netProfit / day.startingBalance) * 100;
                percentGainDisplay = `${pGain > 0 ? '+' : ''}${pGain.toFixed(2)}%`;
                percentGainColor = pGain > 0 ? "text-success" : (pGain < 0 ? "text-danger" : "");
            }
            
            const pClass = day.netProfit > 0 ? "text-success" : (day.netProfit < 0 ? "text-danger" : "");
            
            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted);">${day.dateStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); font-weight: bold;" class="${pClass}">${day.netProfit > 0 ? '+' : ''}${curSym}${day.netProfit.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); font-weight: bold;" class="${percentGainColor}">${percentGainDisplay}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${pf.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${day.tradesCount}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${winRate.toFixed(0)}%</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--success);">${curSym}${avgWin.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--danger);">${avgLoss === 0 ? '' : '-'}${curSym}${avgLoss.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--success);">${curSym}${day.maxWin.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--danger);">${day.maxLoss < 0 ? '-' : ''}${curSym}${Math.abs(day.maxLoss).toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted);">${day.commission !== 0 ? curSym + day.commission.toFixed(2) : '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${day.longs} / ${day.shorts}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); text-align: center;">
                    <button class="secondary-btn open-journal-btn" data-datekey="${day.dateKey}" data-datestr="${day.dateStr}" style="padding: 4px 8px; font-size: 0.8rem;" title="Mental Journal"><i class="ph ph-book-open"></i></button>
                </td>
            `;
            
            tr.style.cursor = "pointer";
            tr.addEventListener("click", (e) => {
                if (e.target.closest('.open-journal-btn')) return;
                
                // Remove active styling from all rows
                tbody.querySelectorAll("tr").forEach(r => r.style.backgroundColor = "");
                tr.style.backgroundColor = "rgba(255,255,255,0.05)";
                
                const dayTrades = trades.filter(t => {
                    const tDate = new Date(t.close_time * 1000);
                    const y = tDate.getUTCFullYear();
                    const m = tDate.getUTCMonth() + 1;
                    const d = tDate.getUTCDate();
                    const tKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    return tKey === day.dateKey;
                });
                
                if (typeof window.renderTradesTable === "function") {
                    window.renderTradesTable(dayTrades, curSym);
                    const tradesTable = document.querySelector("#trades-table");
                    if (tradesTable) {
                        const glassPanel = tradesTable.closest(".glass-panel");
                        if (glassPanel) {
                            const titleSpan = glassPanel.querySelector("h3 span");
                            if (titleSpan) {
                                titleSpan.innerHTML = `Recent Trades &amp; Tags <span style="color:var(--text-muted);font-size:0.85rem;margin-left:10px;">(Filtered: ${day.dateStr})</span>`;
                            }
                            glassPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
                
                // Update AI Scope Dropdown
                const scopeDayOpt = document.getElementById("ai-scope-day");
                const aiScopeSel = document.getElementById("ai-scope");
                if (scopeDayOpt && aiScopeSel) {
                    scopeDayOpt.textContent = `Day (${day.dateStr})`;
                    scopeDayOpt.setAttribute("data-datekey", day.dateKey);
                    aiScopeSel.value = "day";
                }
            });
            
            tbody.appendChild(tr);
        });

        document.querySelectorAll(".open-journal-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const dKey = btn.getAttribute("data-datekey");
                const dStr = btn.getAttribute("data-datestr");
                openJournalModal(dKey, dStr);
            });
        });
    }

    function renderHeatmap(data, curSym) {
        const grid = document.getElementById("heatmap-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        const hmLang = localStorage.getItem("tm_global_lang") || "de";
        const fullDays = (i18n[hmLang] && i18n[hmLang].days) ? i18n[hmLang].days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const days = fullDays.map(d => d.substring(0, 3));
        
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
                    legend: { display: false },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                                modifierKey: 'ctrl'
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x'
                        },
                        pan: {
                            enabled: true,
                            modifierKey: 'ctrl',
                            mode: 'x'
                        }
                    }
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
                const now = new Date();
                const todayStartTime = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000);
                
                let tradesToAnalyze = currentFilteredTrades;
                const aiScopeVal = document.getElementById("ai-scope")?.value;
                if (aiScopeVal === "week") {
                    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
                    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
                    const weekStartSec = Math.floor(monday.getTime() / 1000);
                    tradesToAnalyze = currentFilteredTrades.filter(t => t.close_time >= weekStartSec);
                } else if (aiScopeVal === "day") {
                    const scopeDayOpt = document.getElementById("ai-scope-day");
                    if (scopeDayOpt && scopeDayOpt.hasAttribute("data-datekey")) {
                        const dKey = scopeDayOpt.getAttribute("data-datekey");
                        tradesToAnalyze = currentFilteredTrades.filter(t => {
                            const d = new Date(t.close_time * 1000);
                            return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}` === dKey;
                        });
                    } else {
                        // fallback to today
                        tradesToAnalyze = currentFilteredTrades.filter(t => t.close_time >= todayStartTime);
                    }
                }

                const profileData = {
                    style: profStyle ? profStyle.value : "Unknown",
                    session: selectedSessions.length > 0 ? selectedSessions.join(", ") : "Any",
                    risk: profRisk ? profRisk.value : "Unknown",
                    language: globalLang ? globalLang.value : "de",
                    timeframe: currentTimeframe,
                    stats: window.coachStats || {},
                    trades: tradesToAnalyze.map(t => {
                        const isToday = t.close_time >= todayStartTime;
                        const note = (isToday && window.tradeNotesMap && window.tradeNotesMap[t.ticket]) ? window.tradeNotesMap[t.ticket] : null;
                        const tradeObj = {
                            symbol: t.symbol,
                            side: t.side,
                            net_profit: t.net_profit,
                            gross_profit: t.gross_profit,
                            open_time: t.open_time,
                            close_time: t.close_time
                        };
                        if (note) tradeObj.tag = note; // Add as tag/note to prompt AI to look at it
                        return tradeObj;
                    })
                };

                const response = await fetch(`${API_URL}?action=ai_coach`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": localStorage.getItem("tm_master_token")
                    },
                    body: JSON.stringify({ ...profileData, account_id: key })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to get AI analysis.");
                }

                // Format markdown simple
                let htmlContent = data.analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');

                aiContent.innerHTML = `
                    <div style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main); margin-bottom: 15px;">${htmlContent}</div>
                    <button id="save-archive-btn" class="secondary-btn" style="width: 100%; padding: 6px; font-size: 0.85rem;"><i class="ph ph-floppy-disk"></i> Archive Analysis</button>
                `;

                const saveArchiveBtn = document.getElementById("save-archive-btn");
                if (saveArchiveBtn) {
                    saveArchiveBtn.addEventListener("click", async () => {
                        saveArchiveBtn.disabled = true;
                        saveArchiveBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:var(--text-main);border-right-color:transparent;border-radius:50%;animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-right:5px;"></div> Saving...';
                        try {
                            const now = new Date();
                            const dateStr = (currentTimeframe === "current_month" || currentTimeframe === "all") ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` : currentTimeframe;
                            const res = await fetch(`${API_URL}?action=coach_archive`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": localStorage.getItem("tm_master_token")
                                },
                                body: JSON.stringify({ account_id: key, date: dateStr, analysis_text: htmlContent })
                            });
                            if (res.ok) {
                                saveArchiveBtn.innerHTML = '<i class="ph ph-check"></i> Archived successfully';
                                saveArchiveBtn.style.color = 'var(--success)';
                                saveArchiveBtn.style.borderColor = 'var(--success)';
                            } else {
                                throw new Error("Failed to save archive");
                            }
                        } catch (err) {
                            saveArchiveBtn.innerHTML = '<i class="ph ph-warning"></i> Save failed';
                            saveArchiveBtn.style.color = 'var(--danger)';
                            saveArchiveBtn.disabled = false;
                        }
                    });
                }
                
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
    }

    // --- Kill-Switch Settings ---
    async function loadSettings(key) {
        try {
            const response = await fetch(`${API_URL}?action=settings&account_id=${encodeURIComponent(key)}`, {
                method: "GET",
                headers: { "Authorization": localStorage.getItem("tm_master_token") }
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
                headers: { "Authorization": localStorage.getItem("tm_master_token"), "Content-Type": "application/json" },
                body: JSON.stringify({
                        account_id: key,
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

    // --- Journal Modal Logic ---
    window.openJournalModal = async function(dateKey, dateStr) {
        const modal = document.getElementById("journal-modal");
        const title = document.getElementById("journal-modal-title");
        const textObj = document.getElementById("journal-modal-text");
        const status = document.getElementById("journal-modal-status");
        const saveBtn = document.getElementById("journal-modal-save");
        
        if (!modal || !title || !textObj || !saveBtn) return;
        
        const key = localStorage.getItem("tm_license_key");
        if (!key) return;

        title.innerText = `Mental Journal - ${dateStr}`;
        textObj.value = "Loading...";
        textObj.disabled = true;
        status.innerText = "";
        modal.classList.remove("hidden");
        
        // Fetch journal for this specific day
        try {
            const res = await fetch(`${API_URL}?action=journal&account_id=${encodeURIComponent(key)}&date=${dateKey}`, {
                headers: { 'Authorization': localStorage.getItem('tm_master_token') }
            });
            const data = await res.json();
            textObj.value = data.content || "";
        } catch (e) {
            console.error("Failed to load journal", e);
            textObj.value = "";
            status.innerText = "Error loading!";
            status.style.color = "var(--danger)";
        } finally {
            textObj.disabled = false;
        }

        // Remove old event listeners to prevent duplicate saves
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener("click", async () => {
            newSaveBtn.innerText = "Saving...";
            status.style.color = "var(--success)";
            try {
                await fetch(`${API_URL}?action=journal`, {
                    method: "POST",
                    headers: { "Authorization": localStorage.getItem("tm_master_token"), "Content-Type": "application/json" },
                    body: JSON.stringify({ account_id: key, date: dateKey, content: textObj.value })
                });
                status.innerText = "Saved successfully!";
                setTimeout(() => { modal.classList.add("hidden"); }, 1000);
            } catch (err) {
                console.error("Journal save error", err);
                status.innerText = "Error saving!";
                status.style.color = "var(--danger)";
            } finally {
                newSaveBtn.innerText = "Save Entry";
            }
        });
    };

    const journalModalClose = document.getElementById("journal-modal-close");
    if (journalModalClose) {
        journalModalClose.addEventListener("click", () => {
            document.getElementById("journal-modal").classList.add("hidden");
        });
    }
    // --- New Features Logic ---
    window.runCompoundCalc = function() {
        const start = parseFloat(document.getElementById("calc-start")?.value) || 0;
        const rate = parseFloat(document.getElementById("calc-rate")?.value) || 0;
        const days = parseInt(document.getElementById("calc-days")?.value) || 0;
        
        let endCapital = start;
        for (let i = 0; i < days; i++) {
            endCapital += (endCapital * (rate / 100));
        }
        
        const netProfit = endCapital - start;
        const curSym = (localStorage.getItem("tm_license_key") || "").toLowerCase().includes("usd") ? "$" : "€";
        
        const resEl = document.getElementById("calc-result-val");
        if (resEl) resEl.innerText = `${curSym}${endCapital.toFixed(2)}`;
        const profEl = document.getElementById("calc-profit-val");
        if (profEl) profEl.innerText = `+${curSym}${netProfit.toFixed(2)}`;
    };

    // Attach Event Listeners
    document.getElementById("calc-start")?.addEventListener("input", window.runCompoundCalc);
    document.getElementById("calc-rate")?.addEventListener("input", window.runCompoundCalc);
    document.getElementById("calc-days")?.addEventListener("input", window.runCompoundCalc);
    
    document.getElementById("watchdog-daily-cost")?.addEventListener("input", () => {
        if(typeof calculateKPIs === "function" && currentFilteredTrades) {
            calculateKPIs(currentFilteredTrades);
        }
    });

    // Run calc once on load
    setTimeout(window.runCompoundCalc, 500);

});

// ══════════════════════════════════════════════════
// STRATEGY MANAGEMENT SYSTEM
// ══════════════════════════════════════════════════

// Color palette — each strategy gets a unique, vibrant color based on its ID hash
const STRATEGY_COLORS = [
    "#39ff14", "#00d4ff", "#ff6b35", "#ff2d78", "#a855f7",
    "#f59e0b", "#10b981", "#06b6d4", "#ec4899", "#8b5cf6",
    "#84cc16", "#f97316", "#14b8a6", "#e879f9", "#fb923c"
];

function getStrategyColor(id) {
    if (!id) return "#888";
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return STRATEGY_COLORS[Math.abs(hash) % STRATEGY_COLORS.length];
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
}

// ── Render Strategy Definition Cards ─────────────
function renderStrategyCards() {
    const container = document.getElementById("strategy-cards-container");
    if (!container) return;
    const defs = window.strategyDefs || [];
    container.innerHTML = "";

    defs.forEach(s => {
        const color = getStrategyColor(s.id);
        const rgb = hexToRgb(color);
        // Gather performance stats for inline display
        const trades = currentFilteredTrades || [];
        const stratMap = window.tradeStrategyMap || {};
        const stratTrades = trades.filter(t => stratMap[t.ticket] === s.id);
        const profit = stratTrades.reduce((sum, t) => sum + parseFloat(t.net_profit), 0);
        const wins = stratTrades.filter(t => parseFloat(t.net_profit) > 0).length;
        const wr = stratTrades.length > 0 ? ((wins / stratTrades.length) * 100).toFixed(0) : 0;
        const profitColor = profit > 0 ? "var(--success)" : (profit < 0 ? "var(--danger)" : "inherit");
        const curSym = window.currentCurSym || "€";

        const card = document.createElement("div");
        card.className = "strategy-card";
        card.style.cssText = `--s-color:${color};--s-rgb:${rgb};`;
        card.innerHTML = `
            <div class="strategy-card-name">
                <span>${s.name}</span>
                <span style="color:${profitColor}; font-size:0.95rem;">${profit >= 0 ? '+' : ''}${curSym}${profit.toFixed(0)}</span>
            </div>
            <div class="strategy-card-stats">${stratTrades.length} Trades &nbsp;|&nbsp; ${wr}% WR</div>
            ${s.description ? `<div class="strategy-card-desc">${s.description}</div>` : ''}
            <div class="strategy-card-actions">
                <button onclick="openStrategyModal('${s.id}')">✏ Edit</button>
                <button onclick="deleteStrategy('${s.id}')" style="color:#ef4444;">🗑 Delete</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Add "+" button if there are any strategies already
    if (defs.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No strategies defined yet. Click "+ NEW STRATEGY" to create your first system.</div>`;
    }
}

// ── Render Strategy Performance Panel ────────────
function renderStrategyPerformance(trades) {
    const container = document.getElementById("strategy-perf-container");
    const panel = document.getElementById("strategy-performance-panel");
    if (!container) return;
    const defs = window.strategyDefs || [];
    const stratMap = window.tradeStrategyMap || {};
    const curSym = window.currentCurSym || "€";

    if (defs.length === 0) {
        if (panel) panel.style.display = "none";
        return;
    }
    if (panel) panel.style.display = "";

    container.innerHTML = "";

    // Unassigned trades card
    const unassigned = (trades || []).filter(t => !stratMap[t.ticket]);
    const allCards = [];

    defs.forEach(s => {
        const color = getStrategyColor(s.id);
        const rgb = hexToRgb(color);
        const stratTrades = (trades || []).filter(t => stratMap[t.ticket] === s.id);
        const profit = stratTrades.reduce((sum, t) => sum + parseFloat(t.net_profit), 0);
        const wins = stratTrades.filter(t => parseFloat(t.net_profit) > 0).length;
        const losses = stratTrades.filter(t => parseFloat(t.net_profit) < 0).length;
        const wr = stratTrades.length > 0 ? ((wins / stratTrades.length) * 100).toFixed(0) : 0;
        const pColor = profit > 0 ? "var(--success)" : (profit < 0 ? "var(--danger)" : "inherit");

        if (window.coachStats && window.coachStats.strategyPerformance) {
            window.coachStats.strategyPerformance[s.name] = { profit, trades: stratTrades.length, winrate: wr };
        }

        allCards.push({ profit, html: `
            <div class="strategy-perf-card" style="--s-color:${color};--s-rgb:${rgb}; border-color: rgba(${rgb},0.3);">
                <div class="strategy-perf-card-name">${s.name}</div>
                <div class="strategy-perf-card-profit" style="color:${pColor};">${profit >= 0 ? '+' : ''}${curSym}${profit.toFixed(2)}</div>
                <div class="strategy-perf-card-meta">
                    <span>${stratTrades.length} Trades</span>
                    <span>${wr}% WR</span>
                    <span>${wins}W / ${losses}L</span>
                </div>
            </div>
        `});
    });

    // Sort by profit descending
    allCards.sort((a, b) => b.profit - a.profit);
    allCards.forEach(c => container.insertAdjacentHTML("beforeend", c.html));

    // Unassigned card
    if (unassigned.length > 0) {
        const uProfit = unassigned.reduce((sum, t) => sum + parseFloat(t.net_profit), 0);
        container.insertAdjacentHTML("beforeend", `
            <div class="strategy-perf-card" style="opacity:0.5;">
                <div class="strategy-perf-card-name" style="color:var(--text-muted);">— Unassigned</div>
                <div class="strategy-perf-card-profit" style="color:${uProfit >= 0 ? 'var(--success)' : 'var(--danger)'}">${uProfit >= 0 ? '+' : ''}${curSym}${uProfit.toFixed(2)}</div>
                <div class="strategy-perf-card-meta"><span>${unassigned.length} Trades</span></div>
            </div>
        `);
    }
}

// ── Strategy Modal ────────────────────────────────
function openStrategyModal(editId) {
    const modal = document.getElementById("strategy-modal");
    const titleEl = document.getElementById("strategy-modal-title");
    const idInput = document.getElementById("strategy-modal-id");
    const nameInput = document.getElementById("strategy-modal-name");
    const descInput = document.getElementById("strategy-modal-desc");
    if (!modal) return;

    if (editId) {
        const s = (window.strategyDefs || []).find(d => d.id === editId);
        titleEl.textContent = "Edit Strategy";
        idInput.value = s ? s.id : "";
        nameInput.value = s ? s.name : "";
        descInput.value = s ? (s.description || "") : "";
    } else {
        titleEl.textContent = "New Strategy";
        idInput.value = "";
        nameInput.value = "";
        descInput.value = "";
    }
    modal.classList.remove("hidden");
    setTimeout(() => nameInput.focus(), 50);
}

async function saveStrategy() {
    const name = document.getElementById("strategy-modal-name")?.value.trim();
    if (!name) { alert("Please enter a strategy name."); return; }
    const id = document.getElementById("strategy-modal-id")?.value.trim() || null;
    const desc = document.getElementById("strategy-modal-desc")?.value.trim() || "";
    const token = localStorage.getItem("tm_master_token");

    const body = { name, description: desc };
    if (id) body.id = id;

    try {
        const res = await fetch(`${API_URL}?action=strategies`, {
            method: "POST",
            headers: { "Authorization": token, "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.id) {
            // Upsert locally
            if (!window.strategyDefs) window.strategyDefs = [];
            const idx = window.strategyDefs.findIndex(s => s.id === (id || data.id));
            if (idx >= 0) {
                window.strategyDefs[idx] = { id: id || data.id, name, description: desc };
            } else {
                window.strategyDefs.push({ id: data.id, name, description: desc });
            }
        }
        document.getElementById("strategy-modal").classList.add("hidden");
        renderStrategyCards();
        renderStrategyPerformance(currentFilteredTrades);
    } catch(e) {
        console.error("Strategy save error", e);
    }
}

async function deleteStrategy(id) {
    if (!confirm("Delete this strategy? Assigned trades will become unassigned.")) return;
    const token = localStorage.getItem("tm_master_token");
    await fetch(`${API_URL}?action=strategies`, {
        method: "POST",
        headers: { "Authorization": token, "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: id })
    });
    window.strategyDefs = (window.strategyDefs || []).filter(s => s.id !== id);
    renderStrategyCards();
    renderStrategyPerformance(currentFilteredTrades);
}

// ── Inline Strategy Picker (popover dropdown) ─────
function openStrategyPicker(el, ticket) {
    // Remove any existing picker
    const existing = document.getElementById("_strat_picker");
    if (existing) existing.remove();

    const defs = window.strategyDefs || [];
    const current = window.tradeStrategyMap ? (window.tradeStrategyMap[ticket] || "") : "";

    const picker = document.createElement("select");
    picker.id = "_strat_picker";
    picker.className = "strategy-select-dropdown";
    picker.style.cssText = "position: absolute; z-index: 9999; min-width: 140px;";

    picker.innerHTML = `<option value="">— None —</option>` +
        defs.map(s => `<option value="${s.id}" ${s.id === current ? 'selected' : ''}>${s.name}</option>`).join("");

    // Position near the element
    const rect = el.getBoundingClientRect();
    picker.style.top = (rect.bottom + window.scrollY + 4) + "px";
    picker.style.left = (rect.left + window.scrollX) + "px";
    document.body.appendChild(picker);
    picker.focus();

    async function applyPick() {
        const sid = picker.value || null;
        picker.remove();
        const key = localStorage.getItem("tm_license_key");
        const token = localStorage.getItem("tm_master_token");
        if (!key) return;

        if (!window.tradeStrategyMap) window.tradeStrategyMap = {};
        if (sid) {
            window.tradeStrategyMap[ticket] = sid;
        } else {
            delete window.tradeStrategyMap[ticket];
        }

        // Update badge inline
        const strat = (window.strategyDefs || []).find(s => s.id === sid);
        const color = strat ? getStrategyColor(strat.id) : null;
        const rgb = color ? hexToRgb(color) : null;
        if (el.tagName === "SPAN") {
            if (strat) {
                el.style.cssText = `--s-color:${color};--s-rgb:${rgb};`;
                el.textContent = strat.name;
            } else {
                el.outerHTML = `<button class="strategy-select-dropdown" style="opacity:0.5;" onclick="openStrategyPicker(this, '${ticket}')">+ Assign</button>`;
            }
        } else {
            if (strat) {
                el.outerHTML = `<span class="strategy-badge" style="--s-color:${color};--s-rgb:${rgb};" data-ticket="${ticket}" onclick="openStrategyPicker(this, '${ticket}')">${strat.name}</span>`;
            }
        }
        renderStrategyCards();
        renderStrategyPerformance(currentFilteredTrades);

        // Persist
        fetch(`${API_URL}?action=trade_strategy`, {
            method: "POST",
            headers: { "Authorization": token, "Content-Type": "application/json" },
            body: JSON.stringify({ account_id: key, ticket: String(ticket), strategy_id: sid || "" })
        }).catch(e => console.error("Strategy assign error", e));
    }

    picker.addEventListener("change", applyPick);
    picker.addEventListener("blur", () => setTimeout(() => picker.remove(), 200));
}

// ── Wire up modal buttons ─────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-strategy-btn")?.addEventListener("click", () => openStrategyModal(null));
    document.getElementById("strategy-modal-close")?.addEventListener("click", () => {
        document.getElementById("strategy-modal")?.classList.add("hidden");
    });
    document.getElementById("strategy-modal-save")?.addEventListener("click", saveStrategy);
    document.getElementById("strategy-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "strategy-modal") document.getElementById("strategy-modal").classList.add("hidden");
    });

    // View Archives logic
    document.getElementById("view-archives-btn")?.addEventListener("click", async () => {
        const modal = document.getElementById("coach-archive-modal");
        const list = document.getElementById("coach-archive-list");
        if (!modal || !list) return;
        
        modal.classList.remove("hidden");
        list.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">Loading archives...</div>';
        
        try {
            const key = localStorage.getItem("tm_license_key");
            const res = await fetch(`${API_URL}?action=coach_archive&account_id=${encodeURIComponent(key)}`, {
                headers: { "Authorization": localStorage.getItem("tm_master_token") }
            });
            const archives = await res.json();
            
            if (archives.length === 0) {
                list.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);">No archived analyses found.</div>';
            } else {
                list.innerHTML = "";
                archives.forEach(arch => {
                    const dateObj = new Date(arch.created_at * 1000);
                    const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth()+1).padStart(2, '0')}.${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                    list.insertAdjacentHTML("beforeend", `
                        <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-dark); padding: 15px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph ph-calendar"></i> ${arch.date}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                            </div>
                            <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-main);">
                                ${arch.analysis_text}
                            </div>
                        </div>
                    `);
                });
            }
        } catch (e) {
            list.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Failed to load archives.</div>`;
        }
    });

    document.getElementById("coach-archive-close")?.addEventListener("click", () => {
        document.getElementById("coach-archive-modal")?.classList.add("hidden");
    });
    document.getElementById("coach-archive-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "coach-archive-modal") document.getElementById("coach-archive-modal").classList.add("hidden");
    });
});

