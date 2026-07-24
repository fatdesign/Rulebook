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

      // --- Archive Forex Factory events into permanent history, so trades
      // from past weeks can eventually be correlated against real news
      // (the upstream feed itself only ever exposes "this week"). ---
      async function archiveNewsEvents(env, events) {
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS news_events (
            id TEXT PRIMARY KEY,
            title TEXT,
            country TEXT,
            date TEXT,
            impact TEXT
          )
        `,
        ).run();

        const stmt = env.DB.prepare(
          "INSERT INTO news_events (id, title, country, date, impact) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
        );
        const rows = [];
        for (const ev of events) {
          if (!ev || !ev.date || !ev.country || !ev.title) continue;
          const id = `${ev.country}|${ev.date}|${ev.title}`;
          rows.push(stmt.bind(id, ev.title, ev.country, ev.date, ev.impact || "Low"));
        }
        for (let i = 0; i < rows.length; i += 50) {
          await env.DB.batch(rows.slice(i, i + 50));
        }
      }

      // --- Notification helper (reactions, comments, follows) ---
      async function createNotification(
        env,
        { recipient_user_id, actor_user_id, type, post_id, extra },
      ) {
        if (!recipient_user_id || recipient_user_id === actor_user_id) return;

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            recipient_user_id TEXT,
            actor_user_id TEXT,
            actor_username TEXT,
            type TEXT,
            post_id TEXT,
            extra TEXT,
            is_read INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
        ).run();

        const actor = await env.DB.prepare(
          "SELECT username FROM users WHERE id = ?",
        )
          .bind(actor_user_id)
          .first();
        const actorUsername = actor ? actor.username : "Someone";

        await env.DB.prepare(
          "INSERT INTO notifications (id, recipient_user_id, actor_user_id, actor_username, type, post_id, extra, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
        )
          .bind(
            crypto.randomUUID(),
            recipient_user_id,
            actor_user_id,
            actorUsername,
            type,
            post_id || null,
            extra || null,
            Math.floor(Date.now() / 1000),
          )
          .run();
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
      // nfs.faireconomy.media is flaky for Cloudflare Workers specifically
      // (shared Workers IP ranges get rate-limited/blocked intermittently),
      // so we cache the last good response in D1 and fall back to it
      // instead of showing "no news" whenever the live fetch fails.
      if (request.method === "GET" && action === "news") {
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS news_cache (
            id INTEGER PRIMARY KEY,
            data TEXT,
            fetched_at INTEGER
          )
        `,
        ).run();

        async function fetchLiveNews() {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          try {
            const ffResponse = await fetch(
              "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                  Accept: "application/json",
                  Referer: "https://www.forexfactory.com/",
                },
                signal: controller.signal,
              },
            );
            if (!ffResponse.ok) return null;
            const text = await ffResponse.text();
            const data = JSON.parse(text);
            if (!Array.isArray(data) || data.length === 0) return null;
            return { text, data };
          } catch (e) {
            return null;
          } finally {
            clearTimeout(timeout);
          }
        }

        // One retry - a single transient failure shouldn't force a fallback
        // to (potentially days-old) cached data if the second try succeeds.
        let live = await fetchLiveNews();
        if (!live) live = await fetchLiveNews();

        if (live) {
          try {
            await env.DB.prepare(
              "INSERT INTO news_cache (id, data, fetched_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, fetched_at=excluded.fetched_at",
            )
              .bind(live.text, Math.floor(Date.now() / 1000))
              .run();
          } catch (e) {}

          // Archive into a permanent history table too, since the upstream
          // API only ever exposes "this week" - this is how we build up
          // enough historical coverage to correlate trades with news over
          // time (see action=news_history / the correlation panel).
          try {
            await archiveNewsEvents(env, live.data);
          } catch (e) {}

          return new Response(live.text, { headers: corsHeaders });
        }

        // Live fetch failed twice - serve the last known-good cache instead
        // of an empty ticker, as long as it's not absurdly stale (7 days).
        try {
          const cached = await env.DB.prepare(
            "SELECT data, fetched_at FROM news_cache WHERE id = 1",
          ).first();
          const maxAge = 7 * 24 * 60 * 60;
          if (cached && Date.now() / 1000 - cached.fetched_at < maxAge) {
            return new Response(cached.data, { headers: corsHeaders });
          }
        } catch (e) {}

        return new Response(
          JSON.stringify({ error: "Failed to fetch news." }),
          { status: 500, headers: corsHeaders },
        );
      }

      // --- NEWS HISTORY (for trade/news correlation) ---
      // Serves the archived events built up by action=news over time.
      // Public market data, same as action=news - no auth required.
      if (request.method === "GET" && action === "news_history") {
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS news_events (
            id TEXT PRIMARY KEY,
            title TEXT,
            country TEXT,
            date TEXT,
            impact TEXT
          )
        `,
        ).run();

        const daysParam = parseInt(url.searchParams.get("days")) || 180;
        const sinceDate = new Date(
          Date.now() - daysParam * 24 * 60 * 60 * 1000,
        ).toISOString();

        const { results } = await env.DB.prepare(
          "SELECT title, country, date, impact FROM news_events WHERE date >= ? ORDER BY date ASC LIMIT 5000",
        )
          .bind(sinceDate)
          .all();

        return new Response(JSON.stringify(results || []), {
          headers: corsHeaders,
        });
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
            fire_count INTEGER DEFAULT 0,
            flex_count INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
          ).run();
          try {
            await env.DB.prepare(
              "ALTER TABLE community_posts ADD COLUMN fire_count INTEGER DEFAULT 0",
            ).run();
          } catch (e) {}
          try {
            await env.DB.prepare(
              "ALTER TABLE community_posts ADD COLUMN flex_count INTEGER DEFAULT 0",
            ).run();
          } catch (e) {}

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

      // Reaction type -> counter column on community_posts. Whitelisted
      // because column names can't be parameterized in SQL.
      const REACTION_COLUMNS = {
        heart: "likes",
        fire: "fire_count",
        flex: "flex_count",
      };

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

        const reaction = REACTION_COLUMNS[body.reaction] ? body.reaction : "heart";
        const column = REACTION_COLUMNS[reaction];

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS community_likes (
            post_id TEXT,
            user_id TEXT,
            reaction TEXT DEFAULT 'heart',
            PRIMARY KEY (post_id, user_id)
          )
        `,
        ).run();
        try {
          await env.DB.prepare(
            "ALTER TABLE community_likes ADD COLUMN reaction TEXT DEFAULT 'heart'",
          ).run();
        } catch (e) {}
        try {
          await env.DB.prepare(
            "ALTER TABLE community_posts ADD COLUMN fire_count INTEGER DEFAULT 0",
          ).run();
        } catch (e) {}
        try {
          await env.DB.prepare(
            "ALTER TABLE community_posts ADD COLUMN flex_count INTEGER DEFAULT 0",
          ).run();
        } catch (e) {}

        const existing = await env.DB.prepare(
          "SELECT reaction FROM community_likes WHERE post_id = ? AND user_id = ?",
        )
          .bind(body.post_id, user_id)
          .first();

        if (existing && existing.reaction === reaction) {
          // Same reaction clicked again -> remove it
          await env.DB.prepare(
            "DELETE FROM community_likes WHERE post_id = ? AND user_id = ?",
          )
            .bind(body.post_id, user_id)
            .run();
          await env.DB.prepare(
            `UPDATE community_posts SET ${column} = max(0, ${column} - 1) WHERE id = ?`,
          )
            .bind(body.post_id)
            .run();
          return new Response(
            JSON.stringify({ success: true, active: false, reaction }),
            { headers: corsHeaders },
          );
        } else if (existing) {
          // Switching from a different reaction to this one
          const oldColumn = REACTION_COLUMNS[existing.reaction] || "likes";
          await env.DB.prepare(
            "UPDATE community_likes SET reaction = ? WHERE post_id = ? AND user_id = ?",
          )
            .bind(reaction, body.post_id, user_id)
            .run();
          await env.DB.prepare(
            `UPDATE community_posts SET ${oldColumn} = max(0, ${oldColumn} - 1) WHERE id = ?`,
          )
            .bind(body.post_id)
            .run();
          await env.DB.prepare(
            `UPDATE community_posts SET ${column} = ${column} + 1 WHERE id = ?`,
          )
            .bind(body.post_id)
            .run();
          return new Response(
            JSON.stringify({ success: true, active: true, reaction }),
            { headers: corsHeaders },
          );
        } else {
          // New reaction
          await env.DB.prepare(
            "INSERT INTO community_likes (post_id, user_id, reaction) VALUES (?, ?, ?)",
          )
            .bind(body.post_id, user_id, reaction)
            .run();
          await env.DB.prepare(
            `UPDATE community_posts SET ${column} = ${column} + 1 WHERE id = ?`,
          )
            .bind(body.post_id)
            .run();

          // Notify the post owner (unless reacting to your own post).
          try {
            const post = await env.DB.prepare(
              "SELECT user_id FROM community_posts WHERE id = ?",
            )
              .bind(body.post_id)
              .first();
            if (post && post.user_id !== user_id) {
              await createNotification(env, {
                recipient_user_id: post.user_id,
                actor_user_id: user_id,
                type: "reaction",
                post_id: body.post_id,
                extra: reaction,
              });
            }
          } catch (e) {}

          return new Response(
            JSON.stringify({ success: true, active: true, reaction }),
            { headers: corsHeaders },
          );
        }
      }

      // --- FOLLOW / UNFOLLOW A COMMUNITY USER ---
      if (request.method === "POST" && action === "community_follow") {
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
        if (!body.target_user_id || body.target_user_id === user_id) {
          return new Response("Invalid target_user_id", {
            status: 400,
            headers: corsHeaders,
          });
        }

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS community_follows (
            follower_user_id TEXT,
            followee_user_id TEXT,
            created_at INTEGER,
            PRIMARY KEY (follower_user_id, followee_user_id)
          )
        `,
        ).run();

        const existing = await env.DB.prepare(
          "SELECT 1 FROM community_follows WHERE follower_user_id = ? AND followee_user_id = ?",
        )
          .bind(user_id, body.target_user_id)
          .first();

        if (existing) {
          await env.DB.prepare(
            "DELETE FROM community_follows WHERE follower_user_id = ? AND followee_user_id = ?",
          )
            .bind(user_id, body.target_user_id)
            .run();
          return new Response(
            JSON.stringify({ success: true, following: false }),
            { headers: corsHeaders },
          );
        } else {
          await env.DB.prepare(
            "INSERT INTO community_follows (follower_user_id, followee_user_id, created_at) VALUES (?, ?, ?)",
          )
            .bind(user_id, body.target_user_id, Math.floor(Date.now() / 1000))
            .run();

          try {
            await createNotification(env, {
              recipient_user_id: body.target_user_id,
              actor_user_id: user_id,
              type: "follow",
            });
          } catch (e) {}

          return new Response(
            JSON.stringify({ success: true, following: true }),
            { headers: corsHeaders },
          );
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
            fire_count INTEGER DEFAULT 0,
            flex_count INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
          ).run();
          try {
            await env.DB.prepare(
              "ALTER TABLE community_posts ADD COLUMN fire_count INTEGER DEFAULT 0",
            ).run();
          } catch (e) {}
          try {
            await env.DB.prepare(
              "ALTER TABLE community_posts ADD COLUMN flex_count INTEGER DEFAULT 0",
            ).run();
          } catch (e) {}

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_likes (
            post_id TEXT,
            user_id TEXT,
            reaction TEXT DEFAULT 'heart',
            PRIMARY KEY (post_id, user_id)
          )
        `,
          ).run();
          try {
            await env.DB.prepare(
              "ALTER TABLE community_likes ADD COLUMN reaction TEXT DEFAULT 'heart'",
            ).run();
          } catch (e) {}

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

          await env.DB.prepare(
            `
          CREATE TABLE IF NOT EXISTS community_follows (
            follower_user_id TEXT,
            followee_user_id TEXT,
            created_at INTEGER,
            PRIMARY KEY (follower_user_id, followee_user_id)
          )
        `,
          ).run();

          // Who the current user follows, for the "is_following" flag and
          // for scope=following filtering.
          const followsRes = await env.DB.prepare(
            "SELECT followee_user_id FROM community_follows WHERE follower_user_id = ?",
          )
            .bind(user_id)
            .all();
          const followedIds = (followsRes.results || []).map(
            (r) => r.followee_user_id,
          );
          const followedSet = new Set(followedIds);

          const scope = url.searchParams.get("scope");
          let results;
          if (scope === "following") {
            if (followedIds.length === 0) {
              results = [];
            } else {
              const placeholders = followedIds.map(() => "?").join(",");
              const followingRes = await env.DB.prepare(
                `SELECT * FROM community_posts WHERE user_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`,
              )
                .bind(...followedIds)
                .all();
              results = followingRes.results;
            }
          } else {
            const allRes = await env.DB.prepare(
              "SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50",
            ).all();
            results = allRes.results;
          }

          // Fetch the current user's reaction (if any) per post
          const reactionRes = await env.DB.prepare(
            "SELECT post_id, reaction FROM community_likes WHERE user_id = ?",
          )
            .bind(user_id)
            .all();
          const reactionByPost = {};
          (reactionRes.results || []).forEach((r) => {
            reactionByPost[r.post_id] = r.reaction || "heart";
          });

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

          // Journaling streak badge: consecutive days (ending today or
          // yesterday, so a streak isn't lost before the day is over) that
          // this post's author logged at least one journal entry, across
          // any of their linked accounts.
          const authorIds = [...new Set(results.map((p) => p.user_id))];
          const streakByUser = {};
          if (authorIds.length > 0) {
            try {
              const since = new Date();
              since.setUTCDate(since.getUTCDate() - 40);
              const sinceStr = since.toISOString().split("T")[0];
              const journalRes = await env.DB.prepare(
                "SELECT DISTINCT license_key, date FROM journal WHERE date >= ?",
              )
                .bind(sinceStr)
                .all();
              const authorIdSet = new Set(authorIds);
              const daysByUser = {};
              (journalRes.results || []).forEach((r) => {
                const uid = (r.license_key || "").split(":")[0];
                if (!authorIdSet.has(uid)) return;
                if (!daysByUser[uid]) daysByUser[uid] = new Set();
                daysByUser[uid].add(r.date);
              });

              const todayStr = new Date().toISOString().split("T")[0];
              const yesterdayDate = new Date();
              yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
              const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

              for (const uid of Object.keys(daysByUser)) {
                const days = daysByUser[uid];
                let cursor;
                if (days.has(todayStr)) cursor = new Date(`${todayStr}T00:00:00Z`);
                else if (days.has(yesterdayStr))
                  cursor = new Date(`${yesterdayStr}T00:00:00Z`);
                else continue; // streak already broken today - no badge

                let streak = 0;
                while (true) {
                  const dStr = cursor.toISOString().split("T")[0];
                  if (!days.has(dStr)) break;
                  streak++;
                  cursor.setUTCDate(cursor.getUTCDate() - 1);
                }
                streakByUser[uid] = streak;
              }
            } catch (e) {}
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
              reactions: {
                heart: post.likes || 0,
                fire: post.fire_count || 0,
                flex: post.flex_count || 0,
              },
              user_reaction: reactionByPost[post.id] || null,
              is_owner: post.user_id === user_id,
              is_following: followedSet.has(post.user_id),
              trade_data: parsedTrade,
              image_urls: parsedImages,
              comments: commentsByPost[post.id] || [],
              journal_streak: streakByUser[post.user_id] || 0,
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
            "SELECT license_key, symbol, side, net_profit, open_time, close_time FROM trades WHERE close_time >= ?",
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
                hold_ratio: [],
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
                winHoldSum: 0,
                winHoldCount: 0,
                lossHoldSum: 0,
                lossHoldCount: 0,
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
            const holdSec = (t.close_time || 0) - (t.open_time || 0);
            if (holdSec > 0) {
              if (netProfit > 0) {
                a.winHoldSum += holdSec;
                a.winHoldCount += 1;
              } else {
                a.lossHoldSum += holdSec;
                a.lossHoldCount += 1;
              }
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
                winHoldSum: 0,
                winHoldCount: 0,
                lossHoldSum: 0,
                lossHoldCount: 0,
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
            u.winHoldSum += a.winHoldSum;
            u.winHoldCount += a.winHoldCount;
            u.lossHoldSum += a.lossHoldSum;
            u.lossHoldCount += a.lossHoldCount;
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

          // "Lets winners run" award: ratio of avg winning hold time to avg
          // losing hold time. >1 means winners are held longer than losers.
          // Needs at least 3 of each this week, otherwise too noisy to rank.
          const holdRatio = users
            .filter((u) => u.winHoldCount >= 3 && u.lossHoldCount >= 3)
            .map((u) => {
              const avgWinHold = u.winHoldSum / u.winHoldCount;
              const avgLossHold = u.lossHoldSum / u.lossHoldCount;
              return {
                username: u.username,
                value: parseFloat((avgWinHold / avgLossHold).toFixed(2)),
                avg_win_hold_sec: Math.round(avgWinHold),
                avg_loss_hold_sec: Math.round(avgLossHold),
              };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          return new Response(
            JSON.stringify({
              commissions,
              gain_pct: gainPct,
              biggest_win: biggestWin,
              most_trades: mostTrades,
              hold_ratio: holdRatio,
              week_start: weekStart,
            }),
            { headers: corsHeaders },
          );
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      // --- COMMUNITY DISCIPLINE LEADERBOARD (weekly) ---
      // A second, profit-blind leaderboard so small accounts have something
      // to compete for too: fewest SL widenings, playbook compliance, winrate.
      if (
        request.method === "GET" &&
        action === "community_discipline_leaderboard"
      ) {
        try {
          const user_id = await authenticateUser(request, env);
          if (!user_id)
            return new Response("Unauthorized", {
              status: 401,
              headers: corsHeaders,
            });

          const now = new Date();
          const day = now.getUTCDay();
          const daysToMonday = day === 0 ? -6 : 1 - day;
          const weekStart = Math.floor(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() + daysToMonday,
            ) / 1000,
          );

          const { results: tradeRows } = await env.DB.prepare(
            "SELECT license_key, net_profit, sl_widened FROM trades WHERE close_time >= ?",
          )
            .bind(weekStart)
            .all();

          const perAccount = {};
          for (const t of tradeRows) {
            if (!perAccount[t.license_key]) {
              perAccount[t.license_key] = { count: 0, wins: 0, widenedSum: 0 };
            }
            const a = perAccount[t.license_key];
            a.count += 1;
            if ((parseFloat(t.net_profit) || 0) > 0) a.wins += 1;
            a.widenedSum += t.sl_widened || 0;
          }

          let checklistRows = [];
          try {
            const res = await env.DB.prepare(
              "SELECT t.license_key AS license_key, tcr.ticket AS ticket, tcr.passed AS passed FROM trade_checklist_results tcr JOIN trades t ON t.ticket = tcr.ticket WHERE t.close_time >= ?",
            )
              .bind(weekStart)
              .all();
            checklistRows = res.results || [];
          } catch (e) {}

          const perAccountChecklist = {};
          for (const r of checklistRows) {
            if (!perAccountChecklist[r.license_key]) {
              perAccountChecklist[r.license_key] = {
                passedSum: 0,
                totalCount: 0,
                tickets: new Set(),
              };
            }
            const c = perAccountChecklist[r.license_key];
            c.passedSum += r.passed ? 1 : 0;
            c.totalCount += 1;
            c.tickets.add(r.ticket);
          }

          const licenseKeys = [
            ...new Set([
              ...Object.keys(perAccount),
              ...Object.keys(perAccountChecklist),
            ]),
          ];

          if (!licenseKeys.length) {
            return new Response(
              JSON.stringify({
                fewest_sl_widened: [],
                playbook_compliance: [],
                best_winrate: [],
                week_start: weekStart,
              }),
              { headers: corsHeaders },
            );
          }

          const userIds = [
            ...new Set(licenseKeys.map((lk) => lk.split(":")[0])),
          ];
          const userMap = {};
          if (userIds.length) {
            const placeholders = userIds.map(() => "?").join(",");
            const uRows = await env.DB
              .prepare(
                `SELECT id, username FROM users WHERE id IN (${placeholders})`,
              )
              .bind(...userIds)
              .all();
            (uRows.results || []).forEach((u) => {
              userMap[u.id] = u.username || "Trader";
            });
          }

          const perUser = {};
          function ensureUser(uid) {
            if (!perUser[uid]) {
              perUser[uid] = {
                username: userMap[uid] || "Trader",
                count: 0,
                wins: 0,
                widenedSum: 0,
                passedSum: 0,
                checklistTotal: 0,
                checklistTickets: new Set(),
              };
            }
            return perUser[uid];
          }

          for (const lk of Object.keys(perAccount)) {
            const uid = lk.split(":")[0];
            const u = ensureUser(uid);
            const a = perAccount[lk];
            u.count += a.count;
            u.wins += a.wins;
            u.widenedSum += a.widenedSum;
          }
          for (const lk of Object.keys(perAccountChecklist)) {
            const uid = lk.split(":")[0];
            const u = ensureUser(uid);
            const c = perAccountChecklist[lk];
            u.passedSum += c.passedSum;
            u.checklistTotal += c.totalCount;
            c.tickets.forEach((tk) => u.checklistTickets.add(tk));
          }

          const users = Object.values(perUser);

          const fewestSlWidened = users
            .filter((u) => u.count >= 5)
            .map((u) => ({
              username: u.username,
              value: parseFloat(((u.widenedSum / u.count) * 100).toFixed(1)),
              widened_count: u.widenedSum,
              trade_count: u.count,
            }))
            .sort((a, b) => a.value - b.value)
            .slice(0, 5);

          const playbookCompliance = users
            .filter((u) => u.checklistTickets.size >= 3)
            .map((u) => ({
              username: u.username,
              value: parseFloat(
                ((u.passedSum / u.checklistTotal) * 100).toFixed(1),
              ),
              graded_trades: u.checklistTickets.size,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          const bestWinrate = users
            .filter((u) => u.count >= 5)
            .map((u) => ({
              username: u.username,
              value: parseFloat(((u.wins / u.count) * 100).toFixed(1)),
              trade_count: u.count,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          return new Response(
            JSON.stringify({
              fewest_sl_widened: fewestSlWidened,
              playbook_compliance: playbookCompliance,
              best_winrate: bestWinrate,
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

          try {
            const post = await env.DB.prepare(
              "SELECT user_id FROM community_posts WHERE id = ?",
            )
              .bind(body.post_id)
              .first();
            if (post) {
              await createNotification(env, {
                recipient_user_id: post.user_id,
                actor_user_id: user_id,
                type: "comment",
                post_id: body.post_id,
                extra: String(body.content).slice(0, 80),
              });
            }
          } catch (e) {}

          return new Response(
            JSON.stringify({ success: true, comment_id, username, created_at }),
            { headers: corsHeaders },
          );
        } catch (e) {
          return new Response(e.message, { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === "POST" && action === "notifications_mark_read") {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            recipient_user_id TEXT,
            actor_user_id TEXT,
            actor_username TEXT,
            type TEXT,
            post_id TEXT,
            extra TEXT,
            is_read INTEGER DEFAULT 0,
            created_at INTEGER
          )
        `,
        ).run();

        await env.DB.prepare(
          "UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ?",
        )
          .bind(user_id)
          .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders,
        });
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

        // Pull in recent Mental Journal entries so the coach can connect
        // mindset/mood with what actually happened in the trades.
        let journalContext = "Keine Journal-Einträge vorhanden.";
        try {
          const journalRes = await env.DB.prepare(
            "SELECT date, content, plan_followed, emotional_state, mood FROM journal WHERE license_key = ? ORDER BY date DESC LIMIT 14",
          )
            .bind(db_key)
            .all();
          const entries = journalRes.results || [];
          if (entries.length > 0) {
            journalContext = entries
              .map((e) => {
                const parts = [`Datum: ${e.date}`];
                if (e.mood) parts.push(`Stimmung: ${e.mood}`);
                if (e.emotional_state !== null && e.emotional_state !== undefined)
                  parts.push(`Emotionaler Zustand (1-5): ${e.emotional_state}`);
                if (e.plan_followed !== null && e.plan_followed !== undefined)
                  parts.push(`Plan befolgt: ${e.plan_followed ? "Ja" : "Nein"}`);
                if (e.content) parts.push(`Notiz: "${e.content}"`);
                return parts.join(", ");
              })
              .join("\n");
          }
        } catch (e) {}

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
Mental Journal Einträge der letzten Tage (chronologisch absteigend):
${journalContext}
WICHTIGE REGELN:
1. Sprich den Trader IMMER direkt mit "Du" an.
2. KEINE EINLEITUNG! Starte direkt mit dem ersten Punkt der Analyse. Phrasen wie "Ich werde nun deine Trades analysieren" oder "Deine Statistiken zeigen, dass..." sind STRIKT VERBOTEN. Komm sofort zur Sache.
3. Nenne KEINE genauen Zeitstempel oder rohen Daten aus dem JSON, sondern leite wertvolle Schlüsse ab.
4. Beziehe dich explizit auf die Statistiken: Welche Strategie ist am profitabelsten/schlechtesten? Welche Wochentage oder Uhrzeiten (Heatmap) sind Stärken/Schwächen? Sind kurze oder lange Haltedauern besser?
5. Berechne und empfehle EINEN konkreten "Kill Switch" (Daily Loss Limit) basierend auf dem durchschnittlichen Verlust (z.B. 2-3x Avg Loss oder max Drawdown). Erkläre kurz, warum dieser Wert sinnvoll ist.
6. KONTROLLIERE DAS PROFIL: Passt das angegebene Profil (Style, Session, Risk) zum tatsächlichen Verhalten?
7. Gib hartes, ehrliches Feedback. Lobe bei Disziplin, kritisiere bei Fehlern. Wenn bei Trades "sl_widened" > 0 ist, weise den Trader STRENG darauf hin, dass das Verschieben des Stop Loss in den Verlustbereich ein gefährlicher Disziplinverstoß (Hoffnungstrading) ist! Achte auch auf Tags/Notizen der Trades.
8. VERKNÜPFE MENTAL JOURNAL MIT TRADES: Wenn Journal-Einträge vorhanden sind, stelle explizit einen Zusammenhang zwischen Stimmung/emotionalem Zustand/Plan-Treue und der tatsächlichen Trading-Performance an diesen Tagen her (z.B. "an Tagen mit Stimmung X liefst du schlechter"). Wenn keine Einträge vorhanden sind, ignoriere diesen Punkt einfach.
9. Gib am Ende EINEN starken Ratschlag zur Verbesserung.
10. SPRACHE EXTREM WICHTIG: Antworte NUR auf ${promptLang}! Übersetze deine gesamte finale Antwort in ${promptLang}.
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

      // --- WEEKLY AI REPORT (auto-generated recap, cached per calendar week) ---
      if (
        (request.method === "GET" || request.method === "POST") &&
        action === "weekly_report"
      ) {
        const user_id = await authenticateUser(request, env);
        if (!user_id)
          return new Response("Unauthorized", {
            status: 401,
            headers: corsHeaders,
          });

        let body = {};
        if (request.method === "POST") {
          try {
            body = await request.json();
          } catch (e) {
            body = {};
          }
        }

        const account_id =
          body.account_id || url.searchParams.get("account_id") || "default";
        const db_key = `${user_id}:${account_id}`;
        const language =
          body.language || url.searchParams.get("language") || "de";
        const langMap = {
          de: "Deutsch",
          en: "English",
          es: "Español",
          tr: "Türkçe",
        };
        const promptLang = langMap[language] || "Deutsch";

        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS weekly_reports (
            license_key TEXT,
            week_key TEXT,
            report_text TEXT,
            trade_count INTEGER,
            generated_at INTEGER,
            regen_count INTEGER DEFAULT 0,
            PRIMARY KEY (license_key, week_key)
          )`,
        ).run();
        try {
          await env.DB.prepare(
            "ALTER TABLE weekly_reports ADD COLUMN language TEXT",
          ).run();
        } catch (e) {}

        // Monday 00:00:00 UTC of the current week -> used as the week key & window start
        const now = new Date();
        const dayOfWeek = now.getUTCDay(); // 0 = Sunday
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - diffToMonday,
          ),
        );
        const nextMonday = new Date(
          monday.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
        const weekKey = monday.toISOString().split("T")[0];
        const weekStartSec = Math.floor(monday.getTime() / 1000);
        const weekEndSec = Math.floor(nextMonday.getTime() / 1000);

        const forceRegen = request.method === "POST" && body.force === true;

        const existing = await env.DB.prepare(
          "SELECT * FROM weekly_reports WHERE license_key = ? AND week_key = ?",
        )
          .bind(db_key, weekKey)
          .first();

        // A cached report written in another language (or written before we
        // tracked language at all) doesn't count as a valid cache hit - it
        // needs a fresh generation in the requested language, but that
        // shouldn't burn one of the user's manual "regenerate" credits.
        const languageMismatch = !!(
          existing &&
          existing.language &&
          existing.language !== language
        );
        const legacyNoLanguage = !!(existing && !existing.language);
        const needsLanguageRegen = languageMismatch || legacyNoLanguage;

        if (existing && !forceRegen && !needsLanguageRegen) {
          return new Response(
            JSON.stringify({
              report: existing.report_text,
              week_key: weekKey,
              trade_count: existing.trade_count,
              generated_at: existing.generated_at,
              cached: true,
              regen_left: Math.max(0, 3 - (existing.regen_count || 0)),
            }),
            { headers: corsHeaders },
          );
        }

        if (
          forceRegen &&
          !needsLanguageRegen &&
          existing &&
          (existing.regen_count || 0) >= 3
        ) {
          return new Response(
            JSON.stringify({
              error: "Regenerierungs-Limit für diese Woche erreicht.",
            }),
            { status: 403, headers: corsHeaders },
          );
        }

        const tradesRes = await env.DB.prepare(
          "SELECT * FROM trades WHERE license_key = ? AND close_time >= ? AND close_time < ? ORDER BY close_time ASC",
        )
          .bind(db_key, weekStartSec, weekEndSec)
          .all();
        const weekTrades = tradesRes.results || [];

        if (weekTrades.length < 3) {
          return new Response(
            JSON.stringify({
              report: null,
              reason: "not_enough_trades",
              trade_count: weekTrades.length,
              week_key: weekKey,
            }),
            { headers: corsHeaders },
          );
        }

        // Aggregate stats for the prompt
        const weekdayNames = [
          "Sonntag",
          "Montag",
          "Dienstag",
          "Mittwoch",
          "Donnerstag",
          "Freitag",
          "Samstag",
        ];
        const byWeekday = {};
        const byHour = {};
        let wins = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let slWidenedCount = 0;
        const symbolCounts = {};

        for (const t of weekTrades) {
          const profit = parseFloat(t.net_profit) || 0;
          if (profit > 0) {
            wins++;
            grossProfit += profit;
          } else {
            grossLoss += profit;
          }
          if (t.sl_widened) slWidenedCount++;
          symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;

          const d = new Date(t.close_time * 1000);
          const wd = weekdayNames[d.getUTCDay()];
          const hr = d.getUTCHours();
          byWeekday[wd] = (byWeekday[wd] || 0) + profit;
          byHour[hr] = (byHour[hr] || 0) + profit;
        }

        const sortedWeekdays = Object.entries(byWeekday).sort(
          (a, b) => b[1] - a[1],
        );
        const sortedHours = Object.entries(byHour).sort(
          (a, b) => b[1] - a[1],
        );
        const topSymbol = Object.entries(symbolCounts).sort(
          (a, b) => b[1] - a[1],
        )[0];

        const statsSummary = {
          zeitraum: `${weekKey} bis ${nextMonday.toISOString().split("T")[0]}`,
          anzahl_trades: weekTrades.length,
          winrate: ((wins / weekTrades.length) * 100).toFixed(1) + "%",
          netto_ergebnis: (grossProfit + grossLoss).toFixed(2),
          bester_wochentag: sortedWeekdays[0] ? sortedWeekdays[0][0] : "-",
          schlechtester_wochentag: sortedWeekdays[sortedWeekdays.length - 1]
            ? sortedWeekdays[sortedWeekdays.length - 1][0]
            : "-",
          beste_uhrzeit_utc: sortedHours[0] ? sortedHours[0][0] + ":00" : "-",
          schlechteste_uhrzeit_utc: sortedHours[sortedHours.length - 1]
            ? sortedHours[sortedHours.length - 1][0] + ":00"
            : "-",
          meistgehandeltes_symbol: topSymbol ? topSymbol[0] : "-",
          sl_verschoben_anzahl: slWidenedCount,
        };

        const prompt = `SPRACHE / LANGUAGE / IDIOMA / DİL: Antworte ausschließlich auf ${promptLang}. Deine GESAMTE Antwort muss auf ${promptLang} sein - unabhängig davon, in welcher Sprache die folgenden Anweisungen und Daten formuliert sind.

Du bist ein direkter, erfahrener Trading-Mentor und schreibst einen kurzen Wochenrückblick für einen Trader, der automatisch jeden Montag generiert wird.
Statistiken der vergangenen Handelswoche: ${JSON.stringify(statsSummary)}
WICHTIGE REGELN:
1. Sprich den Trader IMMER direkt mit "Du" an.
2. KEINE EINLEITUNG. Starte direkt mit der wichtigsten Erkenntnis der Woche.
3. Nenne KEINE rohen Zeitstempel, sondern leite Muster ab (z.B. "montags läuft es bei dir deutlich besser als freitags").
4. Wenn sl_verschoben_anzahl > 0 ist, weise klar darauf hin, dass das Verschieben des Stop Loss ein Disziplinproblem ist.
5. Maximal 3-4 Sätze, wie ein kurzes Montags-Briefing. Kein Blabla.
6. Beende mit EINEM konkreten, umsetzbaren Tipp für die kommende Woche.
7. SPRACHE EXTREM WICHTIG: Antworte NUR auf ${promptLang}! Übersetze deine gesamte finale Antwort komplett in ${promptLang}, auch wenn Regeln und Statistiken oben auf Deutsch stehen.`;

        if (!env.AI)
          return new Response(
            JSON.stringify({ error: "Cloudflare AI Binding fehlt." }),
            { status: 500, headers: corsHeaders },
          );

        const userTriggerMap = {
          de: "Schreibe jetzt meinen Wochenrückblick auf Deutsch.",
          en: "Now write my weekly recap in English.",
          es: "Ahora escribe mi resumen semanal en español.",
          tr: "Şimdi haftalık özetimi Türkçe yaz.",
        };
        const userTrigger = userTriggerMap[language] || userTriggerMap.de;

        let weeklyAiResponse;
        try {
          weeklyAiResponse = await env.AI.run(
            "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
            {
              messages: [
                { role: "system", content: prompt },
                { role: "user", content: userTrigger },
              ],
              max_tokens: 400,
            },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "Cloudflare AI Fehler: " + err.message }),
            { status: 500, headers: corsHeaders },
          );
        }

        const reportText = weeklyAiResponse.response || null;
        const generatedAt = Math.floor(Date.now() / 1000);
        const newRegenCount =
          forceRegen && !needsLanguageRegen && existing
            ? (existing.regen_count || 0) + 1
            : existing
              ? existing.regen_count || 0
              : 0;

        await env.DB.prepare(
          "INSERT INTO weekly_reports (license_key, week_key, report_text, trade_count, generated_at, regen_count, language) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(license_key, week_key) DO UPDATE SET report_text=excluded.report_text, trade_count=excluded.trade_count, generated_at=excluded.generated_at, regen_count=excluded.regen_count, language=excluded.language",
        )
          .bind(
            db_key,
            weekKey,
            reportText,
            weekTrades.length,
            generatedAt,
            newRegenCount,
            language,
          )
          .run();

        return new Response(
          JSON.stringify({
            report: reportText,
            week_key: weekKey,
            trade_count: weekTrades.length,
            generated_at: generatedAt,
            cached: false,
            regen_left: Math.max(0, 3 - newRegenCount),
          }),
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
            max_daily_loss REAL DEFAULT 0
          )
        `,
        ).run();

        await env.DB.prepare(
          `
          INSERT INTO user_settings (license_key, kill_switch_active, max_daily_loss)
          VALUES (?, ?, ?)
          ON CONFLICT(license_key) DO UPDATE SET
            kill_switch_active=excluded.kill_switch_active,
            max_daily_loss=excluded.max_daily_loss
        `,
        )
          .bind(
            db_key,
            body.kill_switch_active ? 1 : 0,
            body.max_daily_loss || 0,
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
            license_key TEXT, date TEXT, content TEXT,
            plan_followed INTEGER, emotional_state INTEGER, mood TEXT,
            PRIMARY KEY (license_key, date)
          )
        `,
        ).run();
        try {
          await env.DB.prepare(
            "ALTER TABLE journal ADD COLUMN plan_followed INTEGER",
          ).run();
        } catch (e) {}
        try {
          await env.DB.prepare(
            "ALTER TABLE journal ADD COLUMN emotional_state INTEGER",
          ).run();
        } catch (e) {}
        try {
          await env.DB.prepare("ALTER TABLE journal ADD COLUMN mood TEXT").run();
        } catch (e) {}

        // Careful: the "No" button sends the STRING "0", which is truthy in
        // JS - a plain `body.plan_followed ? 1 : 0` would wrongly save it as 1.
        const planFollowed =
          body.plan_followed === null ||
          body.plan_followed === undefined ||
          body.plan_followed === ""
            ? null
            : body.plan_followed === "0" ||
                body.plan_followed === 0 ||
                body.plan_followed === false
              ? 0
              : 1;
        const emotionalState =
          body.emotional_state === null || body.emotional_state === undefined
            ? null
            : parseInt(body.emotional_state);
        const mood = body.mood || null;

        await env.DB.prepare(
          `
          INSERT INTO journal (license_key, date, content, plan_followed, emotional_state, mood)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(license_key, date) DO UPDATE SET
            content=excluded.content,
            plan_followed=excluded.plan_followed,
            emotional_state=excluded.emotional_state,
            mood=excluded.mood
        `,
        )
          .bind(db_key, dateStr, body.content || "", planFollowed, emotionalState, mood)
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
        await env.DB.prepare(
          `
          CREATE TABLE IF NOT EXISTS strategy_checklist_items (
            id TEXT PRIMARY KEY, strategy_id TEXT, user_id TEXT, text TEXT, item_order INTEGER
          )
        `,
        ).run();

        if (body.delete_id) {
          await env.DB.prepare(
            "DELETE FROM strategy_definitions WHERE id = ? AND user_id = ?",
          )
            .bind(body.delete_id, user_id)
            .run();
          await env.DB.prepare(
            "DELETE FROM strategy_checklist_items WHERE strategy_id = ? AND user_id = ?",
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

        // Sync the checklist: keep existing item IDs stable across edits
        // (update in place) so trade grading history doesn't get silently
        // orphaned every time a strategy is edited. Only new items get a
        // fresh ID, and items the user removed get pruned (along with any
        // grading results that reference them).
        if (Array.isArray(body.checklist)) {
          const items = body.checklist.filter(
            (it) => it && typeof it.text === "string" && it.text.trim() !== "",
          );

          const keptIds = [];
          const batch = [];
          items.forEach((it, idx) => {
            if (it.id) {
              keptIds.push(it.id);
              batch.push(
                env.DB.prepare(
                  "UPDATE strategy_checklist_items SET text = ?, item_order = ? WHERE id = ? AND strategy_id = ? AND user_id = ?",
                ).bind(it.text.trim(), idx, it.id, id, user_id),
              );
            } else {
              const newId = crypto.randomUUID();
              keptIds.push(newId);
              batch.push(
                env.DB.prepare(
                  "INSERT INTO strategy_checklist_items (id, strategy_id, user_id, text, item_order) VALUES (?, ?, ?, ?, ?)",
                ).bind(newId, id, user_id, it.text.trim(), idx),
              );
            }
          });
          if (batch.length > 0) await env.DB.batch(batch);

          // Prune items that were removed in the editor.
          const existingRes = await env.DB.prepare(
            "SELECT id FROM strategy_checklist_items WHERE strategy_id = ? AND user_id = ?",
          )
            .bind(id, user_id)
            .all();
          const removedIds = (existingRes.results || [])
            .map((r) => r.id)
            .filter((existingId) => !keptIds.includes(existingId));
          if (removedIds.length > 0) {
            const placeholders = removedIds.map(() => "?").join(",");
            await env.DB.prepare(
              `DELETE FROM strategy_checklist_items WHERE id IN (${placeholders})`,
            )
              .bind(...removedIds)
              .run();
            try {
              await env.DB.prepare(
                `DELETE FROM trade_checklist_results WHERE item_id IN (${placeholders})`,
              )
                .bind(...removedIds)
                .run();
            } catch (e) {}
          }
        }

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

      // --- TRADE CHECKLIST GRADING ROUTE (POST) - playbook compliance ---
      if (request.method === "POST" && action === "trade_checklist") {
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
          CREATE TABLE IF NOT EXISTS trade_checklist_results (
            license_key TEXT, ticket TEXT, item_id TEXT, passed INTEGER,
            PRIMARY KEY (license_key, ticket, item_id)
          )
        `,
        ).run();

        // Replace-all for this ticket's graded results (a handful of rows).
        await env.DB.prepare(
          "DELETE FROM trade_checklist_results WHERE license_key = ? AND ticket = ?",
        )
          .bind(db_key, String(body.ticket))
          .run();

        const results = Array.isArray(body.results) ? body.results : [];
        if (results.length > 0) {
          const stmt = env.DB.prepare(
            "INSERT INTO trade_checklist_results (license_key, ticket, item_id, passed) VALUES (?, ?, ?, ?)",
          );
          const batch = results
            .filter((r) => r && r.item_id)
            .map((r) =>
              stmt.bind(db_key, String(body.ticket), r.item_id, r.passed ? 1 : 0),
            );
          if (batch.length > 0) await env.DB.batch(batch);
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
                max_daily_loss REAL DEFAULT 0
              )
            `,
          ).run();
          const res = await env.DB.prepare(
            "SELECT kill_switch_active, max_daily_loss FROM user_settings WHERE license_key = ?",
          )
            .bind(db_key)
            .first();
          return new Response(
            JSON.stringify(
              res || {
                kill_switch_active: 0,
                max_daily_loss: 0,
              },
            ),
            { headers: corsHeaders },
          );
        }

        if (action === "notifications") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                recipient_user_id TEXT,
                actor_user_id TEXT,
                actor_username TEXT,
                type TEXT,
                post_id TEXT,
                extra TEXT,
                is_read INTEGER DEFAULT 0,
                created_at INTEGER
              )
            `,
          ).run();

          const { results } = await env.DB.prepare(
            "SELECT id, actor_username, type, post_id, extra, is_read, created_at FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC LIMIT 30",
          )
            .bind(user_id)
            .all();
          const unreadRes = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM notifications WHERE recipient_user_id = ? AND is_read = 0",
          )
            .bind(user_id)
            .first();

          return new Response(
            JSON.stringify({
              notifications: results || [],
              unread_count: (unreadRes && unreadRes.count) || 0,
            }),
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
                license_key TEXT, date TEXT, content TEXT,
                plan_followed INTEGER, emotional_state INTEGER, mood TEXT,
                PRIMARY KEY (license_key, date)
              )
            `,
          ).run();
          try {
            await env.DB.prepare(
              "ALTER TABLE journal ADD COLUMN plan_followed INTEGER",
            ).run();
          } catch (e) {}
          try {
            await env.DB.prepare(
              "ALTER TABLE journal ADD COLUMN emotional_state INTEGER",
            ).run();
          } catch (e) {}
          try {
            await env.DB.prepare("ALTER TABLE journal ADD COLUMN mood TEXT").run();
          } catch (e) {}
          const res = await env.DB.prepare(
            "SELECT content, plan_followed, emotional_state, mood FROM journal WHERE license_key = ? AND date = ?",
          )
            .bind(db_key, dateStr)
            .first();
          return new Response(
            JSON.stringify(
              res || {
                content: "",
                plan_followed: null,
                emotional_state: null,
                mood: null,
              },
            ),
            { headers: corsHeaders },
          );
        }

        if (action === "journal_history") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS journal (
                license_key TEXT, date TEXT, content TEXT,
                plan_followed INTEGER, emotional_state INTEGER, mood TEXT,
                PRIMARY KEY (license_key, date)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT date, plan_followed, emotional_state, mood FROM journal WHERE license_key = ? AND mood IS NOT NULL ORDER BY date DESC LIMIT 180",
          )
            .bind(db_key)
            .all();
          return new Response(JSON.stringify(results || []), {
            headers: corsHeaders,
          });
        }

        // Lightweight: just which dates actually have a real journal entry
        // (not an empty row created by opening+saving without filling
        // anything), so the calendar/daily-stats table can highlight them.
        if (action === "journal_dates") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS journal (
                license_key TEXT, date TEXT, content TEXT,
                plan_followed INTEGER, emotional_state INTEGER, mood TEXT,
                PRIMARY KEY (license_key, date)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            `SELECT date FROM journal WHERE license_key = ? AND (
              (content IS NOT NULL AND TRIM(content) != '')
              OR plan_followed IS NOT NULL
              OR emotional_state IS NOT NULL
              OR mood IS NOT NULL
            )`,
          )
            .bind(db_key)
            .all();
          return new Response(
            JSON.stringify((results || []).map((r) => r.date)),
            { headers: corsHeaders },
          );
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
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS strategy_checklist_items (
                id TEXT PRIMARY KEY, strategy_id TEXT, user_id TEXT, text TEXT, item_order INTEGER
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT id, name, description FROM strategy_definitions WHERE user_id = ?",
          )
            .bind(user_id)
            .all();

          const { results: checklistRows } = await env.DB.prepare(
            "SELECT id, strategy_id, text FROM strategy_checklist_items WHERE user_id = ? ORDER BY item_order ASC",
          )
            .bind(user_id)
            .all();
          const checklistByStrategy = {};
          (checklistRows || []).forEach((row) => {
            if (!checklistByStrategy[row.strategy_id]) checklistByStrategy[row.strategy_id] = [];
            checklistByStrategy[row.strategy_id].push({ id: row.id, text: row.text });
          });
          const withChecklist = (results || []).map((s) => ({
            ...s,
            checklist: checklistByStrategy[s.id] || [],
          }));

          return new Response(JSON.stringify(withChecklist), {
            headers: corsHeaders,
          });
        }

        if (action === "trade_checklist") {
          await env.DB.prepare(
            `
              CREATE TABLE IF NOT EXISTS trade_checklist_results (
                license_key TEXT, ticket TEXT, item_id TEXT, passed INTEGER,
                PRIMARY KEY (license_key, ticket, item_id)
              )
            `,
          ).run();
          const { results } = await env.DB.prepare(
            "SELECT ticket, item_id, passed FROM trade_checklist_results WHERE license_key = ?",
          )
            .bind(db_key)
            .all();
          return new Response(JSON.stringify(results || []), {
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
        await env.DB.prepare(
          "DELETE FROM trade_checklist_results WHERE license_key = ?",
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
