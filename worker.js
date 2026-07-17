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

      // --- KI COACH ROUTE ---
      if (request.method === "POST" && action === "ai_coach") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = authHeader.split(":");
        const license_key = `${username}:${password}`;
        
        // Check body parameters
        const body = await request.json();

        // Rate Limiting Table erstellen falls nicht existent
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS ai_limits (
            license_key TEXT, 
            date TEXT, 
            analyses_count INTEGER, 
            PRIMARY KEY (license_key, date)
          )
        `).run();

        // Rate limit check
        const todayStr = new Date().toISOString().split("T")[0];
        const limitRes = await env.DB.prepare("SELECT analyses_count FROM ai_limits WHERE license_key = ? AND date = ?")
          .bind(license_key, todayStr).first();
        
        let count = limitRes ? limitRes.analyses_count : 0;
        if (count >= 1000) {
          return new Response(JSON.stringify({ 
            error: "Du hast dein Limit von 1000 Analysen erreicht." 
          }), { status: 403, headers: corsHeaders });
        }

        // Letzte Trades abrufen (entweder vom Dashboard geschickt oder als Fallback die letzten 50)
        let trades = [];
        if (body.trades && Array.isArray(body.trades) && body.trades.length > 0) {
            trades = body.trades;
        } else {
            const tradesRes = await env.DB.prepare("SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC LIMIT 50")
              .bind(license_key).all();
            trades = tradesRes.results;
        }
        
        const prompt = `Du bist ein erfahrener, direkter und emotional intelligenter Trading-Mentor. 
Analysiere die folgenden Trades.
Profil des Traders: ${JSON.stringify({style: body.style, session: body.session, risk: body.risk})}
WICHTIGE REGELN:
1. Sprich den Trader IMMER direkt mit "Du" an.
2. Nenne NIEMALS die Anzahl der Trades, Daten oder exakte Uhrzeiten! Diese Infos sind irrelevant.
3. Gib Feedback wie ein echter Mentor: Lobe, wenn es gut läuft, und verteile ehrliche, harte Kritik, wenn Fehler gemacht wurden.
4. KONTROLLIERE DAS PROFIL: Vergleiche das angegebene Profil (Style, Session, Risk) strikt mit dem tatsächlichen Verhalten! Wenn er "Asian Session" angibt, aber nur mittags tradet, oder sich "Scalper" nennt, aber Trades stundenlang hält, dann konfrontiere ihn schonungslos mit diesem Widerspruch!
5. Konzentriere dich auf Verhaltensmuster, Profitabilität und Risikomanagement.
6. Gib am Ende EINEN starken, motivierenden Ratschlag zur Verbesserung.
7. SPRACHE: Deine gesamte Antwort MUSS zwingend in der Sprache '${body.language}' verfasst sein!
Fasse dich prägnant, aber tiefgründig (ca. 4-6 Sätze). Kein unnötiges Blabla, nur echter Mehrwert!`;
        
        if (!env.AI) {
           return new Response(JSON.stringify({ error: "Cloudflare AI Binding fehlt. Bitte 'AI' in den Worker Settings binden!" }), { status: 500, headers: corsHeaders });
        }

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

        // Counter erhöhen
        if (count === 0) {
          await env.DB.prepare("INSERT INTO ai_limits (license_key, date, analyses_count) VALUES (?, ?, 1)").bind(license_key, todayStr).run();
        } else {
          await env.DB.prepare("UPDATE ai_limits SET analyses_count = analyses_count + 1 WHERE license_key = ? AND date = ?").bind(license_key, todayStr).run();
        }

        return new Response(JSON.stringify({ 
          analysis: text, 
          limitLeft: 999 - count 
        }), { headers: corsHeaders });
      }

      // --- MT5 EA SYNC ROUTE ---
      if (request.method === "POST" && (!action || action === "trades")) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = authHeader.split(":");
        const license_key = `${username}:${password}`;
        
        let body;
        try {
            body = await request.json();
        } catch(e) {
            return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
        }

        if (!body || !body.trades || !Array.isArray(body.trades)) {
          return new Response("Invalid request: Expected 'trades' array", { status: 400, headers: corsHeaders });
        }

        const stmt = env.DB.prepare("INSERT INTO trades (ticket, license_key, symbol, side, volume, net_profit, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(ticket) DO UPDATE SET net_profit=excluded.net_profit");
        const batch = [];
        for (const t of body.trades) {
          batch.push(stmt.bind(t.ticket, license_key, t.symbol, t.side, t.volume, t.net_profit, t.open_time, t.close_time));
        }
        
        if (batch.length > 0) {
          await env.DB.batch(batch);
        }

        return new Response(JSON.stringify({ success: true, inserted: batch.length }), { headers: corsHeaders });
      }

      // --- SETTINGS ROUTE (POST) ---
      if (request.method === "POST" && action === "settings") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = authHeader.split(":");
        const license_key = `${username}:${password}`;
        
        const body = await request.json();
        
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
        `).bind(license_key, body.kill_switch_active ? 1 : 0, body.max_daily_loss || 0).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- FETCH TRADES ROUTE ---
      if (request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        const urlKey = url.searchParams.get("key");
        const keyData = authHeader || urlKey;
        
        if (!keyData) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = keyData.split(":");
        const license_key = `${username}:${password}`;
        
        if (action === "settings") {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS user_settings (
                license_key TEXT PRIMARY KEY,
                kill_switch_active INTEGER DEFAULT 0,
                max_daily_loss REAL DEFAULT 0
              )
            `).run();
            const res = await env.DB.prepare("SELECT kill_switch_active, max_daily_loss FROM user_settings WHERE license_key = ?").bind(license_key).first();
            return new Response(JSON.stringify(res || { kill_switch_active: 0, max_daily_loss: 0 }), { headers: corsHeaders });
        }
        
        const { results } = await env.DB.prepare("SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC").bind(license_key).all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      // --- RESET DATABASE ROUTE ---
      if (request.method === "DELETE") {
        const authHeader = request.headers.get("Authorization");
        const urlKey = url.searchParams.get("key");
        const keyData = authHeader || urlKey;

        if (!keyData) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = keyData.split(":");
        const license_key = `${username}:${password}`;
        
        await env.DB.prepare("DELETE FROM trades WHERE license_key = ?").bind(license_key).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      return new Response("Not found", { status: 404, headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
