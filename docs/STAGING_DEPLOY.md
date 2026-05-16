# Staging Deployment Guide — v0.5 Beta

## Architecture

```
Internet → Vercel (Next.js frontend) → Railway/Render (FastAPI backend) → PostgreSQL
```

## Step 1 — Deploy the backend (teammate's responsibility)

The backend lives in `Backend-V2/`. Deploy it to Railway or Render:

### Railway (recommended)
```bash
# From Backend-V2/
railway login
railway link   # link to existing project or create new
railway up
```

Get the deployed backend URL (e.g. `https://moeys-backend.railway.app`).

### Render
1. Create a new Web Service in Render
2. Connect GitHub repo, select `Backend-V2/` as root
3. Runtime: Python 3.11
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set environment variables (DATABASE_URL, SECRET_KEY, etc.)

After deployment, note the backend URL.

---

## Step 2 — Deploy the frontend (Vercel)

The frontend repo is at: `https://github.com/Moeyes/final`

### Option A — Vercel CLI (fastest)
```bash
cd final/
pnpm dlx vercel login
pnpm dlx vercel deploy --prod
```

During the wizard:
- Select project or create new
- Root directory: `.` (the `final/` directory is the project root)
- Framework: Next.js (auto-detected)

### Option B — Vercel dashboard
1. Go to vercel.com → New Project → Import Git Repository
2. Select `Moeyes/final`
3. Root Directory: `final/` (if repo root is `moeys/`, otherwise `.`)
4. Framework: Next.js

### Environment variables (set in Vercel dashboard → Settings → Environment Variables)

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://moeys-backend.railway.app` | Backend URL |
| `JWT_SECRET` | (same as backend secret) | For token verification in API routes |

After adding env vars, **redeploy** (Deployments → Redeploy).

---

## Step 3 — Verify CORS on backend

The backend must allow requests from the Vercel staging URL. Add to `Backend-V2/main.py`:

```python
origins = [
    "http://localhost:3000",
    "https://moeys-final-staging.vercel.app",  # Replace with actual Vercel URL
    "https://moeys-final.vercel.app",
]
```

---

## Step 4 — Seed the database

Run the seed script against the deployed backend:

```bash
cd /home/panha/moeys
python3 scripts/seed_staging.py --base-url https://moeys-backend.railway.app
```

See `scripts/seed_staging.py` for what's seeded.

---

## Step 5 — Verify deployment

Open the Vercel URL. You should see the login page in Khmer.

Try logging in as Admin with the credentials from `CREDENTIALS.md` (see demo/ directory — not committed to git).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Login fails | Backend URL wrong or CORS issue | Check `NEXT_PUBLIC_API_URL` env var; check CORS origins |
| Khmer shows boxes | Font not loading | Check CSP headers allow `fonts.googleapis.com` |
| 401 on API calls | JWT secret mismatch | Ensure frontend and backend use same secret |
| 500 on registration | org_id = 0 | Use DemoOrgIdSetter on dashboard to set org_id |
| Build fails | TS error | Run `pnpm tsc --noEmit` locally first |

---

## Quick rollback

If staging is broken, restore the `v0.5-beta-rc` tag:
```bash
git checkout v0.5-beta-rc
pnpm dlx vercel deploy --prod --force
```
