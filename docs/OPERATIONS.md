# Operations Guide

## Monitoring

### Key metrics to watch

| Metric | Alert threshold | What it means |
|---|---|---|
| HTTP 5xx rate | > 1% of requests | Server-side errors; check server logs |
| Login success rate | < 95% | Auth backend issue or rate limit being hit |
| Page load time (P95) | > 3 seconds | Performance regression |
| API response time (P95) | > 2 seconds | Backend slowness |
| Failed survey submissions | > 5 in 10 min | Backend API or validation issue |
| Cloudinary upload failures | > 1% | Network or Cloudinary config issue |

### Recommended tooling

- **Uptime monitoring:** UptimeRobot or Better Uptime — ping `/api/auth/me` every 5 min
- **Error tracking:** Sentry — add `@sentry/nextjs` and configure in `next.config.ts`
- **Performance:** Vercel Analytics or Lighthouse CI in GitHub Actions
- **Log aggregation:** Forward Next.js stdout to a log service (Logtail, Papertrail, or a self-hosted ELK stack)

---

## Logging

### What gets logged by default

Next.js logs to stdout. In production, capture stdout and forward to your log service.

Key log lines to watch:
- `[API] → POST /api/auth/login` — every login attempt
- `[API] ← 401` — auth failures
- `[API] ← 429` — rate limit hits (too many login attempts)
- `❌ Invalid environment variables` — startup error; server will refuse to start

Note: API request/response logging only runs in `NODE_ENV=development`. In production, implement Sentry or a custom logger for error tracking.

### Searching logs

Common log queries (adapt to your log service):

```
# All 5xx errors in the last hour
status >= 500 AND timestamp > now() - 1h

# Rate limit hits (failed login brute force)
message:"429" AND path:"/api/auth/login"

# A specific user's login activity
message:"auth/login" AND ip:192.168.1.100

# Cloudinary upload failures
message:"Cloudinary upload failed"
```

---

## Backup and restore

### What to back up

The frontend has **no database or persistent state**. All data is in the backend's PostgreSQL database. Coordinate backups with the backend team.

Frontend assets that need versioning/backup:
- `messages/en.json` and `messages/kh.json` — translation files (in git ✅)
- `_contract/api.types.ts` — API contract (in git ✅)
- Environment variables — must be stored in your deployment platform's secret store, **not in git**

### Restore procedure (frontend)

If the frontend needs to be restored to a previous state:

```bash
git log --oneline  # find the commit you want to restore to
git checkout <commit-hash>
pnpm install --frozen-lockfile
pnpm build
# deploy
```

---

## Common issues and resolutions

| Symptom | Likely cause | Resolution |
|---|---|---|
| Login page shows but login fails | Backend API is down | Check `NEXT_PUBLIC_API_URL` is correct; check backend server status |
| "Invalid environment variables" on startup | Missing `.env` or wrong var | Set `NEXT_PUBLIC_API_URL` in env; restart |
| Khmer text shows boxes in production | Battambang font not loading | Check network requests for font URL; check CSP allows `fonts.googleapis.com` |
| All API calls return 401 | JWT secret changed on backend | Backend team needs to rotate or all users must re-login |
| Rate limit errors for a user | They're hitting login too fast | Ask them to wait 60 seconds; if legitimate, increase `RATE_LIMIT` in `login/route.ts` |
| Excel download fails | Backend report endpoint not ready | Check `_contract/ENDPOINTS.md`; report button should show "Backend required" label |
| Sidebar doesn't collapse on mobile | CSS breakpoint issue | Check `lg:static` and `translate-x` classes on `Sidebar.tsx` |
| Survey submit button disabled | `organization_id` is null | Backend gap — UserPublic doesn't include org ID yet; see `OrgIdGapBanner` component |
| TypeScript errors after `pnpm install` | Contract types stale | Run `pnpm contract:sync` with backend running |

---

## Release checklist

Run before every production deployment:

**Pre-deploy:**
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm test:run` — all 122 tests pass
- [ ] `pnpm build` succeeds
- [ ] `pnpm audit` — zero High or Critical vulnerabilities
- [ ] Staging smoke tests pass (see [DEPLOYMENT.md](./DEPLOYMENT.md#smoke-tests-post-deploy))

**Deploy:**
- [ ] Environment variables confirmed in production config
- [ ] Backend deployed first (if backend changes are included)
- [ ] Frontend deployed

**Post-deploy:**
- [ ] Smoke tests on production URL
- [ ] Monitor error rate for 30 minutes
- [ ] Check Khmer rendering on the events list and participant registration form

---

## Performance tuning

| Optimization | Impact | How |
|---|---|---|
| Dropdown limits | Prevents large fetches | Use `DROPDOWN_LIMIT = 200` not `limit: 999` |
| React Query staleTime | Reduces unnecessary refetches | Set `staleTime: 5 * 60 * 1000` for rarely-changing data (events list) |
| DataTable pagination | Prevents rendering thousands of rows | Always use server-side pagination for lists |
| Image optimization | Faster card loading | Cloudinary `f_auto,q_auto` transformation in the URL |
| Font preloading | Eliminates Khmer font flash | Already configured via `next/font/google` |

---

## On-call rotation

Define your on-call schedule based on team size. For a 2-person team:
- **Primary:** rotates weekly
- **Escalation:** other team member, then Ministry IT

**Alert channels:** Set up PagerDuty or Opsgenie connected to your uptime monitoring.

---

## Escalation paths

```
Issue detected
    ↓
On-call developer (frontend)
    ↓ (if backend issue)
Backend teammate
    ↓ (if data/DB issue)
Backend teammate + DBA
    ↓ (if security incident or PII breach)
Ministry IT Security → Ministry leadership → Legal team
```

Response SLA targets (suggested):
- P0 (site down, data breach): 30 minutes
- P1 (login broken, reports failing): 2 hours
- P2 (feature broken, cosmetic): next business day
