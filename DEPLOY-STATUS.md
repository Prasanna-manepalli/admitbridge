# AdmitBridge — Deployment Status (save point)

Updated: Aug 12, 2026 (evening)

## ✅ Already done — do not redo

- Code pushed to GitHub: `Anudeepkumardekkapati/Admit-Bridge` (branch `main`, latest commit `97383c9`)
- Deployment configs in repo: `render.yaml` (Blueprint) + `vercel.json` (root dir `client`, SPA rewrites)
- Backend reads `PORT`, `MONGODB_URI`, `JWT_SECRET`, `ML_SERVICE_URL` from environment variables (no hardcoded secrets)
- MongoDB Atlas cluster **Cluster0** exists; **database already seeded** (13 universities, users, 5 applications)
  - DB user: `kumaranudeep00_db_user` (password in this chat history)
- Render backend service **created**: `admitbridge-server` — Node, root `server`, build `npm install`, start `node server.js`, health path `/api/health`, env vars `MONGODB_URI`, `JWT_SECRET`, `ML_SERVICE_URL`
  - ⚠️ First deploy FAILED with `MongoDB connection error: ... IP that isn't whitelisted` — this is the one thing to fix (below)

## ⏭️ Step 1 — Fix Atlas IP whitelist (the current blocker)

1. Open MongoDB Atlas → left sidebar → **SECURITY → Network Access**
2. Click the **Network Access** tab (not "Database Access")
3. Click **+ Add IP Address** → select **Allow access from anywhere** (`0.0.0.0/0`) → **Confirm**
4. Wait ~2 minutes until the row shows **Active**

## ⏭️ Step 2 — Redeploy backend on Render

1. Render → **admitbridge-server** service → **Manual Deploy** ▾ → **Deploy latest commit**
2. Success looks like: `MongoDB connected: ac-...mongodb.net` then `AdmitBridge server running on ...`
3. Verify in browser: `https://admitbridge-server.onrender.com/api/health` → `{"status":"ok",...}`

## ⏭️ Step 3 — Create the ML service (if not created yet)

- Render → New → Web Service → repo Admit-Bridge
- Name `admitbridge-ml` · Language **Python 3** · Branch `main` · Root directory `ml`
- Build: `pip install -r requirements.txt` · Start: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- Health check path `/health` (optional). Wait for **Live**, copy its URL.
- Backend already has `ML_SERVICE_URL` set — update it if the URL differs from `https://admitbridge-ml.onrender.com`

## ⏭️ Step 4 — Deploy frontend on Vercel (the share link)

1. vercel.com → Add New Project → import Admit-Bridge (auto-detects from `vercel.json`)
2. Env var: `VITE_API_URL` = `https://admitbridge-server.onrender.com/api`
3. Deploy → share `https://admitbridge.vercel.app`

## 📝 Notes / gotchas

- Render free instances **spin down after ~15 min idle** and can take ~50 s to wake (first request). Just refresh.
- If a deploy shows `MongoDB connection error: ... IP that isn't whitelisted` again → fix Atlas access list, then Manual Deploy. Never a code change.
- Demo logins (password `password123` for all): `student@admitbridge.com`, `anudeep@example.com`, `consultant@admitbridge.com`, `admin@admitbridge.com`
- The real `MONGODB_URI` (with password) and `JWT_SECRET` are only in this chat / Render's env settings — never commit them.
