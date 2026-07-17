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
        if (count >= 4) {
          return new Response(JSON.stringify({ 
            error: "Du hast dein tägliches Limit von 4 Analysen erreicht. Komm morgen wieder!" 
          }), { status: 403, headers: corsHeaders });
        }

        // Letzte Trades abrufen (heute)
        const tradesRes = await env.DB.prepare("SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC LIMIT 50")
          .bind(license_key).all();
        
        const trades = tradesRes.results;
        
        // Gemini API Aufruf
        const prompt = `Du bist ein hochprofessioneller, direkter und analytischer Trading-Coach. 
Analysiere die folgenden Trades und das Profil des Traders.
Profil: ${JSON.stringify(body)}
Gib hartes, datenbasiertes Feedback (kein Blabla). 
Wandle Unix-Timestamps in menschenlesbare Zeitangaben um (z.B. "17. Juli 14:30 Uhr").
Fasse dich kurz und präzise!`;
        
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.KI_API}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            contents: [{parts: [{text: prompt + "\n\nTrades: " + JSON.stringify(trades)}]}]
          })
        });

        const geminiData = await geminiRes.json();
        
        if (!geminiRes.ok || geminiData.error) {
           return new Response(JSON.stringify({ error: "Gemini API Fehler: " + (geminiData.error?.message || "Unbekannt") }), { status: 500, headers: corsHeaders });
        }

        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte keine Analyse erstellen.";

        // Counter erhöhen
        if (count === 0) {
          await env.DB.prepare("INSERT INTO ai_limits (license_key, date, analyses_count) VALUES (?, ?, 1)").bind(license_key, todayStr).run();
        } else {
          await env.DB.prepare("UPDATE ai_limits SET analyses_count = analyses_count + 1 WHERE license_key = ? AND date = ?").bind(license_key, todayStr).run();
        }

        return new Response(JSON.stringify({ 
          analysis: text, 
          limitLeft: 3 - count 
        }), { headers: corsHeaders });
      }

      // --- MT5 EA SYNC ROUTE ---
      if (request.method === "POST") {
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

      // --- FETCH TRADES ROUTE ---
      if (request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        const urlKey = url.searchParams.get("key");
        const keyData = authHeader || urlKey;
        
        if (!keyData) return new Response("Missing Auth", { status: 401, headers: corsHeaders });
        
        const [username, password] = keyData.split(":");
        const license_key = `${username}:${password}`;
        
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
