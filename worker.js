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

      function generateRandomUsername() {
        const adjs = [
          "Quantum",
          "Silent",
          "Alpha",
          "Zen",
          "Crypto",
          "Liquid",
          "Neon",
          "Void",
          "Cyber",
          "Iron",
          "Gold",
          "Silver",
          "Sniper",
          "Flash",
          "Shadow",
          "Dark",
          "Light",
        ];
        const nouns = [
          "Whale",
          "Sniper",
          "Trader",
          "Bull",
          "Bear",
          "Wolf",
          "Hawk",
          "Shark",
          "Titan",
          "Nomad",
          "Pulse",
          "Ghost",
          "Apex",
          "Ronin",
        ];
        const adj = adjs[Math.floor(Math.random() * adjs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 900) + 100;
        return `${adj}_${noun}_${num}`;
      }

      async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      async function setupMasterTables(env) {
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            token TEXT UNIQUE,
            username TEXT
          )
        `,
        ).run();
        try {
          await env.DB.prepare(
            "ALTER TABLE users ADD COLUMN username TEXT",
          ).run();
        } catch (e) {}
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS user_accounts (
            user_id TEXT,
            license_key TEXT,
            alias TEXT,
            PRIMARY KEY (user_id, license_key)
          )
        `,
        ).run();
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
          const user = await env.DB.prepare(
            "SELECT id FROM users WHERE token = ?",
          )
            .bind(token)
            .first();
          if (user) return user.id;
        }

        // 2. Check Email:Password (EA)
        if (token && token.includes(":")) {
          const [email, password] = token.split(":");
          const hash = await hashPassword(password);
          const user = await env.DB.prepare(
            "SELECT id FROM users WHERE email = ? AND password_hash = ?",
          )
            .bind(email, hash)
            .first();
          if (user) return user.id;
        }

        return null;
      }

      // --- MASTER ACCOUNT ROUTES ---
      if (request.method === "POST" && action === "register") {
        await setupMasterTables(env);
        const body = await request.json();
        if (!body.email || !body.password)
          return new Response("Email and password required", {
            status: 400,
            headers: corsHeaders,
          });

        const existing = await env.DB.prepare(
          "SELECT email FROM users WHERE email = ?",
        )
          .bind(body.email)
          .first();
        if (existing)
          return new Response(
            JSON.stringify({ error: "Email already registered" }),
            { status: 400, headers: corsHeaders },
          );

        const id = crypto.randomUUID();
        const hash = await hashPassword(body.password);
        const token = crypto.randomUUID();
        const username = generateRandomUsername();

        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, token, username) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(id, body.email, hash, token, username)
          .run();

        return new Response(
          JSON.stringify({ success: true, token, email: body.email, username }),
          { headers: corsHeaders },
        );
      }

      if (request.method === "POST" && action === "login") {
        await setupMasterTables(env);
        const body = await request.json();
        if (!body.email || !body.password)
          return new Response("Email and password required", {
            status: 400,
            headers: corsHeaders,
          });

        const hash = await hashPassword(body.password);
        const user = await env.DB.prepare(
          "SELECT id, email, token, username FROM users WHERE email = ? AND password_hash = ?",
        )
          .bind(body.email, hash)
          .first();

        if (!user)
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 401, headers: corsHeaders },
          );

        let username = user.username;
        if (!username) {
          username = generateRandomUsername();
          await env.DB.prepare("UPDATE users SET username = ? WHERE id = ?")
            .bind(username, user.id)
            .run();
        }

        return new Response(
          JSON.stringify({
            success: true,
            token: user.token,
            email: user.email,
            username,
          }),
          { headers: corsHeaders },
        );
      }

      if (request.method === "GET" && action === "accounts") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        const { results } = await env.DB.prepare(
          "SELECT license_key, alias FROM user_accounts WHERE user_id = ?",
        )
          .bind(user_id)
          .all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      // --- FOREX FACTORY NEWS PROXY ---
      if (request.method === "GET" && action === "news") {
        try {
          const ffResponse = await fetch(
            "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json"
              }
            }
          );
          const data = await ffResponse.json();
          return new Response(JSON.stringify(data), { headers: corsHeaders });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch news." }),
            { status: 500, headers: corsHeaders },
          );
        }
      }

      // --- COMMUNITY FEED ROUTES ---
      if (request.method === "POST" && action === "community_post") {
        try {
          const user_id = await authenticateUser(request, env);
          if (!user_id)
            return new Response("Unauthorized", {
              status: 401,
              headers: corsHeaders,
            });

          let body;
          try {
            body = await request.json();
          } catch (e) {
            return new Response("Invalid JSON", {
              status: 400,
              headers: corsHeaders,
            });
          }

          // Get or assign username
          let user = await env.DB.prepare(
            "SELECT username FROM users WHERE id = ?",
          )
            .bind(user_id)
            .first();
          let username = user ? user.username : null;
          if (!username) {
            username = generateRandomUsername();
            await env.DB.prepare("UPDATE users SET username = ? WHERE id = ?")
              .bind(username, user_id)
              .run();
          }

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_posts (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            username TEXT,
            content TEXT,
            trade_data TEXT,
            image_urls TEXT,
            likes INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
          ).run();

          const post_id = crypto.randomUUID();
          const created_at = Math.floor(Date.now() / 1000);

          await env.DB.prepare(
            "INSERT INTO community_posts (id, user_id, username, content, trade_data, image_urls, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
          )
            .bind(
              post_id,
              user_id,
              username,
              body.content || "",
              JSON.stringify(body.trade_data || null),
              JSON.stringify(body.image_urls || []),
              created_at,
            )
            .run();

          return new Response(JSON.stringify({ success: true, post_id }), {
            headers: corsHeaders,
          });
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === "POST" && action === "community_like") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }
        if (!body.post_id)
          return new Response("Missing post_id", {
            status: 400,
            headers: corsHeaders,
          });

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS community_likes (
            post_id TEXT,
            user_id TEXT,
            PRIMARY KEY (post_id, user_id)
          )
        `,
        ).run();

        // Check if already liked
        const existing = await env.DB.prepare(
          "SELECT * FROM community_likes WHERE post_id = ? AND user_id = ?",
        )
          .bind(body.post_id, user_id)
          .first();
        if (existing) {
          // Unlike
          await env.DB.prepare(
            "DELETE FROM community_likes WHERE post_id = ? AND user_id = ?",
          )
            .bind(body.post_id, user_id)
            .run();
          await env.DB.prepare(
            "UPDATE community_posts SET likes = max(0, likes - 1) WHERE id = ?",
          )
            .bind(body.post_id)
            .run();
          return new Response(JSON.stringify({ success: true, liked: false }), {
            headers: corsHeaders,
          });
        } else {
          // Like
          await env.DB.prepare(
            "INSERT INTO community_likes (post_id, user_id) VALUES (?, ?)",
          )
            .bind(body.post_id, user_id)
            .run();
          await env.DB.prepare(
            "UPDATE community_posts SET likes = likes + 1 WHERE id = ?",
          )
            .bind(body.post_id)
            .run();
          return new Response(JSON.stringify({ success: true, liked: true }), {
            headers: corsHeaders,
          });
        }
      }

      if (request.method === "GET" && action === "community_feed") {
        try {
          const user_id = await authenticateUser(request, env);
          if (!user_id)
            return new Response("Unauthorized", {
              status: 401,
              headers: corsHeaders,
            });

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_posts (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            username TEXT,
            content TEXT,
            trade_data TEXT,
            image_urls TEXT,
            likes INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
          ).run();

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_likes (
            post_id TEXT,
            user_id TEXT,
            PRIMARY KEY (post_id, user_id)
          )
        `,
          ).run();

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_comments (
            id TEXT PRIMARY KEY,
            post_id TEXT,
            user_id TEXT,
            username TEXT,
            content TEXT,
            created_at INTEGER
          )
        `,
          ).run();

          // Fetch top 50 posts
          const { results } = await env.DB.prepare(
            "SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50",
          ).all();

          // Fetch user's liked posts to show active heart icon
          const likedRes = await env.DB.prepare(
            "SELECT post_id FROM community_likes WHERE user_id = ?",
          )
            .bind(user_id)
            .all();
          const likedSet = new Set(likedRes.results.map((r) => r.post_id));

          // Fetch comments for these posts
          const postsIds = results.map((r) => r.id);
          const commentsByPost = {};
          if (postsIds.length > 0) {
            const placeholders = postsIds.map(() => "?").join(",");
            const commentsRes = await env.DB.prepare(
              `SELECT * FROM community_comments WHERE post_id IN (${placeholders}) ORDER BY created_at ASC`,
            )
              .bind(...postsIds)
              .all();
            commentsRes.results.forEach((c) => {
              if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
              commentsByPost[c.post_id].push(c);
            });
          }

          const feed = results.map((post) => {
            let parsedTrade = null;
            let parsedImages = [];
            try {
              parsedTrade = JSON.parse(post.trade_data || "null");
            } catch (e) {}
            try {
              parsedImages = JSON.parse(post.image_urls || "[]");
            } catch (e) {}

            return {
              ...post,
              has_liked: likedSet.has(post.id),
              is_owner: post.user_id === user_id,
              trade_data: parsedTrade,
              image_urls: parsedImages,
              comments: commentsByPost[post.id] || [],
            };
          });

          return new Response(JSON.stringify(feed), { headers: corsHeaders });
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      // --- COMMUNITY LEADERBOARD (weekly, Mon 00:00 UTC - now) ---
      if (request.method === "GET" && action === "community_leaderboard") {
        try {
          const user_id = await authenticateUser(request, env);
          if (!user_id)
            return new Response("Unauthorized", {
              status: 401,
              headers: corsHeaders,
            });

          const now = new Date();
          const day = now.getUTCDay(); // 0=Sun .. 6=Sat
          const daysToMonday = day === 0 ? -6 : 1 - day;
          const weekStart = Math.floor(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() + daysToMonday,
            ) / 1000,
          );

          const { results: rows } = await env.DB.prepare(
            "SELECT license_key, symbol, side, net_profit FROM trades WHERE close_time >= ?",
          )
            .bind(weekStart)
            .all();

          if (!rows.length) {
            return new Response(
              JSON.stringify({
                commissions: [],
                gain_pct: [],
                biggest_win: [],
                most_trades: [],
                week_start: weekStart,
              }),
              { headers: corsHeaders },
            );
          }

          // Same encoding scheme the MT5 EA/client use: side may be
          // "BUY_USD_<gross_profit>_<balance_after>" — commission = net - gross.
          function parseTrade(t) {
            const netProfit = parseFloat(t.net_profit) || 0;
            let grossProfit = netProfit;
            const side = t.side || "";
            if (side.includes("_")) {
              const parts = side.split("_");
              if (parts.length > 2 && !isNaN(parseFloat(parts[2]))) {
                grossProfit = parseFloat(parts[2]);
              }
            }
            return { netProfit, commission: netProfit - grossProfit };
          }

          const perAccount = {};
          for (const t of rows) {
            const { netProfit, commission } = parseTrade(t);
            if (!perAccount[t.license_key]) {
              perAccount[t.license_key] = {
                netSum: 0,
                commSum: 0,
                count: 0,
                maxWin: -Infinity,
                maxWinSymbol: "",
              };
            }
            const a = perAccount[t.license_key];
            a.netSum += netProfit;
            a.commSum += Math.abs(commission);
            a.count += 1;
            if (netProfit > a.maxWin) {
              a.maxWin = netProfit;
              a.maxWinSymbol = t.symbol || "";
            }
          }

          const licenseKeys = Object.keys(perAccount);

          const balMap = {};
          try {
            const placeholders = licenseKeys.map(() => "?").join(",");
            const balRows = await env.DB
              .prepare(
                `SELECT license_key, balance FROM account_balances WHERE license_key IN (${placeholders})`,
              )
              .bind(...licenseKeys)
              .all();
            (balRows.results || []).forEach((r) => {
              balMap[r.license_key] = r.balance;
            });
          } catch (e) {}

          const userIds = [...new Set(licenseKeys.map((lk) => lk.split(":")[0]))];
          const userMap = {};
          if (userIds.length) {
            const placeholders = userIds.map(() => "?").join(",");
            const uRows = await env.DB
              .prepare(`SELECT id, username FROM users WHERE id IN (${placeholders})`)
              .bind(...userIds)
              .all();
            (uRows.results || []).forEach((u) => {
              userMap[u.id] = u.username || "Trader";
            });
          }

          const perUser = {};
          for (const lk of licenseKeys) {
            const uid = lk.split(":")[0];
            const a = perAccount[lk];
            if (!perUser[uid]) {
              perUser[uid] = {
                username: userMap[uid] || "Trader",
                commSum: 0,
                count: 0,
                netSum: 0,
                balanceStart: 0,
                hasBalance: false,
                maxWin: -Infinity,
                maxWinSymbol: "",
              };
            }
            const u = perUser[uid];
            u.commSum += a.commSum;
            u.count += a.count;
            u.netSum += a.netSum;
            const currentBal = balMap[lk];
            if (currentBal !== undefined && currentBal !== null) {
              u.balanceStart += currentBal - a.netSum;
              u.hasBalance = true;
            }
            if (a.maxWin > u.maxWin) {
              u.maxWin = a.maxWin;
              u.maxWinSymbol = a.maxWinSymbol;
            }
          }

          const users = Object.values(perUser);

          const commissions = users
            .filter((u) => u.commSum > 0.001)
            .sort((a, b) => b.commSum - a.commSum)
            .slice(0, 5)
            .map((u) => ({
              username: u.username,
              value: parseFloat(u.commSum.toFixed(2)),
            }));

          const gainPct = users
            .filter((u) => u.hasBalance && u.balanceStart > 0)
            .map((u) => ({
              username: u.username,
              value: parseFloat(((u.netSum / u.balanceStart) * 100).toFixed(2)),
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          const biggestWin = users
            .filter((u) => u.maxWin > 0)
            .sort((a, b) => b.maxWin - a.maxWin)
            .slice(0, 5)
            .map((u) => ({
              username: u.username,
              value: parseFloat(u.maxWin.toFixed(2)),
              symbol: u.maxWinSymbol,
            }));

          const mostTrades = users
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((u) => ({ username: u.username, value: u.count }));

          return new Response(
            JSON.stringify({
              commissions,
              gain_pct: gainPct,
              biggest_win: biggestWin,
              most_trades: mostTrades,
              week_start: weekStart,
            }),
            { headers: corsHeaders },
          );
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === "POST" && action === "community_comment") {
        try {
          const user_id = await authenticateUser(request, env);
          if (!user_id)
            return new Response("Unauthorized", {
              status: 401,
              headers: corsHeaders,
            });

          let body;
          try {
            body = await request.json();
          } catch (e) {
            return new Response("Invalid JSON", {
              status: 400,
              headers: corsHeaders,
            });
          }

          if (!body.post_id || !body.content) {
            return new Response("Missing post_id or content", {
              status: 400,
              headers: corsHeaders,
            });
          }

          // Check comment limit (max 5)
          const countRes = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM community_comments WHERE post_id = ?",
          )
            .bind(body.post_id)
            .first();

          if (countRes && countRes.count >= 5) {
            return new Response(
              JSON.stringify({ error: "Max 5 comments reached for this post" }),
              { status: 403, headers: corsHeaders },
            );
          }

          let user = await env.DB.prepare(
            "SELECT username FROM users WHERE id = ?",
          )
            .bind(user_id)
            .first();
          let username = user ? user.username : "Unknown";

          const comment_id = crypto.randomUUID();
          const created_at = Math.floor(Date.now() / 1000);

          await env.DB.prepare(
            "INSERT INTO community_comments (id, post_id, user_id, username, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          )
            .bind(
              comment_id,
              body.post_id,
              user_id,
              username,
              body.content,
              created_at,
            )
            .run();

          return new Response(
            JSON.stringify({ success: true, comment_id, username, created_at }),
            { headers: corsHeaders },
          );
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === "POST" && action === "community_delete_post") {
        const user_id = await authenticateUser(request, env);
        if (typeof user_id === "object") return user_id;

        const body = await request.json();
        const post_id = body.post_id;

        if (!post_id)
          return new Response(
            JSON.stringify({ success: false, error: "Missing post_id" }),
            { headers: corsHeaders },
          );

        const postRes = await env.DB.prepare(
          "SELECT user_id FROM community_posts WHERE id = ?",
        )
          .bind(post_id)
          .first();
        if (!postRes || postRes.user_id !== user_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized" }),
            { headers: corsHeaders },
          );
        }

        await env.DB.prepare("DELETE FROM community_posts WHERE id = ?")
          .bind(post_id)
          .run();
        await env.DB.prepare("DELETE FROM community_likes WHERE post_id = ?")
          .bind(post_id)
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- AI COACH ARCHIVE ROUTES ---
      if (request.method === "POST" && action === "coach_archive") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id = body.account_id || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS coach_archives (
            id TEXT PRIMARY KEY,
            license_key TEXT,
            date TEXT,
            analysis_text TEXT,
            created_at INTEGER
          )
        `,
        ).run();

        const id = crypto.randomUUID();
        const created_at = Math.floor(Date.now() / 1000);

        await env.DB.prepare(
          "INSERT INTO coach_archives (id, license_key, date, analysis_text, created_at) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(id, db_key, body.date, body.analysis_text, created_at)
          .run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: corsHeaders,
        });
      }

      if (request.method === "GET" && action === "coach_archive") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        const account_id = url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS coach_archives (
            id TEXT PRIMARY KEY,
            license_key TEXT,
            date TEXT,
            analysis_text TEXT,
            created_at INTEGER
          )
        `,
        ).run();

        const results = await env.DB.prepare(
          "SELECT * FROM coach_archives WHERE license_key = ? ORDER BY created_at DESC",
        )
          .bind(db_key)
          .all();
        return new Response(JSON.stringify(results.results || []), {
          headers: corsHeaders,
        });
      }

      // --- KI COACH ROUTE ---
      if (request.method === "POST" && action === "ai_coach") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id = body.account_id || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS ai_limits (
            license_key TEXT, 
            date TEXT, 
            analyses_count INTEGER, 
            PRIMARY KEY (license_key, date)
          )
        `,
        ).run();

        const todayStr = new Date().toISOString().split("T")[0];
        const limitRes = await env.DB.prepare(
          "SELECT analyses_count FROM ai_limits WHERE license_key = ? AND date = ?",
        )
          .bind(user_id, todayStr)
          .first(); // Rate limit is per USER, not per account

        let count = limitRes ? limitRes.analyses_count : 0;
        if (count >= 1000) {
          return new Response(
            JSON.stringify({
              error: "Du hast dein Limit von 1000 Analysen erreicht.",
            }),
            { status: 403, headers: corsHeaders },
          );
        }

        let trades = [];
        if (
          body.trades &&
          Array.isArray(body.trades) &&
          body.trades.length > 0
        ) {
          trades = body.trades.slice(0, 100); // Limit to 100 to avoid LLM context overflow
        } else {
          const tradesRes = await env.DB.prepare(
            "SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC LIMIT 50",
          )
            .bind(db_key)
            .all();
          trades = tradesRes.results;
        }

        const statsStr = body.stats ? JSON.stringify(body.stats) : "{}";
        const langMap = {
          de: "Deutsch",
          en: "English",
          es: "Español",
          tr: "Türkçe",
        };
        const promptLang = langMap[body.language] || "English";

        const prompt = `Du bist ein erfahrener, direkter und emotional intelligenter Trading-Mentor. 
Analysiere die folgenden Trades und aggregierten Statistiken.
Profil des Traders: ${JSON.stringify({ style: body.style, session: body.session, risk: body.risk })}
Aggregierte Statistiken: ${statsStr}
WICHTIGE REGELN:
1. Sprich den Trader IMMER direkt mit "Du" an.
2. KEINE EINLEITUNG! Starte direkt mit dem ersten Punkt der Analyse. Phrasen wie "Ich werde nun deine Trades analysieren" oder "Deine Statistiken zeigen, dass..." sind STRIKT VERBOTEN. Komm sofort zur Sache.
3. Nenne KEINE genauen Zeitstempel oder rohen Daten aus dem JSON, sondern leite wertvolle Schlüsse ab.
4. Beziehe dich explizit auf die Statistiken: Welche Strategie ist am profitabelsten/schlechtesten? Welche Wochentage oder Uhrzeiten (Heatmap) sind Stärken/Schwächen? Sind kurze oder lange Haltedauern besser?
5. Berechne und empfehle EINEN konkreten "Kill Switch" (Daily Loss Limit) basierend auf dem durchschnittlichen Verlust (z.B. 2-3x Avg Loss oder max Drawdown). Erkläre kurz, warum dieser Wert sinnvoll ist.
6. KONTROLLIERE DAS PROFIL: Passt das angegebene Profil (Style, Session, Risk) zum tatsächlichen Verhalten?
7. Gib hartes, ehrliches Feedback. Lobe bei Disziplin, kritisiere bei Fehlern. Wenn bei Trades "sl_widened" > 0 ist, weise den Trader STRENG darauf hin, dass das Verschieben des Stop Loss in den Verlustbereich ein gefährlicher Disziplinverstoß (Hoffnungstrading) ist! Achte auch auf Tags/Notizen der Trades.
8. Gib am Ende EINEN starken Ratschlag zur Verbesserung.
9. SPRACHE EXTREM WICHTIG: Antworte NUR auf ${promptLang}! Übersetze deine gesamte finale Antwort in ${promptLang}.
Fasse dich prägnant, aber tiefgründig (ca. 5-7 Sätze). Kein unnötiges Blabla, nur echter Mehrwert!`;

        if (!env.AI)
          return new Response(
            JSON.stringify({ error: "Cloudflare AI Binding fehlt." }),
            { status: 500, headers: corsHeaders },
          );

        let aiResponse;
        try {
          aiResponse = await env.AI.run(
            "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
            {
              messages: [
                { role: "system", content: prompt },
                { role: "user", content: "Trades: " + JSON.stringify(trades) },
              ],
              max_tokens: 1024,
            },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "Cloudflare AI Fehler: " + err.message }),
            { status: 500, headers: corsHeaders },
          );
        }

        const text =
          aiResponse.response || "Ich konnte keine Analyse erstellen.";

        if (count === 0) {
          await env.DB.prepare(
            "INSERT INTO ai_limits (license_key, date, analyses_count) VALUES (?, ?, 1)",
          )
            .bind(user_id, todayStr)
            .run();
        } else {
          await env.DB.prepare(
            "UPDATE ai_limits SET analyses_count = analyses_count + 1 WHERE license_key = ? AND date = ?",
          )
            .bind(user_id, todayStr)
            .run();
        }

        return new Response(
          JSON.stringify({ analysis: text, limitLeft: 999 - count }),
          { headers: corsHeaders },
        );
      }

      // --- MT5 EA SYNC ROUTE ---
      if (request.method === "POST" && (!action || action === "trades")) {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        if (!body || !body.trades || !Array.isArray(body.trades)) {
          return new Response("Invalid request: Expected 'trades' array", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id = body.account_id || "default";
        const db_key = `${user_id}:${account_id}`;

        // Auto-link account
        await env.DB.prepare(
          "INSERT INTO user_accounts (user_id, license_key, alias) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
        )
          .bind(user_id, account_id, account_id)
          .run();

        // Save current balance if provided
        if (body.current_balance !== undefined) {
          await env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS account_balances (license_key TEXT PRIMARY KEY, balance REAL)",
          ).run();
          await env.DB.prepare(
            "INSERT INTO account_balances (license_key, balance) VALUES (?, ?) ON CONFLICT(license_key) DO UPDATE SET balance=excluded.balance",
          )
            .bind(db_key, parseFloat(body.current_balance))
            .run();
        }

        try {
          await env.DB.prepare(
            "ALTER TABLE trades ADD COLUMN sl_widened INTEGER DEFAULT 0",
          ).run();
        } catch (e) {}

        const stmt = env.DB.prepare(
          "INSERT INTO trades (ticket, license_key, symbol, side, volume, net_profit, open_time, close_time, sl_widened) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(ticket) DO UPDATE SET net_profit=excluded.net_profit, license_key=excluded.license_key, sl_widened=excluded.sl_widened",
        );
        const batch = [];
        for (const t of body.trades) {
          batch.push(
            stmt.bind(
              t.ticket,
              db_key,
              t.symbol,
              t.side,
              t.volume,
              t.net_profit,
              t.open_time,
              t.close_time,
              t.sl_widened || 0,
            ),
          );
        }

        if (batch.length > 0) {
          await env.DB.batch(batch);
        }

        return new Response(
          JSON.stringify({ success: true, inserted: batch.length }),
          { headers: corsHeaders },
        );
      }

      // --- SETTINGS ROUTE (POST) ---
      if (request.method === "POST" && action === "settings") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS user_settings (
            license_key TEXT PRIMARY KEY,
            kill_switch_active INTEGER DEFAULT 0,
            max_daily_loss REAL DEFAULT 0,
            cooldown_active INTEGER DEFAULT 0,
            cooldown_minutes REAL DEFAULT 15
          )
        `,
        ).run();
        try {
          await env.DB.prepare(
            "ALTER TABLE user_settings ADD COLUMN cooldown_active INTEGER DEFAULT 0",
          ).run();
        } catch (e) {}
        try {
          await env.DB.prepare(
            "ALTER TABLE user_settings ADD COLUMN cooldown_minutes REAL DEFAULT 15",
          ).run();
        } catch (e) {}

        await env.DB.prepare(
          `
          INSERT INTO user_settings (license_key, kill_switch_active, max_daily_loss, cooldown_active, cooldown_minutes)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(license_key) DO UPDATE SET
            kill_switch_active=excluded.kill_switch_active,
            max_daily_loss=excluded.max_daily_loss,
            cooldown_active=excluded.cooldown_active,
            cooldown_minutes=excluded.cooldown_minutes
        `,
        )
          .bind(
            db_key,
            body.kill_switch_active ? 1 : 0,
            body.max_daily_loss || 0,
            body.cooldown_active ? 1 : 0,
            body.cooldown_minutes || 15,
          )
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- JOURNAL ROUTE (POST) ---
      if (request.method === "POST" && action === "journal") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        const dateStr = body.date || new Date().toISOString().split("T")[0];

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS journal (
            license_key TEXT, date TEXT, content TEXT, PRIMARY KEY (license_key, date)
          )
        `,
        ).run();

        await env.DB.prepare(
          `
          INSERT INTO journal (license_key, date, content)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key, date) DO UPDATE SET content=excluded.content
        `,
        )
          .bind(db_key, dateStr, body.content || "")
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- TRADE NOTES ROUTE (POST) ---
      if (request.method === "POST" && action === "notes") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS trade_notes (
            license_key TEXT, ticket TEXT, note TEXT, PRIMARY KEY (license_key, ticket)
          )
        `,
        ).run();

        await env.DB.prepare(
          `
          INSERT INTO trade_notes (license_key, ticket, note)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key, ticket) DO UPDATE SET note=excluded.note
        `,
        )
          .bind(db_key, String(body.ticket), body.note || "")
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- TRADE IMAGES ROUTE (POST) ---
      if (request.method === "POST" && action === "images") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS trade_images (
            license_key TEXT, ticket TEXT, img_before TEXT, img_after TEXT, PRIMARY KEY (license_key, ticket)
          )
        `,
        ).run();

        await env.DB.prepare(
          `
          INSERT INTO trade_images (license_key, ticket, img_before, img_after)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(license_key, ticket) DO UPDATE SET img_before=excluded.img_before, img_after=excluded.img_after
        `,
        )
          .bind(
            db_key,
            String(body.ticket),
            body.img_before || "",
            body.img_after || "",
          )
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- STRATEGY DEFINITIONS ROUTE (POST) ---
      if (request.method === "POST" && action === "strategies") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS strategy_definitions (
            id TEXT, user_id TEXT, name TEXT, description TEXT,
            PRIMARY KEY (id, user_id)
          )
        `,
        ).run();

        if (body.delete_id) {
          await env.DB.prepare(
            "DELETE FROM strategy_definitions WHERE id = ? AND user_id = ?",
          )
            .bind(body.delete_id, user_id)
            .run();
          return new Response(JSON.stringify({ success: true }), {
            headers: corsHeaders,
          });
        }

        const id = body.id || crypto.randomUUID();
        await env.DB.prepare(
          `
          INSERT INTO strategy_definitions (id, user_id, name, description)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id, user_id) DO UPDATE SET name=excluded.name, description=excluded.description
        `,
        )
          .bind(id, user_id, body.name || "Unnamed", body.description || "")
          .run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: corsHeaders,
        });
      }

      // --- TRADE STRATEGY ASSIGNMENT ROUTE (POST) ---
      if (request.method === "POST" && action === "trade_strategy") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response("Invalid JSON", {
            status: 400,
            headers: corsHeaders,
          });
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS trade_strategies (
            license_key TEXT, ticket TEXT, strategy_id TEXT, PRIMARY KEY (license_key, ticket)
          )
        `,
        ).run();

        if (!body.strategy_id) {
          await env.DB.prepare(
            "DELETE FROM trade_strategies WHERE license_key = ? AND ticket = ?",
          )
            .bind(db_key, String(body.ticket))
            .run();
        } else {
          await env.DB.prepare(
            `
            INSERT INTO trade_strategies (license_key, ticket, strategy_id)
            VALUES (?, ?, ?)
            ON CONFLICT(license_key, ticket) DO UPDATE SET strategy_id=excluded.strategy_id
          `,
          )
            .bind(db_key, String(body.ticket), body.strategy_id)
            .run();
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- FETCH DATA ROUTES (GET) ---
      if (request.method === "GET") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        const account_id = url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        if (action === "settings") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS user_settings (
                license_key TEXT PRIMARY KEY,
                kill_switch_active INTEGER DEFAULT 0,
                max_daily_loss REAL DEFAULT 0,
                cooldown_active INTEGER DEFAULT 0,
                cooldown_minutes REAL DEFAULT 15
              )
            `,
          ).run();
          try {
            await env.DB.prepare(
              "ALTER TABLE user_settings ADD COLUMN cooldown_active INTEGER DEFAULT 0",
            ).run();
          } catch (e) {}
          try {
            await env.DB.prepare(
              "ALTER TABLE user_settings ADD COLUMN cooldown_minutes REAL DEFAULT 15",
            ).run();
          } catch (e) {}
          const res = await env.DB.prepare(
            "SELECT kill_switch_active, max_daily_loss, cooldown_active, cooldown_minutes FROM user_settings WHERE license_key = ?",
          )
            .bind(db_key)
            .first();
          return new Response(
            JSON.stringify(
              res || {
                kill_switch_active: 0,
                max_daily_loss: 0,
                cooldown_active: 0,
                cooldown_minutes: 15,
              },
            ),
            { headers: corsHeaders },
          );
        }

        if (action === "journal") {
          const dateStr =
            url.searchParams.get("date") ||
            new Date().toISOString().split("T")[0];
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS journal (
                license_key TEXT, date TEXT, content TEXT, PRIMARY KEY (license_key, date)
              )
            `,
          ).run();
          const res = await env.DB.prepare(
            "SELECT content FROM journal WHERE license_key = ? AND date = ?",
          )
            .bind(db_key, dateStr)
            .first();
          return new Response(JSON.stringify(res || { content: "" }), {
            headers: corsHeaders,
          });
        }

        if (action === "notes") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS trade_notes (
                license_key TEXT, ticket TEXT, note TEXT, PRIMARY KEY (license_key, ticket)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT ticket, note FROM trade_notes WHERE license_key = ?",
          )
            .bind(db_key)
            .all();
          return new Response(JSON.stringify(results), {
            headers: corsHeaders,
          });
        }

        if (action === "strategies") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS strategy_definitions (
                id TEXT, user_id TEXT, name TEXT, description TEXT, PRIMARY KEY (id, user_id)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT id, name, description FROM strategy_definitions WHERE user_id = ?",
          )
            .bind(user_id)
            .all();
          return new Response(JSON.stringify(results), {
            headers: corsHeaders,
          });
        }

        if (action === "images") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS trade_images (
                license_key TEXT, ticket TEXT, img_before TEXT, img_after TEXT, PRIMARY KEY (license_key, ticket)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT ticket, img_before, img_after FROM trade_images WHERE license_key = ?",
          )
            .bind(db_key)
            .all();
          return new Response(JSON.stringify(results), {
            headers: corsHeaders,
          });
        }

        if (action === "trade_strategy") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS trade_strategies (
                license_key TEXT, ticket TEXT, strategy_id TEXT, PRIMARY KEY (license_key, ticket)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT ticket, strategy_id FROM trade_strategies WHERE license_key = ?",
          )
            .bind(db_key)
            .all();
          return new Response(JSON.stringify(results), {
            headers: corsHeaders,
          });
        }

        if (!action) {
          const { results } = await env.DB.prepare(
            "SELECT * FROM trades WHERE license_key = ? ORDER BY close_time DESC",
          )
            .bind(db_key)
            .all();

          await env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS account_balances (license_key TEXT PRIMARY KEY, balance REAL)",
          ).run();
          const balanceRes = await env.DB.prepare(
            "SELECT balance FROM account_balances WHERE license_key = ?",
          )
            .bind(db_key)
            .first();
          const current_balance = balanceRes ? balanceRes.balance : 0;

          return new Response(
            JSON.stringify({ trades: results, current_balance }),
            { headers: corsHeaders },
          );
        }
      }

      // --- DELETE ACCOUNT ROUTE ---
      if (request.method === "DELETE" && action === "account") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        const account_id = url.searchParams.get("account_id");
        if (!account_id)
          return new Response("Missing account_id", {
            status: 400,
            headers: corsHeaders,
          });

        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare("DELETE FROM trades WHERE license_key = ?")
          .bind(db_key)
          .run();
        await env.DB.prepare("DELETE FROM journal WHERE license_key = ?")
          .bind(db_key)
          .run();
        await env.DB.prepare("DELETE FROM trade_notes WHERE license_key = ?")
          .bind(db_key)
          .run();
        await env.DB.prepare(
          "DELETE FROM trade_strategies WHERE license_key = ?",
        )
          .bind(db_key)
          .run();
        await env.DB.prepare("DELETE FROM trade_images WHERE license_key = ?")
          .bind(db_key)
          .run();
        await env.DB.prepare("DELETE FROM user_settings WHERE license_key = ?")
          .bind(db_key)
          .run();
        await env.DB.prepare(
          "DELETE FROM user_accounts WHERE user_id = ? AND license_key = ?",
        )
          .bind(user_id, account_id)
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      // --- RESET DATABASE ROUTE ---
      if (request.method === "DELETE" && !action) {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        const account_id = url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;

        await env.DB.prepare("DELETE FROM trades WHERE license_key = ?")
          .bind(db_key)
          .run();
        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
