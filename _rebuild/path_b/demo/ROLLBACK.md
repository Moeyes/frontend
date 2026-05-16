# Rollback Procedure — v0.5 Beta

## When to rollback

Rollback if:
- Staging is completely broken and unfixable in < 5 minutes
- A database corruption is suspected
- Demo is actively failing and the fallback (screenshots) isn't working

## Frontend rollback (Vercel)

### Option A — Vercel dashboard
1. Go to vercel.com → your project → Deployments
2. Find the last known-good deployment (labeled `v0.5-beta-rc`)
3. Click ⋯ → Promote to Production

### Option B — CLI
```bash
# Checkout the tagged version
git checkout v0.5-beta-rc

# Redeploy
pnpm dlx vercel deploy --prod --force
```

Time to restore: ~3 minutes

## Backend rollback

```bash
# Railway
railway rollback

# Or redeploy from a specific commit:
git checkout v0.5-beta-rc
railway up --force
```

## Database rollback

### If you have a backup snapshot:
```bash
# Railway: use the database backup feature in the dashboard
# Or pg_restore if you have a manual dump:
pg_restore --clean --if-exists -d $DATABASE_URL backup_20260519.dump
```

### If no backup taken before demo:
- Restore from Railway's automatic daily backup (if enabled)
- Contact Railway support for point-in-time recovery

## Tag reference

```
v0.5-beta-rc  — Release candidate tagged on 2026-05-19
               Build is verified clean: pnpm tsc --noEmit, pnpm lint, pnpm build
```

To view tag:
```bash
git show v0.5-beta-rc
```

## Post-rollback verification

After rollback, run the 3-step smoke test:
1. Login as admin_demo → dashboard visible
2. Login as finance_org_demo → surveys visible
3. Admin → Reports → Download Excel for RPT-3 → file downloads

If all 3 pass: demo can proceed (possibly delayed by 10 minutes).
