const API_URL = "https://Rulebook.f-klavun.workers.dev/api";
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
    reset_btn: "Reset",
    filter_today: "Heute",
    filter_yesterday: "Gestern",
    filter_week: "Diese Woche",
    filter_month: "Diesen Monat",
    filter_all: "Alle Trades",
    kpi_profit: "Nettogewinn",
    kpi_gain: "Gewinn %",
    kpi_winrate: "Gewinnrate",
    kpi_trades: "Gesamt Trades",
    kpi_pf: "Profit Faktor",
    kpi_edge: "Long vs. Short",
    kpi_sl_shift: "SL-Verschiebung",
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
    ai_placeholder:
      "Klicke auf den Button, um eine ehrliche und hilfreiche Analyse deiner letzten Trades zu erhalten.",
    ai_loading: "Konsultiere den KI Coach...",
    tilt_sub: "Revenge Trades (< 15 mins nach Verlust)",
    killswitch_sub: "EA blockiert Trades bei Tagesverlust-Limit",
    heatmap_sub: "Wann verdienst du am meisten?",
    save_btn: "Speichern",
    limit_lbl: "Limit: ",
    modal_warn: "WARNUNG",
    modal_desc:
      "Das Deaktivieren des Kill-Switches ist hochriskant. Du bist dabei, deinen Schutzmechanismus abzuschalten und könntest deinen Tagesverlust überschreiten!",
    modal_cancel: "Abbrechen (Sicher bleiben)",
    modal_confirm: "Trotzdem deaktivieren",
    discipline_lbl: "Disziplin",
    setup_btn: "Wie richte ich den EA ein?",
    setup_step1: "Lade den Rulebook Exporter EA im MQL5 Market herunter.",
    setup_step2: "Ziehe ihn auf genau EINEN Chart in deinem MetaTrader 5.",
    setup_step3:
      "Trage in den EA-Einstellungen deine Dashboard E-Mail & Passwort ein.",
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
    link_account_desc:
      "Gib den Benutzernamen und das Passwort ein, die du im MetaTrader EA verwendest.",
    mt5_user_ph: "MT5 Benutzername",
    mt5_pass_ph: "MT5 Passwort",
    link_btn: "Verknüpfen",
    cancel_btn: "Abbrechen",
    kpi_best_day: "Bester Tag",
    kpi_worst_day: "Schlechtester Tag",
    days: [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ],
    journal_title: "Mental Journal",
    journal_save: "Eintrag speichern",
    journal_ph:
      "Wie fühlst du dich heute bei deinen Trades? Hast du deinen Plan befolgt?",
    heatmap_title: "Profit Heatmap",
    tilt_title: "Tilt-Meter",
    killswitch_title: "Kill-Switch",
    trades_title: "Letzte Trades & Tags",
    th_symbol: "Symbol",
    th_side: "Seite",
    th_sl_widening: "SL-Verschiebung",
    th_profit: "Gewinn",
    th_close: "Haltezeit",
    th_note: "Tag / Notiz",
    note_ph: "Notiz oder #Tag hinzufügen...",
    th_gain: "% Gain",
    strategy_title: "STRATEGIE DEFINITIONEN // SYSTEME",
    strategy_add_btn: "+ Neue Strategie",
    th_strategy: "Strategie",
    strategy_name_lbl: "Strategie Name",
    strategy_desc_lbl: "Regeln / Beschreibung",
    ai_scope_month: "Aktueller Monat",
    ai_scope_week: "Aktuelle Woche",
    ai_scope_day: "Heute",
    archive_analysis_btn: "Analyse Archivieren",
    archived_analyses_title: "Archivierte Analysen",
    view_archives_title: "Archive Ansehen",
    th_charts: "Charts",
    chart_before: "Vorher",
    chart_after: "Nachher",
    focus_btn: "Fokus Modus",
    kpi_avg_win: "Ø Gewinn",
    kpi_avg_loss: "Ø Verlust",
    ticker_title: "Markt Ticker",
    nav_dashboard: "Dashboard",
    nav_journal: "Journal",
    nav_trades: "Trades",
    nav_tags: "Fehleranalyse",
    nav_prop: "Prop Challenge",
    market_sessions: "Market Sessions & Timezones",
    prop_tracker: "Prop Firm Challenge Tracker",
    nav_coach: "AI Coach",
    tag_analyzer_title: "Fehleranalyse",
    tag_analyzer_desc:
      "Analysiere deine Fehler und Setups. Wähle einen Hashtag aus, um die entsprechenden Trades zu filtern und zu überprüfen.",
    community_title: "Rulebook Community",
    community_trending: "Trending Now",
    composer_ph: "Was gibt's Neues?",
    composer_attach_trade: "Trade anhängen",
    composer_submit: "Posten",
    loading_feed: "Lade Feed...",
    no_posts: "Noch keine Posts. Teile als Erster einen Trade!",
    failed_feed: "Fehler beim Laden des Feeds.",
    prop_sub:
      "Überwache dein Konto in Echtzeit gegen Max Drawdown, Daily Loss & Profit Target Regeln.",
    prop_rules_setup: "Challenge Regeln & Setup",
    prop_label_account: "MT5 Konto",
    prop_select_account_option: "Konto auswählen...",
    prop_label_start_balance: "Startkapital ($)",
    prop_label_target_pct: "Gewinnziel (%)",
    prop_label_daily_loss_pct: "Max. Tagesverlust (%)",
    prop_label_max_loss_pct: "Max. Gesamtverlust (%)",
    prop_status_lbl: "Status:",
    prop_status_loading: "LADEN...",
    prop_status_fetching: "Daten werden abgerufen...",
    prop_status_waiting: "WARTEN",
    prop_no_account_selected: "KEIN KONTO AUSGEWÄHLT",
    prop_no_account_sub: "Bitte wähle ein Konto zum Überwachen aus.",
    prop_status_active: "AKTIV",
    prop_sub_active: "Challenge läuft — Alle Limits eingehalten.",
    prop_status_failed_max: "FEHLGESCHLAGEN (Max Drawdown)",
    prop_sub_failed_max: "Konto hat das maximale Drawdown-Limit überschritten!",
    prop_status_failed_daily: "FEHLGESCHLAGEN (Tages-Drawdown)",
    prop_sub_failed_daily: "Tages-Verlustlimit wurde an einem Handelstag überschritten!",
    prop_status_passed: "BESTANDEN 🏆",
    prop_sub_passed: "Herzlichen Glückwunsch! Du hast das Gewinnziel erreicht!",
    prop_kpi_target: "Gewinnziel",
    prop_lbl_reached: "erreicht",
    prop_kpi_daily_buffer: "Tagesverlust-Puffer",
    prop_lbl_daily_limit: "Tages-Limit:",
    prop_lbl_max_day_loss: "Max. Tagesverlust:",
    prop_kpi_max_buffer: "Max Drawdown Puffer",
    prop_lbl_floor: "Mindest-Eigenkapital:",
    prop_kpi_current_equity: "Aktuelles Eigenkapital",
    prop_empty_state: "Keine Challenges getrackt. Klicke oben auf +, um eine hinzuzufügen.",
    prop_confirm_delete: "Diesen Prop Challenge Tracker wirklich löschen?",
    nav_calendar: "Kalender",
    nav_community: "Community",
    strategy_perf_title: "Strategie Performance",
    daily_perf_title: "Tagesperformance",
    monthly_over_title: "Monatsübersicht",
    daily_stats_title: "Tägliche Statistiken",
    th_date: "Datum",
    th_pf: "Profit Faktor",
    th_trades: "Trades",
    th_winrate: "Gewinnrate",
    th_avg_win: "Ø Gewinn",
    th_avg_loss: "Ø Verlust",
    th_max_win: "Max Gewinn",
    th_max_loss: "Max Verlust",
    th_commission: "Kommission",
    th_ls: "L / S",
    th_journal: "Journal",
    filter_date_lbl: "Datumsbereich:",
    clear_btn: "Löschen",
    calendar_title: "Performance Kalender",
    sl_widened_tooltip: "Stop Loss {x}x in Verlustrichtung verschoben",
    strategy_name_ph: "z.B. M30 Pullback, Break of Structure...",
    strategy_desc_ph: "Trage hier deine Einstiegsregeln, Konditionen und Notizen ein...",
    journal_modal_ph: "Wie fühlst du dich heute bei deinen Trades? Hast du deinen Plan befolgt?",
    delete_post: "Löschen",
    confirm_delete_post: "Bist du sicher, dass du diesen Beitrag löschen möchtest?",
    deleting_post: "Lösche...",
    delete_error: "Fehler beim Löschen des Beitrags.",
    comment_ph: "Kommentieren...",
    max_comments_reached: "Maximum von 5 Kommentaren erreicht.",
    composer_select_trade: "Wähle einen Trade",
    no_trades_found: "Keine Trades gefunden.",
    composer_empty_warn: "Bitte gib einen Text ein oder wähle einen Trade!",
    loading: "Lädt...",
    community_coming_soon: "Demnächst verfügbar: Top Trader, beste Setups und Community Challenges.",
    trade_screenshot: "Trade Screenshot",
    nav_psychology: "Psychologie",
    psychology_title: "Trading Psychologie & Mindset",
    psychology_sub: "Meistere deine Emotionen, überwinde FOMO & baue ein unerschütterliches Profi-Mindset auf.",
    psychology_search_ph: "Lektionen suchen...",
    mental_check_title: "Pre-Session Mental Check-in",
    mental_check_sub: "Bist du heute emotional bereit zum Traden? Mache den 15-Sekunden Check.",
    check_focus: "Fokus & Energie",
    check_focus_3: "🔥 100% Hellwach & Fokussiert",
    check_focus_2: "😐 Normal / Leicht abgelenkt",
    check_focus_1: "😴 Müde / Unkonzentriert",
    check_fomo: "FOMO / Drang zu Traden",
    check_fomo_3: "🛡️ Gelassen (Warte nur auf mein Setup)",
    check_fomo_2: "⚡ Leichte Unruhe / Will Action",
    check_fomo_1: "🚨 Starkes FOMO (Muss Geld zurückholen)",
    check_risk: "Risiko-Einstellung",
    check_risk_3: "📐 100% Diszipliniert (Striktes Risk)",
    check_risk_2: "⚠️ Bereit höheres Risiko einzugehen",
    check_risk_1: "💣 Emotionale Rache-Trades drohen",
    mental_check_advice_good: "Du bist in hervorragender Verfassung! Befolge deinen Trading-Plan ohne Ausnahmen.",
    mental_check_advice_warn: "Achtung: Du zeigst leichte emotionale Unruhe. Halte dein Risiko klein und traden nur A+ Setups.",
    mental_check_advice_bad: "🚨 Gefahr: Hohes Tilt / FOMO Risiko! Wir empfehlen dringend, heute eine Pause einzulegen.",
    cat_all: "Alle Themen",
    cat_discipline: "Disziplin & Emotionen",
    cat_fomo: "FOMO & Revenge Trading",
    cat_mindset: "Mindset & Wahrscheinlichkeiten",
    cat_risk: "Risiko & Verlust-Toleranz",
    read_lesson: "Lektion lesen",
    ask_ai_lesson: "KI Coach fragen",
    read_time: "Min. Lesezeit",
  },
  en: {
    login_sub: "Connect your MT5 account to view AI insights.",
    username_ph: "Username",
    password_ph: "Password",
    login_btn: "Login & Analyze",
    disconnect_btn: "Disconnect",
    refresh_btn: "↻ Refresh",
    reset_btn: "Reset",
    filter_today: "Today",
    filter_yesterday: "Yesterday",
    filter_week: "This Week",
    filter_month: "This Month",
    filter_all: "All Trades",
    kpi_profit: "Net Profit",
    kpi_gain: "Gain %",
    kpi_winrate: "Win Rate",
    kpi_trades: "Total Trades",
    kpi_pf: "Profit Factor",
    kpi_edge: "Long vs. Short Edge",
    kpi_sl_shift: "SL Shift",
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
    ai_placeholder:
      "Click the button above to get a harsh but helpful AI analysis of your recent trades.",
    ai_loading: "Consulting the AI Coach...",
    tilt_sub: "Revenge Trades (< 15 mins after loss)",
    killswitch_sub: "EA blocks trades at daily loss limit",
    heatmap_sub: "When do you earn the most?",
    save_btn: "Save",
    limit_lbl: "Limit: ",
    modal_warn: "WARNING",
    modal_desc:
      "Deactivating the Kill-Switch is highly risky. You are about to disable your protection mechanism and could exceed your daily loss limit!",
    modal_cancel: "Cancel (Stay Safe)",
    modal_confirm: "Deactivate anyway",
    discipline_lbl: "Discipline",
    setup_btn: "How to Setup & Get the EA",
    setup_step1: "Download the Rulebook Exporter EA from MQL5 Market.",
    setup_step2:
      "Attach it to exactly ONE chart in your MetaTrader 5 terminal.",
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
    link_account_desc:
      "Enter the username and password you use in the MetaTrader EA.",
    mt5_user_ph: "MT5 Username",
    mt5_pass_ph: "MT5 Password",
    link_btn: "Link Account",
    cancel_btn: "Cancel",
    kpi_best_day: "Best Day",
    kpi_worst_day: "Worst Day",
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    journal_title: "Mental Journal",
    journal_save: "Save Entry",
    journal_ph:
      "How are you feeling about your trades today? Did you follow your plan?",
    heatmap_title: "Profit Heatmap",
    tilt_title: "Tilt-Meter",
    killswitch_title: "Kill-Switch",
    trades_title: "Recent Trades & Tags",
    th_symbol: "Symbol",
    th_side: "Side",
    th_sl_widening: "SL Shift",
    th_profit: "Profit",
    th_close: "Duration",
    th_note: "Tag / Note",
    note_ph: "Add note or #tag...",
    th_gain: "% Gain",
    strategy_title: "STRATEGY DEFINITIONS // SYSTEMS",
    strategy_add_btn: "+ New Strategy",
    th_strategy: "Strategy",
    strategy_name_lbl: "Strategy Name",
    strategy_desc_lbl: "Rules / Description",
    ai_scope_month: "Current Month",
    ai_scope_week: "Current Week",
    ai_scope_day: "Today",
    archive_analysis_btn: "Archive Analysis",
    archived_analyses_title: "Archived Coach Analyses",
    view_archives_title: "View Archives",
    th_charts: "Charts",
    chart_before: "Before",
    chart_after: "After",
    focus_btn: "Focus Mode",
    kpi_avg_win: "Avg Win",
    kpi_avg_loss: "Avg Loss",
    ticker_title: "Market Ticker",
    nav_dashboard: "Dashboard",
    nav_journal: "Journal",
    nav_trades: "Trades",
    nav_tags: "Error Analysis",
    nav_prop: "Prop Challenge",
    market_sessions: "Market Sessions & Timezones",
    prop_tracker: "Prop Firm Challenge Tracker",
    nav_coach: "AI Coach",
    tag_analyzer_title: "Error Analysis",
    tag_analyzer_desc:
      "Analyze your mistakes and setups. Select a hashtag to filter and inspect the corresponding trades.",
    community_title: "Rulebook Community",
    community_trending: "Trending Now",
    composer_ph: "What's new?",
    composer_attach_trade: "Attach Trade",
    composer_submit: "Post",
    loading_feed: "Loading Feed...",
    no_posts: "No posts yet. Be the first to share a trade!",
    failed_feed: "Failed to load feed.",
    prop_sub:
      "Monitor your account in real-time against Max Drawdown, Daily Loss & Profit Target rules.",
    prop_rules_setup: "Challenge Rules & Setup",
    prop_label_account: "MT5 Account",
    prop_select_account_option: "Select Account...",
    prop_label_start_balance: "Initial Balance ($)",
    prop_label_target_pct: "Profit Target (%)",
    prop_label_daily_loss_pct: "Max Daily Loss (%)",
    prop_label_max_loss_pct: "Max Total Loss (%)",
    prop_status_lbl: "Status:",
    prop_status_loading: "LOADING...",
    prop_status_fetching: "Fetching data...",
    prop_status_waiting: "WAITING",
    prop_no_account_selected: "NO ACCOUNT SELECTED",
    prop_no_account_sub: "Please select an account to track.",
    prop_status_active: "ACTIVE",
    prop_sub_active: "Challenge active — All limits maintained.",
    prop_status_failed_max: "FAILED (Max Drawdown)",
    prop_sub_failed_max: "Account exceeded the maximum drawdown limit!",
    prop_status_failed_daily: "FAILED (Daily Drawdown)",
    prop_sub_failed_daily: "Daily loss limit was exceeded on a trading day!",
    prop_status_passed: "PASSED 🏆",
    prop_sub_passed: "Congratulations! You reached the profit target!",
    prop_kpi_target: "Profit Target",
    prop_lbl_reached: "reached",
    prop_kpi_daily_buffer: "Daily Loss Buffer",
    prop_lbl_daily_limit: "Daily Limit:",
    prop_lbl_max_day_loss: "Max Day Loss:",
    prop_kpi_max_buffer: "Max Drawdown Buffer",
    prop_lbl_floor: "Equity Floor:",
    prop_kpi_current_equity: "Current Equity",
    prop_empty_state: "No Challenges tracked. Click the + button above to add one.",
    prop_confirm_delete: "Delete this Prop Challenge tracker?",
    nav_calendar: "Calendar",
    nav_community: "Community",
    strategy_perf_title: "Strategy Performance",
    daily_perf_title: "Daily Performance",
    monthly_over_title: "Monthly Overview",
    daily_stats_title: "Daily Statistics",
    th_date: "Date",
    th_pf: "Profit Factor",
    th_trades: "Trades",
    th_winrate: "Win Rate",
    th_avg_win: "Avg Win",
    th_avg_loss: "Avg Loss",
    th_max_win: "Max Win",
    th_max_loss: "Max Loss",
    th_commission: "Commission",
    th_ls: "L / S",
    th_journal: "Journal",
    filter_date_lbl: "Date Range:",
    clear_btn: "Clear",
    calendar_title: "Performance Calendar",
    sl_widened_tooltip: "Stop Loss moved {x}x into loss direction",
    strategy_name_ph: "e.g. M30 Pullback, Break of Structure...",
    strategy_desc_ph: "List your entry rules, conditions and notes here...",
    journal_modal_ph: "How are you feeling about your trades today? Did you follow your plan?",
    delete_post: "Delete",
    confirm_delete_post: "Are you sure you want to delete this post?",
    deleting_post: "Deleting...",
    delete_error: "Error deleting post.",
    comment_ph: "Add a comment...",
    max_comments_reached: "Maximum limit of 5 comments reached.",
    composer_select_trade: "Select a Trade",
    no_trades_found: "No trades found.",
    composer_empty_warn: "Please enter text or select a trade!",
    loading: "Loading...",
    community_coming_soon: "Coming soon: Top Traders, Best Setups, and Community Challenges.",
    trade_screenshot: "Trade Screenshot",
    nav_psychology: "Psychology",
    psychology_title: "Trading Psychology & Mindset",
    psychology_sub: "Master your emotions, overcome FOMO & build an unshakeable pro mindset.",
    psychology_search_ph: "Search lessons...",
    mental_check_title: "Pre-Session Mental Check-in",
    mental_check_sub: "Are you emotionally ready to trade today? Take the 15-second check.",
    check_focus: "Focus & Energy",
    check_focus_3: "🔥 100% Wide Awake & Focused",
    check_focus_2: "😐 Normal / Slightly Distracted",
    check_focus_1: "😴 Tired / Unfocused",
    check_fomo: "FOMO / Urge to Trade",
    check_fomo_3: "🛡️ Calm (Waiting strictly for my setup)",
    check_fomo_2: "⚡ Slight Restlessness / Want Action",
    check_fomo_1: "🚨 Strong FOMO (Must regain money)",
    check_risk: "Risk Attitude",
    check_risk_3: "📐 100% Disciplined (Strict Risk)",
    check_risk_2: "⚠️ Willing to take higher risk",
    check_risk_1: "💣 Emotional revenge trades threat",
    mental_check_advice_good: "You are in peak condition! Follow your trading plan without exceptions.",
    mental_check_advice_warn: "Caution: Slight emotional restlessness detected. Keep risk small and trade A+ setups only.",
    mental_check_advice_bad: "🚨 Danger: High tilt / FOMO risk! We strongly advise taking a break today.",
    cat_all: "All Topics",
    cat_discipline: "Discipline & Emotions",
    cat_fomo: "FOMO & Revenge Trading",
    cat_mindset: "Mindset & Probabilities",
    cat_risk: "Risk & Loss Tolerance",
    read_lesson: "Read Lesson",
    ask_ai_lesson: "Ask AI Coach",
    read_time: "Min Read",
  },
  es: {
    login_sub: "Conecta tu cuenta MT5 para análisis de IA.",
    username_ph: "Usuario",
    password_ph: "Contraseña",
    login_btn: "Iniciar sesión",
    disconnect_btn: "Desconectar",
    refresh_btn: "↻ Actualizar",
    reset_btn: "Reset",
    filter_today: "Hoy",
    filter_yesterday: "Ayer",
    filter_week: "Esta Semana",
    filter_month: "Este Mes",
    filter_all: "Todas",
    kpi_profit: "Beneficio Neto",
    kpi_gain: "Ganancia %",
    kpi_winrate: "Tasa de Acierto",
    kpi_trades: "Total",
    kpi_pf: "Factor de Beneficio",
    kpi_edge: "Long vs. Short",
    kpi_sl_shift: "Ajuste SL",
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
    ai_placeholder:
      "Haz clic en el botón de arriba para obtener un análisis honesto de tus operaciones recientes.",
    ai_loading: "Consultando al Coach IA...",
    tilt_sub: "Operaciones de Revancha (< 15 mins post-pérdida)",
    killswitch_sub: "El EA bloquea trades al llegar al límite diario",
    heatmap_sub: "¿Cuándo ganas más?",
    save_btn: "Guardar",
    limit_lbl: "Límite: ",
    modal_warn: "ADVERTENCIA",
    modal_desc:
      "Desactivar el Kill-Switch es muy arriesgado. ¡Estás a punto de deshabilitar tu protección y podrías superar tu límite de pérdida diaria!",
    modal_cancel: "Cancelar (Mantener Seguro)",
    modal_confirm: "Desactivar de todos modos",
    discipline_lbl: "Disciplina",
    setup_btn: "Cómo configurar y obtener el EA",
    setup_step1: "Descarga el EA Rulebook Exporter desde MQL5 Market.",
    setup_step2: "Añádelo a UN SOLO gráfico en tu MetaTrader 5.",
    setup_step3:
      "Introduce tu Correo y Contraseña del Dashboard en los ajustes del EA.",
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
    link_account_desc:
      "Introduce el usuario y contraseña que usas en el EA de MetaTrader.",
    mt5_user_ph: "Usuario MT5",
    mt5_pass_ph: "Contraseña MT5",
    link_btn: "Vincular",
    cancel_btn: "Cancelar",
    kpi_best_day: "Mejor Día",
    kpi_worst_day: "Peor Día",
    days: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
    journal_title: "Diario Mental",
    journal_save: "Guardar Entrada",
    journal_ph: "¿Cómo te sientes con tus operaciones hoy? ¿Seguiste tu plan?",
    heatmap_title: "Mapa de Calor",
    tilt_title: "Medidor de Tilt",
    killswitch_title: "Kill-Switch",
    trades_title: "Operaciones Recientes",
    th_symbol: "Símbolo",
    th_side: "Lado",
    th_sl_widening: "Ajuste SL",
    th_profit: "Beneficio",
    th_close: "Duración",
    th_note: "Etiqueta / Nota",
    note_ph: "Añadir nota o #etiqueta...",
    th_gain: "% Gain",
    strategy_title: "DEFINICIONES DE ESTRATEGIA // SISTEMAS",
    strategy_add_btn: "+ Nueva Estrategia",
    th_strategy: "Estrategia",
    strategy_name_lbl: "Nombre de Estrategia",
    strategy_desc_lbl: "Reglas / Descripción",
    ai_scope_month: "Mes Actual",
    ai_scope_week: "Semana Actual",
    ai_scope_day: "Hoy",
    archive_analysis_btn: "Archivar Análisis",
    archived_analyses_title: "Análisis Archivados",
    view_archives_title: "Ver Archivos",
    th_charts: "Gráficos",
    chart_before: "Antes",
    chart_after: "Después",
    focus_btn: "Modo Enfoque",
    kpi_avg_win: "Ganancia Prom.",
    kpi_avg_loss: "Pérdida Prom.",
    ticker_title: "Mercado Ticker",
    nav_dashboard: "Panel",
    nav_journal: "Diario",
    nav_trades: "Operaciones",
    nav_tags: "Análisis de Errores",
    nav_prop: "Reto Prop",
    market_sessions: "Sesiones de Mercado",
    prop_sub:
      "Supervisa tu cuenta en tiempo real frente a las reglas de Drawdown Máximo, Pérdida Diaria y Objetivo de Beneficio.",
    prop_rules_setup: "Reglas del Reto y Configuración",
    prop_label_account: "Cuenta MT5",
    prop_select_account_option: "Seleccionar Cuenta...",
    prop_label_start_balance: "Balance Inicial ($)",
    prop_label_target_pct: "Objetivo de Beneficio (%)",
    prop_label_daily_loss_pct: "Pérdida Máx. Diaria (%)",
    prop_label_max_loss_pct: "Pérdida Máx. Total (%)",
    prop_status_lbl: "Estado:",
    prop_status_loading: "CARGANDO...",
    prop_status_fetching: "Obteniendo datos...",
    prop_status_waiting: "ESPERANDO",
    prop_no_account_selected: "NINGUNA CUENTA SELECCIONADA",
    prop_no_account_sub: "Por favor selecciona una cuenta para supervisar.",
    prop_status_active: "ACTIVO",
    prop_sub_active: "Reto activo — Todos los límites respetados.",
    prop_status_failed_max: "FALLIDO (Drawdown Máximo)",
    prop_sub_failed_max: "¡La cuenta ha superado el límite de drawdown máximo!",
    prop_status_failed_daily: "FALLIDO (Drawdown Diario)",
    prop_sub_failed_daily: "¡Se ha superado el límite de pérdida diaria en un día de trading!",
    prop_status_passed: "SUPERADO 🏆",
    prop_sub_passed: "¡Felicidades! ¡Has alcanzado el objetivo de beneficio!",
    prop_kpi_target: "Objetivo de Beneficio",
    prop_lbl_reached: "alcanzado",
    prop_kpi_daily_buffer: "Margen Pérdida Diaria",
    prop_lbl_daily_limit: "Límite Diario:",
    prop_lbl_max_day_loss: "Pérdida Máx. Día:",
    prop_kpi_max_buffer: "Margen Drawdown Máximo",
    prop_lbl_floor: "Límite de Capital:",
    prop_kpi_current_equity: "Capital Actual",
    prop_empty_state: "No hay retos registrados. Haz clic en el botón + de arriba para añadir uno.",
    prop_confirm_delete: "¿Eliminar este rastreador de reto prop?",
    tag_analyzer_title: "Análisis de Errores",
    tag_analyzer_desc:
      "Analiza tus errores y configuraciones. Selecciona una etiqueta para filtrar e inspeccionar las operaciones correspondientes.",
    community_title: "Comunidad Rulebook",
    community_trending: "Tendencias Ahora",
    composer_ph: "¿Qué hay de nuevo?",
    composer_attach_trade: "Adjuntar Operación",
    composer_submit: "Publicar",
    loading_feed: "Cargando Feed...",
    no_posts: "Aún no hay publicaciones. ¡Sé el primero en compartir una operación!",
    failed_feed: "Error al cargar el feed.",
    prop_tracker: "Rastreador Reto Prop",
    nav_coach: "Coach IA",
    nav_calendar: "Calendario",
    nav_community: "Comunidad",
    strategy_perf_title: "Rendimiento por Estrategia",
    daily_perf_title: "Rendimiento Diario",
    monthly_over_title: "Resumen Mensual",
    daily_stats_title: "Estadísticas Diarias",
    th_date: "Fecha",
    th_pf: "Factor de Beneficio",
    th_trades: "Operaciones",
    th_winrate: "Tasa de Acierto",
    th_avg_win: "Ganancia Prom.",
    th_avg_loss: "Pérdida Prom.",
    th_max_win: "Ganancia Máx.",
    th_max_loss: "Pérdida Máx.",
    th_commission: "Comisión",
    th_ls: "C / V",
    th_journal: "Diario",
    filter_date_lbl: "Rango de Fechas:",
    clear_btn: "Limpiar",
    calendar_title: "Calendario de Rendimiento",
    sl_widened_tooltip: "Stop Loss movido {x}x hacia pérdidas",
    strategy_name_ph: "ej. M30 Pullback, Break of Structure...",
    strategy_desc_ph: "Escribe aquí tus reglas de entrada, condiciones y notas...",
    journal_modal_ph: "¿Cómo te sientes con tus operaciones hoy? ¿Seguiste tu plan?",
    delete_post: "Eliminar",
    confirm_delete_post: "¿Estás seguro de que deseas eliminar esta publicación?",
    deleting_post: "Eliminando...",
    delete_error: "Error al eliminar la publicación.",
    comment_ph: "Comentar...",
    max_comments_reached: "Límite máximo de 5 comentarios alcanzado.",
    composer_select_trade: "Seleccionar una Operación",
    no_trades_found: "No se encontraron operaciones.",
    composer_empty_warn: "¡Por favor ingresa un texto o selecciona una operación!",
    loading: "Cargando...",
    community_coming_soon: "Próximamente: Mejores Traders, Mejores Setups y Desafíos de la Comunidad.",
    trade_screenshot: "Captura de pantalla de la operación",
    nav_psychology: "Psicología",
    psychology_title: "Psicología de Trading y Mentalidad",
    psychology_sub: "Domina tus emociones, supera el FOMO y construye una mentalidad profesional inquebrantable.",
    psychology_search_ph: "Buscar lecciones...",
    mental_check_title: "Check-in Mental Pre-Sesión",
    mental_check_sub: "¿Estás emocionalmente preparado para operar hoy? Haz la prueba de 15 segundos.",
    check_focus: "Enfoque y Energía",
    check_focus_3: "🔥 100% Alerta y Enfocado",
    check_focus_2: "😐 Normal / Ligeramente distraído",
    check_focus_1: "😴 Cansado / Desenfocado",
    check_fomo: "FOMO / Impulso de Operar",
    check_fomo_3: "🛡️ Calma (Esperando estrictamente mi setup)",
    check_fomo_2: "⚡ Inquietud leve / Buscando acción",
    check_fomo_1: "🚨 FOMO Intenso (Necesidad de recuperar)",
    check_risk: "Actitud ante el Riesgo",
    check_risk_3: "📐 100% Disciplinado (Riesgo estricto)",
    check_risk_2: "⚠️ Dispuesto a asumir mayor riesgo",
    check_risk_1: "💣 Amenaza de operaciones de venganza",
    mental_check_advice_good: "¡Estás en excelente condición! Sigue tu plan de trading sin excepciones.",
    mental_check_advice_warn: "Precaución: Ligera inquietud detectada. Mantén un riesgo bajo y opera solo setups A+.",
    mental_check_advice_bad: "🚨 Peligro: Alto riesgo de tilt / FOMO. Te recomendamos encarecidamente tomar un descanso hoy.",
    cat_all: "Todos los Temas",
    cat_discipline: "Disciplina y Emociones",
    cat_fomo: "FOMO y Revenge Trading",
    cat_mindset: "Mentalidad y Probabilidades",
    cat_risk: "Riesgo y Tolerancia a Pérdidas",
    read_lesson: "Leer Lección",
    ask_ai_lesson: "Preguntar al Coach IA",
    read_time: "Min de lectura",
  },
  tr: {
    login_sub: "Yapay zeka analizi için MT5 hesabınızı bağlayın.",
    username_ph: "Kullanıcı Adı",
    password_ph: "Şifre",
    login_btn: "Giriş Yap",
    disconnect_btn: "Çıkış Yap",
    refresh_btn: "↻ Yenile",
    reset_btn: "Sıfırla",
    filter_today: "Bugün",
    filter_yesterday: "Dün",
    filter_week: "Bu Hafta",
    filter_month: "Bu Ay",
    filter_all: "Tüm İşlemler",
    kpi_profit: "Net Kar",
    kpi_gain: "Getiri %",
    kpi_winrate: "Kazanma Oranı",
    kpi_trades: "Toplam İşlem",
    kpi_pf: "Kar Faktörü",
    kpi_edge: "Long vs. Short",
    kpi_sl_shift: "SL Kaydırma",
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
    ai_placeholder:
      "Son işlemlerinizin dürüst ve faydalı bir analizini almak için yukarıdaki düğmeye tıklayın.",
    ai_loading: "Yapay Zeka Koçuna Danışılıyor...",
    tilt_sub: "İntikam İşlemleri (Kayıptan < 15 dk sonra)",
    killswitch_sub: "Günlük kayıp limitinde işlemleri durdurur",
    heatmap_sub: "En çok ne zaman kazanıyorsun?",
    save_btn: "Kaydet",
    limit_lbl: "Limit: ",
    modal_warn: "UYARI",
    modal_desc:
      "Kill-Switch'i devre dışı bırakmak yüksek risklidir. Koruma mekanizmanızı kapatmak üzeresiniz ve günlük kayıp limitinizi aşabilirsiniz!",
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
    link_account_desc:
      "MetaTrader EA'da kullandığınız kullanıcı adı ve şifreyi girin.",
    mt5_user_ph: "MT5 Kullanıcı Adı",
    mt5_pass_ph: "MT5 Şifresi",
    link_btn: "Bağla",
    cancel_btn: "İptal",
    kpi_best_day: "En İyi Gün",
    kpi_worst_day: "En Kötü Gün",
    days: [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ],
    journal_title: "Zihinsel Günlük",
    journal_save: "Kaydı Kaydet",
    journal_ph:
      "Bugünkü işlemleriniz hakkında nasıl hissediyorsunuz? Planınıza uydunuz mu?",
    heatmap_title: "Kâr Isı Haritası",
    tilt_title: "Tilt Ölçer",
    killswitch_title: "Kill-Switch",
    trades_title: "Son İşlemler & Etiketler",
    th_symbol: "Sembol",
    th_side: "Yön",
    th_sl_widening: "SL Kaydırma",
    th_profit: "Kâr",
    th_close: "Süre",
    th_note: "Etiket / Not",
    note_ph: "Not veya #etiket ekle...",
    th_gain: "% Gain",
    strategy_title: "STRATEJİ TANIMLARI // SİSTEMLER",
    strategy_add_btn: "+ Yeni Strateji",
    th_strategy: "Strateji",
    strategy_name_lbl: "Strateji Adı",
    strategy_desc_lbl: "Kurallar / Açıklama",
    ai_scope_month: "Bu Ay",
    ai_scope_week: "Bu Hafta",
    ai_scope_day: "Bugün",
    archive_analysis_btn: "Analizi Arşivle",
    archived_analyses_title: "Arşivlenmiş Analizler",
    view_archives_title: "Arşivleri Görüntüle",
    th_charts: "Grafikler",
    chart_before: "Öncesi",
    chart_after: "Sonrası",
    focus_btn: "Odak Modu",
    kpi_avg_win: "Ort. Kazanç",
    kpi_avg_loss: "Ort. Kayıp",
    ticker_title: "Piyasa Takipçisi",
    nav_dashboard: "Panel",
    nav_journal: "Günlük",
    nav_trades: "İşlemler",
    nav_tags: "Hata Analizi",
    nav_prop: "Prop Mücadelesi",
    market_sessions: "Piyasa Saatleri",
    prop_tracker: "Prop Challenge Takipçisi",
    nav_coach: "AI Koçu",
    prop_sub:
      "Hesabınızı Maks. Düşüş, Günlük Kayıp ve Kâr Hedefi kurallarına karşı gerçek zamanlı izleyin.",
    prop_rules_setup: "Mücadele Kuralları ve Kurulum",
    prop_label_account: "MT5 Hesabı",
    prop_select_account_option: "Hesap Seçin...",
    prop_label_start_balance: "Başlangıç Bakiyesi ($)",
    prop_label_target_pct: "Kâr Hedefi (%)",
    prop_label_daily_loss_pct: "Maks. Günlük Kayıp (%)",
    prop_label_max_loss_pct: "Maks. Toplam Kayıp (%)",
    prop_status_lbl: "Durum:",
    prop_status_loading: "YÜKLENİYOR...",
    prop_status_fetching: "Veriler alınıyor...",
    prop_status_waiting: "BEKLENİYOR",
    prop_no_account_selected: "HESAP SEÇİLMEDİ",
    prop_no_account_sub: "Lütfen izlemek için bir hesap seçin.",
    prop_status_active: "AKTİF",
    prop_sub_active: "Mücadele aktif — Tüm limitlere uyuldu.",
    prop_status_failed_max: "BAŞARISIZ (Maks. Düşüş)",
    prop_sub_failed_max: "Hesap maksimum düşüş limitini aştı!",
    prop_status_failed_daily: "BAŞARISIZ (Günlük Düşüş)",
    prop_sub_failed_daily: "Bir işlem gününde günlük kayıp limiti aşıldı!",
    prop_status_passed: "GEÇİLDİ 🏆",
    prop_sub_passed: "Tebrikler! Kâr hedefine ulaştınız!",
    prop_kpi_target: "Kâr Hedefi",
    prop_lbl_reached: "ulaşıldı",
    prop_kpi_daily_buffer: "Günlük Kayıp Tamponu",
    prop_lbl_daily_limit: "Günlük Limit:",
    prop_lbl_max_day_loss: "Maks. Günlük Kayıp:",
    prop_kpi_max_buffer: "Maks. Düşüş Tamponu",
    prop_lbl_floor: "Varlık Tabanı:",
    prop_kpi_current_equity: "Mevcut Varlık",
    prop_empty_state: "İzlenen mücadele yok. Bir tane eklemek için yukarıdaki + düğmesine tıklayın.",
    prop_confirm_delete: "Bu Prop Challenge takipçisi silinsin mi?",
    tag_analyzer_title: "Hata Analizi",
    tag_analyzer_desc:
      "Hatalarınızı ve kurulumlarınızı analiz edin. İlgili işlemleri filtrelemek ve incelemek için bir hashtag seçin.",
    community_title: "Rulebook Topluluğu",
    community_trending: "Şimdi Popüler",
    composer_ph: "Yeni ne var?",
    composer_attach_trade: "İşlem Ekle",
    composer_submit: "Paylaş",
    loading_feed: "Akış Yükleniyor...",
    no_posts: "Henüz paylaşım yok. İlk işlemi paylaşan siz olun!",
    failed_feed: "Akış yüklenemedi.",
    nav_calendar: "Takvim",
    nav_community: "Topluluk",
    strategy_perf_title: "Strateji Performansı",
    daily_perf_title: "Günlük Performans",
    monthly_over_title: "Aylık Genel Bakış",
    daily_stats_title: "Günlük İstatistikler",
    th_date: "Tarih",
    th_pf: "Kâr Faktörü",
    th_trades: "İşlemler",
    th_winrate: "Kazanma Oranı",
    th_avg_win: "Ort. Kazanç",
    th_avg_loss: "Ort. Kayıp",
    th_max_win: "Maks. Kazanç",
    th_max_loss: "Maks. Kayıp",
    th_commission: "Komisyon",
    th_ls: "L / S",
    th_journal: "Günlük",
    filter_date_lbl: "Tarih Aralığı:",
    clear_btn: "Temizle",
    calendar_title: "Performans Takvimi",
    sl_widened_tooltip: "Stop Loss {x}x kayıp yönüne kaydırıldı",
    strategy_name_ph: "ör. M30 Pullback, Break of Structure...",
    strategy_desc_ph: "Giriş kurallarınızı, koşullarınızı ve notlarınızı buraya yazın...",
    journal_modal_ph: "Bugünkü işlemleriniz hakkında nasıl hissediyorsunuz? Planınıza uydunuz mu?",
    delete_post: "Sil",
    confirm_delete_post: "Bu gönderiyi silmek istediğinizden emin misiniz?",
    deleting_post: "Siliniyor...",
    delete_error: "Gönderi silinirken hata oluştu.",
    comment_ph: "Yorum yap...",
    max_comments_reached: "Maksimum 5 yorum sınırına ulaşıldı.",
    composer_select_trade: "Bir İşlem Seçin",
    no_trades_found: "İşlem bulunamadı.",
    composer_empty_warn: "Lütfen bir metin girin veya bir işlem seçin!",
    loading: "Yükleniyor...",
    community_coming_soon: "Yakında: En İyi Traderlar, En İyi Kurulumlar ve Topluluk Yarışmaları.",
    trade_screenshot: "İşlem Ekran Görüntüsü",
    nav_psychology: "Psikoloji",
    psychology_title: "Trading Psikolojisi ve Zihniyet",
    psychology_sub: "Duygularınızı yönetin, FOMO'yu aşın ve sarsılmaz bir profesyonel zihniyet inşa edin.",
    psychology_search_ph: "Derslerde ara...",
    mental_check_title: "Seans Öncesi Zihinsel Check-in",
    mental_check_sub: "Bugün işlem yapmaya duygusal olarak hazır mısınız? 15 saniyelik testi yapın.",
    check_focus: "Odaklanma ve Enerji",
    check_focus_3: "🔥 %100 Uyanık ve Odaklanmış",
    check_focus_2: "😐 Normal / Hafif Dikkatsiz",
    check_focus_1: "😴 Yorgun / Odaksız",
    check_fomo: "FOMO / İşlem Yapma İsteği",
    check_fomo_3: "🛡️ Sakin (Sadece kurulumumu bekliyorum)",
    check_fomo_2: "⚡ Hafif Huzursuzluk / Aksiyon İsteği",
    check_fomo_1: "🚨 Yüksek FOMO (Parayı geri alma hırsı)",
    check_risk: "Risk Tutumu",
    check_risk_3: "📐 %100 Disiplinli (Sıkı Risk)",
    check_risk_2: "⚠️ Daha yüksek risk almaya istekli",
    check_risk_1: "💣 Duygusal intikam işlemleri tehlikesi",
    mental_check_advice_good: "Zirve durumdasınız! İşlem planınızı istisnasız uygulayın.",
    mental_check_advice_warn: "Dikkat: Hafif duygusal huzursuzluk tespit edildi. Riski düşük tutun ve sadece A+ kurulumları yapın.",
    mental_check_advice_bad: "🚨 Tehlike: Yüksek tilt / FOMO riski! Bugün işlem yapmaya ara vermenizi şiddetle tavsiye ederiz.",
    cat_all: "Tüm Konular",
    cat_discipline: "Disiplin ve Duygular",
    cat_fomo: "FOMO ve İntikam İşlemleri",
    cat_mindset: "Zihniyet ve Olasılıklar",
    cat_risk: "Risk ve Kayıp Toleransı",
    read_lesson: "Dersi Oku",
    ask_ai_lesson: "Yapay Zeka Koçuna Sor",
    read_time: "Dk Okuma",
  },
};

// ── Image Preview Modal ─────────────────────────────────────────────────
let _imgZoomScale = 1;

function openImagePreview(url) {
  const modal = document.getElementById("image-preview-modal");
  const img = document.getElementById("image-preview-img");
  if (!modal || !img) return;
  _imgZoomScale = 1;
  img.style.transform = "scale(1)";
  img.style.cursor = "zoom-in";
  img.src = url;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeImagePreview() {
  const modal = document.getElementById("image-preview-modal");
  const img = document.getElementById("image-preview-img");
  if (!modal || !img) return;
  modal.classList.add("hidden");
  img.src = "";
  _imgZoomScale = 1;
  img.style.transform = "scale(1)";
  document.body.style.overflow = "";
}

// Close button
const imgModalClose = document.getElementById("image-preview-close");
if (imgModalClose) imgModalClose.addEventListener("click", closeImagePreview);

// Click on backdrop closes modal
const imgModalEl = document.getElementById("image-preview-modal");
if (imgModalEl) {
  imgModalEl.addEventListener("click", (e) => {
    if (e.target === imgModalEl) closeImagePreview();
  });
}

// Escape key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("image-preview-modal");
    if (modal && !modal.classList.contains("hidden")) closeImagePreview();
  }
});

// Ctrl + Scroll = Zoom (cursor-relative)
const imgPreviewWrap = document.getElementById("image-preview-modal");
if (imgPreviewWrap) {
  imgPreviewWrap.addEventListener(
    "wheel",
    (e) => {
      const img = document.getElementById("image-preview-img");
      if (!img) return;
      if (e.ctrlKey) {
        e.preventDefault();

        // Calculate mouse position as % of image dimensions BEFORE scaling
        const rect = img.getBoundingClientRect();
        const originX = ((e.clientX - rect.left) / rect.width) * 100;
        const originY = ((e.clientY - rect.top) / rect.height) * 100;

        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        _imgZoomScale = Math.min(5, Math.max(0.5, _imgZoomScale + delta));

        img.style.transformOrigin = `${originX}% ${originY}%`;
        img.style.transform = `scale(${_imgZoomScale})`;
        img.style.cursor = _imgZoomScale > 1 ? "zoom-out" : "zoom-in";
      }
    },
    { passive: false },
  );
}

// Double-click resets zoom
const imgPreviewImg = document.getElementById("image-preview-img");
if (imgPreviewImg) {
  imgPreviewImg.addEventListener("dblclick", () => {
    _imgZoomScale = 1;
    imgPreviewImg.style.transform = "scale(1)";
    imgPreviewImg.style.cursor = "zoom-in";
  });
}

window.saveTradeImage = function (inputEl) {
  const ticket = inputEl.getAttribute("data-ticket");
  const type = inputEl.getAttribute("data-type");
  const url = inputEl.value.trim();
  if (!url) return;

  if (!window.tradeImagesMap) window.tradeImagesMap = {};
  if (!window.tradeImagesMap[ticket])
    window.tradeImagesMap[ticket] = { before: "", after: "" };
  window.tradeImagesMap[ticket][type] = url;

  updateTradeImagesBackend(ticket);
};

window.deleteTradeImage = function (ticket, type) {
  if (!window.tradeImagesMap || !window.tradeImagesMap[ticket]) return;
  window.tradeImagesMap[ticket][type] = "";
  updateTradeImagesBackend(ticket);
};

function updateTradeImagesBackend(ticket) {
  const token = localStorage.getItem("tm_master_token");
  const accountId = localStorage.getItem("tm_license_key");
  if (!token || !accountId) return;

  const imgData = window.tradeImagesMap[ticket];
  fetch(
    `${API_URL}?action=images&account_id=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        ticket: ticket,
        img_before: imgData.before,
        img_after: imgData.after,
      }),
    },
  )
    .then((r) => r.json())
    .then((d) => {
      if (
        d.success &&
        typeof renderTradesTable === "function" &&
        currentFilteredTrades
      ) {
        renderTradesTable(currentFilteredTrades, window.currentCurSym);
        if (
          window.currentAllTrades &&
          typeof window.renderTagAnalyzer === "function"
        ) {
          window.renderTagAnalyzer(
            window.currentAllTrades,
            window.currentCurSym || "$",
          );
        }
      }
    })
    .catch((e) => console.error(e));
}

document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const connectBtn = document.getElementById("connect-btn");
  const logoutBtn = document.getElementById("logout-btn");
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
  let currentTimeframe = "month";
  let currentAllTrades = [];
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentTimeframe = e.target.getAttribute("data-timeframe");

      const tradesDateLabel = document.getElementById(
        "trades-selected-date-label",
      );
      const clearTradesDateBtn = document.getElementById(
        "clear-trades-date-btn",
      );
      if (tradesDateLabel) {
        tradesDateLabel.textContent = "";
        tradesDateLabel.style.display = "none";
      }
      if (clearTradesDateBtn) clearTradesDateBtn.style.display = "none";

      const key = localStorage.getItem("tm_license_key");
      if (key) loadDashboard(key);
    });
  });

  const monthSelector = document.getElementById("month-selector");
  if (monthSelector) {
    monthSelector.addEventListener("change", (e) => {
      currentTimeframe = e.target.value;
      filterBtns.forEach((b) => b.classList.remove("active"));

      const tradesDateLabel = document.getElementById(
        "trades-selected-date-label",
      );
      const clearTradesDateBtn = document.getElementById(
        "clear-trades-date-btn",
      );
      if (tradesDateLabel) {
        tradesDateLabel.textContent = "";
        tradesDateLabel.style.display = "none";
      }
      if (clearTradesDateBtn) clearTradesDateBtn.style.display = "none";

      const key = localStorage.getItem("tm_license_key");
      if (key) loadDashboard(key);
    });
  }

  // Language Handling
  function setLanguage(lang) {
    if (!i18n[lang]) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18n[lang][key]) el.innerText = i18n[lang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (i18n[lang][key]) el.placeholder = i18n[lang][key];
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (i18n[lang][key]) el.title = i18n[lang][key];
    });

    const discSpan = document.getElementById("kpi-discipline");
    if (discSpan) {
      const currentText = discSpan.innerText;
      const scoreMatch = currentText.match(/:\s*(\d+)%/);
      if (scoreMatch) {
        discSpan.innerText = `${i18n[lang].discipline_lbl}: ${scoreMatch[1]}%`;
      }
    }

    if (typeof window.renderPropChallenges === "function") {
      window.renderPropChallenges();
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
      window.location.reload();
    });
  }

  if (loginLang) {
    loginLang.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("tm_global_lang", newLang);
      if (globalLang) globalLang.value = newLang;
      setLanguage(newLang);
      window.location.reload();
    });
  }

  // Theme Toggle Logic
  const themeSelects = document.querySelectorAll(".theme-select");
  const savedTheme = localStorage.getItem("tm_theme") || "neo-retro";
  document.documentElement.setAttribute("data-theme", savedTheme);

  window.renderCalendarWidget = function () {
    const container = document.getElementById("tv-calendar-container");
    if (!container) return;

    container.innerHTML =
      '<div class="tradingview-widget-container__widget"></div>';

    const currentTheme = localStorage.getItem("tm_theme") || "neo-retro";
    const isLight = currentTheme === "modern-light" || currentTheme === "win95";
    const tvTheme = isLight ? "light" : "dark";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: tvTheme,
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "de",
      importanceFilter: "-1,0,1",
      countryFilter: "eu,de,us,gb,jp,ch,au,ca,nz",
    });

    container.appendChild(script);
  };

  // Initial render
  window.renderCalendarWidget();

  function updateSidebarLogo(theme) {
    const expandedImg = document.querySelector(".logo-expanded");
    const collapsedImg = document.querySelector(".logo-collapsed");
    if (!expandedImg || !collapsedImg) return;

    let expandedSrc = "assets/rulebook_logo_neo.png";
    let collapsedSrc = "assets/rulebook_logo_neo_small.png";

    switch (theme) {
      case "win95":
        expandedSrc = "assets/rulebook_logo_win95.png";
        collapsedSrc = "assets/rulebook_logo_win95_small.png";
        break;
      case "modern-dark":
        expandedSrc = "assets/rulebook_logo_moderndark.png";
        collapsedSrc = "assets/rulebook_logo_moderndark_small.png";
        break;
      case "modern-light":
        expandedSrc = "assets/rulebook_logo_modernlight.png";
        collapsedSrc = "assets/rulebook_logo_modernlight_small.png";
        break;
      case "quantum":
        expandedSrc = "assets/rulebook_logo_quantum.png";
        collapsedSrc = "assets/rulebook_logo_quantum_small.png";
        break;
    }
    expandedImg.src = expandedSrc;
    collapsedImg.src = collapsedSrc;
    const loginLogo = document.getElementById("login-logo");
    if (loginLogo) loginLogo.src = expandedSrc;
  }

  updateSidebarLogo(savedTheme);

  themeSelects.forEach((sel) => {
    sel.value = savedTheme;
    sel.addEventListener("change", (e) => {
      const t = e.target.value;
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("tm_theme", t);
      themeSelects.forEach((s) => (s.value = t));
      updateSidebarLogo(t);
      if (window.renderCalendarWidget) window.renderCalendarWidget();
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
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("tm_master_token"),
        },
        body: JSON.stringify({ email, password }),
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
    masterLoginBtn.addEventListener("click", () =>
      handleMasterAuth(
        "login",
        document.getElementById("login-email").value,
        document.getElementById("login-password").value,
        masterLoginBtn,
      ),
    );
    setupEnterKey("login-email", masterLoginBtn);
    setupEnterKey("login-password", masterLoginBtn);
  }
  if (masterRegisterBtn) {
    masterRegisterBtn.addEventListener("click", () =>
      handleMasterAuth(
        "register",
        document.getElementById("reg-email").value,
        document.getElementById("reg-password").value,
        masterRegisterBtn,
      ),
    );
    setupEnterKey("reg-email", masterRegisterBtn);
    setupEnterKey("reg-password", masterRegisterBtn);
  }

  async function fetchLinkedAccounts() {
    const token = localStorage.getItem("tm_master_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}?action=accounts`, {
        method: "GET",
        headers: { Authorization: token },
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
        accounts.forEach((acc) => {
          const opt = document.createElement("option");
          opt.value = acc.license_key;
          opt.innerText = acc.alias;
          accountSwitcher.appendChild(opt);
        });

        let currentKey = localStorage.getItem("tm_license_key");
        if (!accounts.some((a) => a.license_key === currentKey)) {
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

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      const key = localStorage.getItem("tm_license_key");
      if (!key) return;

      const lang = globalLang ? globalLang.value : "de";
      const msg =
        lang === "de"
          ? "Bist du sicher? Alle Trades im Dashboard werden gelöscht (dein MT5 bleibt unangetastet!). Der EA wird in 60s neu synchronisieren."
          : "Are you sure? All trades in the dashboard will be deleted (your MT5 is untouched!). The EA will resync in 60s.";

      if (confirm(msg)) {
        const span = resetBtn.querySelector(".sidebar-btn-text");
        if (span) span.innerText = "⏳...";
        else resetBtn.innerText = "⏳...";
        try {
          const response = await fetch(
            `${API_URL}?account_id=${encodeURIComponent(key)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: localStorage.getItem("tm_master_token"),
              },
            },
          );
          if (response.ok) {
            alert(
              lang === "de"
                ? "Dashboard geleert! Warte 60s auf den nächsten EA Sync."
                : "Dashboard cleared! Wait 60s for the next EA sync.",
            );
            window.location.reload();
          } else {
            alert("Error resetting dashboard.");
          }
        } catch (err) {
          alert(err.message);
        } finally {
          if (span)
            span.innerText =
              i18n[lang] && i18n[lang].reset_btn
                ? i18n[lang].reset_btn
                : "Reset";
          else
            resetBtn.innerText =
              i18n[lang] && i18n[lang].reset_btn
                ? i18n[lang].reset_btn
                : "Reset";
        }
      }
    });
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      const key = localStorage.getItem("tm_license_key");
      if (!key) return;

      const lang = globalLang ? globalLang.value : "de";
      const msg =
        lang === "de"
          ? "Bist du sicher? Dieser Trading Account und ALLE zugehörigen Daten (Trades, Journal, Notizen) werden permanent gelöscht! Der Account verschwindet aus der Liste."
          : "Are you sure? This trading account and ALL associated data (trades, journal, notes) will be permanently deleted! The account will be removed from the list.";

      if (confirm(msg)) {
        deleteAccountBtn.innerText = "⏳";
        try {
          const response = await fetch(
            `${API_URL}?action=account&account_id=${encodeURIComponent(key)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: localStorage.getItem("tm_master_token"),
              },
            },
          );
          if (response.ok) {
            alert(
              lang === "de"
                ? "Account erfolgreich gelöscht."
                : "Account successfully deleted.",
            );
            localStorage.removeItem("tm_license_key"); // Clear current key so it picks the next one
            window.location.reload();
          } else {
            alert("Error deleting account.");
          }
        } catch (err) {
          alert(err.message);
        } finally {
          deleteAccountBtn.innerText = "🗑️";
        }
      }
    });
  }

  // ── Trades Tab Calendar Popup ──────────────────────────────────
  const tradesCalBtn = document.getElementById("trades-calendar-btn");
  const clearTradesDateBtn = document.getElementById("clear-trades-date-btn");
  const tradesCalOverlay = document.getElementById("trades-cal-overlay");
  const tradesCalClose = document.getElementById("trades-cal-close");
  const tradesCalPrev = document.getElementById("trades-cal-prev");
  const tradesCalNext = document.getElementById("trades-cal-next");
  const tradesCalTitle = document.getElementById("trades-cal-month-title");
  const tradesCalGrid = document.getElementById("trades-cal-grid-container");
  const tradesDateLabel = document.getElementById("trades-selected-date-label");

  const FULL_MONTHS = [
    "JANUAR",
    "FEBRUAR",
    "MÄRZ",
    "APRIL",
    "MAI",
    "JUNI",
    "JULI",
    "AUGUST",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DEZEMBER",
  ];

  let calPopupYear = new Date().getFullYear();
  let calPopupMonth = new Date().getMonth(); // 0-based

  function renderTradesCalPopup() {
    if (!tradesCalGrid || !tradesCalTitle) return;

    // Build daily profit map from ALL trades (across all time)
    const dailyProfit = {};
    currentAllTrades.forEach((t) => {
      const d = new Date(t.close_time * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!dailyProfit[key]) dailyProfit[key] = 0;
      dailyProfit[key] += parseFloat(t.net_profit);
    });

    tradesCalTitle.textContent = `${FULL_MONTHS[calPopupMonth]} ${calPopupYear}`;

    const firstDay = new Date(calPopupYear, calPopupMonth, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(calPopupYear, calPopupMonth + 1, 0).getDate();
    const curSym = window.currentCurSym || "$";

    let html = `<div class="cal-grid">`;
    ["M", "D", "M", "D", "F", "S", "S"].forEach((h) => {
      html += `<div class="cal-header">${h}</div>`;
    });
    for (let i = 0; i < startOffset; i++)
      html += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${calPopupYear}-${String(calPopupMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const val = dailyProfit[dateKey];
      let cls = "clickable-cal-day";
      let valHtml = "";
      if (val !== undefined) {
        cls += val > 0 ? " positive" : val < 0 ? " negative" : "";
        const disp =
          val >= 0
            ? `+${curSym}${val.toFixed(0)}`
            : `-${curSym}${Math.abs(val).toFixed(0)}`;
        valHtml = `<span class="cal-val">${disp}</span>`;
      }
      html += `<div class="cal-day ${cls}" data-datekey="${dateKey}" style="cursor:pointer"><span class="cal-date">${d}</span>${valHtml}</div>`;
    }
    html += `</div>`;
    tradesCalGrid.innerHTML = html;

    // Day click → filter trades table and close popup
    tradesCalGrid.querySelectorAll(".clickable-cal-day").forEach((el) => {
      el.addEventListener("click", () => {
        const dKey = el.getAttribute("data-datekey");
        const [yy, mm, dd] = dKey.split("-");
        const dateStr = `${dd}.${mm}.${yy}`;

        const dayTrades = currentAllTrades.filter((t) => {
          const tDate = new Date(t.close_time * 1000);
          const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}-${String(tDate.getDate()).padStart(2, "0")}`;
          return tKey === dKey;
        });

        if (typeof window.renderTradesTable === "function") {
          window.renderTradesTable(dayTrades, window.currentCurSym || "$");
        }
        const titleSpan = document.querySelector(
          "#recent-trades-panel h3 span",
        );
        if (titleSpan) {
          titleSpan.innerHTML = `Recent Trades &amp; Tags <span style="color:var(--text-muted);font-size:0.85rem;margin-left:10px;">(${dateStr})</span>`;
        }
        if (tradesDateLabel) {
          tradesDateLabel.textContent = dateStr;
          tradesDateLabel.style.display = "inline";
        }
        if (clearTradesDateBtn)
          clearTradesDateBtn.style.display = "inline-flex";

        // close popup
        tradesCalOverlay.style.display = "none";
      });
    });
  }

  function openTradesCalPopup() {
    // Start on the month of the currently filtered timeframe
    const now = new Date();
    calPopupYear = now.getFullYear();
    calPopupMonth = now.getMonth();
    renderTradesCalPopup();
    if (tradesCalOverlay) {
      tradesCalOverlay.style.display = "flex";
    }
  }

  if (tradesCalBtn) tradesCalBtn.addEventListener("click", openTradesCalPopup);
  if (tradesCalClose)
    tradesCalClose.addEventListener("click", () => {
      tradesCalOverlay.style.display = "none";
    });
  if (tradesCalOverlay) {
    tradesCalOverlay.addEventListener("click", (e) => {
      if (e.target === tradesCalOverlay)
        tradesCalOverlay.style.display = "none";
    });
  }
  if (tradesCalPrev) {
    tradesCalPrev.addEventListener("click", () => {
      calPopupMonth--;
      if (calPopupMonth < 0) {
        calPopupMonth = 11;
        calPopupYear--;
      }
      renderTradesCalPopup();
    });
  }
  if (tradesCalNext) {
    tradesCalNext.addEventListener("click", () => {
      calPopupMonth++;
      if (calPopupMonth > 11) {
        calPopupMonth = 0;
        calPopupYear++;
      }
      renderTradesCalPopup();
    });
  }

  if (clearTradesDateBtn) {
    clearTradesDateBtn.addEventListener("click", () => {
      if (typeof window.renderTradesTable === "function") {
        window.renderTradesTable(
          currentFilteredTrades,
          window.currentCurSym || "$",
        );
      }
      const titleSpan = document.querySelector("#recent-trades-panel h3 span");
      if (titleSpan) {
        const lang = globalLang ? globalLang.value : "en";
        titleSpan.innerHTML =
          i18n[lang] && i18n[lang].trades_title
            ? i18n[lang].trades_title
            : "Recent Trades &amp; Tags";
      }
      if (tradesDateLabel) {
        tradesDateLabel.textContent = "";
        tradesDateLabel.style.display = "none";
      }
      clearTradesDateBtn.style.display = "none";
    });
  }

  const limitSelect = document.getElementById("trades-limit-select");
  if (limitSelect) {
    limitSelect.value = window.tradesPerPage;
    limitSelect.addEventListener("change", (e) => {
      const limit = parseInt(e.target.value) || 10;
      window.tradesPerPage = limit;
      localStorage.setItem("tm_trades_limit", limit);
      if (window._lastTradesArray) {
        window.renderTradesTable(
          window._lastTradesArray,
          window.currentCurSym || "$",
        );
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
      const response = await fetch(
        `${API_URL}?account_id=${encodeURIComponent(key)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("tm_master_token"),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Invalid License Key or Server Error.");
      }

      const payload = await response.json();
      const trades = payload.trades || payload;
      let currentBalance = payload.current_balance || 0;

      let runningBalance = parseFloat(currentBalance);
      window.accCurrency = "USD";
      trades.forEach((t) => {
        // Offset timestamps so local browser time exactly matches MT5 Server time
        const offsetSecs = new Date(t.close_time * 1000).getTimezoneOffset() * 60;
        if (t.open_time) t.open_time = t.open_time + offsetSecs;
        if (t.close_time) t.close_time = t.close_time + offsetSecs;

        // Parse side
        if (t.side.includes("_")) {
          const sideParts = t.side.split("_");
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
        
        t.commission = parseFloat((parseFloat(t.net_profit) - parseFloat(t.gross_profit)).toFixed(2));

        // Calculate balances
        const netP = parseFloat(t.net_profit);
        if (
          t.balance_after !== undefined &&
          t.balance_after !== null &&
          !isNaN(t.balance_after)
        ) {
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
      fetch(`${API_URL}?action=notes&account_id=${encodeURIComponent(key)}`, {
        headers: { Authorization: localStorage.getItem("tm_master_token") },
      })
        .then((r) => r.json())
        .then((d) => {
          window.tradeNotesMap = {};
          d.forEach((n) => {
            window.tradeNotesMap[n.ticket] = n.note;
          });
          // Re-render table if data already processed
          if (currentFilteredTrades && currentFilteredTrades.length > 0) {
            if (typeof renderTradesTable === "function") {
              renderTradesTable(currentFilteredTrades, window.currentCurSym);
            } else {
              processData(currentFilteredTrades, window.currentCurSym);
            }
          }
          if (
            window.currentAllTrades &&
            typeof window.renderTagAnalyzer === "function"
          ) {
            window.renderTagAnalyzer(
              window.currentAllTrades,
              window.currentCurSym || "$",
            );
          }
        })
        .catch((e) => console.error(e));

      // Load Trade Images
      fetch(`${API_URL}?action=images&account_id=${encodeURIComponent(key)}`, {
        headers: { Authorization: localStorage.getItem("tm_master_token") },
      })
        .then((r) => r.json())
        .then((d) => {
          window.tradeImagesMap = {};
          d.forEach((img) => {
            window.tradeImagesMap[img.ticket] = {
              before: img.img_before,
              after: img.img_after,
            };
          });
          if (currentFilteredTrades && currentFilteredTrades.length > 0) {
            if (typeof renderTradesTable === "function") {
              renderTradesTable(currentFilteredTrades, window.currentCurSym);
            }
          }
          if (
            window.currentAllTrades &&
            typeof window.renderTagAnalyzer === "function"
          ) {
            window.renderTagAnalyzer(
              window.currentAllTrades,
              window.currentCurSym || "$",
            );
          }
        })
        .catch((e) => console.error(e));

      // Load Trade Strategy Assignments
      fetch(
        `${API_URL}?action=trade_strategy&account_id=${encodeURIComponent(key)}`,
        { headers: { Authorization: localStorage.getItem("tm_master_token") } },
      )
        .then((r) => r.json())
        .then((d) => {
          window.tradeStrategyMap = {};
          d.forEach((n) => {
            window.tradeStrategyMap[n.ticket] = n.strategy_id;
          });
          if (currentFilteredTrades && currentFilteredTrades.length > 0) {
            renderStrategyPerformance(currentFilteredTrades);
            if (typeof renderTradesTable === "function")
              renderTradesTable(currentFilteredTrades, window.currentCurSym);
          }
          if (
            window.currentAllTrades &&
            typeof window.renderTagAnalyzer === "function"
          ) {
            window.renderTagAnalyzer(
              window.currentAllTrades,
              window.currentCurSym || "$",
            );
          }
        })
        .catch((e) => console.error(e));

      // Load Strategy Definitions
      fetch(`${API_URL}?action=strategies`, {
        headers: { Authorization: localStorage.getItem("tm_master_token") },
      })
        .then((r) => r.json())
        .then((d) => {
          window.strategyDefs = d || [];
          renderStrategyCards();
          renderStrategyPerformance(currentFilteredTrades);
          if (currentFilteredTrades && currentFilteredTrades.length > 0) {
            if (typeof renderTradesTable === "function")
              renderTradesTable(currentFilteredTrades, window.currentCurSym);
          }
          if (
            window.currentAllTrades &&
            typeof window.renderTagAnalyzer === "function"
          ) {
            window.renderTagAnalyzer(
              window.currentAllTrades,
              window.currentCurSym || "$",
            );
          }
        })
        .catch((e) => console.error(e));

      // Filter trades based on timeframe
      const now = new Date();
      let startTime = 0;
      let endTime = 2000000000;

      // MT5 timestamps represent Server Time as if it were UTC.
      // Therefore, we must construct our boundaries using Date.UTC but with local year/month/date.
      if (currentTimeframe === "today") {
        startTime = Math.floor(
          Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000,
        );
      } else if (currentTimeframe === "yesterday") {
        startTime = Math.floor(
          Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1) / 1000,
        );
        endTime =
          Math.floor(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000,
          ) - 1;
      } else if (currentTimeframe === "week") {
        const day = now.getDay(); // 0=Sun .. 6=Sat
        const daysToMonday = day === 0 ? -6 : 1 - day;
        const mondayDate = now.getDate() + daysToMonday;
        const sundayDate = mondayDate + 6;
        // Date.UTC handles overflow automatically (e.g. day=0 → last day of prev month)
        startTime = Math.floor(
          Date.UTC(now.getFullYear(), now.getMonth(), mondayDate) / 1000,
        );
        endTime =
          Math.floor(
            Date.UTC(now.getFullYear(), now.getMonth(), sundayDate + 1) / 1000,
          ) - 1;
      } else if (currentTimeframe === "month" || currentTimeframe === "current_month") {
        startTime = Math.floor(
          Date.UTC(now.getFullYear(), now.getMonth(), 1) / 1000,
        );
        endTime =
          Math.floor(
            Date.UTC(now.getFullYear(), now.getMonth() + 1, 1) / 1000,
          ) - 1;
      } else if (currentTimeframe.match(/^\d{4}-\d{1,2}$/)) {
        const [y, m] = currentTimeframe.split("-").map(Number);
        startTime = Math.floor(new Date(y, m, 1).getTime() / 1000);
        endTime = Math.floor(new Date(y, m + 1, 1).getTime() / 1000) - 1;
      } else if (currentTimeframe === "all") {
        startTime = 0;
        endTime = 2000000000;
      }

      // Extract currency and gross profit from all trades
      let accCurrency = window.accCurrency || "USD";

      const currencyMap = {
        EUR: "€",
        USD: "$",
        GBP: "£",
        JPY: "¥",
        CHF: "CHF",
        AUD: "A$",
        CAD: "C$",
        NZD: "NZ$",
      };
      const curSym = currencyMap[accCurrency] || accCurrency;
      window.currentCurSym = curSym;

      const monthSel = document.getElementById("month-selector");
      if (monthSel) {
        const uniqueMonths = new Set();
        trades.forEach((t) => {
          const d = new Date(t.close_time * 1000);
          uniqueMonths.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
        });

        uniqueMonths.add(`${now.getFullYear()}-${now.getMonth()}`);

        const sortedMonths = Array.from(uniqueMonths).sort((a, b) => {
          const [yA, mA] = a.split("-").map(Number);
          const [yB, mB] = b.split("-").map(Number);
          if (yA !== yB) return yB - yA;
          return mB - mA;
        });

        const monthNames = [
          "Jan",
          "Feb",
          "Mär",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Dez",
        ];
        let optionsHtml = `<option value="all" data-i18n="filter_all">All Time</option>`;

        sortedMonths.forEach((mStr) => {
          const [y, m] = mStr.split("-").map(Number);
          optionsHtml += `<option value="${mStr}">${monthNames[m]} ${y}</option>`;
        });

        monthSel.innerHTML = optionsHtml;

        if (currentTimeframe === "current_month") {
          monthSel.value = `${now.getFullYear()}-${now.getMonth()}`;
          currentTimeframe = monthSel.value;
        } else if (
          currentTimeframe === "all" ||
          currentTimeframe.match(/^\d{4}-\d{1,2}$/)
        ) {
          monthSel.value = currentTimeframe;
        }
      }

      renderCalendarAndMonthly(trades, curSym);

      const filteredTrades = trades.filter(
        (t) => t.close_time >= startTime && t.close_time <= endTime,
      );
      currentFilteredTrades = filteredTrades;
      window.currentFilteredTrades = filteredTrades;
      currentAllTrades = trades;
      window.currentAllTrades = trades;

      processData(filteredTrades, curSym);
    } catch (err) {
      showError(err.message);
    } finally {
      if (connectBtn) {
        connectBtn.innerText = "Connect & Analyze";
      }
    }
  }

  function formatCurrency(num) {
    return num >= 0 ? "+$" + num.toFixed(2) : "-$" + Math.abs(num).toFixed(2);
  }

  // --- Profile Settings Auto-Save ---
  function loadProfileSettings() {
    if (profStyle && localStorage.getItem("tm_prof_style"))
      profStyle.value = localStorage.getItem("tm_prof_style");
    if (profRisk && localStorage.getItem("tm_prof_risk"))
      profRisk.value = localStorage.getItem("tm_prof_risk");

    const savedSessions = localStorage.getItem("tm_prof_session");
    if (savedSessions) {
      const sessions = savedSessions.split(",");
      profSessionCheckboxes.forEach((cb) => {
        cb.checked = sessions.includes(cb.value);
      });
    }
  }

  loadProfileSettings();

  const profileSelects = [profStyle, profRisk];
  profileSelects.forEach((select) => {
    if (select) {
      select.addEventListener("change", (e) => {
        localStorage.setItem(
          "tm_" + e.target.id.replace("-", "_"),
          e.target.value,
        );
      });
    }
  });

  profSessionCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const selected = Array.from(profSessionCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);
      localStorage.setItem("tm_prof_session", selected.join(","));
    });
  });

  function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove("hidden");
  }

  let symbolChartInstance = null;
  function renderSymbolChart(symbolProfits, curSym) {
    const ctx = document.getElementById("symbolChart").getContext("2d");
    if (symbolChartInstance) symbolChartInstance.destroy();

    // Sort symbols by absolute profit (descending) so biggest movers are at the top
    const sortedSymbols = Object.keys(symbolProfits).sort(
      (a, b) => Math.abs(symbolProfits[b]) - Math.abs(symbolProfits[a]),
    );

    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];

    sortedSymbols.slice(0, 8).forEach((sym) => {
      // Top 8 symbols
      labels.push(sym);
      const val = symbolProfits[sym];
      data.push(val);
      if (val >= 0) {
        backgroundColors.push("rgba(16, 185, 129, 0.5)"); // Green
        borderColors.push("#10b981");
      } else {
        backgroundColors.push("rgba(239, 68, 68, 0.5)"); // Red
        borderColors.push("#ef4444");
      }
    });

    symbolChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Net Profit",
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return ` ${curSym}${context.parsed.x.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
          },
          y: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 11 } },
          },
        },
      },
    });
  }

  window.formatHoldTime = function (sec) {
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  };
  function formatHoldTime(sec) {
    return window.formatHoldTime(sec);
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
      headers: {
        Authorization: localStorage.getItem("tm_master_token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account_id: key, ticket: String(ticket), note }),
    })
      .then((res) => {
        if (res.ok) {
          if (window.tradeNotesMap) window.tradeNotesMap[ticket] = note;
          inputEl.style.borderColor = "#10b981"; // Green = saved
          setTimeout(() => {
            inputEl.style.borderColor = origBorder;
          }, 1500);
          if (
            window.currentAllTrades &&
            typeof window.renderTagAnalyzer === "function"
          ) {
            window.renderTagAnalyzer(
              window.currentAllTrades,
              window.currentCurSym || "$",
            );
          }
        } else {
          console.error("Note save failed:", res.status);
          inputEl.style.borderColor = "#ef4444"; // Red = error
          setTimeout(() => {
            inputEl.style.borderColor = origBorder;
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Note save err", err);
        inputEl.style.borderColor = "#ef4444";
        setTimeout(() => {
          inputEl.style.borderColor = origBorder;
        }, 2000);
      });
  }

  window.currentTradesPage = 1;
  window.tradesPerPage =
    parseInt(localStorage.getItem("tm_trades_limit")) || 10;
  window._lastTradesArray = null;

  window.renderTradesTable = function (trades, curSym) {
    const tbody = document.querySelector("#trades-table tbody");
    const paginationContainer = document.getElementById("trades-pagination");
    if (!tbody) return;

    if (window._lastTradesArray !== trades) {
      window.currentTradesPage = 1;
      window._lastTradesArray = trades;
    }

    tbody.innerHTML = "";

    const totalTrades = trades.length;
    const totalPages = Math.ceil(totalTrades / window.tradesPerPage) || 1;

    if (window.currentTradesPage > totalPages)
      window.currentTradesPage = totalPages;
    if (window.currentTradesPage < 1) window.currentTradesPage = 1;

    const startIndex = (window.currentTradesPage - 1) * window.tradesPerPage;
    const endIndex = startIndex + window.tradesPerPage;
    const pageTrades = trades.slice(startIndex, endIndex);

    if (paginationContainer) {
      paginationContainer.innerHTML = "";
      if (totalPages > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.className = "secondary-btn";
        prevBtn.style.padding = "2px 8px";
        prevBtn.style.fontSize = "0.85rem";
        prevBtn.innerHTML = "<i class='ph ph-caret-left'></i>";
        prevBtn.disabled = window.currentTradesPage === 1;
        if (window.currentTradesPage === 1) prevBtn.style.opacity = "0.5";
        prevBtn.onclick = () => {
          window.currentTradesPage--;
          window.renderTradesTable(trades, curSym);
        };

        const nextBtn = document.createElement("button");
        nextBtn.className = "secondary-btn";
        nextBtn.style.padding = "2px 8px";
        nextBtn.style.fontSize = "0.85rem";
        nextBtn.innerHTML = "<i class='ph ph-caret-right'></i>";
        nextBtn.disabled = window.currentTradesPage === totalPages;
        if (window.currentTradesPage === totalPages)
          nextBtn.style.opacity = "0.5";
        nextBtn.onclick = () => {
          window.currentTradesPage++;
          window.renderTradesTable(trades, curSym);
        };

        const pageInfo = document.createElement("span");
        pageInfo.style.fontSize = "0.8rem";
        pageInfo.style.color = "var(--text-muted)";
        pageInfo.innerText = `Seite ${window.currentTradesPage} / ${totalPages}`;

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
      }
    }

    pageTrades.forEach((t) => {
      const tr = document.createElement("tr");
      const sideStr = t.side || "";
      const sideColor = sideStr.startsWith("Buy")
        ? "var(--success)"
        : "var(--danger)";
      const profitNum = parseFloat(t.gross_profit !== undefined ? t.gross_profit : t.net_profit || 0);
      const profitColor = profitNum >= 0 ? "var(--success)" : "var(--danger)";
      const commissionNum = parseFloat(t.commission || 0);
      const commissionStr = Math.abs(commissionNum) > 0.001 ? (commissionNum < 0 ? "-" : "") + curSym + Math.abs(commissionNum).toFixed(2) : "-";
      const holdSec = (t.close_time || 0) - (t.open_time || 0);
      const durationStr = formatHoldTime(holdSec);

      const openDate = new Date((t.open_time || 0) * 1000);
      const dateStr = openDate.toLocaleString([], {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      const strategyId = window.tradeStrategyMap
        ? window.tradeStrategyMap[t.ticket] || ""
        : "";
      const stratDefs = window.strategyDefs || [];
      const assignedStrat = stratDefs.find((s) => s.id === strategyId);
      const stratColor = assignedStrat
        ? getStrategyColor(assignedStrat.id)
        : null;
      const stratRgb = stratColor ? hexToRgb(stratColor) : null;
      const stratBadgeHtml = assignedStrat
        ? `<span class="strategy-badge" style="--s-color:${stratColor};--s-rgb:${stratRgb};" data-ticket="${t.ticket}" onclick="openStrategyPicker(this, '${t.ticket}')">${assignedStrat.name}</span>`
        : `<button class="strategy-select-dropdown" style="opacity:0.5;" onclick="openStrategyPicker(this, '${t.ticket}')">+ Assign</button>`;
      const currentNote = window.tradeNotesMap
        ? window.tradeNotesMap[t.ticket] || ""
        : "";

      const imgData = window.tradeImagesMap
        ? window.tradeImagesMap[t.ticket] || {}
        : {};
      const beforeUrl = imgData.before || "";
      const afterUrl = imgData.after || "";

      const renderImageInput = (type, url) => {
        if (url) {
          return `<div style="display: flex; gap: 4px; align-items: center; margin-bottom: 2px;">
                                <button class="secondary-btn image-preview-btn" data-url="${url}" style="padding: 2px 6px; font-size: 0.8rem; flex: 1;"><i class="ph ph-image"></i> ${type}</button>
                                <button class="secondary-btn image-delete-btn" data-ticket="${t.ticket}" data-type="${type.toLowerCase()}" style="padding: 2px 6px; color: var(--danger);"><i class="ph ph-trash"></i></button>
                            </div>`;
        } else {
          return `<input type="text" class="trade-img-input profile-select" data-ticket="${t.ticket}" data-type="${type.toLowerCase()}" placeholder="${type} URL" style="width: 100%; max-width: 120px; padding: 2px 4px; font-size: 0.75rem; margin-bottom: 2px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--border-dark);">`;
        }
      };

      const chartHtml = `
                <div style="display: flex; flex-direction: column;">
                    ${renderImageInput("Before", beforeUrl)}
                    ${renderImageInput("After", afterUrl)}
                </div>
            `;

      const slWidenedCount = parseInt(t.sl_widened || 0);
      const currentLang = localStorage.getItem("tm_global_lang") || "de";
      const tooltipTpl =
        (i18n[currentLang] || i18n["de"]).sl_widened_tooltip ||
        "Stop Loss {x}x in Verlustrichtung verschoben";
      const slTitle = tooltipTpl.replace("{x}", slWidenedCount);

      const slBadgeHtml =
        slWidenedCount > 0
          ? `<span class="sl-widened-badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" title="${slTitle}"><i class="ph ph-warning-circle"></i> SL +${slWidenedCount}x</span>`
          : `<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>`;

      tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted); font-size: 0.85rem;">${dateStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${t.symbol || "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: ${sideColor}">${sideStr}</td>
                <td style="padding: 8px 6px; border-bottom: 1px solid var(--border-dark); text-align: center; width: 100px; white-space: nowrap;">${slBadgeHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: ${profitColor}">${profitNum < 0 ? "-" : ""}${curSym}${Math.abs(profitNum).toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted);">${commissionStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted); font-size: 0.85rem;">${durationStr}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${stratBadgeHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${chartHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <input type="text" class="trade-note-input profile-select" data-ticket="${t.ticket}" value="${currentNote}" placeholder="${(i18n[localStorage.getItem("tm_global_lang") || "de"] || {}).note_ph || "Add note or #tag..."}" style="width: 100%; max-width: 250px; padding: 4px; background: var(--input-bg); color: var(--input-text); border: 1px solid var(--border-dark);">
                    </div>
                </td>
            `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".trade-note-input").forEach((inp) => {
      inp.addEventListener("blur", (e) => saveTradeNote(e.target));
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur(); // triggers blur → saveTradeNote
        }
      });
    });

    document.querySelectorAll(".trade-img-input").forEach((inp) => {
      inp.addEventListener("blur", (e) => saveTradeImage(e.target));
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
        }
      });
    });

    document.querySelectorAll(".image-preview-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const url = e.currentTarget.getAttribute("data-url");
        openImagePreview(url);
      });
    });

    document.querySelectorAll(".image-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const ticket = e.currentTarget.getAttribute("data-ticket");
        const type = e.currentTarget.getAttribute("data-type");
        deleteTradeImage(ticket, type);
      });
    });
  };

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

    let longWins = 0,
      longLosses = 0;
    let shortWins = 0,
      shortLosses = 0;
    const symbolProfits = {};

    ascendingTrades.forEach((trade, index) => {
      const netP = parseFloat(trade.net_profit);
      const grossP =
        trade.gross_profit !== undefined ? trade.gross_profit : netP;
      const holdSec = trade.close_time - trade.open_time;

      // Revenge trade check
      if (index > 0) {
        const prevTrade = ascendingTrades[index - 1];
        const prevGross =
          prevTrade.gross_profit !== undefined
            ? prevTrade.gross_profit
            : parseFloat(prevTrade.net_profit);
        if (prevGross < 0 && trade.open_time - prevTrade.close_time < 900) {
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
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0;

    const longWinrate =
      longWins + longLosses > 0
        ? (longWins / (longWins + longLosses)) * 100
        : 0;
    const shortWinrate =
      shortWins + shortLosses > 0
        ? (shortWins / (shortWins + shortLosses)) * 100
        : 0;

    let edgeText = "-";
    if (longWinrate > shortWinrate + 5)
      edgeText = `Long (+${(longWinrate - shortWinrate).toFixed(0)}%)`;
    else if (shortWinrate > longWinrate + 5)
      edgeText = `Short (+${(shortWinrate - longWinrate).toFixed(0)}%)`;
    else if (totalWinLoss > 0) edgeText = `Balanced`;

    const avgHoldWin = wins > 0 ? totalHoldWins / wins : 0;
    const avgHoldLoss = losses > 0 ? totalHoldLosses / losses : 0;

    // Calculate Gain % taking into account deposits/withdrawals
    let gainPct = 0;
    const allTrades = window.currentAllTrades || trades;
    if (trades.length > 0 && allTrades.length > 0) {
      // Sort both arrays chronologically ascending
      const sortedAll = [...allTrades].sort((a, b) => a.close_time - b.close_time);
      const sortedFiltered = [...trades].sort((a, b) => a.close_time - b.close_time);

      const firstFiltered = sortedFiltered[0];
      let startingBalance = firstFiltered.balance_before;

      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let prevBalanceAfter = startingBalance;
      let totalNetProfit = 0;

      sortedFiltered.forEach(t => {
        const diff = t.balance_before - prevBalanceAfter;
        if (diff > 0.01) {
          totalDeposits += diff;
        } else if (diff < -0.01) {
          totalWithdrawals += Math.abs(diff);
        }
        totalNetProfit += parseFloat(t.net_profit || 0);
        prevBalanceAfter = t.balance_after;
      });

      const denominator = startingBalance + totalDeposits;
      if (denominator > 0) {
        gainPct = (totalNetProfit / denominator) * 100;
        updateKPI(
          "kpi-gain",
          `${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(2)}%`,
          gainPct >= 0,
        );
      } else {
        // Fallback if balance data is missing from old exporter
        const gainEl = document.getElementById("kpi-gain");
        if (gainEl) {
          gainEl.innerText = "-%";
          gainEl.className = "kpi-value";
          gainEl.style.color = "var(--text-muted)";
        }
      }
    }

    // Update UI
    updateKPI(
      "kpi-profit",
      `${curSym}${totalProfit.toFixed(2)}`,
      totalProfit >= 0,
    );
    updateKPI("kpi-winrate", `${winrate.toFixed(1)}%`, winrate >= 50);
    document.getElementById("kpi-trades").innerText = trades.length;
    updateKPI("kpi-pf", profitFactor.toFixed(2), profitFactor >= 1.5);

    // Advanced UI
    updateKPI("kpi-edge", edgeText, true);
    updateKPI("kpi-hold-win", formatHoldTime(avgHoldWin), true);
    updateKPI("kpi-hold-loss", formatHoldTime(avgHoldLoss), false);
    updateKPI("kpi-drawdown", `-${curSym}${maxDrawdown.toFixed(2)}`, false);

    // SL Shift / SL Widening KPI
    let totalSlShifts = 0;
    let tradesWithSlShift = 0;
    trades.forEach((t) => {
      const cnt = parseInt(t.sl_widened || 0);
      if (cnt > 0) {
        totalSlShifts += cnt;
        tradesWithSlShift++;
      }
    });
    const kpiSlShiftEl = document.getElementById("kpi-sl-shift");
    if (kpiSlShiftEl) {
      if (totalSlShifts > 0) {
        kpiSlShiftEl.innerText = `${totalSlShifts}x (${tradesWithSlShift})`;
        kpiSlShiftEl.style.color = "var(--danger)";
      } else {
        kpiSlShiftEl.innerText = "0";
        kpiSlShiftEl.style.color = "var(--text-main)";
      }
    }

    // Revenge Trades & Discipline
    const discScore =
      trades.length > 0
        ? Math.max(0, 100 - (revengeTrades / trades.length) * 100)
        : 100;
    document.getElementById("kpi-revenge").innerText = revengeTrades;
    const lang = globalLang ? globalLang.value : "en";
    const discLbl =
      i18n[lang] && i18n[lang].discipline_lbl
        ? i18n[lang].discipline_lbl
        : "Disziplin";
    document.getElementById("kpi-discipline").innerText =
      `${discLbl}: ${discScore.toFixed(0)}%`;
    document.getElementById("kpi-discipline").style.color =
      discScore > 80 ? "#10b981" : discScore > 50 ? "#f59e0b" : "#ef4444";

    // Best / Worst Trading Day KPI
    const dayTotals = heatmapData.map((hours) =>
      hours.reduce((a, b) => a + b, 0),
    );
    let bestDayIdx = 1,
      worstDayIdx = 1;
    for (let i = 1; i < 7; i++) {
      if (dayTotals[i] > dayTotals[bestDayIdx]) bestDayIdx = i;
      if (dayTotals[i] < dayTotals[worstDayIdx]) worstDayIdx = i;
    }
    if (dayTotals[0] > dayTotals[bestDayIdx]) bestDayIdx = 0;
    if (dayTotals[0] < dayTotals[worstDayIdx]) worstDayIdx = 0;

    const curLang = localStorage.getItem("tm_global_lang") || "de";
    const dayNames =
      i18n[curLang] && i18n[curLang].days
        ? i18n[curLang].days
        : [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];

    const bestDayText =
      dayTotals[bestDayIdx] === 0
        ? "-"
        : `${dayNames[bestDayIdx]} (${curSym}${dayTotals[bestDayIdx].toFixed(2)})`;
    const worstDayText =
      dayTotals[worstDayIdx] === 0
        ? "-"
        : `${dayNames[worstDayIdx]} (${curSym}${dayTotals[worstDayIdx].toFixed(2)})`;

    document.getElementById("kpi-best-day").innerText = bestDayText;
    document.getElementById("kpi-worst-day").innerText = worstDayText;

    // Update Focus Mode KPIs
    updateKPI("focus-kpi-hold-win", formatHoldTime(avgHoldWin), true);
    updateKPI("focus-kpi-hold-loss", formatHoldTime(avgHoldLoss), false);
    updateKPI("focus-kpi-avg-win", `${curSym}${avgWin.toFixed(2)}`, true);
    updateKPI("focus-kpi-avg-loss", `-${curSym}${avgLoss.toFixed(2)}`, false);
    document.getElementById("focus-kpi-best-day").innerText = bestDayText;
    document.getElementById("focus-kpi-worst-day").innerText = worstDayText;

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
      strategyPerformance: {},
    };

    // Reset trades table title
    const tradesTable = document.querySelector("#trades-table");
    if (tradesTable) {
      const glassPanel = tradesTable.closest(".glass-panel");
      if (glassPanel) {
        const titleSpan = glassPanel.querySelector("h3 span");
        if (titleSpan) {
          titleSpan.innerHTML =
            i18n[curLang] && i18n[curLang].trades_title
              ? i18n[curLang].trades_title
              : "Recent Trades &amp; Tags";
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
    if (typeof window.updatePropChallengeTracker === "function") {
      window.updatePropChallengeTracker(trades);
    }
    if (typeof window.renderTagAnalyzer === "function") {
      window.renderTagAnalyzer(window.currentAllTrades || trades, curSym);
    }
  }

  function renderCalendarAndMonthly(trades, curSym) {
    const dailyProfit = {};
    const monthlyProfit = {};

    trades.forEach((t) => {
      const date = new Date(t.close_time * 1000);
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth(); // 0-11
      const d = date.getUTCDate();

      const dayKey = `${y}-${m}-${d}`;
      const monthKey = `${y}-${m}`;

      if (!dailyProfit[dayKey]) dailyProfit[dayKey] = 0;
      dailyProfit[dayKey] += parseFloat(t.net_profit);

      if (!monthlyProfit[monthKey]) monthlyProfit[monthKey] = 0;
      monthlyProfit[monthKey] += parseFloat(t.net_profit);
    });

    // --- Monthly Overview ---
    const monthlyContainer = document.getElementById(
      "monthly-overview-container",
    );
    if (monthlyContainer) {
      const cacheKey = trades.length + "_" + curSym;

      if (monthlyContainer.dataset.cacheKey !== cacheKey) {
        monthlyContainer.innerHTML =
          '<div id="monthly-overview-content" style="transform-origin: top center; width: 100%;"></div>';
        const innerContainer = document.getElementById(
          "monthly-overview-content",
        );
        const years = [
          ...new Set(
            Object.keys(monthlyProfit).map((k) => parseInt(k.split("-")[0])),
          ),
        ].sort((a, b) => b - a);

        const monthNames = [
          "Jan",
          "Feb",
          "Mär",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Dez",
        ];

        const now = new Date();
        const currY = now.getFullYear();
        const currM = now.getMonth();

        years.forEach((year) => {
          const yearDiv = document.createElement("div");
          yearDiv.className = "monthly-year-group";
          yearDiv.innerHTML = `<div class="monthly-year-title">${year}</div><div class="monthly-grid"></div>`;
          const grid = yearDiv.querySelector(".monthly-grid");

          for (let m = 0; m < 12; m++) {
            const mKey = `${year}-${m}`;
            if (monthlyProfit[mKey] !== undefined) {
              const val = monthlyProfit[mKey];
              const isCurrent = year === currY && m === currM;
              const cls = val > 0 ? "positive" : val < 0 ? "negative" : "";
              const displayVal =
                val >= 0
                  ? `+${curSym}${val.toFixed(0)}`
                  : `-${curSym}${Math.abs(val).toFixed(0)}`;
              grid.innerHTML += `
                                <div class="month-card clickable-month ${cls} ${isCurrent ? "current" : ""}" data-month="${mKey}">
                                    <span class="m-name">${monthNames[m]} ${year}</span>
                                    <span class="m-val">${displayVal}</span>
                                </div>
                            `;
            }
          }
          if (grid.innerHTML !== "") {
            innerContainer.appendChild(yearDiv);
          }
        });

        // Add click listeners to month cards
        innerContainer.querySelectorAll(".clickable-month").forEach((card) => {
          card.addEventListener("click", () => {
            const mKey = card.getAttribute("data-month");
            currentTimeframe = mKey;

            document
              .querySelectorAll(".filter-btn")
              .forEach((b) => b.classList.remove("active"));

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
      const innerContainer = document.getElementById(
        "monthly-overview-content",
      );
      if (innerContainer) {
        innerContainer.querySelectorAll(".clickable-month").forEach((card) => {
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
    if (calContainer && monthTitle) {
      calContainer.innerHTML = "";
      let y, m;
      const nowD = new Date();

      if (currentTimeframe && currentTimeframe.match(/^\d{4}-\d{1,2}$/)) {
        [y, m] = currentTimeframe.split("-").map(Number);
      } else {
        y = nowD.getFullYear();
        m = nowD.getMonth();
      }

      const fullMonthNames = [
        "JANUAR",
        "FEBRUAR",
        "MÄRZ",
        "APRIL",
        "MAI",
        "JUNI",
        "JULI",
        "AUGUST",
        "SEPTEMBER",
        "OKTOBER",
        "NOVEMBER",
        "DEZEMBER",
      ];
      monthTitle.innerText = `${fullMonthNames[m]} ${y}`;

      let gridHtml = `<div class="cal-grid">`;
      const daysHeader = ["M", "D", "M", "D", "F", "S", "S"];
      daysHeader.forEach((dh) => {
        gridHtml += `<div class="cal-header">${dh}</div>`;
      });

      const firstDay = new Date(y, m, 1).getDay(); // 0 (Sun) - 6 (Sat)
      let startOffset = firstDay === 0 ? 6 : firstDay - 1; // Make Monday 0
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      for (let i = 0; i < startOffset; i++) {
        gridHtml += `<div class="cal-day empty"></div>`;
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dayKey = `${y}-${m}-${d}`;
        const filterKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const val = dailyProfit[dayKey];
        let content = `<span class="cal-date">${d}</span>`;
        let cls = "clickable-cal-day";
        if (val !== undefined) {
          cls += val > 0 ? " positive" : val < 0 ? " negative" : "";
          const displayVal =
            val >= 0
              ? `+${curSym}${val.toFixed(0)}`
              : `-${curSym}${Math.abs(val).toFixed(0)}`;
          content += `<span class="cal-val">${displayVal}</span>`;
        }
        gridHtml += `<div class="cal-day ${cls}" data-datekey="${filterKey}" style="cursor: pointer;">${content}</div>`;
      }

      gridHtml += `</div>`;
      calContainer.innerHTML = gridHtml;

      // Add click listeners to calendar days
      calContainer.querySelectorAll(".clickable-cal-day").forEach((dayEl) => {
        dayEl.addEventListener("click", () => {
          // Remove active styling from all days
          calContainer
            .querySelectorAll(".clickable-cal-day")
            .forEach((el) => (el.style.border = ""));
          dayEl.style.border = "2px solid var(--primary-color)";

          const dKey = dayEl.getAttribute("data-datekey");
          const dayTrades = trades.filter((t) => {
            const tDate = new Date(t.close_time * 1000);
            const ty = tDate.getUTCFullYear();
            const tm = tDate.getUTCMonth() + 1;
            const td = tDate.getUTCDate();
            const tKey = `${ty}-${String(tm).padStart(2, "0")}-${String(td).padStart(2, "0")}`;
            return tKey === dKey;
          });

          if (typeof window.renderTradesTable === "function") {
            window.renderTradesTable(dayTrades, curSym);
            const tradesTable = document.querySelector("#trades-table");
            if (tradesTable) {
              const glassPanel = tradesTable.closest(".glass-panel");
              if (glassPanel) {
                const titleSpan = glassPanel.querySelector("h3 span");
                if (titleSpan) {
                  const [yy, mm, dd] = dKey.split("-");
                  const dateStr = `${dd}.${mm}.${yy}`;
                  titleSpan.innerHTML = `Recent Trades &amp; Tags <span style="color:var(--text-muted);font-size:0.85rem;margin-left:10px;">(Filtered: ${dateStr})</span>`;
                }
                glassPanel.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
          }

          // Update AI Scope Dropdown
          const scopeDayOpt = document.getElementById("ai-scope-day");
          const aiScopeSel = document.getElementById("ai-scope");
          if (scopeDayOpt && aiScopeSel) {
            const [yy, mm, dd] = dKey.split("-");
            const dateStr = `${dd}.${mm}.${yy}`;
            scopeDayOpt.textContent = `Day (${dateStr})`;
            scopeDayOpt.setAttribute("data-datekey", dKey);
            aiScopeSel.value = "day";
          }
        });
      });
    }
  }

  function renderDailyStatsTable(trades, curSym) {
    const tbody = document.querySelector("#daily-stats-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const daysMap = {};

    trades.forEach((t) => {
      const dateObj = new Date(t.close_time * 1000);
      const y = dateObj.getFullYear();
      const m = dateObj.getMonth() + 1;
      const d = dateObj.getDate();

      const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      if (!daysMap[dateKey]) {
        daysMap[dateKey] = {
          dateKey: dateKey,
          dateStr: `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`,
          timestamp: new Date(y, m - 1, d).getTime(),
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
          startingBalance: t.balance_before,
        };
      } else {
        daysMap[dateKey].startingBalance = t.balance_before;
      }

      const day = daysMap[dateKey];
      const netP = parseFloat(t.net_profit);
      const grossP =
        t.gross_profit !== undefined ? parseFloat(t.gross_profit) : netP;

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

    const sortedDays = Object.values(daysMap).sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    if (sortedDays.length === 0) {
      tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 20px; color: var(--text-muted);" data-i18n="no_trades_found">No trades found for this period.</td></tr>`;
      return;
    }

    sortedDays.forEach((day) => {
      const tr = document.createElement("tr");

      const pf =
        day.grossLoss === 0
          ? day.grossProfit > 0
            ? day.grossProfit
            : 0
          : day.grossProfit / day.grossLoss;
      const winRate =
        day.tradesCount > 0 ? (day.wins / day.tradesCount) * 100 : 0;
      const avgWin = day.wins > 0 ? day.grossProfit / day.wins : 0;
      const avgLoss = day.losses > 0 ? day.grossLoss / day.losses : 0;

      let percentGainDisplay = "-";
      let percentGainColor = "";
      if (day.startingBalance > 0) {
        const pGain = (day.netProfit / day.startingBalance) * 100;
        percentGainDisplay = `${pGain > 0 ? "+" : ""}${pGain.toFixed(2)}%`;
        percentGainColor =
          pGain > 0 ? "text-success" : pGain < 0 ? "text-danger" : "";
      }

      const pClass =
        day.netProfit > 0
          ? "text-success"
          : day.netProfit < 0
            ? "text-danger"
            : "";

      const hasJournal = window.journalData && window.journalData[day.dateKey] && window.journalData[day.dateKey].trim() !== "";
      const dateDisplayHtml = hasJournal 
        ? `<span class="journal-badge" title="Journal vorhanden"><i class="ph ph-notebook"></i></span> ${day.dateStr}`
        : day.dateStr;
      const journalBtnStyle = hasJournal
        ? "padding: 4px 8px; font-size: 0.8rem; border-color: #10b981; color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.3);"
        : "padding: 4px 8px; font-size: 0.8rem;";

      tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted);">${dateDisplayHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); font-weight: bold;" class="${pClass}">${day.netProfit > 0 ? "+" : ""}${curSym}${day.netProfit.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); font-weight: bold;" class="${percentGainColor}">${percentGainDisplay}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${pf.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${day.tradesCount}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${winRate.toFixed(0)}%</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--success);">${curSym}${avgWin.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--danger);">${avgLoss === 0 ? "" : "-"}${curSym}${avgLoss.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--success);">${curSym}${day.maxWin.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--danger);">${day.maxLoss < 0 ? "-" : ""}${curSym}${Math.abs(day.maxLoss).toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); color: var(--text-muted);">${Math.abs(day.commission) > 0.001 ? (day.commission < 0 ? "-" : "") + curSym + Math.abs(day.commission).toFixed(2) : "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark);">${day.longs} / ${day.shorts}</td>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-dark); text-align: center;">
                    <button class="secondary-btn open-journal-btn" data-datekey="${day.dateKey}" data-datestr="${day.dateStr}" style="${journalBtnStyle}" title="Mental Journal"><i class="ph ph-book-open"></i></button>
                </td>
            `;

      tr.style.cursor = "pointer";
      tr.addEventListener("click", (e) => {
        if (e.target.closest(".open-journal-btn")) return;

        // Remove active styling from all rows
        tbody
          .querySelectorAll("tr")
          .forEach((r) => (r.style.backgroundColor = ""));
        tr.style.backgroundColor = "rgba(255,255,255,0.05)";

        const dayTrades = trades.filter((t) => {
          const tDate = new Date(t.close_time * 1000);
          const y = tDate.getFullYear();
          const m = tDate.getMonth() + 1;
          const d = tDate.getDate();
          const tKey = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
              glassPanel.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
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

    document.querySelectorAll(".open-journal-btn").forEach((btn) => {
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
    const fullDays =
      i18n[hmLang] && i18n[hmLang].days
        ? i18n[hmLang].days
        : [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
    const days = fullDays.map((d) => d.substring(0, 3));

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
    const ctx = document.getElementById("equityChart").getContext("2d");

    if (equityChartInstance) {
      equityChartInstance.destroy();
    }

    equityChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Net Equity",
            data: data,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
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
                modifierKey: "ctrl",
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
            pan: {
              enabled: true,
              modifierKey: "ctrl",
              mode: "x",
            },
          },
        },
        scales: {
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
          },
          x: {
            grid: { display: false },
            ticks: { display: false },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
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
        const selectedSessions = Array.from(profSessionCheckboxes)
          .filter((c) => c.checked)
          .map((c) => c.value);
        const now = new Date();
        const todayStartTime = Math.floor(
          new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() /
            1000,
        );

        let tradesToAnalyze = window.currentAllTrades || [];
        const aiScopeVal = document.getElementById("ai-scope")?.value;

        if (aiScopeVal === "month") {
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          tradesToAnalyze = (window.currentAllTrades || []).filter((t) => {
            const d = new Date(t.close_time * 1000);
            return (
              d.getMonth() === currentMonth && d.getFullYear() === currentYear
            );
          });
        } else if (aiScopeVal === "week") {
          const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - diffToMonday,
          );
          const weekStartSec = Math.floor(monday.getTime() / 1000);
          tradesToAnalyze = (window.currentAllTrades || []).filter(
            (t) => t.close_time >= weekStartSec,
          );
        } else if (aiScopeVal === "day") {
          const scopeDayOpt = document.getElementById("ai-scope-day");
          if (scopeDayOpt && scopeDayOpt.hasAttribute("data-datekey")) {
            const dKey = scopeDayOpt.getAttribute("data-datekey");
            tradesToAnalyze = (window.currentAllTrades || []).filter((t) => {
              const d = new Date(t.close_time * 1000);
              return (
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` ===
                dKey
              );
            });
          } else {
            // fallback to today
            tradesToAnalyze = (window.currentAllTrades || []).filter(
              (t) => t.close_time >= todayStartTime,
            );
          }
        }

        // Calculate basic stats for the exact trades to be analyzed
        let aiWins = 0, aiLosses = 0;
        let aiGrossWin = 0, aiGrossLoss = 0;
        let aiTotalHoldWins = 0, aiTotalHoldLosses = 0;
        let aiGrossP = 0;
        
        tradesToAnalyze.forEach(t => {
          const netP = parseFloat(t.net_profit);
          const grossP = t.gross_profit !== undefined ? parseFloat(t.gross_profit) : netP;
          const holdSec = t.close_time - t.open_time;
          if (grossP > 0) {
            aiWins++;
            aiGrossWin += grossP;
            aiTotalHoldWins += holdSec;
          } else if (grossP <= 0) {
            aiLosses++;
            aiGrossLoss += Math.abs(grossP);
            aiTotalHoldLosses += Math.max(0, holdSec);
          }
        });
        
        const aiTotalWinLoss = aiWins + aiLosses;
        const aiWinrate = aiTotalWinLoss > 0 ? (aiWins / aiTotalWinLoss) * 100 : 0;
        const aiProfitFactor = aiGrossLoss === 0 ? aiGrossWin : aiGrossWin / aiGrossLoss;
        const aiAvgHoldWin = aiWins > 0 ? aiTotalHoldWins / aiWins : 0;
        const aiAvgHoldLoss = aiLosses > 0 ? aiTotalHoldLosses / aiLosses : 0;

        const scopedStats = {
          totalTrades: tradesToAnalyze.length,
          winrate: parseFloat(aiWinrate.toFixed(1)),
          profitFactor: parseFloat(aiProfitFactor.toFixed(2)),
          avgHoldWin: window.formatHoldTime ? window.formatHoldTime(aiAvgHoldWin) : aiAvgHoldWin,
          avgHoldLoss: window.formatHoldTime ? window.formatHoldTime(aiAvgHoldLoss) : aiAvgHoldLoss,
        };

        const profileData = {
          style: profStyle ? profStyle.value : "Unknown",
          session:
            selectedSessions.length > 0 ? selectedSessions.join(", ") : "Any",
          risk: profRisk ? profRisk.value : "Unknown",
          language: globalLang ? globalLang.value : "de",
          timeframe: aiScopeVal || currentTimeframe,
          stats: scopedStats,
          trades: tradesToAnalyze.map((t) => {
            const isToday = t.close_time >= todayStartTime;
            const note =
              isToday && window.tradeNotesMap && window.tradeNotesMap[t.ticket]
                ? window.tradeNotesMap[t.ticket]
                : null;
            const tradeObj = {
              symbol: t.symbol,
              side: t.side,
              net_profit: t.net_profit,
              gross_profit: t.gross_profit,
              open_time: t.open_time,
              close_time: t.close_time,
            };
            if (note) tradeObj.tag = note; // Add as tag/note to prompt AI to look at it
            return tradeObj;
          }),
        };

        const response = await fetch(`${API_URL}?action=ai_coach`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("tm_master_token"),
          },
          body: JSON.stringify({ ...profileData, account_id: key }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get AI analysis.");
        }

        // Format markdown simple
        let htmlContent = data.analysis
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br>");

        aiContent.innerHTML = `
                    <div style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main); margin-bottom: 15px;">${htmlContent}</div>
                    <button id="save-archive-btn" class="secondary-btn" style="width: 100%; padding: 6px; font-size: 0.85rem;" data-i18n="archive_analysis_btn"><i class="ph ph-floppy-disk"></i> Archive Analysis</button>
                `;
        if (globalLang) setLanguage(globalLang.value);

        const saveArchiveBtn = document.getElementById("save-archive-btn");
        if (saveArchiveBtn) {
          saveArchiveBtn.addEventListener("click", async () => {
            saveArchiveBtn.disabled = true;
            saveArchiveBtn.innerHTML =
              '<div class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:var(--text-main);border-right-color:transparent;border-radius:50%;animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-right:5px;"></div> Saving...';
            try {
              const now = new Date();
              const dateStr =
                currentTimeframe === "current_month" ||
                currentTimeframe === "all"
                  ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
                  : currentTimeframe;
              const res = await fetch(`${API_URL}?action=coach_archive`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: localStorage.getItem("tm_master_token"),
                },
                body: JSON.stringify({
                  account_id: key,
                  date: dateStr,
                  analysis_text: htmlContent,
                }),
              });
              if (res.ok) {
                saveArchiveBtn.innerHTML =
                  '<i class="ph ph-check"></i> Archived successfully';
                saveArchiveBtn.style.color = "var(--success)";
                saveArchiveBtn.style.borderColor = "var(--success)";
              } else {
                throw new Error("Failed to save archive");
              }
            } catch (err) {
              saveArchiveBtn.innerHTML =
                '<i class="ph ph-warning"></i> Save failed';
              saveArchiveBtn.style.color = "var(--danger)";
              saveArchiveBtn.disabled = false;
            }
          });
        }

        if (data.limitLeft !== undefined) {
          document.getElementById("ai-limit").innerText =
            `${data.limitLeft} analyzes left today`;
        }
      } catch (err) {
        aiContent.innerHTML = `<p class="error-msg">${err.message}</p>`;
      } finally {
        if (globalLang) {
          aiBtn.innerText = i18n[globalLang.value]
            ? i18n[globalLang.value].ai_btn
            : "Ask Coach for Analysis";
        }
        aiBtn.disabled = false;
      }
    });
  }

  // --- Kill-Switch Settings ---
  async function loadSettings(key) {
    try {
      const response = await fetch(
        `${API_URL}?action=settings&account_id=${encodeURIComponent(key)}`,
        {
          method: "GET",
          headers: { Authorization: localStorage.getItem("tm_master_token") },
        },
      );
      if (response.ok) {
        const settings = await response.json();
        const ksToggle = document.getElementById("kill-switch-toggle");
        const ksLimit = document.getElementById("kill-switch-limit");
        if (ksToggle) ksToggle.checked = settings.kill_switch_active === 1;
        if (ksLimit) ksLimit.value = settings.max_daily_loss;
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }

  async function saveSettings(key) {
    try {
      await fetch(`${API_URL}?action=settings`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("tm_master_token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: key,
          kill_switch_active:
            document.getElementById("kill-switch-toggle").checked,
          max_daily_loss:
            parseFloat(document.getElementById("kill-switch-limit").value) || 0,
        }),
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
      setTimeout(() => (ksSaveBtn.innerText = "Save"), 2000);
    });
  }

  // Attach loadSettings to window so it can be called from loadDashboard
  window.loadSettings = loadSettings;

  // --- Journal Modal Logic ---
  window.openJournalModal = async function (dateKey, dateStr) {
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
      const res = await fetch(
        `${API_URL}?action=journal&account_id=${encodeURIComponent(key)}&date=${dateKey}`,
        {
          headers: { Authorization: localStorage.getItem("tm_master_token") },
        },
      );
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
          headers: {
            Authorization: localStorage.getItem("tm_master_token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_id: key,
            date: dateKey,
            content: textObj.value,
          }),
        });
        status.innerText = "Saved successfully!";
        setTimeout(() => {
          modal.classList.add("hidden");
        }, 1000);
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
  window.runCompoundCalc = function () {
    const start = parseFloat(document.getElementById("calc-start")?.value) || 0;
    const rate = parseFloat(document.getElementById("calc-rate")?.value) || 0;
    const days = parseInt(document.getElementById("calc-days")?.value) || 0;

    let endCapital = start;
    for (let i = 0; i < days; i++) {
      endCapital += endCapital * (rate / 100);
    }

    const netProfit = endCapital - start;
    const curSym = (localStorage.getItem("tm_license_key") || "")
      .toLowerCase()
      .includes("usd")
      ? "$"
      : "€";

    const resEl = document.getElementById("calc-result-val");
    if (resEl) resEl.innerText = `${curSym}${endCapital.toFixed(2)}`;
    const profEl = document.getElementById("calc-profit-val");
    if (profEl) profEl.innerText = `+${curSym}${netProfit.toFixed(2)}`;
  };

  // Attach Event Listeners
  document
    .getElementById("calc-start")
    ?.addEventListener("input", window.runCompoundCalc);
  document
    .getElementById("calc-rate")
    ?.addEventListener("input", window.runCompoundCalc);
  document
    .getElementById("calc-days")
    ?.addEventListener("input", window.runCompoundCalc);

  document
    .getElementById("watchdog-daily-cost")
    ?.addEventListener("input", () => {
      if (typeof calculateKPIs === "function" && currentFilteredTrades) {
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
  "#39ff14",
  "#00d4ff",
  "#ff6b35",
  "#ff2d78",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#84cc16",
  "#f97316",
  "#14b8a6",
  "#e879f9",
  "#fb923c",
];

function getStrategyColor(id) {
  if (!id) return "#888";
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return STRATEGY_COLORS[Math.abs(hash) % STRATEGY_COLORS.length];
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Render Strategy Definition Cards ─────────────
function renderStrategyCards() {
  const container = document.getElementById("strategy-cards-container");
  if (!container) return;
  const defs = window.strategyDefs || [];
  container.innerHTML = "";

  defs.forEach((s) => {
    const color = getStrategyColor(s.id);
    const rgb = hexToRgb(color);
    // Gather performance stats for inline display
    const trades = currentFilteredTrades || [];
    const stratMap = window.tradeStrategyMap || {};
    const stratTrades = trades.filter((t) => stratMap[t.ticket] === s.id);
    const profit = stratTrades.reduce(
      (sum, t) => sum + parseFloat(t.net_profit),
      0,
    );
    const wins = stratTrades.filter((t) => parseFloat(t.net_profit) > 0).length;
    const wr =
      stratTrades.length > 0
        ? ((wins / stratTrades.length) * 100).toFixed(0)
        : 0;
    const profitColor =
      profit > 0 ? "var(--success)" : profit < 0 ? "var(--danger)" : "inherit";
    const curSym = window.currentCurSym || "€";

    const card = document.createElement("div");
    card.className = "strategy-card";
    card.style.cssText = `--s-color:${color};--s-rgb:${rgb};`;
    card.innerHTML = `
            <div class="strategy-card-name">
                <span>${s.name}</span>
                <span style="color:${profitColor}; font-size:0.95rem;">${profit >= 0 ? "+" : ""}${curSym}${profit.toFixed(0)}</span>
            </div>
            <div class="strategy-card-stats">${stratTrades.length} Trades &nbsp;|&nbsp; ${wr}% WR</div>
            ${s.description ? `<div class="strategy-card-desc">${s.description}</div>` : ""}
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
  const unassigned = (trades || []).filter((t) => !stratMap[t.ticket]);
  const allCards = [];

  defs.forEach((s) => {
    const color = getStrategyColor(s.id);
    const rgb = hexToRgb(color);
    const stratTrades = (trades || []).filter(
      (t) => stratMap[t.ticket] === s.id,
    );
    const profit = stratTrades.reduce(
      (sum, t) => sum + parseFloat(t.net_profit),
      0,
    );
    const wins = stratTrades.filter((t) => parseFloat(t.net_profit) > 0).length;
    const losses = stratTrades.filter(
      (t) => parseFloat(t.net_profit) < 0,
    ).length;
    const wr =
      stratTrades.length > 0
        ? ((wins / stratTrades.length) * 100).toFixed(0)
        : 0;
    const pColor =
      profit > 0 ? "var(--success)" : profit < 0 ? "var(--danger)" : "inherit";

    if (window.coachStats && window.coachStats.strategyPerformance) {
      window.coachStats.strategyPerformance[s.name] = {
        profit,
        trades: stratTrades.length,
        winrate: wr,
      };
    }

    allCards.push({
      profit,
      html: `
            <div class="strategy-perf-card" style="--s-color:${color};--s-rgb:${rgb}; border-color: rgba(${rgb},0.3);">
                <div class="strategy-perf-card-name">${s.name}</div>
                <div class="strategy-perf-card-profit" style="color:${pColor};">${profit >= 0 ? "+" : ""}${curSym}${profit.toFixed(2)}</div>
                <div class="strategy-perf-card-meta">
                    <span>${stratTrades.length} Trades</span>
                    <span>${wr}% WR</span>
                    <span>${wins}W / ${losses}L</span>
                </div>
            </div>
        `,
    });
  });

  // Sort by profit descending
  allCards.sort((a, b) => b.profit - a.profit);
  allCards.forEach((c) => container.insertAdjacentHTML("beforeend", c.html));

  // Unassigned card
  if (unassigned.length > 0) {
    const uProfit = unassigned.reduce(
      (sum, t) => sum + parseFloat(t.net_profit),
      0,
    );
    container.insertAdjacentHTML(
      "beforeend",
      `
            <div class="strategy-perf-card" style="opacity:0.5;">
                <div class="strategy-perf-card-name" style="color:var(--text-muted);">— Unassigned</div>
                <div class="strategy-perf-card-profit" style="color:${uProfit >= 0 ? "var(--success)" : "var(--danger)"}">${uProfit >= 0 ? "+" : ""}${curSym}${uProfit.toFixed(2)}</div>
                <div class="strategy-perf-card-meta"><span>${unassigned.length} Trades</span></div>
            </div>
        `,
    );
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
    const s = (window.strategyDefs || []).find((d) => d.id === editId);
    titleEl.textContent = "Edit Strategy";
    idInput.value = s ? s.id : "";
    nameInput.value = s ? s.name : "";
    descInput.value = s ? s.description || "" : "";
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
  if (!name) {
    alert("Please enter a strategy name.");
    return;
  }
  const id = document.getElementById("strategy-modal-id")?.value.trim() || null;
  const desc =
    document.getElementById("strategy-modal-desc")?.value.trim() || "";
  const token = localStorage.getItem("tm_master_token");

  const body = { name, description: desc };
  if (id) body.id = id;

  try {
    const res = await fetch(`${API_URL}?action=strategies`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.id) {
      // Upsert locally
      if (!window.strategyDefs) window.strategyDefs = [];
      const idx = window.strategyDefs.findIndex(
        (s) => s.id === (id || data.id),
      );
      if (idx >= 0) {
        window.strategyDefs[idx] = {
          id: id || data.id,
          name,
          description: desc,
        };
      } else {
        window.strategyDefs.push({ id: data.id, name, description: desc });
      }
    }
    document.getElementById("strategy-modal").classList.add("hidden");
    renderStrategyCards();
    renderStrategyPerformance(currentFilteredTrades);
  } catch (e) {
    console.error("Strategy save error", e);
  }
}

async function deleteStrategy(id) {
  if (!confirm("Delete this strategy? Assigned trades will become unassigned."))
    return;
  const token = localStorage.getItem("tm_master_token");
  await fetch(`${API_URL}?action=strategies`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ delete_id: id }),
  });
  window.strategyDefs = (window.strategyDefs || []).filter((s) => s.id !== id);
  renderStrategyCards();
  renderStrategyPerformance(currentFilteredTrades);
}

// ── Inline Strategy Picker (popover dropdown) ─────
function openStrategyPicker(el, ticket) {
  // Remove any existing picker
  const existing = document.getElementById("_strat_picker");
  if (existing) existing.remove();

  const defs = window.strategyDefs || [];
  const current = window.tradeStrategyMap
    ? window.tradeStrategyMap[ticket] || ""
    : "";

  const picker = document.createElement("select");
  picker.id = "_strat_picker";
  picker.className = "strategy-select-dropdown";
  picker.style.cssText = "position: absolute; z-index: 9999; min-width: 140px;";

  picker.innerHTML =
    `<option value="">— None —</option>` +
    defs
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === current ? "selected" : ""}>${s.name}</option>`,
      )
      .join("");

  // Position near the element
  const rect = el.getBoundingClientRect();
  picker.style.top = rect.bottom + window.scrollY + 4 + "px";
  picker.style.left = rect.left + window.scrollX + "px";
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
    const strat = (window.strategyDefs || []).find((s) => s.id === sid);
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
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: key,
        ticket: String(ticket),
        strategy_id: sid || "",
      }),
    }).catch((e) => console.error("Strategy assign error", e));
  }

  picker.addEventListener("change", applyPick);
  picker.addEventListener("blur", () => setTimeout(() => picker.remove(), 200));
}

// ── Wire up modal buttons ─────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("add-strategy-btn")
    ?.addEventListener("click", () => openStrategyModal(null));
  document
    .getElementById("strategy-modal-close")
    ?.addEventListener("click", () => {
      document.getElementById("strategy-modal")?.classList.add("hidden");
    });
  document
    .getElementById("strategy-modal-save")
    ?.addEventListener("click", saveStrategy);
  document.getElementById("strategy-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "strategy-modal")
      document.getElementById("strategy-modal").classList.add("hidden");
  });

  // View Archives logic
  document
    .getElementById("view-archives-btn")
    ?.addEventListener("click", async () => {
      const modal = document.getElementById("coach-archive-modal");
      const list = document.getElementById("coach-archive-list");
      if (!modal || !list) return;

      modal.classList.remove("hidden");
      list.innerHTML =
        '<div style="text-align:center; padding: 20px; color: var(--text-muted);">Loading archives...</div>';

      try {
        const key = localStorage.getItem("tm_license_key");
        const res = await fetch(
          `${API_URL}?action=coach_archive&account_id=${encodeURIComponent(key)}`,
          {
            headers: { Authorization: localStorage.getItem("tm_master_token") },
          },
        );
        const archives = await res.json();

        if (archives.length === 0) {
          list.innerHTML =
            '<div style="text-align:center; padding: 20px; color: var(--text-muted);">No archived analyses found.</div>';
        } else {
          list.innerHTML = "";
          archives.forEach((arch) => {
            const dateObj = new Date(arch.created_at * 1000);
            const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}.${String(dateObj.getMonth() + 1).padStart(2, "0")}.${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;
            list.insertAdjacentHTML(
              "beforeend",
              `
                        <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-dark); padding: 15px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph ph-calendar"></i> ${arch.date}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                            </div>
                            <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-main);">
                                ${arch.analysis_text}
                            </div>
                        </div>
                    `,
            );
          });
        }
      } catch (e) {
        list.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Failed to load archives.</div>`;
      }
    });

  document
    .getElementById("coach-archive-close")
    ?.addEventListener("click", () => {
      document.getElementById("coach-archive-modal")?.classList.add("hidden");
    });
  document
    .getElementById("coach-archive-modal")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "coach-archive-modal")
        document.getElementById("coach-archive-modal").classList.add("hidden");
    });
});

// ── News Ticker & Focus Mode Logic ───────────────────────────────────────────────────

let tickerFilters = JSON.parse(localStorage.getItem("tm_ticker_filters")) || {
  impacts: ["High", "Medium"],
  currencies: ["EUR", "USD"]
};

function initTickerFilterUI() {
  const modal = document.getElementById("ticker-filter-modal");
  const openBtn = document.getElementById("ticker-filter-btn");
  const closeBtn = document.getElementById("ticker-filter-close");
  const saveBtn = document.getElementById("ticker-filter-save");
  if (!modal || !openBtn) return;

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY"];
  const currContainer = document.getElementById("ticker-currency-container");
  
  if (currContainer && currContainer.innerHTML.trim() === "") {
    let currHtml = "";
    currencies.forEach(c => {
      const isChecked = tickerFilters.currencies.includes(c) ? "checked" : "";
      currHtml += `
        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" class="ticker-currency-cb" value="${c}" ${isChecked}> ${c}
        </label>
      `;
    });
    currContainer.innerHTML = currHtml;
  }

  // Set impact checkboxes
  const impactCbs = document.querySelectorAll(".ticker-impact-cb");
  impactCbs.forEach(cb => {
    cb.checked = tickerFilters.impacts.includes(cb.value);
  });

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const selectedImpacts = Array.from(document.querySelectorAll(".ticker-impact-cb:checked")).map(cb => cb.value);
      const selectedCurrencies = Array.from(document.querySelectorAll(".ticker-currency-cb:checked")).map(cb => cb.value);
      
      tickerFilters = { impacts: selectedImpacts, currencies: selectedCurrencies };
      localStorage.setItem("tm_ticker_filters", JSON.stringify(tickerFilters));
      
      modal.classList.add("hidden");
      initNewsTicker(); // re-fetch and render
    });
  }
}

async function initNewsTicker() {
  const ticker = document.getElementById("news-ticker-content");
  if (!ticker) return;

  const fallbackNews = `
    <span class="impact-high">🔴 Market Ticker Offline</span>
    <span class="impact-medium">🟠 No News Available</span>
  `;

  try {
    const url = (typeof API_URL !== "undefined" ? API_URL : "") + "?action=news";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch news");
    const events = await response.json();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const fallbackNews = `
    <span class="impact-low">⚪ No News Today</span>
  `;

    let newsHtml = "";
    if (Array.isArray(events)) {
      events.forEach((ev) => {
        if (!ev.date) return;
        const evDateStr = ev.date.split("T")[0];
        if (evDateStr === todayStr) {
          if (!tickerFilters.impacts.includes(ev.impact)) return;
          if (!tickerFilters.currencies.includes(ev.country)) return;
          
          const dateObj = new Date(ev.date);
          const time = dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          
          let impactClass = "impact-low";
          let icon = "🟡";
          if (ev.impact === "High") {
            impactClass = "impact-high";
            icon = "🔴";
          } else if (ev.impact === "Medium") {
            impactClass = "impact-medium";
            icon = "🟠";
          } else if (ev.impact === "Holiday") {
            icon = "⚪";
          }
          
          newsHtml += `<span class="${impactClass}">${icon} [${time}] ${ev.country} - ${ev.title}</span>`;
        }
      });
    }

    if (!newsHtml) {
      newsHtml = fallbackNews;
    }

    ticker.innerHTML = newsHtml.repeat(8);
  } catch (err) {
    console.error("News fetch error:", err);
    ticker.innerHTML = fallbackNews.repeat(8);
  }
}

window.selectedAnalyzerTag = window.selectedAnalyzerTag || null;

window.renderTagAnalyzer = function (trades, curSym) {
  const barContainer = document.getElementById("tag-analyzer-bar");
  const feedContainer = document.getElementById("tag-analyzer-feed");
  if (!barContainer || !feedContainer) return;

  // 1. Extract notes and parse hashtags
  const allTaggedTrades = [];
  const tagCounts = {}; // { "#overtrading": 5, ... }

  (trades || []).forEach((t) => {
    const note = window.tradeNotesMap
      ? window.tradeNotesMap[t.ticket] || ""
      : "";
    if (!note) return;

    // Simple regex to find hashtags
    const tags = note.match(/#[a-zA-Z0-9_\u00C0-\u00FF]+/g);
    if (tags && tags.length > 0) {
      // Remove duplicates in the same note
      const uniqueTags = [...new Set(tags.map((tag) => tag.toLowerCase()))];
      uniqueTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      allTaggedTrades.push({
        trade: t,
        tags: uniqueTags,
        note: note,
      });
    }
  });

  // Sort tags by frequency
  const uniqueTagsSorted = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a],
  );

  // Render Tag Buttons
  barContainer.innerHTML = "";

  if (uniqueTagsSorted.length === 0) {
    barContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No tags found. Add hashtags (e.g. #fomo, #overtrading) in the Trades tab to analyze them here.</div>`;
    feedContainer.innerHTML = "";
    return;
  }

  // Add an "ALL" button
  const allBtn = document.createElement("button");
  allBtn.className = !window.selectedAnalyzerTag
    ? "filter-btn active"
    : "filter-btn";
  allBtn.style.padding = "5px 12px";
  allBtn.style.fontSize = "0.85rem";
  allBtn.innerHTML = `All (${allTaggedTrades.length})`;
  allBtn.onclick = () => {
    window.selectedAnalyzerTag = null;
    window.renderTagAnalyzer(trades, curSym);
  };
  barContainer.appendChild(allBtn);

  uniqueTagsSorted.forEach((tag) => {
    const btn = document.createElement("button");
    btn.className =
      window.selectedAnalyzerTag === tag ? "filter-btn active" : "filter-btn";
    btn.style.padding = "5px 12px";
    btn.style.fontSize = "0.85rem";
    btn.innerHTML = `${tag} (${tagCounts[tag]})`;
    btn.onclick = () => {
      window.selectedAnalyzerTag = tag;
      window.renderTagAnalyzer(trades, curSym);
    };
    barContainer.appendChild(btn);
  });

  // Filter feed trades
  const filteredTagged = allTaggedTrades.filter((item) => {
    if (!window.selectedAnalyzerTag) return true;
    return item.tags.includes(window.selectedAnalyzerTag);
  });

  // Render Feed cards
  feedContainer.innerHTML = "";

  if (filteredTagged.length === 0) {
    feedContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">No trades found for tag ${window.selectedAnalyzerTag}</div>`;
    return;
  }

  // Sort by close time descending
  filteredTagged.sort((a, b) => b.trade.close_time - a.trade.close_time);

  filteredTagged.forEach((item) => {
    const t = item.trade;
    const note = item.note;
    const sideStr = t.side || "";
    const sideColor = sideStr.startsWith("Buy")
      ? "var(--success)"
      : "var(--danger)";
    const profitVal = parseFloat(t.gross_profit !== undefined ? t.gross_profit : t.net_profit || 0);
    const profitColor = profitVal >= 0 ? "var(--success)" : "var(--danger)";
    const commissionNum = parseFloat(t.commission || 0);
    const commissionStr = Math.abs(commissionNum) > 0.001 ? (commissionNum < 0 ? "-" : "") + curSym + Math.abs(commissionNum).toFixed(2) : "-";

    // Images
    const imgData = window.tradeImagesMap
      ? window.tradeImagesMap[t.ticket] || {}
      : {};
    const beforeUrl = imgData.before || "";
    const afterUrl = imgData.after || "";

    // Format note to highlight hashtags
    const highlightedNote = note.replace(
      /(#[a-zA-Z0-9_\u00C0-\u00FF]+)/g,
      '<span style="color: #38bdf8; font-weight: 500;">$1</span>',
    );

    const dateObj = new Date(t.close_time * 1000);
    const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}.${String(dateObj.getMonth() + 1).padStart(2, "0")}.${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

    // Strategy
    const strategyId = window.tradeStrategyMap
      ? window.tradeStrategyMap[t.ticket] || ""
      : "";
    const stratDefs = window.strategyDefs || [];
    const assignedStrat = stratDefs.find((s) => s.id === strategyId);
    const stratHtml = assignedStrat
      ? `<span style="font-size: 0.75rem; padding: 2px 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; color: #7dd3fc; margin-left: 8px;">${assignedStrat.name}</span>`
      : "";

    const card = document.createElement("div");
    card.className = "glass-panel tag-trade-card";
    card.style.cssText =
      "padding: 15px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-dark); border-radius: 8px; background: rgba(0,0,0,0.15);";

    // Image Preview elements
    let imagesHtml = "";
    if (beforeUrl || afterUrl) {
      imagesHtml = `<div style="display: flex; gap: 10px; margin-top: 5px;">`;
      if (beforeUrl) {
        imagesHtml += `
                    <div class="tag-feed-image-container" style="flex: 1; position: relative; cursor: pointer; aspect-ratio: 16/9; overflow: hidden; border-radius: 4px; border: 1px solid var(--border-dark);" onclick="openImagePreview('${beforeUrl}')">
                        <img src="${beforeUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Before Chart">
                        <span style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 3px;">Before</span>
                    </div>
                `;
      }
      if (afterUrl) {
        imagesHtml += `
                    <div class="tag-feed-image-container" style="flex: 1; position: relative; cursor: pointer; aspect-ratio: 16/9; overflow: hidden; border-radius: 4px; border: 1px solid var(--border-dark);" onclick="openImagePreview('${afterUrl}')">
                        <img src="${afterUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="After Chart">
                        <span style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 3px;">After</span>
                    </div>
                `;
      }
      imagesHtml += `</div>`;
    } else {
      imagesHtml = `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 15px; border: 1px dashed var(--border-dark); border-radius: 4px;">No charts attached</div>`;
    }

    card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 5px;">
                <div>
                    <span style="font-weight: bold; font-size: 1rem; color: var(--text-main);">${t.symbol}</span>
                    <span style="margin-left: 8px; font-size: 0.8rem; color: ${sideColor}; font-weight: 500;">${sideStr}</span>
                    ${stratHtml}
                </div>
                <span style="font-weight: bold; color: ${profitColor};">${profitVal < 0 ? "-" : ""}${curSym}${Math.abs(profitVal).toFixed(2)}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: -8px;">Ticket: ${t.ticket} &nbsp;|&nbsp; Close: ${dateStr} &nbsp;|&nbsp; Comm: <span style="color: var(--text-main);">${commissionStr}</span></div>
            <div style="font-size: 0.85rem; color: var(--text-main); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; line-height: 1.4;">
                ${highlightedNote}
            </div>
            ${imagesHtml}
        `;
    feedContainer.appendChild(card);
  });
};

window.focusModeActive = localStorage.getItem("tm_focus_mode") === "true";

function updateFocusModeUI() {
  const dashboard = document.getElementById("dashboard");
  const focusBtn = document.getElementById("focus-btn");
  const focusBtnExit = document.getElementById("focus-btn-exit");
  if (!dashboard) return;

  if (window.focusModeActive) {
    dashboard.classList.add("focus-mode-active");
    if (focusBtn) {
      focusBtn.style.background = "var(--border-light)";
      focusBtn.style.color = "var(--border-darker)";
    }
    if (focusBtnExit) {
      focusBtnExit.style.display = "inline-flex";
      focusBtnExit.style.background = "var(--border-light)";
      focusBtnExit.style.color = "var(--border-darker)";
    }
  } else {
    dashboard.classList.remove("focus-mode-active");
    if (focusBtn) {
      focusBtn.style.background = "var(--panel-bg)";
      focusBtn.style.color = "#a855f7";
    }
    if (focusBtnExit) {
      focusBtnExit.style.display = "none";
    }
  }
}

function updateMarketSessions() {
  const container = document.getElementById("market-sessions-container");
  const clockLabel = document.getElementById("utc-clock-label");
  if (!container) return;

  const now = new Date();
  const hrs = now.getHours();
  const mins = now.getMinutes();
  const secs = now.getSeconds();
  const localHoursStr = String(hrs).padStart(2, "0");
  const localMinsStr = String(mins).padStart(2, "0");
  const localSecsStr = String(secs).padStart(2, "0");

  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const offsetStr = `UTC${offsetSign}${offsetHours}${offsetMins ? ":" + String(offsetMins).padStart(2, "0") : ""}`;

  if (clockLabel) {
    clockLabel.textContent = `Local: ${localHoursStr}:${localMinsStr}:${localSecsStr} (${offsetStr})`;
  }

  const localTotalMins = hrs * 60 + mins;

  const sessions = [
    { name: "Sydney", start: 23 * 60, end: 8 * 60, icon: "🌏", timeStr: "23:00 - 08:00" },
    { name: "Tokyo", start: 2 * 60, end: 11 * 60, icon: "🗾", timeStr: "02:00 - 11:00" },
    { name: "London", start: 9 * 60, end: 18 * 60, icon: "🏛️", timeStr: "09:00 - 18:00" },
    { name: "New York", start: 15 * 60 + 30, end: 22 * 60, icon: "🗽", timeStr: "15:30 - 22:00" },
  ];

  let html = "";
  sessions.forEach((s) => {
    let isOpen = false;
    if (s.start > s.end) {
      isOpen = localTotalMins >= s.start || localTotalMins < s.end;
    } else {
      isOpen = localTotalMins >= s.start && localTotalMins < s.end;
    }

    const badgeClass = isOpen ? "open" : "closed";
    const badgeText = isOpen ? "OPEN" : "CLOSED";

    html += `
      <div class="market-session-card ${badgeClass}">
        <div class="market-session-header">
          <span class="market-session-title">${s.icon} ${s.name}</span>
          <span class="market-session-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="market-session-time"><i class="ph ph-clock"></i> ${s.timeStr}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.loadPropChallenges = function() {
  const saved = localStorage.getItem("tm_prop_challenges");
  if (saved) {
    try {
      window.propChallenges = JSON.parse(saved);
    } catch(e) {
      window.propChallenges = [];
    }
  } else {
    window.propChallenges = [];
  }
};

window.savePropChallenges = function() {
  localStorage.setItem("tm_prop_challenges", JSON.stringify(window.propChallenges || []));
};

window.renderPropChallenges = function() {
  const container = document.getElementById("prop-challenges-container");
  if (!container) return;
  
  if (!window.propChallenges) window.loadPropChallenges();

  const lang = localStorage.getItem("tm_global_lang") || "de";
  const t = i18n[lang] || i18n.de;

  let html = "";
  const curSym = window.currentCurrencySymbol || "$";

  // Get available accounts to populate dropdowns
  const availableAccounts = [];
  const accountSelect = document.getElementById("account-switcher");
  if (accountSelect) {
    Array.from(accountSelect.options).forEach(opt => {
      availableAccounts.push(opt.value);
    });
  }

  window.propChallenges.forEach((chal, index) => {
    let optionsHtml = `<option value="">${t.prop_select_account_option || "Select Account..."}</option>`;
    availableAccounts.forEach(acc => {
      optionsHtml += `<option value="${acc}" ${chal.accountId === acc ? 'selected' : ''}>${acc}</option>`;
    });

    html += `
      <div class="prop-challenge-block" data-id="${chal.id}" style="border-bottom: 2px dashed rgba(255,255,255,0.1); padding-bottom: 30px; margin-bottom: 30px;">
        <div class="glass-panel" style="margin-bottom: 20px; position: relative;">
          <button class="delete-challenge-btn icon-btn" data-id="${chal.id}" style="position: absolute; top: 15px; right: 15px; color: var(--danger); font-size: 1.2rem; cursor: pointer; border:none; background:transparent;"><i class="ph ph-trash"></i></button>
          
          <h3 style="margin-bottom: 15px"><i class="ph ph-gear"></i> ${t.prop_rules_setup || "Challenge Rules & Setup"}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${t.prop_label_account || "MT5 Account"}</label>
              <select class="profile-select prop-acc-select" data-id="${chal.id}" style="width: 100%; padding: 8px;">
                ${optionsHtml}
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${t.prop_label_start_balance || "Initial Balance ($)"}</label>
              <input type="number" class="profile-select prop-start-balance" data-id="${chal.id}" value="${chal.startBalance}" style="width: 100%; padding: 8px;" />
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${t.prop_label_target_pct || "Profit Target (%)"}</label>
              <input type="number" class="profile-select prop-target-pct" data-id="${chal.id}" value="${chal.targetPct}" step="0.5" style="width: 100%; padding: 8px;" />
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${t.prop_label_daily_loss_pct || "Max Daily Loss (%)"}</label>
              <input type="number" class="profile-select prop-daily-loss-pct" data-id="${chal.id}" value="${chal.dailyLossPct}" step="0.5" style="width: 100%; padding: 8px;" />
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${t.prop_label_max_loss_pct || "Max Total Loss (%)"}</label>
              <input type="number" class="profile-select prop-max-loss-pct" data-id="${chal.id}" value="${chal.maxLossPct}" step="0.5" style="width: 100%; padding: 8px;" />
            </div>
          </div>
        </div>

        <!-- Live Monitor Cards -->
        <div class="glass-panel prop-status-card" style="margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; font-size: 1.3rem;">${t.prop_status_lbl || "Status:"} <span id="prop-status-text-${chal.id}">${t.prop_status_loading || "LOADING..."}</span></h2>
            <p style="margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.85rem;" id="prop-status-subtext-${chal.id}">${t.prop_status_fetching || "Fetching data..."}</p>
          </div>
          <div id="prop-status-badge-${chal.id}" class="prop-status-badge" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">${t.prop_status_waiting || "WAITING"}</div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card glass-panel">
            <h3 style="font-size: 0.85rem;">${t.prop_kpi_target || "Profit Target"}</h3>
            <p id="prop-target-val-${chal.id}" class="kpi-value positive">$0.00</p>
            <div class="prop-progress-bar"><div id="prop-target-fill-${chal.id}" class="prop-progress-fill" style="width: 0%;"></div></div>
            <span id="prop-target-pct-lbl-${chal.id}" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">0% ${t.prop_lbl_reached || "reached"}</span>
          </div>

          <div class="kpi-card glass-panel">
            <h3 style="font-size: 0.85rem;">${t.prop_kpi_daily_buffer || "Daily Loss Buffer"}</h3>
            <p id="prop-daily-buffer-val-${chal.id}" class="kpi-value positive">$0.00</p>
            <span id="prop-daily-loss-lbl-${chal.id}" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">${t.prop_lbl_daily_limit || "Daily Limit:"} $0.00</span>
          </div>

          <div class="kpi-card glass-panel">
            <h3 style="font-size: 0.85rem;">${t.prop_kpi_max_buffer || "Max Drawdown Buffer"}</h3>
            <p id="prop-max-buffer-val-${chal.id}" class="kpi-value positive">$0.00</p>
            <span id="prop-max-loss-lbl-${chal.id}" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">${t.prop_lbl_floor || "Equity Floor:"} $0.00</span>
          </div>

          <div class="kpi-card glass-panel">
            <h3 style="font-size: 0.85rem;">${t.prop_kpi_current_equity || "Current Equity"}</h3>
            <p id="prop-current-equity-${chal.id}" class="kpi-value">$0.00</p>
            <span id="prop-net-profit-${chal.id}" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">P&L: $0.00</span>
          </div>
        </div>
      </div>
    `;
  });

  if (window.propChallenges.length === 0) {
    html = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
      <i class="ph ph-trophy" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
      <p>${t.prop_empty_state || "No Challenges tracked. Click the + button above to add one."}</p>
    </div>`;
  }

  container.innerHTML = html;

  // Add event listeners for inputs
  container.querySelectorAll('.prop-acc-select, .prop-start-balance, .prop-target-pct, .prop-daily-loss-pct, .prop-max-loss-pct').forEach(el => {
    el.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const chal = window.propChallenges.find(c => c.id == id);
      if (chal) {
        const block = e.target.closest('.prop-challenge-block');
        chal.accountId = block.querySelector('.prop-acc-select').value;
        chal.startBalance = parseFloat(block.querySelector('.prop-start-balance').value) || 100000;
        chal.targetPct = parseFloat(block.querySelector('.prop-target-pct').value) || 10;
        chal.dailyLossPct = parseFloat(block.querySelector('.prop-daily-loss-pct').value) || 5;
        chal.maxLossPct = parseFloat(block.querySelector('.prop-max-loss-pct').value) || 10;
        window.savePropChallenges();
        window.updatePropChallengeStats(chal);
      }
    });
  });

  // Add event listeners for delete buttons
  container.querySelectorAll('.delete-challenge-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('button').getAttribute('data-id');
      if (confirm(t.prop_confirm_delete || 'Delete this challenge?')) {
        window.propChallenges = window.propChallenges.filter(c => c.id != id);
        window.savePropChallenges();
        window.renderPropChallenges();
      }
    });
  });

  // Fetch and update stats for all challenges
  window.propChallenges.forEach(chal => {
    if (chal.accountId) {
      window.updatePropChallengeStats(chal);
    } else {
      const statusElem = document.getElementById(`prop-status-text-${chal.id}`);
      const statusSubElem = document.getElementById(`prop-status-subtext-${chal.id}`);
      if (statusElem) statusElem.textContent = t.prop_no_account_selected || "NO ACCOUNT SELECTED";
      if (statusSubElem) statusSubElem.textContent = t.prop_no_account_sub || "Please select an account to track.";
    }
  });
};

window.updatePropChallengeStats = async function(chal) {
  if (!chal.accountId) return;

  const lang = localStorage.getItem("tm_global_lang") || "de";
  const t = i18n[lang] || i18n.de;
  const curSym = window.currentCurrencySymbol || "$";
  
  try {
    const token = localStorage.getItem("tm_master_token");
    if (!token) return;

    const response = await fetch(`${typeof API_URL !== "undefined" ? API_URL : ""}?account_id=${encodeURIComponent(chal.accountId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch trades for challenge");
    const payload = await response.json();
    const trades = payload.trades || [];
    
    let totalNetP = 0;
    const dailyPnl = {};
    trades.forEach((t) => {
      const p = parseFloat(t.net_profit) || 0;
      totalNetP += p;
      const dObj = new Date(t.close_time * 1000);
      const dKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}-${String(dObj.getDate()).padStart(2, "0")}`;
      dailyPnl[dKey] = (dailyPnl[dKey] || 0) + p;
    });

    const currentEquity = chal.startBalance + totalNetP;
    const targetProfitAmount = chal.startBalance * (chal.targetPct / 100);
    const maxLossAmount = chal.startBalance * (chal.maxLossPct / 100);
    const maxLossFloor = chal.startBalance - maxLossAmount;
    const dailyLossLimitAmount = chal.startBalance * (chal.dailyLossPct / 100);

    let worstDayLoss = 0;
    Object.values(dailyPnl).forEach((dayPnl) => {
      if (dayPnl < 0 && Math.abs(dayPnl) > worstDayLoss) {
        worstDayLoss = Math.abs(dayPnl);
      }
    });

    const targetReachedPct = Math.min(100, Math.max(0, (totalNetP / targetProfitAmount) * 100));
    const maxLossBuffer = currentEquity - maxLossFloor;
    const dailyLossBuffer = dailyLossLimitAmount - worstDayLoss;

    let statusText = t.prop_status_active || "ACTIVE";
    let statusSubtext = t.prop_sub_active || "Challenge läuft — Alle Limits eingehalten.";
    let statusClass = "active";

    if (currentEquity <= maxLossFloor) {
      statusText = t.prop_status_failed_max || "FAILED (Max Drawdown)";
      statusSubtext = t.prop_sub_failed_max || "Account hat das maximale Drawdown-Limit überschritten!";
      statusClass = "failed";
    } else if (dailyLossBuffer <= 0) {
      statusText = t.prop_status_failed_daily || "FAILED (Daily Drawdown)";
      statusSubtext = t.prop_sub_failed_daily || "Tages-Verlustlimit wurde an einem Handelstag überschritten!";
      statusClass = "failed";
    } else if (totalNetP >= targetProfitAmount) {
      statusText = t.prop_status_passed || "PASSED 🏆";
      statusSubtext = t.prop_sub_passed || "Herzlichen Glückwunsch! Du hast das Profit-Ziel erreicht!";
      statusClass = "passed";
    }

    const statusElem = document.getElementById(`prop-status-text-${chal.id}`);
    const statusSubElem = document.getElementById(`prop-status-subtext-${chal.id}`);
    const statusBadge = document.getElementById(`prop-status-badge-${chal.id}`);

    if (statusElem) statusElem.textContent = statusText;
    if (statusSubElem) statusSubElem.textContent = statusSubtext;
    if (statusBadge) {
      statusBadge.className = `prop-status-badge ${statusClass}`;
      statusBadge.textContent = statusText;
      statusBadge.style.background = ""; 
      statusBadge.style.border = "";
    }

    const targetValElem = document.getElementById(`prop-target-val-${chal.id}`);
    const targetFillElem = document.getElementById(`prop-target-fill-${chal.id}`);
    const targetPctLbl = document.getElementById(`prop-target-pct-lbl-${chal.id}`);

    if (targetValElem) targetValElem.textContent = `${curSym}${targetProfitAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (targetFillElem) targetFillElem.style.width = `${targetReachedPct}%`;
    if (targetPctLbl) targetPctLbl.textContent = `${targetReachedPct.toFixed(1)}% ${t.prop_lbl_reached || "reached"} (${curSym}${totalNetP.toFixed(2)} / ${curSym}${targetProfitAmount.toFixed(2)})`;

    const dailyBufferVal = document.getElementById(`prop-daily-buffer-val-${chal.id}`);
    const dailyLossLbl = document.getElementById(`prop-daily-loss-lbl-${chal.id}`);
    if (dailyBufferVal) {
      dailyBufferVal.textContent = `${curSym}${dailyLossBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
      dailyBufferVal.className = `kpi-value ${dailyLossBuffer < 1000 ? "negative" : "positive"}`;
    }
    if (dailyLossLbl) dailyLossLbl.textContent = `${t.prop_lbl_daily_limit || "Daily Limit:"} ${curSym}${dailyLossLimitAmount.toFixed(2)} (${t.prop_lbl_max_day_loss || "Max Day Loss:"} ${curSym}${worstDayLoss.toFixed(2)})`;

    const maxBufferVal = document.getElementById(`prop-max-buffer-val-${chal.id}`);
    const maxLossLbl = document.getElementById(`prop-max-loss-lbl-${chal.id}`);
    if (maxBufferVal) {
      maxBufferVal.textContent = `${curSym}${maxLossBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
      maxBufferVal.className = `kpi-value ${maxLossBuffer < 2000 ? "negative" : "positive"}`;
    }
    if (maxLossLbl) maxLossLbl.textContent = `${t.prop_lbl_floor || "Equity Floor:"} ${curSym}${maxLossFloor.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    const currentEquityElem = document.getElementById(`prop-current-equity-${chal.id}`);
    const netProfitElem = document.getElementById(`prop-net-profit-${chal.id}`);
    if (currentEquityElem) currentEquityElem.textContent = `${curSym}${currentEquity.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (netProfitElem) {
      netProfitElem.textContent = `P&L: ${totalNetP >= 0 ? "+" : ""}${curSym}${totalNetP.toFixed(2)}`;
      netProfitElem.className = totalNetP >= 0 ? "positive" : "negative";
    }

  } catch (err) {
    console.error("Failed to update prop stats for account", chal.accountId, err);
  }
};

window.updatePropChallengeTracker = function(trades) {
  // Trigger re-render of Prop Challenges if the tab is active or data changes globally
  window.renderPropChallenges();
};

document.addEventListener("DOMContentLoaded", () => {
  initTickerFilterUI();
  initNewsTicker();
  updateFocusModeUI();
  updateMarketSessions();
  setInterval(updateMarketSessions, 1000);
  const addPropBtn = document.getElementById("add-prop-challenge-btn");
  if (addPropBtn) {
    addPropBtn.addEventListener("click", () => {
      if (!window.propChallenges) window.loadPropChallenges();
      window.propChallenges.push({
        id: Date.now(),
        accountId: "",
        startBalance: 100000,
        targetPct: 10,
        dailyLossPct: 5,
        maxLossPct: 10
      });
      window.savePropChallenges();
      window.renderPropChallenges();
    });
  }

  const focusBtn = document.getElementById("focus-btn");
  const focusBtnExit = document.getElementById("focus-btn-exit");
  const toggleFocus = () => {
    window.focusModeActive = !window.focusModeActive;
    localStorage.setItem("tm_focus_mode", window.focusModeActive);
    updateFocusModeUI();
  };
  if (focusBtn) focusBtn.addEventListener("click", toggleFocus);
  if (focusBtnExit) focusBtnExit.addEventListener("click", toggleFocus);

  // --- SIDEBAR COLLAPSE / EXPAND LOGIC ---
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");

  if (sidebar && sidebarToggle) {
    // Load initial state
    const isCollapsed = localStorage.getItem("tm_sidebar_collapsed") === "true";
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
      const toggleIcon = sidebarToggle.querySelector("i");
      if (toggleIcon) {
        toggleIcon.className = "ph ph-caret-double-right";
      }
    }

    sidebarToggle.addEventListener("click", () => {
      const collapsed = sidebar.classList.toggle("collapsed");
      localStorage.setItem("tm_sidebar_collapsed", collapsed);
      const toggleIcon = sidebarToggle.querySelector("i");
      if (toggleIcon) {
        toggleIcon.className = collapsed
          ? "ph ph-caret-double-right"
          : "ph ph-caret-double-left";
      }
    });
  }

  // --- TAB SWITCHING LOGIC ---
  const navItems = document.querySelectorAll(".sidebar-nav-item");
  const tabContents = document.querySelectorAll(".tab-content");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all items and contents
      navItems.forEach((nav) => nav.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked item
      item.classList.add("active");

      // Show corresponding tab content
      const tabId = item.getAttribute("data-tab");
      localStorage.setItem("tm_active_tab", tabId);
      const targetTab = document.getElementById(tabId);
      if (targetTab) {
        targetTab.classList.add("active");
      }

      // Toggle timeframe filters visibility: only shown on DASHBOARD page
      const timeframeFilters = document.getElementById("timeframe-filters");
      const monthSelector = document.getElementById("month-selector");
      if (timeframeFilters) {
        if (tabId === "tab-dashboard") {
          timeframeFilters.style.display = "";
          if (monthSelector) monthSelector.style.display = "";
        } else {
          timeframeFilters.style.display = "none";
          if (monthSelector) monthSelector.style.display = "none";
        }
      }

      if (
        tabId === "tab-tags" &&
        typeof window.renderTagAnalyzer === "function" &&
        window.currentAllTrades
      ) {
        window.renderTagAnalyzer(
          window.currentAllTrades,
          window.currentCurSym || "$",
        );
      }
      if (tabId === "tab-community") {
        loadCommunityFeed();
      }
      if (tabId === "tab-psychology") {
        renderPsychologyLessons();
      }
    });
  });

  // Restore active tab after page reload
  const savedActiveTab = localStorage.getItem("tm_active_tab");
  if (savedActiveTab) {
    const activeNavBtn = document.querySelector(`.sidebar-nav-item[data-tab="${savedActiveTab}"]`);
    if (activeNavBtn) activeNavBtn.click();
  }

  // --- COMMUNITY FEED LOGIC ---
  const communityFeedContainer = document.getElementById(
    "community-feed-container",
  );
  const refreshFeedBtn = document.getElementById("refresh-feed-btn");

  if (refreshFeedBtn) {
    refreshFeedBtn.addEventListener("click", loadCommunityFeed);
  }

  function loadCommunityFeed() {
    if (!communityFeedContainer) return;
    const currentLang = document.getElementById("global-lang")?.value || "de";
    communityFeedContainer.innerHTML = `<p class="ai-placeholder-text" style="text-align: center; margin-top: 40px;">${i18n[currentLang].loading_feed}</p>`;
    const token = localStorage.getItem("tm_master_token");
    fetch(`${API_URL}?action=community_feed&t=${Date.now()}`, {
      headers: { Authorization: token },
    })
      .then((r) => r.json())
      .then((posts) => {
        if (!Array.isArray(posts)) {
          const currentLang =
            document.getElementById("global-lang")?.value || "de";
          communityFeedContainer.innerHTML = `<p class="ai-placeholder-text" style="text-align: center; margin-top: 40px;">${i18n[currentLang].failed_feed}</p>`;
          return;
        }
        if (posts.length === 0) {
          const currentLang =
            document.getElementById("global-lang")?.value || "de";
          communityFeedContainer.innerHTML = `<p class="ai-placeholder-text" style="text-align: center; margin-top: 40px;">${i18n[currentLang].no_posts}</p>`;
          return;
        }
        renderCommunityFeed(posts);
      })
      .catch((e) => {
        console.error(e);
        const currentLang =
          document.getElementById("global-lang")?.value || "de";
        communityFeedContainer.innerHTML = `<p class="ai-placeholder-text" style="text-align: center; margin-top: 40px;">${i18n[currentLang].failed_feed}</p>`;
      });
  }

  function renderCommunityFeed(posts) {
    communityFeedContainer.innerHTML = "";
    const currentLang = localStorage.getItem("tm_global_lang") || "de";
    const dict = i18n[currentLang] || i18n["de"];

    posts.forEach((post) => {
      const date = new Date(post.created_at * 1000);
      const timeStr = date.toLocaleString();

      const p = document.createElement("div");
      p.className = "community-post";
      let tradeHtml = "";
      if (post.trade_data) {
        const td = post.trade_data;
        const isProfit = parseFloat(td.profit) >= 0;
        const profitColor = isProfit ? "var(--success)" : "var(--danger)";
        const profitSign = isProfit ? "+" : "";

        let hashtagsHtml = "";
        if (td.note) {
          const tags = td.note.match(/#[\w]+/g);
          if (tags) {
            hashtagsHtml = `<div style="margin-top: 10px; color: var(--accent-color); font-size: 0.85rem; display: flex; gap: 8px; flex-wrap: wrap;">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
          }
        }

        let screenshotHtml = "";
        if (td.screenshot) {
          const screenAlt = dict.trade_screenshot || "Trade Screenshot";
          screenshotHtml = `<div style="margin-top: 15px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-dark);"><img src="${td.screenshot}" style="width: 100%; display: block; object-fit: contain; max-height: 400px; cursor: pointer;" alt="${screenAlt}" onclick="window.open('${td.screenshot}', '_blank')" /></div>`;
        }

        tradeHtml = `
          <div class="post-trade-card" style="margin-top: 15px; padding: 15px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-dark);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-weight: bold; font-size: 1.05rem; color: var(--text-main);">${td.symbol || "-"}</span>
                      <span style="font-size: 0.85rem; color: var(--text-muted);">${td.side || "-"}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                      <span style="font-weight: bold; font-size: 1.05rem; color: ${profitColor}">
                          ${profitSign}${parseFloat(td.profit || 0).toFixed(2)}
                      </span>
                      <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="ph ph-clock"></i> ${td.duration || "-"}</span>
                  </div>
              </div>
              ${hashtagsHtml}
              ${screenshotHtml}
          </div>
        `;
      }

      let optionsMenu = "";
      if (post.is_owner) {
        const delText = dict.delete_post || "Löschen";
        optionsMenu = `
            <div class="post-options-menu">
                <button class="post-options-btn"><i class="ph ph-dots-three"></i></button>
                <div class="post-options-dropdown" data-post-id="${post.id}">
                    <button class="delete-post-btn"><i class="ph ph-trash"></i> ${delText}</button>
                </div>
            </div>
         `;
      }

      let commentsHtml = "";
      if (post.comments && post.comments.length > 0) {
        commentsHtml = `<div class="post-comments-list" style="margin-top: 15px; border-top: 1px solid var(--border-dark); padding-top: 10px;">
             ${post.comments
               .map(
                 (c) => `
                 <div style="margin-bottom: 8px; font-size: 0.85rem;">
                     <span style="font-weight: bold; color: var(--primary-color);">${c.username}:</span> 
                     <span style="color: var(--text-main);">${escapeHTML(c.content)}</span>
                 </div>
             `,
               )
               .join("")}
         </div>`;
      }

      let commentInputHtml = "";
      if (!post.comments || post.comments.length < 5) {
        const commentPh = dict.comment_ph || "Kommentieren...";
        commentInputHtml = `
             <div class="comment-input-container" style="display: flex; gap: 10px; margin-top: 10px;">
                 <input type="text" class="profile-select comment-input" data-post-id="${post.id}" placeholder="${commentPh}" style="flex: 1; padding: 6px 10px; font-size: 0.85rem;" />
                 <button class="secondary-btn post-comment-btn" data-post-id="${post.id}" style="padding: 6px 12px; font-size: 0.85rem;"><i class="ph ph-paper-plane-right"></i></button>
             </div>
         `;
      } else {
        const maxCommText = dict.max_comments_reached || "Maximum von 5 Kommentaren erreicht.";
        commentInputHtml = `<div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">${maxCommText}</div>`;
      }

      p.innerHTML = `
                ${optionsMenu}
                <div class="post-header">
                    <div class="post-avatar">${post.username ? post.username.substring(0, 1).toUpperCase() : "U"}</div>
                    <div class="post-author-info">
                        <span class="post-username">${post.username || "Unknown Trader"}</span>
                        <span class="post-time">${timeStr}</span>
                    </div>
                </div>
                <div class="post-content">${escapeHTML(post.content || "")}</div>
                ${tradeHtml}
                <div class="post-actions" style="margin-bottom: 10px;">
                    <button class="post-action-btn ${post.user_liked ? "liked" : ""}" data-post-id="${post.id}">
                        <i class="${post.user_liked ? "ph-fill ph-heart" : "ph ph-heart"}"></i>
                        <span class="like-count">${post.likes || 0}</span>
                    </button>
                </div>
                ${commentsHtml}
                ${commentInputHtml}
            `;
      communityFeedContainer.appendChild(p);
    });

    communityFeedContainer
      .querySelectorAll(".post-action-btn")
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const postId = this.getAttribute("data-post-id");
          toggleLike(postId, this);
        });
      });

    communityFeedContainer
      .querySelectorAll(".post-comment-btn")
      .forEach((btn) => {
        btn.addEventListener("click", async function () {
          const postId = this.getAttribute("data-post-id");
          const input = communityFeedContainer.querySelector(
            `.comment-input[data-post-id="${postId}"]`,
          );
          const text = input.value.trim();
          if (!text) return;

          btn.disabled = true;
          try {
            const token = localStorage.getItem("tm_master_token");
            const r = await fetch(`${API_URL}?action=community_comment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify({ post_id: postId, content: text }),
            }).then((res) => res.json());

            if (r.success) {
              loadCommunityFeed(); // reload to show new comment
            } else {
              alert(r.error || "Fehler beim Posten des Kommentars.");
            }
          } catch (e) {
            alert("Fehler beim Kommentieren.");
          }
          btn.disabled = false;
        });
      });

    communityFeedContainer
      .querySelectorAll(".comment-input")
      .forEach((input) => {
        input.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            const btn = communityFeedContainer.querySelector(
              `.post-comment-btn[data-post-id="${this.getAttribute("data-post-id")}"]`,
            );
            if (btn) btn.click();
          }
        });
      });

    // Add event delegation for post options
    communityFeedContainer
      .querySelectorAll(".post-options-btn")
      .forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          const menu = this.closest(".post-options-menu");
          const dropdown = menu.querySelector(".post-options-dropdown");

          // Close all other dropdowns
          document
            .querySelectorAll(".post-options-dropdown.show")
            .forEach((d) => {
              if (d !== dropdown) d.classList.remove("show");
            });

          dropdown.classList.toggle("show");
        });
      });

    communityFeedContainer
      .querySelectorAll(".delete-post-btn")
      .forEach((btn) => {
        btn.addEventListener("click", async function (e) {
          e.stopPropagation();
          const dropdown = this.closest(".post-options-dropdown");
          const postId = dropdown.getAttribute("data-post-id");
          const currentLang = localStorage.getItem("tm_global_lang") || "de";
          const dict = i18n[currentLang] || i18n["de"];

          if (
            confirm(dict.confirm_delete_post || "Bist du sicher, dass du diesen Beitrag löschen möchtest?")
          ) {
            this.innerHTML = dict.deleting_post || "Lösche...";
            this.disabled = true;
            try {
              const d = await fetch(`${API_URL}?action=community_delete_post`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: localStorage.getItem("tm_master_token"),
                },
                body: JSON.stringify({ post_id: postId }),
              }).then((r) => r.json());

              if (d.success) {
                loadCommunityFeed();
              } else {
                alert((dict.delete_error || "Fehler beim Löschen des Beitrags: ") + (d.error || ""));
                this.innerHTML = `<i class="ph ph-trash"></i> ${dict.delete_post || "Löschen"}`;
                this.disabled = false;
              }
            } catch (e) {
              console.error(e);
              alert(dict.delete_error || "Fehler beim Löschen des Beitrags.");
              this.innerHTML = `<i class="ph ph-trash"></i> ${dict.delete_post || "Löschen"}`;
              this.disabled = false;
            }
          }
        });
      });
  }

  function toggleLike(postId, btnEl) {
    const token = localStorage.getItem("tm_master_token");
    fetch(`${API_URL}?action=community_like`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const countEl = btnEl.querySelector(".like-count");
          const iconEl = btnEl.querySelector("i");
          let count = parseInt(countEl.innerText) || 0;
          if (d.liked) {
            btnEl.classList.add("liked");
            iconEl.className = "ph-fill ph-heart";
            countEl.innerText = count + 1;
          } else {
            btnEl.classList.remove("liked");
            iconEl.className = "ph ph-heart";
            countEl.innerText = Math.max(0, count - 1);
          }
        }
      })
      .catch(console.error);
  }

  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag],
    );
  }

  // --- SHARE MODAL LOGIC ---
  const shareModal = document.getElementById("share-modal");
  const shareModalClose = document.getElementById("share-modal-close");
  const shareModalSubmit = document.getElementById("share-modal-submit");
  const shareModalTicket = document.getElementById("share-modal-ticket");
  const shareTradePreview = document.getElementById("share-trade-preview");
  const shareModalText = document.getElementById("share-modal-text");

  if (shareModalClose) {
    shareModalClose.addEventListener("click", () => {
      shareModal.classList.add("hidden");
    });
  }

  let attachedTradeData = null;

  // Ensure post options dropdowns close when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".post-options-menu")) {
      document
        .querySelectorAll(".post-options-dropdown.show")
        .forEach((d) => d.classList.remove("show"));
    }
  });

  // Composer submit logic
  const composerSubmitBtn = document.getElementById("composer-submit-btn");
  if (composerSubmitBtn) {
    composerSubmitBtn.addEventListener("click", async () => {
      const textarea = document.getElementById("composer-textarea");
      const text = textarea.value.trim();
      const currentLang = localStorage.getItem("tm_global_lang") || "de";
      const dict = i18n[currentLang] || i18n["de"];

      if (!text && !attachedTradeData) {
        alert(dict.composer_empty_warn || "Bitte gib einen Text ein oder wähle einen Trade!");
        return;
      }

      composerSubmitBtn.disabled = true;
      composerSubmitBtn.textContent = dict.loading || "Lädt...";

      const payload = { content: text };
      if (attachedTradeData) {
        payload.trade_data = attachedTradeData;
      }

      try {
        const d = await fetch(`${API_URL}?action=community_post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("tm_master_token"),
          },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (d.success) {
          textarea.value = "";
          attachedTradeData = null;
          const attachedPill = document.getElementById(
            "composer-attached-trade",
          );
          if (attachedPill) {
            attachedPill.classList.add("hidden");
            attachedPill.style.display = "none";
          }
          loadCommunityFeed();
        } else {
          alert("Fehler: " + d.message);
        }
      } catch (err) {
        console.error("Composer error", err);
        alert("Error posting to community.");
      } finally {
        composerSubmitBtn.disabled = false;
        composerSubmitBtn.textContent = dict.composer_submit || "Posten";
      }
    });
  }

  // Attach Trade UI logic
  const attachTradeBtn = document.getElementById("composer-attach-trade-btn");
  const tradeDropdown = document.getElementById("composer-trade-dropdown");
  const tradeList = document.getElementById("composer-trade-list");

  if (attachTradeBtn && tradeDropdown && tradeList) {
    attachTradeBtn.addEventListener("click", () => {
      tradeDropdown.classList.toggle("hidden");
      if (!tradeDropdown.classList.contains("hidden")) {
        tradeDropdown.style.display = "flex";
        tradeList.innerHTML = "";
        const trades = window.currentAllTrades || [];
        if (trades.length === 0) {
          const currentLang = localStorage.getItem("tm_global_lang") || "de";
          const dict = i18n[currentLang] || i18n["de"];
          tradeList.innerHTML =
            `<div style="padding: 10px; color: var(--text-muted); font-size: 0.9rem;">${dict.no_trades_found || "Keine Trades gefunden."}</div>`;
          return;
        }

        trades.slice(0, 10).forEach((t) => {
          const netProfitNum = parseFloat(t.net_profit || 0);
          const profitColor =
            netProfitNum >= 0 ? "var(--success)" : "var(--danger)";
          const holdSec = (t.close_time || 0) - (t.open_time || 0);

          const item = document.createElement("div");
          item.style.cssText =
            "padding: 10px; border-bottom: 1px solid var(--border-dark); cursor: pointer; display: flex; justify-content: space-between; transition: background 0.2s;";
          item.onmouseover = () =>
            (item.style.background = "var(--bg-panel-hover)");
          item.onmouseout = () => (item.style.background = "transparent");
          item.innerHTML = `
              <div><span style="color: var(--text-muted);">${t.symbol}</span> <span style="font-size: 0.85rem;">${t.side}</span></div>
              <div style="color: ${profitColor}; font-weight: bold;">${netProfitNum >= 0 ? "+" : ""}${netProfitNum.toFixed(2)}</div>
           `;
          item.addEventListener("click", () => {
            const imgData = window.tradeImagesMap
              ? window.tradeImagesMap[t.ticket] || {}
              : {};
            const noteData = window.tradeNotesMap
              ? window.tradeNotesMap[t.ticket] || ""
              : "";

            attachedTradeData = {
              ticket: String(t.ticket),
              symbol: t.symbol,
              side: t.side,
              profit: netProfitNum.toFixed(2),
              duration: window.formatHoldTime(holdSec),
              screenshot: imgData.after
                ? imgData.after
                : imgData.before
                  ? imgData.before
                  : null,
              note: noteData,
            };
            document.getElementById("composer-attached-trade-text").innerHTML =
              `<i class="ph ph-paperclip"></i> Anhang: ${t.symbol} ${t.side} <span style="color:${profitColor}; margin-left: 5px;">${netProfitNum >= 0 ? "+" : ""}${netProfitNum.toFixed(2)}</span>`;
            const attachedPill = document.getElementById(
              "composer-attached-trade",
            );
            attachedPill.classList.remove("hidden");
            attachedPill.style.display = "flex";
            tradeDropdown.classList.add("hidden");
            tradeDropdown.style.display = "none";
          });
          tradeList.appendChild(item);
        });
      } else {
        tradeDropdown.style.display = "none";
      }
    });

    const removeBtn = document.getElementById("composer-remove-trade");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        attachedTradeData = null;
        const attachedPill = document.getElementById("composer-attached-trade");
        attachedPill.classList.add("hidden");
        attachedPill.style.display = "none";
      });
    }

    document.addEventListener("click", (e) => {
      if (
        !attachTradeBtn.contains(e.target) &&
        !tradeDropdown.contains(e.target)
      ) {
        tradeDropdown.classList.add("hidden");
        tradeDropdown.style.display = "none";
      }
    });
  }
});


// --- TRADING PSYCHOLOGY & MINDSET DATA & LOGIC ---
// --- TRADING PSYCHOLOGY & MINDSET DATA & LOGIC ---
const psychologyLessons = [
  {
    id: "fomo_trap",
    cat: "fomo",
    readTime: 4,
    title: {
      de: "Die FOMO-Falle überwinden",
      en: "Overcoming the FOMO Trap",
      es: "Superar la Trampa de FOMO",
      tr: "FOMO Tuzağını Aşmak"
    },
    quote: {
      de: "Der Markt hat unendlich viele Chancen. Das Verpassen eines Trades bringt dich nicht um – ein schlechter Trade schon.",
      en: "The market has infinite opportunities. Missing a trade won't kill you – a bad trade will.",
      es: "El mercado tiene infinitas oportunidades. Perderte una operación no te matará; una mala operación sí.",
      tr: "Piyasada sonsuz fırsat vardır. Bir işlemi kaçırmak sizi öldürmez, ama kötü bir işlem öldürür."
    },
    summary: {
      de: "Impulstrades bei schnellen Kerzen entstehen durch die Angst, etwas zu verpassen. Lerne, geduldig auf deinen vorgegebenen Einstieg zu warten.",
      en: "Impulse trades during fast candle movements stem from the fear of missing out. Learn to patiently wait for your planned entry.",
      es: "Las operaciones impulsivas durante velas rápidas surgen del miedo a perderse la oportunidad. Aprende a esperar tu entrada.",
      tr: "Hızlı mum hareketlerinde yapılan anlık işlemler fırsatı kaçırma korkusundan kaynaklanır. Planladığınız girişi sabırla beklemeyi öğrenin."
    },
    content: {
      de: "<p>FOMO (Fear Of Missing Out) ist einer der häufigsten Konto-Killer für Trader aller Erfahrungsstufen. Es tritt auf, wenn du siehst, wie sich eine Kerze aggressiv in eine Richtung bewegt, und dein Gehirn dir vorgaukelt, dass du sofort einsteigen musst, um den 'Gewinn deines Lebens' nicht zu verpassen.</p><p><b>Warum das eine Falle ist:</b> Wenn du in eine bereits stark gelaufene Kerze springst, steigst du fast immer am schlechtesten möglichen Preis ein. Banken und institutionelle Händler nutzen diesen späten Nachfragen-Ansturm, um ihre eigenen Positionen abzuverkaufen.</p><p><b>Die Lösung:</b> Entwickle das Bewusstsein, dass der Markt wie ein Busbahnhof ist. Verpasst du einen Bus, kommt in wenigen Minuten der nächste. Ein regelkonformer Einstieg ist das Einzige, was zählt.</p>",
      en: "<p>FOMO (Fear Of Missing Out) is one of the most common account destroyers for traders of all experience levels. It happens when you see a candle moving aggressively in one direction, and your brain tricks you into believing you must enter right now not to miss out on profit.</p><p><b>Why it's a trap:</b> When you jump into a candle that has already extended, you almost always enter at the worst possible price. Institutional players use this late retail rush to dump their positions onto late buyers.</p><p><b>The Solution:</b> Realize the market is like a bus station. If you miss one bus, another will arrive shortly. Only rule-based entries matter.</p>",
      es: "<p>FOMO (Miedo a Perderse Algo) es uno de los destructores de cuentas más comunes. Ocurre cuando ves una vela moviéndose agresivamente y tu cerebro te obliga a entrar de inmediato.</p><p><b>Por qué es una trampa:</b> Al saltar a una vela ya extendida, entras al peor precio posible. Los institucionales aprovechan este impulso minorista tardío para cerrar sus posiciones.</p><p><b>La Solución:</b> Trata el mercado como una estación de autobuses. Si pierdes uno, vendrá otro pronto. Solo importan las entradas bajo tus reglas.</p>",
      tr: "<p>FOMO (Fırsatı Kaçırma Korkusu) en yaygın hesap batırma nedenlerinden biridir. Hızlı hareket eden bir mum gördüğünüzde zihniniz sizi anında işleme girmeye zorlar.</p><p><b>Neden bir tuzaktır:</b> Zaten ilerlemiş bir muma atladığınızda neredeyse her zaman en kötü fiyattan girersiniz. Kurumsal oyuncular bu geç kalan talebi pozisyonlarını boşaltmak için kullanır.</p><p><b>Çözüm:</b> Piyasayı bir otobüs durağı gibi görün. Birini kaçırırsanız yenisi gelir. Önemli olan sadece kurallarınıza uyan girişlerdir.</p>"
    },
    points: {
      de: [
        "Springe NIEMALS in eine Kerze, die bereits in Bewegung ist.",
        "Erstelle eine klare Watchlist und warte auf den Retest.",
        "Erinnere dich: Das Kapital zu schützen ist wichtiger als Gewinn nachzujagen."
      ],
      en: [
        "NEVER jump into a candle that is already moving fast.",
        "Create a clear watchlist and wait for your specified retest.",
        "Remember: Protecting your capital is more important than chasing gains."
      ],
      es: [
        "NUNCA saltes a una vela que ya se está moviendo rápidamente.",
        "Crea una lista de seguimiento clara y espera la confirmación/retest.",
        "Recuerda: Proteger tu capital es más importante que perseguir ganancias."
      ],
      tr: [
        "Hızlı hareket eden bir muma ASLA sonradan atlamayın.",
        "Net bir izleme listesi oluşturun ve test onayını bekleyin.",
        "Unutmayın: Sermayenizi korumak kâr peşinde koşmaktan daha önemlidir."
      ]
    }
  },
  {
    id: "revenge_trading",
    cat: "fomo",
    readTime: 4,
    title: {
      de: "Revenge Trading stoppen",
      en: "Stopping Revenge Trading",
      es: "Detener el Trading de Venganza",
      tr: "İntikam İşlemlerini Durdurmak"
    },
    quote: {
      de: "Der Markt schuldet dir nichts. Rache an den Märkten ist der schnellste Weg zur Konto-Entleerung.",
      en: "The market owes you nothing. Revenge against the market is the fastest path to a blown account.",
      es: "El mercado no te debe nada. La venganza contra el mercado es la vía más rápida para quemar tu cuenta.",
      tr: "Piyasa size hiçbir şey borçlu değildir. Piyasadan intikam almaya çalışmak hesabı sıfırlamanın en hızlı yoludur."
    },
    summary: {
      de: "Der Drang, nach einem Verlust sofort mit höherem Risiko einzusteigen, ist rein emotional. Schalte dein Gehirn zurück in den Analyse-Modus.",
      en: "The urge to enter immediately with higher lot size after a loss is purely emotional. Reset your mindset to analytical mode.",
      es: "La necesidad de entrar inmediatamente con mayor riesgo tras una pérdida es puramente emocional. Vuelve al modo analítico.",
      tr: "Kayıptan hemen sonra daha yüksek riskle işleme girme isteği tamamen duygusaldır. Zihninizi tekrar analitik moda alın."
    },
    content: {
      de: "<p>Revenge Trading entsteht durch eine verletzte Ego-Reaktion. Wenn ein Trade im Stop Loss endet, empfindet das Gehirn den Verlust als persönlichen Angriff oder Ungerechtigkeit.</p><p><b>Das gefährliche Schema:</b> Du verdoppelst die Lotgröße, ignorierst deine Analyse und willst das verlorene Geld 'sofort zurückholen'. Innerhalb von 30 Minuten entsteht so ein irreparabler Drawdown.</p><p><b>Wie du dich schützt:</b> Errichte eine eiserne Firewall. Nach 2 Verlusten in Folge herrscht absolutes Handelsverbot für mindestens 30 Minuten. Schließe deine Trading-Plattform und mache einen Spaziergang.</p>",
      en: "<p>Revenge trading is triggered by a bruised ego. When a trade hits your stop loss, your brain interprets the loss as a personal threat or injustice.</p><p><b>The Dangerous Loop:</b> You double your position size, ignore your setup, and demand your money back right now. Within 30 minutes, a manageable loss turns into account destruction.</p><p><b>Protection:</b> Build a circuit breaker. After 2 consecutive losses, enforce a strict mandatory 30-minute cooling-off period away from all screens.</p>",
      es: "<p>El trading de venganza nace de un ego herido. Cuando saltas un stop loss, tu cerebro interpreta la pérdida como una ofensa personal.</p><p><b>Bucle peligroso:</b> Duplicas el riesgo, ignoras tu plan y quieres recuperar el dinero de inmediato. En 30 minutos quemas la cuenta.</p><p><b>Protección:</b> Establece un cortafuegos. Tras 2 pérdidas seguidas, desconecta 30 minutos de la pantalla de forma obligatoria.</p>",
      tr: "<p>İntikam işlemleri incinmiş bir egodan kaynaklanır. Stop olduğunuzda zihniniz kaybı kişisel bir haksızlık olarak görür.</p><p><b>Tehlikeli Döngü:</b> Lotu ikiye katlar, planı unutur ve paranızı hemen geri istersiniz. 30 dakikada yönetilebilir kayıp felakete dönüşür.</p><p><b>Korunma:</b> Güvenlik şalteri koyun. Üst üste 2 kayıptan sonra en az 30 dakika ekrandan kesinlikle uzaklaşın.</p>"
    },
    points: {
      de: [
        "Nach 2 Verlusten in Folge zwingend 15 Minuten den Bildschirm verlassen.",
        "Aktiviere dein Daily Loss Limit (Kill Switch) und akzeptiere Stopps.",
        "Verluste sind normale Betriebskosten im Trading-Business."
      ],
      en: [
        "After 2 consecutive losses, step away from the screen for at least 15 minutes.",
        "Respect your Daily Loss Limit (Kill Switch) without exceptions.",
        "Accept losses as standard cost of doing business in trading."
      ],
      es: [
        "Tras 2 pérdidas consecutivas, aléjate de la pantalla al menos 15 minutos.",
        "Respeta tu Límite de Pérdida Diaria (Kill Switch) sin excepciones.",
        "Acepta las pérdidas como costes operativos normales en el trading."
      ],
      tr: [
        "Üst üste 2 kayıptan sonra en az 15 dakika ekrandan uzaklaşın.",
        "Günlük Kayıp Sınırınıza (Kill Switch) istisnasız uyun.",
        "Kayıpları trading işinin doğal bir maliyeti olarak kabul edin."
      ]
    }
  },
  {
    id: "probabilistic_thinking",
    cat: "mindset",
    readTime: 5,
    title: {
      de: "Denken in Wahrscheinlichkeiten",
      en: "Thinking in Probabilities",
      es: "Pensar en Probabilidades",
      tr: "Olasılıklara Göre Düşünmek"
    },
    quote: {
      de: "Jeder einzelne Trade hat ein zufälliges Ergebnis. Der Kantenvorteil zeigt sich erst über eine Serie von 30-50 Trades.",
      en: "Every single trade outcome is random. Your edge only manifests over a sample size of 30-50 trades.",
      es: "El resultado de cada operación individual es aleatorio. Tu ventaja solo se manifiesta en una muestra de 30-50 operaciones.",
      tr: "Her tekil işlemin sonucu rastgeledir. Kenar avantajınız ancak 30-50 işlemlik bir seride ortaya çıkar."
    },
    summary: {
      de: "Mark Douglas lehrte: Ein Verlust bedeutet nicht, dass du falsch lagst, sondern nur, dass die Verteilung der Ergebnisse gegenschlug.",
      en: "Mark Douglas taught: A loss doesn't mean you were wrong, only that the distribution of outcomes varied.",
      es: "Mark Douglas enseñó: Una pérdida no significa que te equivocaste, solo que la distribución de resultados varió.",
      tr: "Mark Douglas'ın öğrettiği gibi: Bir kayıp haksız olduğunuz anlamına gelmez, sadece olasılık dağılımının o anki sonucudur."
    },
    content: {
      de: "<p>In seinem Buch <i>'Trading in the Zone'</i> beschreibt Mark Douglas den fundamentalen Unterschied zwischen Anfängern und Profis: Anfänger suchen nach Gewissheit bei jedem einzelnen Trade, während Profis wissen, dass das Ergebnis jedes einzelnen Trades rein zufällig ist.</p><p><b>Das Casino-Prinzip:</b> Ein Roulettetisch beim Roulette gewinnt nicht jedes Mal. Das Casino weiß aber, dass es über 1.000 Spiele hinweg einen mathematischen Vorteil von 2.7% hat. Genau so musst du dein Trading betrachten.</p><p><b>Praktische Umsetzung:</b> Höre auf, dich nach einem Verlust zu fragen 'Was habe ich falsch gemacht?'. Wenn du deine Regeln eingehalten hast, war der Trade perfekt – egal wie er ausging!</p>",
      en: "<p>In <i>'Trading in the Zone'</i>, Mark Douglas highlights the core difference between novices and pros: novices look for certainty on a trade-by-trade basis, while pros understand that outcomes are randomly distributed.</p><p><b>The Casino Principle:</b> A casino doesn't win every single spin of roulette. But over 1,000 spins, its 2.7% edge guarantees profit. Treat your strategy like a casino edge.</p><p><b>Action:</b> Stop asking 'What did I do wrong?' after a valid stop loss. If you followed your plan, the execution was 100% successful regardless of PnL.</p>",
      es: "<p>En <i>'Trading en la Zona'</i>, Mark Douglas explica que los principiantes buscan certeza en cada operación, mientras que los profesionales piensan en probabilidades sobre muestras grandes.</p><p><b>El Principio del Casino:</b> El casino no gana cada ruleta, pero la ventaja matemática del 2.7% le da ganancias tras 1.000 tiradas. Así debes ver tu sistema.</p><p><b>Acción:</b> Deja de culparte tras un stop loss si seguiste tus reglas. Si ejecutaste el plan, la operación fue un éxito.</p>",
      tr: "<p>Mark Douglas <i>'Disiplinli Trader'</i> kitabında profesyonellerin her tekil işlemin sonucunun rastgele dağıldığını bildiğini belirtir.</p><p><b>Kasa Mantığı:</b> Kumarhane her rulet turunu kazanmaz ama 1.000 turda %2.7'lik avantajı kârı garantiler. Stratejinizi kumarhane avantajı gibi görün.</p><p><b>Uygulama:</b> Kurallara uyduğunuz bir kayıptan sonra kendinizi suçlamayı bırakın. Plana uyduysanız işlem %100 başarılıdır.</p>"
    },
    points: {
      de: [
        "Fokussiere dich auf die makellose Ausführung des Systems, nicht auf den $ Gewinn.",
        "Bewerte deine Performance immer in Blöcken von 20 Trades.",
        "Ein Verlust bei regelkonformer Ausführung ist ein ERFOLGREICHER Trade."
      ],
      en: [
        "Focus on flawless process execution rather than single-trade dollar gains.",
        "Always evaluate your performance in blocks of 20 trades.",
        "A loss executed strictly according to your rules is a SUCCESSFUL trade."
      ],
      es: [
        "Concéntrate en la ejecución impecable del proceso en lugar del beneficio monetario.",
        "Evalúa siempre tu rendimiento en bloques de 20 operaciones.",
        "Una pérdida ejecutada estrictamente según tus reglas es una operación EXITOSA."
      ],
      tr: [
        "Tekil dolarlık kâr yerine sürecin kusursuz uygulanmasına odaklanın.",
        "Performansınızı her zaman 20 işlemlik bloklar halinde değerlendirin.",
        "Kurallarınıza göre disiplinle kapatılan bir kayıp BAŞARILI bir işlemdir."
      ]
    }
  },
  {
    id: "stop_loss_widening",
    cat: "risk",
    readTime: 4,
    title: {
      de: "Stop-Loss Disziplin & Hoffnungstrading",
      en: "Stop-Loss Discipline & Hope Trading",
      es: "Disciplina de Stop-Loss y Trading de Esperanza",
      tr: "Stop-Loss Disiplini ve Umut Ticareti"
    },
    quote: {
      de: "Das Verschieben deines Stop-Loss in den Verlustbereich verwandelt ein kontrolliertes Risiko in eine Katastrophe.",
      en: "Moving your stop loss deeper into negative territory converts controlled risk into uncontrollable disaster.",
      es: "Mover tu stop loss más profundo en pérdidas convierte un riesgo controlado en un desastre incontrolable.",
      tr: "Stop loss seviyenizi zarara doğru genişletmek, kontrollü bir riski kontrolden çıkan bir felakete dönüştürür."
    },
    summary: {
      de: "Hoffnung ist keine Trading-Strategie. Wenn der Preis deinen SL nähert, akzeptiere den definierten Verlust und bewahre dein Kapital.",
      en: "Hope is not a trading strategy. When price approaches your stop, take the loss and protect your longevity.",
      es: "La esperanza no es una estrategia. Cuando el precio se acerque a tu stop loss, acepta la pérdida y protege tu capital.",
      tr: "Umut bir işlem stratejisi değildir. Fiyat stop noktanıza yaklaştığında zararı kabullenin ve sermayenizi koruyun."
    },
    content: {
      de: "<p>Das manuelle Erweitern oder Löschen eines Stop Loss während der Trade läuft, gehört zu den gefährlichsten psychologischen Fehlern überhaupt. Es entspringt der Unfähigkeit des Gehirns, einen schmerzvollen Verlust im Hier und Jetzt zu akzeptieren.</p><p><b>Die Illusion:</b> Trader reden sich ein: 'Der Markt dreht gleich, ich gebe ihm nur noch 10 Pips Platz.' Oft dreht der Markt erst, wenn das gesamte Konto platzt.</p><p><b>Goldene Regel:</b> Dein Stop Loss darf NIEMALS nach unten (in den Verlust) verschoben werden. Er darf ausschließlich zur Absicherung von Gewinnen (Break Even / Trailing Stop) nachgezogen werden!</p>",
      en: "<p>Manually moving or removing your stop loss while a trade is running is a deadly psychological trap. It comes from the brain's unwillingness to realize a loss immediately.</p><p><b>The Illusion:</b> Traders tell themselves 'It will turn around, just 10 more pips.' Usually the market turns around right after blowing the whole account.</p><p><b>Golden Rule:</b> Never widen a stop loss into drawdown. Trailing into profit is allowed; widening into loss is strictly forbidden.</p>",
      es: "<p>Ampliar o quitar el stop loss con la operación abierta es un error fatal producido por no querer aceptar la pérdida.</p><p><b>Ilusión:</b> Te dices 'Ya se dará la vuelta, le doy 10 pips más'. El mercado se da la vuelta tras liquidarte la cuenta.</p><p><b>Regla de Oro:</b> El stop loss NUNCA se mueve a favor de la pérdida. Solo se mueve para asegurar ganancias (Break Even).</p>",
      tr: "<p>Açık işlemde stop loss'u eksiye çekmek veya kaldırmak büyük bir psikolojik hatadır. Kaybı kabul edememe duygusundan doğar.</p><p><b>İllüzyon:</b> 'Birazdan döner, 10 pip daha vereyim' dersiniz. Piyasa genelde hesabınız sıfırlandıktan sonra döner.</p><p><b>Altın Kural:</b> Stop seviyesi ASLA zarara doğru esnetilmez. Sadece kârı korumak için çekilebilir.</p>"
    },
    points: {
      de: [
        "Setze den Stop Loss VOR dem Einstieg und passe ihn NIEMALS ins Negative an.",
        "Akzeptiere den genauen Geldbetrag des Verlustes vor Klick auf den Orderbutton.",
        "Dein Stop Loss ist dein bester Freund, der dich vor dem Ruin bewahrt."
      ],
      en: [
        "Set your stop loss BEFORE entering and NEVER widen it into negative territory.",
        "Accept the exact dollar loss amount mentally before clicking buy or sell.",
        "Your stop loss is your bodyguard preserving your trading account."
      ],
      es: [
        "Establece tu stop loss ANTES de entrar y NUNCA lo amplíes en pérdidas.",
        "Acepta mentalmente la cantidad exacta de dinero a arriesgar antes de operar.",
        "Tu stop loss es tu guardaespaldas para proteger tu cuenta de trading."
      ],
      tr: [
        "Stop loss seviyenizi girmeden ÖNCE belirleyin ve ASLA eksiye doğru genişletmeyin.",
        "İşleme basmadan önce riske ettiğiniz tam tutarı zihnen kabul edin.",
        "Stop loss'unuz sizi büyük kayıplardan koruyan en iyi dostunuzdur."
      ]
    }
  },
  {
    id: "accepting_risk",
    cat: "risk",
    readTime: 4,
    title: {
      de: "Echtes Akzeptieren des Risikos",
      en: "Truly Accepting the Risk",
      es: "Aceptar Realmente el Riesgo",
      tr: "Riski Gerçekten Kabul Etmek"
    },
    quote: {
      de: "Spürst du vor dem Trade Herzklopfen? Dann ist deine Lotgröße zu hoch für dein Nervensystem.",
      en: "Feeling heart palpitations before opening a trade? Your lot size is too big for your nervous system.",
      es: "¿Sientes palpitaciones antes de abrir una operación? Tu tamaño de lote es demasiado grande para tu sistema nervioso.",
      tr: "İşlem açmadan önce kalp çarpıntısı mı hissediyorsunuz? Lot büyüklüğünüz sinir sisteminiz için çok fazla."
    },
    summary: {
      de: "Wahres Akzeptieren bedeutet, dass dich der Verlust emotional völlig kalt lässt, weil die Positionsgröße perfekt angepasst ist.",
      en: "True risk acceptance means feeling completely calm about a loss because your position size is properly calibrated.",
      es: "La verdadera aceptación del riesgo significa mantener la calma total ante una pérdida gracias a un lotaje calibrado.",
      tr: "Riski gerçekten kabul etmek, pozisyon büyüklüğünüz doğru ayarlandığı için kayıp durumunda tamamen sakin kalmaktır."
    },
    content: {
      de: "<p>Es gibt einen gewaltigen Unterschied zwischen dem Wissen, dass ein Trade verlieren kann, und dem <b>echten Akzeptieren</b> des Verlustes. Wenn du beim Einstieg zögerst, Angst verspürst oder deine Position alle 5 Sekunden aktualisierst, hast du das Risiko nicht akzeptiert.</p><p><b>Positionsgröße reduzieren:</b> Das einfachste Heilmittel für Trading-Angst ist die Reduzierung der Lotgröße. Wenn du nur 0.5% deines Kontos riskierst, verliert ein Stop Loss seine emotionale Macht über dich.</p>",
      en: "<p>There is a vast difference between knowing a trade can lose and <b>truly accepting</b> the loss. If you hesitate to enter or check prices every 5 seconds, you haven't accepted the risk.</p><p><b>Reduce Position Size:</b> The ultimate cure for trading anxiety is cutting your lot size. Risking 0.5% per trade disarms emotional pain.</p>",
      es: "<p>Hay una gran diferencia entre saber que puedes perder y <b>aceptar realmente</b> la pérdida. Si dudas al entrar o miras la pantalla cada 5 segundos, no has aceptado el riesgo.</p><p><b>Reduce el Lotaje:</b> La cura contra la ansiedad es reducir la posición. Arriesgar solo el 0.5% elimina el dolor emocional.</p>",
      tr: "<p>Bir işlemin kaybedebileceğini bilmek ile kaybı <b>gerçekten kabul etmek</b> arasında dağlar kadar fark vardır. Tereddüt ediyorsanız riski kabul etmemişsinizdir.</p><p><b>Lotu Düşürün:</b> İşlem kaygısının en net çözümü lot büyüklüğünü azaltmaktır. %0.5 risk almak duygusal baskıyı sıfırlar.</p>"
    },
    points: {
      de: [
        "Riskere pro Trade nie mehr als 1-2% deines Gesamtkapitals.",
        "Wenn du Angst hast den Auslöser zu drücken, halbiere deine Lotgröße.",
        "Trading muss sich langweilig und hochprofessionell anfühlen."
      ],
      en: [
        "Never risk more than 1-2% of your account per trade.",
        "If you feel hesitant to execute, cut your lot size in half.",
        "Professional trading should feel structured, calm, and boring."
      ],
      es: [
        "Nunca arriesgues más del 1-2% de tu cuenta por operación.",
        "Si sientes dudas para ejecutar, reduce el tamaño de lote a la mitad.",
        "El trading profesional debe sentirse estructurado, tranquilo y metódico."
      ],
      tr: [
        "Her işlemde hesabınızın en fazla %1-2'sini riske atın.",
        "Tetiği çekerken tereddüt ediyorsanız lot büyüklüğünüzü yarıya indirin.",
        "Profesyonel trading yapılı, sakin ve disiplinli hissettirmelidir."
      ]
    }
  },
  {
    id: "overconfidence_streak",
    cat: "discipline",
    readTime: 3,
    title: {
      de: "Die Falle der Gewinnsträhne",
      en: "The Winning Streak Trap",
      es: "La Trampa de la Racha Ganadora",
      tr: "Kazanan Seri Tuzağı"
    },
    quote: {
      de: "Nach 5 Gewinnen in Folge fühlst du dich unbesiegbar. Genau dort lauert der größte Verlust.",
      en: "After 5 wins in a row you feel invincible. That is precisely when your biggest loss threatens.",
      es: "Tras 5 victorias consecutivas te sientes invencible. Ahí es exactamente donde amenaza la mayor pérdida.",
      tr: "Üst üste 5 kazançtan sonra kendinizi yenilmez hissedersiniz. İşte en büyük kaybın kapıda beklediği an odur."
    },
    summary: {
      de: "Gewinnserien verleiten zu Leichtsinn, Regelauslegungen und unzulässigem Überhebeln. Bleibe nach Erfolgen besonders wachsam.",
      en: "Winning streaks induce recklessness, rule-bending, and over-leveraging. Stay extra vigilant after profitable streaks.",
      es: "Las rachas ganadoras inducen a la imprudencia, saltarse reglas y sobreapalancarse. Mantén la disciplina tras el éxito.",
      tr: "Kazanç serileri dikkatsizliğe, kuralları esnetmeye ve aşırı kaldıraca yol açar. Başarılı serilerden sonra ekstra dikkatli olun."
    },
    content: {
      de: "<p>Viele Trader glauben, dass Verluste die größte Gefahr darstellen. In Wirklichkeit ist Euphorie nach einer Gewinnsträhne viel gefährlicher. Das Gehirn schüttet Dopamin aus und vermittelt das trügerische Gefühl, 'den Markt geknackt zu haben'.</p><p><b>Die Folge:</b> Du verdoppelst unüberlegt die Lotgröße, nimmst Setups zweiter Wahl und verzichtest auf den Stop Loss. Ein einziger übergroßer Verlust wischt die Gewinne von zwei Wochen weg.</p>",
      en: "<p>Many believe losses are the main danger. In reality, euphoria following a winning streak is far more fatal. Dopamine floods your brain, convincing you that you have mastered the market.</p><p><b>The Consequence:</b> You double your lots, trade B-grade setups, and skip stops. One oversized trade wipes out two weeks of hard work.</p>",
      es: "<p>Muchos creen que las pérdidas son el gran peligro, pero la euforia tras ganar 5 operaciones seguidas es peor. El cerebro se llena de dopamina.</p><p><b>Consecuencia:</b> Duplicas lotes, operas setups de baja calidad y quitas el stop loss. Una mala operación destruye dos semanas de ganancias.</p>",
      tr: "<p>Pek çok kişi kaybın en büyük tehlike olduğunu sanır. Oysa kazanç serisi sonrası öfori çok daha tehlikelidir. Zihin piyasayı çözdüğünü sanır.</p><p><b>Sonuç:</b> Lotu rastgele artırır, kötü kurulumları alır ve stop koymazsınız. Tek bir işlem 2 haftalık kârı siler.</p>"
    },
    points: {
      de: [
        "Erhöhe deine Lotgröße NICHT spontan nur weil die letzten Trades Gewinner waren.",
        "Schreibe Erfolge deinem System zu, nicht deinem eigenen Ego.",
        "Setze dir Tagesgewinn-Ziele und schließe die Plattform rechtzeitig."
      ],
      en: [
        "DO NOT randomly boost lot sizes just because your recent trades were winners.",
        "Attribute success to your system process, not your ego.",
        "Set daily profit goals and lock in your wins by closing the terminal."
      ],
      es: [
        "NO aumentes el lotaje al azar solo porque tus últimas operaciones fueron ganadoras.",
        "Atribuye el éxito a tu sistema y proceso, no a tu ego.",
        "Establece metas de beneficio diario y cierra la plataforma a tiempo."
      ],
      tr: [
        "Son işlemleriniz kazandı diye lot büyüklüklerini rastgele ARTTIRMAYIN.",
        "Başarıyı egonuza değil, sisteminize ve sürecinize bağlayın.",
        "Günlük kâr hedeflerinizi belirleyin ve zamanında ekranı kapatın."
      ]
    }
  },
  {
    id: "patience_wait",
    cat: "discipline",
    readTime: 4,
    title: {
      de: "Die Kunst des Warten & Geduld",
      en: "The Art of Waiting & Patience",
      es: "El Arte de Esperar y la Paciencia",
      tr: "Bekleme Sanatı ve Sabır"
    },
    quote: {
      de: "Gute Trader verbringen 90% ihrer Zeit mit Warten und nur 10% mit der Ausführung.",
      en: "Good traders spend 90% of their time waiting and only 10% executing.",
      es: "Los buenos traders pasan el 90% de su tiempo esperando y solo el 10% ejecutando.",
      tr: "İyi traderlar zamanlarının %90'ını bekleyerek, sadece %10'unu işlem yaparak geçirir."
    },
    summary: {
      de: "Lerne zu akzeptieren, dass an manchen Tagen kein valides Setup vorhanden ist. Kein Trade ist auch eine Position.",
      en: "Learn to accept that on some days there is simply no valid setup. Sitting on hands is a profitable position.",
      es: "Aprende a aceptar que algunos días simplemente no hay setups válidos. No operar también es una posición.",
      tr: "Bazı günler uygun kurulum olmadığını kabul etmeyi öğrenin. İşlem yapmamak da bir pozisyondur."
    },
    content: {
      de: "<p>Anfängern fällt es extrem schwer, vor dem Bildschirm zu sitzen und 3 Stunden lang keinen Klick zu tätigen. Sie verwechseln Aktivität mit Produktivität. Im Trading wird man jedoch fürs Warten bezahlt, nicht fürs Viel-Traden.</p><p><b>Erkenntnis:</b> Wenn dein Setup nicht 100% erfüllt ist, ist das Beste was du tun kannst: Nichts tun. Kapital erhalten ist die höchste Priorität.</p>",
      en: "<p>Beginners struggle to sit in front of charts for 3 hours without taking action. They confuse busyness with profitability. In trading, you are paid for waiting for your edge.</p><p><b>Insight:</b> If your setup isn't 100% valid, the smartest move is doing nothing. Capital preservation is priority #1.</p>",
      es: "<p>A los novatos les cuesta estar 3 horas mirando gráficos sin operar. Confunden actividad con rentabilidad. En trading te pagan por esperar tu ventaja.</p><p><b>Lección:</b> Si tu setup no cumple las reglas al 100%, no hagas nada. Preservar capital es lo primero.</p>",
      tr: "<p>Yeni başlayanlar 3 saat ekran başında işlem açmadan durmakta zorlanır. Yoğunluğu kazançla karıştırırlar. Tradingde bekleme disiplinine ödeme yapılır.</p><p><b>İpucu:</b> Kurulumunuz %100 uymuyorsa hiçbir şey yapmayın. Sermayeyi korumak ilk kuraldır.</p>"
    },
    points: {
      de: [
        "Setze dir feste Regeln für A+ Setups.",
        "Steige nur ein, wenn alle Bedingungen der Strategie erfüllt sind.",
        "Wiederhole das Mantra: 'Kein Trade ist ein guter Trade'."
      ],
      en: [
        "Establish clear non-negotiable rules for A+ setups.",
        "Enter only when 100% of your checklist conditions are met.",
        "Repeat the mantra: 'No trade is a good trade'."
      ],
      es: [
        "Establece reglas no negociables para setups A+.",
        "Entra solo cuando se cumplan todas las condiciones de tu lista.",
        "Repite la premisa: 'No operar también es ganar'."
      ],
      tr: [
        "A+ kurulumlar için esnetilemez kurallar koyun.",
        "Sadece tüm kontrol listesi onaylandığında işleme girin.",
        "'İşlem yapmamak da doğru bir karardır' mottosunu hatırlayın."
      ]
    }
  },
  {
    id: "drawdown_resilience",
    cat: "risk",
    readTime: 5,
    title: {
      de: "Mentale Stärke im Drawdown",
      en: "Mental Resilience in Drawdown",
      es: "Fortaleza Mental en Drawdown",
      tr: "Drawdown Sırasında Zihinsel Dayanıklılık"
    },
    quote: {
      de: "Ein Drawdown testet nicht dein System, sondern deinen Charakter.",
      en: "A drawdown tests your character far more than your system.",
      es: "Un drawdown prueba tu carácter mucho más que tu sistema.",
      tr: "Bir drawdown sisteminizi değil, karakterinizi test eder."
    },
    summary: {
      de: "Wie du Phasen von aufeinanderfolgenden Verlusten überstehst, ohne dein System im Frust über den Haufen zu werfen.",
      en: "How to survive periods of consecutive losses without abandoning a proven system out of frustration.",
      es: "Cómo sobrevivir a rachas de pérdidas sin abandonar un sistema probado por pura frustración.",
      tr: "Kayıp serilerini frustrated olup kanıtlanmış sisteminizi terk etmeden nasıl atlatırsınız."
    },
    content: {
      de: "<p>Jedes rentable Handelsmodell durchläuft statistisch bedingte Verlustserien (Drawdowns). Der Verlust von 5-8 Trades in Folge ist bei einer 50% Gewinnrate mathematisch völlig normal.</p><p><b>Der häufigste Fehler:</b> Nach 4 Verlusten wechselt der Trader die Strategie (System Hopping). Er verlässt das System genau an dem Punkt, an dem die nächste Gewinnsträhne einsetzen würde.</p>",
      en: "<p>Every profitable trading strategy encounters statistical drawdowns. Losing 5-8 trades in a row with a 50% win rate is mathematically bound to happen over time.</p><p><b>System Hopping Trap:</b> Traders abandon their strategy right after a loss streak, missing the inevitable recovery phase.</p>",
      es: "<p>Todo sistema rentable sufre rachas de pérdidas. Perder 5-8 operaciones seguidas con un 50% de acierto es matemáticamente normal.</p><p><b>Trampa de cambiar de sistema:</b> Abandonar la estrategia tras una racha mala evita aprovechar la fase ganadora posterior.</p>",
      tr: "<p>Kârlı her strateji istatistiksel kayıp dönemleri yaşar. %50 kazanma oranında üst üste 5-8 kayıp matematiksel olarak kaçınılmazdır.</p><p><b>Sistem Değiştirme Tuzağı:</b> Kayıp serisinden sonra stratejiyi bırakmak, hemen ardından gelecek toparlanmayı kaçırmanıza neden olur.</p>"
    },
    points: {
        de: [
          "Verstehe, dass Drawdowns mathematisch unvermeidbar sind.",
          "Reduziere im Drawdown dein Risiko pro Trade um die Hälfte.",
          "Wechsle nicht vorschnell die Strategie."
        ],
        en: [
          "Understand that drawdowns are mathematically inevitable.",
          "Cut your risk per trade in half during a drawdown.",
          "Do not change strategies impulsively."
        ],
        es: [
          "Entiende que las pérdidas seguidas son matemáticamente inevitables.",
          "Reduce tu riesgo a la mitad durante el drawdown.",
          "No cambies de estrategia impulsivamente."
        ],
        tr: [
          "Drawdown dönemlerinin matematiksel olarak kaçınılmaz olduğunu bilin.",
          "Kayıp serisinde işlem başına riski yarıya indirin.",
          "Aceleyle strateji değiştirmeyin."
        ]
      }
    }
  ];

let activePsychCat = "all";

function renderPsychologyLessons() {
  const container = document.getElementById("psychology-articles-grid");
  if (!container) return;

  const currentLang = localStorage.getItem("tm_global_lang") || "de";
  const dict = i18n[currentLang] || i18n["de"];

  container.innerHTML = "";

  const filtered = psychologyLessons.filter((item) => {
    return activePsychCat === "all" || item.cat === activePsychCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;" data-i18n="no_trades_found">Keine Lektionen gefunden.</div>`;
    return;
  }

  filtered.forEach((item) => {
    const titleText = item.title[currentLang] || item.title["de"];
    const quoteText = item.quote[currentLang] || item.quote["de"];
    const summaryText = item.summary[currentLang] || item.summary["de"];
    const catLabel = dict[`cat_${item.cat}`] || item.cat.toUpperCase();
    const readLessonLabel = dict.read_lesson || "Lektion lesen";

    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.cssText = "padding: 20px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, border-color 0.2s; border: 1px solid var(--border-dark); cursor: pointer;";
    card.onmouseover = () => {
      card.style.borderColor = "var(--accent-color)";
      card.style.transform = "translateY(-2px)";
    };
    card.onmouseout = () => {
      card.style.borderColor = "var(--border-dark)";
      card.style.transform = "translateY(0)";
    };

    // Clicking card opens modal
    card.addEventListener("click", () => {
      openPsychologyModal(item.id);
    });

    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; background: rgba(0, 242, 254, 0.1); color: var(--accent-color); border: 1px solid rgba(0, 242, 254, 0.2);">${catLabel}</span>
        </div>
        <h3 style="margin: 0 0 10px 0; font-size: 1.15rem; color: var(--text-main);">${titleText}</h3>
        <p style="font-size: 0.85rem; font-style: italic; color: var(--accent-color); margin-bottom: 12px; padding: 8px 12px; background: rgba(255,255,255,0.03); border-left: 3px solid var(--accent-color); border-radius: 4px;">
          "${quoteText}"
        </p>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">${summaryText}</p>
      </div>
      <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-dark); padding-top: 14px;">
        <button class="secondary-btn read-lesson-btn" style="padding: 6px 14px; font-size: 0.82rem; display: flex; align-items: center; gap: 6px; color: var(--accent-color); border-color: rgba(0, 242, 254, 0.3); background: rgba(0, 242, 254, 0.05);">
          <i class="ph ph-book-open"></i> ${readLessonLabel}
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function openPsychologyModal(lessonId) {
  const lesson = psychologyLessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  const currentLang = localStorage.getItem("tm_global_lang") || "de";
  const dict = i18n[currentLang] || i18n["de"];

  const modal = document.getElementById("psychology-modal");
  const catEl = document.getElementById("psych-modal-cat");
  const titleEl = document.getElementById("psych-modal-title");
  const quoteEl = document.getElementById("psych-modal-quote");
  const bodyEl = document.getElementById("psych-modal-body");
  const timeEl = document.getElementById("psych-modal-time");

  if (catEl) catEl.innerText = dict[`cat_${lesson.cat}`] || lesson.cat.toUpperCase();
  if (titleEl) titleEl.innerText = lesson.title[currentLang] || lesson.title["de"];
  if (quoteEl) quoteEl.innerText = `"${lesson.quote[currentLang] || lesson.quote["de"]}"`;

  const bodyHtml = lesson.content && lesson.content[currentLang] 
    ? lesson.content[currentLang] 
    : (lesson.content ? lesson.content["de"] : `<p>${lesson.summary[currentLang] || lesson.summary["de"]}</p>`);

  const pointsList = lesson.points[currentLang] || lesson.points["de"];
  const pointsHtml = pointsList 
    ? `<div style="margin-top: 20px; padding: 14px; background: rgba(0, 242, 254, 0.04); border-radius: 8px; border: 1px solid rgba(0, 242, 254, 0.15);"><h4 style="margin: 0 0 10px 0; color: var(--accent-color); font-size: 0.9rem;">Key Takeaways:</h4><ul style="padding-left: 18px; margin: 0; font-size: 0.88rem; line-height: 1.6;">${pointsList.map(p => `<li style="margin-bottom: 6px;">${p}</li>`).join("")}</ul></div>` 
    : "";

  if (bodyEl) bodyEl.innerHTML = bodyHtml + pointsHtml;
  if (timeEl) timeEl.innerHTML = `<i class="ph ph-clock"></i> ${lesson.readTime} ${dict.read_time || "Min. Lesezeit"}`;

  if (modal) modal.classList.remove("hidden");
}

function triggerPsychologyAICoach(lessonId) {
  const lesson = psychologyLessons.find((l) => l.id === lessonId);
  if (!lesson) return;
  const currentLang = localStorage.getItem("tm_global_lang") || "de";
  const lessonTitle = lesson.title[currentLang] || lesson.title["de"];

  const coachTabBtn = document.querySelector('.sidebar-nav-item[data-tab="tab-coach"]');
  if (coachTabBtn) {
    coachTabBtn.click();
    const coachInput = document.getElementById("coach-prompt-input");
    if (coachInput) {
      coachInput.value = `Wie betrifft mich das Thema "${lessonTitle}" basierend auf meinen letzten Trades und meinen Statistiken?`;
      coachInput.focus();
    }
  }
}

// Modal Close logic
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("close-psychology-modal");
  const modal = document.getElementById("psychology-modal");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  }
});
