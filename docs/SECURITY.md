# Security Guide

## Threat model

| Attacker | Goal | Likelihood |
|---|---|---|
| External attacker (internet) | Steal athlete PII (DOB, ID numbers, photos) | Medium |
| Malicious federation user | Access another federation's participant data | Medium |
| Compromised admin account | Manipulate event data, generate fraudulent reports | Low |
| XSS injector | Run scripts in other users' browsers | Low (mitigated by React) |
| CSRF attacker | Forge requests on behalf of logged-in users | Low (SameSite=Strict) |

---

## How auth tokens are handled

| Token | Location | Lifetime | Protection |
|---|---|---|---|
| `access_token` JWT | HttpOnly cookie | 15 minutes | `HttpOnly; SameSite=Strict; Secure (prod)` |
| `refresh_token` | HttpOnly cookie | 7 days | `HttpOnly; SameSite=Strict; Secure (prod)` |

**Not in:** `localStorage`, `sessionStorage`, `window.*`, `document.cookie`

Logout immediately revokes the refresh token on the backend so captured tokens cannot be replayed after logout.

---

## How RBAC is enforced

Three layers:

1. **Middleware** (`middleware.ts`) — redirects unauthenticated requests server-side before HTML is rendered
2. **ProtectedRoute** (`core/auth/components/ProtectedRoute.tsx`) — client-side role check; renders null for wrong role
3. **Backend** — all API endpoints validate JWT and role; frontend is defence-in-depth only

Data scoping: federation and org users always pass `organization_id` as a query parameter so their queries return only their data. The backend also enforces this.

---

## Input validation strategy

- **Forms:** Zod schemas validate all form input before submission
- **API responses:** TypeScript types guard response data (generated from OpenAPI)
- **Files:** Client-side size check (≤2 MB) in `FileUploadField` before Cloudinary upload; MIME type validated by `accept` attribute (advisory) — backend enforces strict type check
- **XSS:** React JSX escapes all text by default; `dangerouslySetInnerHTML` is prohibited (see `_rebuild/RED_LINES.md`)
- **CSRF:** `SameSite=Strict` on all auth cookies prevents cross-origin request forgery

---

## File upload safety

| Layer | What it checks |
|---|---|
| Frontend (`FileUploadField`) | `file.size ≤ 2 MB` — rejects oversized files before upload |
| Browser `accept` attribute | Advisory MIME type filter (bypassable) |
| Cloudinary | Enforces its own limits per upload preset |
| Backend | ⚠️ Should validate MIME type and scan for malware before storing |

Files are uploaded directly browser → Cloudinary (presigned URL flow). The backend never handles the raw bytes. If backend malware scanning is required, the architecture must change to route uploads through a backend proxy.

Cloudinary URLs are currently permanent public URLs. For a production ministry system handling citizen ID documents, switch to Cloudinary authenticated delivery with signed TTL URLs. Coordinate with backend team.

---

## HTTP security headers

All responses include:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
```

Configured in `next.config.ts`. CSP uses `report-only` mode initially — switch to enforcement after reviewing violation reports from production.

---

## Login rate limiting

`app/api/auth/login/route.ts` enforces 10 requests per IP per minute. Returns `429 Too Many Requests` when exceeded.

This is in-memory per Next.js instance. For multi-instance deployments, replace with Redis-backed rate limiting (e.g., `@upstash/ratelimit`).

---

## Dependency management

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies (patch + minor)
pnpm update

# Update a specific vulnerable package
pnpm add axios@^1.16.0
```

Target: **zero High or Critical vulnerabilities** in production. Run `pnpm audit` weekly or on every PR via CI.

Dependency update cadence:
- Security patches: within 48 hours of disclosure
- Minor updates: monthly
- Major updates: per quarter with a full regression test

---

## Incident response runbook

### 1. Suspected account compromise

```
1. Revoke all sessions: reset the user's password in the admin panel
2. Backend team: invalidate all refresh tokens for the user
3. Check backend audit logs for API calls from that account in the last 7 days
4. Assess what data was accessed; prepare breach notification if PII was exposed
5. Document incident in the incident log
```

### 2. Suspected XSS

```
1. Identify which input → output path is affected
2. Check if `dangerouslySetInnerHTML` was used (search codebase) — it should never be
3. React escapes JSX text — XSS via JSX is extremely unlikely
4. If confirmed: patch immediately, deploy hotfix, notify users
5. Add a test case for the specific payload
```

### 3. Dependency vulnerability disclosed

```
1. Run pnpm audit to confirm impact
2. Check if the vulnerable code path is reachable (e.g., Cloudinary presign flow vs. server-side only)
3. Apply patch: pnpm add <package>@<patched-version>
4. Run pnpm test:run && pnpm build to confirm nothing broke
5. Deploy hotfix to production within 48 hours for High/Critical
```

### 4. Data breach (participant PII exposed)

```
1. Immediately: restrict access (take affected endpoint offline if possible)
2. Backend team: rotate all JWT secrets → invalidates all active sessions
3. Assess scope: what data, which users, how long
4. Notify: Ministry IT Security → Ministry leadership → affected organizations
5. Cambodian data protection regulations apply — follow the legal team's guidance
6. Post-mortem within 5 business days
```

---

## Audit log access

The backend records audit events (user created, event published, survey approved, etc.). To access logs for compliance:

1. Ask the backend team for log access credentials
2. Logs are queryable by: user_id, action type, timestamp range, organization_id
3. Frontend does not currently display an audit log UI — planned for a future release

For compliance or legal holds, coordinate with the Ministry IT team for raw database access.
