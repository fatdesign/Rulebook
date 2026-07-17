const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");

      async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      async function setupMasterTables(env) {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            token TEXT UNIQUE
          )
        `).run();
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS user_accounts (
            user_id TEXT,
            license_key TEXT,
            alias TEXT,
            PRIMARY KEY (user_id, license_key)
          )
        `).run();
      }

      // --- Helper for Auth ---
      async function authenticateUser(request, env) {
        await setupMasterTables(env);
        const authHeader = request.headers.get("Authorization");
        const urlParams = new URL(request.url).searchParams;
        
        let token = authHeader;
        if (!token && urlParams.get("token")) {
            token = urlParams.get("token");
        }
        
        // 1. Check Master Token (Web Dashboard)
        if (token && !token.includes(":")) {
            const user = await env.DB.prepare("SELECT id FROM users WHERE token = ?").bind(token).first();
            if (user) return user.id;
        }
        
        // 2. Check Email:Password (EA)
        if (token && token.includes(":")) {
            const [email, password] = token.split(":");
            const hash = await hashPassword(password);
            const user = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND password_hash = ?").bind(email, hash).first();
            if (user) return user.id;
        }
        
        return null;
      }

      // --- MASTER ACCOUNT ROUTES ---
      if (request.method === "POST" && action === "register") {
        await setupMasterTables(env);
        const body = await request.json();
        if (!body.email || !body.password) return new Response("Email and password required", { status: 400, headers: corsHeaders });
        
        const existing = await env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(body.email).first();
        if (existing) return new Response(JSON.stringify({ error: "Email already registered" }), { status: 400, headers: corsHeaders });
        
        const id = crypto.randomUUID();
        const hash = await hashPassword(body.password);
        const token = crypto.randomUUID(); 
        
        await env.DB.prepare("INSERT INTO users (id, email, password_hash, token) VALUES (?, ?, ?, ?)")
          .bind(id, body.email, hash, token).run();
          
        return new Response(JSON.stringify({ success: true, token, email: body.email }), { headers: corsHeaders });
      }

      if (request.method === "POST" && action === "login") {
        await setupMasterTables(env);
        const body = await request.json();
        if (!body.email || !body.password) return new Response("Email and password required", { status: 400, headers: corsHeaders });
        
        const hash = await hashPassword(body.password);
        const user = await env.DB.prepare("SELECT id, email, token FROM users WHERE email = ? AND password_hash = ?")
          .bind(body.email, hash).first();
          
        if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: corsHeaders });
        
        return new Response(JSON.stringify({ success: true, token: user.token, email: user.email }), { headers: corsHeaders });
      }

      if (request.method === "GET" && action === "accounts") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        const { results } = await env.DB.prepare("SELECT license_key, alias FROM user_accounts WHERE user_id = ?").bind(user_id).all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      // --- KI COACH ROUTE ---
      if (request.method === "POST" && action === "ai_coach") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        let body;
        try { body = await request.json(); } catch(e) { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }
        
        const account_id = body.account_id || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS ai_limits (
            license_key TEXT, 
            date TEXT, 
            analyses_count INTEGER, 
            PRIMARY KEY (license_key, date)
          )
        `).run();

        const todayStr = new Date().toISOString().split("T")[0];
        const limitRes = await env.DB.prepare("SELECT analyses_count FROM ai_limits WHERE license_key = ? AND date = ?")
          .bind(user_id, todayStr).first(); // Rate limit is per USER, not per account
        
        let count = limitRes ? limitRes.analyses_count : 0;
        if (count >= 1000) {
          return new Response(JSON.stringify({ error: "Du hast dein Limit von 1000 Analysen erreicht." }), { status: 403, headers: corsHeaders });
        }

        let trades = [];
        if (body.trades && Array.isArray(body.trades) && body.trades.length > 0) {
            trades = body.trades;
        } else {
            const tradesRes = await env.DB.prepare("SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC LIMIT 50")
              .bind(db_key).all();
            trades = tradesRes.results;
        }
        
        const langMap = { "de": "Deutsch", "en": "English", "es": "Español", "tr": "Türkçe" };
        const promptLang = langMap[body.language] || "English";

        const prompt = `Du bist ein erfahrener, direkter und emotional intelligenter Trading-Mentor. 
Analysiere die folgenden Trades.
Profil des Traders: ${JSON.stringify({style: body.style, session: body.session, risk: body.risk})}
WICHTIGE REGELN:
1. Sprich den Trader IMMER direkt mit "Du" an.
2. Nenne NIEMALS die Anzahl der Trades, Daten oder exakte Uhrzeiten! Diese Infos sind irrelevant.
3. Gib Feedback wie ein echter Mentor: Lobe, wenn es gut läuft, und verteile ehrliche, harte Kritik, wenn Fehler gemacht wurden.
4. KONTROLLIERE DAS PROFIL: Vergleiche das angegebene Profil (Style, Session, Risk) strikt mit dem tatsächlichen Verhalten!
5. Konzentriere dich auf Verhaltensmuster, Profitabilität und Risikomanagement.
6. ACHTE AUF TAGS/NOTIZEN: Einige Trades haben eine Eigenschaft 'tag'. Dies sind persönliche Notizen des Traders zu diesem Trade. Beziehe diese Erkenntnisse zwingend in deine Analyse ein!
7. Gib am Ende EINEN starken, motivierenden Ratschlag zur Verbesserung.
8. SPRACHE EXTREM WICHTIG: Du darfst NUR auf ${promptLang} antworten! Übersetze deine gesamte finale Antwort in ${promptLang}.
Fasse dich prägnant, aber tiefgründig (ca. 4-6 Sätze). Kein unnötiges Blabla, nur echter Mehrwert!`;
        
        if (!env.AI) return new Response(JSON.stringify({ error: "Cloudflare AI Binding fehlt." }), { status: 500, headers: corsHeaders });

        let aiResponse;
        try {
            aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: "Trades: " + JSON.stringify(trades) }
                ],
                max_tokens: 1024
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: "Cloudflare AI Fehler: " + err.message }), { status: 500, headers: corsHeaders });
        }

        const text = aiResponse.response || "Ich konnte keine Analyse erstellen.";

        if (count === 0) {
          await env.DB.prepare("INSERT INTO ai_limits (license_key, date, analyses_count) VALUES (?, ?, 1)").bind(user_id, todayStr).run();
        } else {
          await env.DB.prepare("UPDATE ai_limits SET analyses_count = analyses_count + 1 WHERE license_key = ? AND date = ?").bind(user_id, todayStr).run();
        }

        return new Response(JSON.stringify({ analysis: text, limitLeft: 999 - count }), { headers: corsHeaders });
      }

      // --- MT5 EA SYNC ROUTE ---
      if (request.method === "POST" && (!action || action === "trades")) {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        let body;
        try { body = await request.json(); } catch(e) { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }

        if (!body || !body.trades || !Array.isArray(body.trades)) {
          return new Response("Invalid request: Expected 'trades' array", { status: 400, headers: corsHeaders });
        }
        
        const account_id = body.account_id || "default";
        const db_key = `${user_id}:${account_id}`;
        
        // Auto-link account
        await env.DB.prepare("INSERT INTO user_accounts (user_id, license_key, alias) VALUES (?, ?, ?) ON CONFLICT DO NOTHING")
          .bind(user_id, account_id, account_id).run();

        // Save current balance if provided
        if (body.current_balance !== undefined) {
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS account_balances (license_key TEXT PRIMARY KEY, balance REAL)").run();
            await env.DB.prepare("INSERT INTO account_balances (license_key, balance) VALUES (?, ?) ON CONFLICT(license_key) DO UPDATE SET balance=excluded.balance")
              .bind(db_key, parseFloat(body.current_balance)).run();
        }

        const stmt = env.DB.prepare("INSERT INTO trades (ticket, license_key, symbol, side, volume, net_profit, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(ticket) DO UPDATE SET net_profit=excluded.net_profit, license_key=excluded.license_key");
        const batch = [];
        for (const t of body.trades) {
          batch.push(stmt.bind(t.ticket, db_key, t.symbol, t.side, t.volume, t.net_profit, t.open_time, t.close_time));
        }
        
        if (batch.length > 0) {
          await env.DB.batch(batch);
        }

        return new Response(JSON.stringify({ success: true, inserted: batch.length }), { headers: corsHeaders });
      }

      // --- SETTINGS ROUTE (POST) ---
      if (request.method === "POST" && action === "settings") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        let body;
        try { body = await request.json(); } catch(e) { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }
        
        const account_id = body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS user_settings (
            license_key TEXT PRIMARY KEY,
            kill_switch_active INTEGER DEFAULT 0,
            max_daily_loss REAL DEFAULT 0
          )
        `).run();
        
        await env.DB.prepare(`
          INSERT INTO user_settings (license_key, kill_switch_active, max_daily_loss)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key) DO UPDATE SET 
            kill_switch_active=excluded.kill_switch_active,
            max_daily_loss=excluded.max_daily_loss
        `).bind(db_key, body.kill_switch_active ? 1 : 0, body.max_daily_loss || 0).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- JOURNAL ROUTE (POST) ---
      if (request.method === "POST" && action === "journal") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        let body;
        try { body = await request.json(); } catch(e) { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }
        
        const account_id = body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        
        const dateStr = body.date || new Date().toISOString().split("T")[0];
        
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS journal (
            license_key TEXT, date TEXT, content TEXT, PRIMARY KEY (license_key, date)
          )
        `).run();
        
        await env.DB.prepare(`
          INSERT INTO journal (license_key, date, content)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key, date) DO UPDATE SET content=excluded.content
        `).bind(db_key, dateStr, body.content || "").run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- TRADE NOTES ROUTE (POST) ---
      if (request.method === "POST" && action === "notes") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        let body;
        try { body = await request.json(); } catch(e) { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }
        
        const account_id = body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS trade_notes (
            license_key TEXT, ticket TEXT, note TEXT, PRIMARY KEY (license_key, ticket)
          )
        `).run();
        
        await env.DB.prepare(`
          INSERT INTO trade_notes (license_key, ticket, note)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key, ticket) DO UPDATE SET note=excluded.note
        `).bind(db_key, String(body.ticket), body.note || "").run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- FETCH DATA ROUTES (GET) ---
      if (request.method === "GET") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        const account_id = url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        
        if (action === "settings") {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS user_settings (
                license_key TEXT PRIMARY KEY, kill_switch_active INTEGER DEFAULT 0, max_daily_loss REAL DEFAULT 0
              )
            `).run();
            const res = await env.DB.prepare("SELECT kill_switch_active, max_daily_loss FROM user_settings WHERE license_key = ?").bind(db_key).first();
            return new Response(JSON.stringify(res || { kill_switch_active: 0, max_daily_loss: 0 }), { headers: corsHeaders });
        }

        if (action === "journal") {
            const dateStr = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS journal (
                license_key TEXT, date TEXT, content TEXT, PRIMARY KEY (license_key, date)
              )
            `).run();
            const res = await env.DB.prepare("SELECT content FROM journal WHERE license_key = ? AND date = ?").bind(db_key, dateStr).first();
            return new Response(JSON.stringify(res || { content: "" }), { headers: corsHeaders });
        }

        if (action === "notes") {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS trade_notes (
                license_key TEXT, ticket TEXT, note TEXT, PRIMARY KEY (license_key, ticket)
              )
            `).run();
            const { results } = await env.DB.prepare("SELECT ticket, note FROM trade_notes WHERE license_key = ?").bind(db_key).all();
            return new Response(JSON.stringify(results), { headers: corsHeaders });
        }
        
        if (!action) {
            const { results } = await env.DB.prepare("SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC").bind(db_key).all();
            
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS account_balances (license_key TEXT PRIMARY KEY, balance REAL)").run();
            const balanceRes = await env.DB.prepare("SELECT balance FROM account_balances WHERE license_key = ?").bind(db_key).first();
            const current_balance = balanceRes ? balanceRes.balance : 0;
            
            return new Response(JSON.stringify({ trades: results, current_balance }), { headers: corsHeaders });
        }
      }

      // --- DELETE ACCOUNT ROUTE ---
      if (request.method === "DELETE" && action === "account") {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        const account_id = url.searchParams.get("account_id");
        if (!account_id) return new Response("Missing account_id", { status: 400, headers: corsHeaders });
        
        const db_key = `${user_id}:${account_id}`;
        
        await env.DB.prepare("DELETE FROM trades WHERE license_key = ?").bind(db_key).run();
        await env.DB.prepare("DELETE FROM journal WHERE license_key = ?").bind(db_key).run();
        await env.DB.prepare("DELETE FROM trade_notes WHERE license_key = ?").bind(db_key).run();
        await env.DB.prepare("DELETE FROM user_settings WHERE license_key = ?").bind(db_key).run();
        await env.DB.prepare("DELETE FROM user_accounts WHERE user_id = ? AND license_key = ?").bind(user_id, account_id).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- RESET DATABASE ROUTE ---
      if (request.method === "DELETE" && !action) {
        const user_id = await authenticateUser(request, env);
        if (!user_id) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        
        const account_id = url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        
        await env.DB.prepare("DELETE FROM trades WHERE license_key = ?").bind(db_key).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      return new Response("Not found", { status: 404, headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
