# Deployment Guide

## Environments

| Environment | Purpose | URL | Branch |
|---|---|---|---|
| Development | Local developer machines | `http://localhost:3000` | any |
| Staging | Pre-release testing, ministry demos | `https://staging.sports.moeys.gov.kh` | `main` |
| Production | Live ministry system | `https://sports.moeys.gov.kh` | `main` (tagged) |

---

## Required environment variables

Set these in the deployment platform (Vercel / VPS / Docker) — **never in code**:

```dotenv
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_URL=https://api.sports.moeys.gov.kh

# Frontend public URL
NEXT_PUBLIC_APP_URL=https://sports.moeys.gov.kh

# Cloudinary cloud name (from Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=moeys_prod
```

All three are validated at server startup by `env.ts`. The server refuses to start if `NEXT_PUBLIC_API_URL` is missing or not a valid URL.

---

## Build process

```bash
# Install dependencies (frozen lockfile = no surprise updates)
pnpm install --frozen-lockfile

# Type check
pnpm tsc --noEmit

# Run tests
pnpm test:run

# Build
pnpm build

# Start
pnpm start
```

The build uses `--webpack` flag (`next build --webpack`) because of a compatibility requirement with a Tailwind plugin. If upgrading Next.js, re-test without this flag.

---

## CI/CD pipeline

Recommended GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm test:run
      - run: pnpm build
    env:
      NEXT_PUBLIC_API_URL: ${{ vars.STAGING_API_URL }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${{ vars.CLOUDINARY_CLOUD_NAME }}

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        # Use Vercel CLI or SSH deploy script here

  deploy-production:
    needs: test
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        # Manual approval gate recommended before this step
```

---

## DNS and TLS setup

- Point `sports.moeys.gov.kh` → your hosting IP
- TLS certificate: use Let's Encrypt (certbot) or the hosting provider's auto-SSL
- Ensure the `Strict-Transport-Security` header is served over HTTPS only (the `Secure` cookie flag requires HTTPS)
- Add the domain to the HSTS preload list after confirming HTTPS works correctly: https://hstspreload.org

---

## Database migrations

The database is owned by the backend team. Frontend has no direct DB access.

For frontend-relevant changes:
1. Backend team runs migrations on staging first
2. Run `pnpm contract:sync` after the migration to pick up new fields
3. Test on staging with updated contract
4. Deploy frontend + backend together to production

---

## Rollback procedure

### Fast rollback (code-only)

```bash
# Revert to previous deployment
# On Vercel: use the deployment history UI
# On VPS: git revert the commit and redeploy
git revert HEAD
git push origin main
# CI/CD triggers new deployment automatically
```

### Database rollback

Only the backend team can roll back DB migrations. Coordinate with them. Frontend can be rolled back independently of the database as long as the API contract hasn't changed in a breaking way.

---

## Smoke tests post-deploy

Run these manually after every production deployment:

```
1. [ ] Home page loads at https://sports.moeys.gov.kh
2. [ ] Login as admin user → dashboard visible with Khmer text
3. [ ] Events list loads (at least 1 event visible)
4. [ ] Login as federation user → surveys list visible
5. [ ] Submit a test survey entry
6. [ ] Login as org user → participation page visible
7. [ ] Download RPT-ROSTER-ALL report for a real event
8. [ ] Language switcher works (Khmer ↔ English)
9. [ ] No console errors on any of the above pages
10.[ ] No HTTP 500 errors in server logs
```

If step 3 or 4 fail → the backend is likely down or the API URL is misconfigured.
If step 7 fails → Excel report backend endpoint may have changed — check `_contract/ENDPOINTS.md`.
