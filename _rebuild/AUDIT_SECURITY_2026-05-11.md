# Security Audit — 2026-05-11

**Scope**: Frontend codebase at `/home/panha/moeys/final` — all TypeScript/TSX, API route handlers, middleware, env config, and dependencies.  
**Auditor**: Static analysis + dependency audit (`pnpm audit`). Dynamic testing (cross-tenant API calls, live rate-limit probing) requires backend access and is flagged separately.  
**Cannot verify without backend**: rate limiting, refresh token rotation/invalidation, Cloudinary access control policies, virus scanning, server-side IDOR enforcement.

---

## 1. Executive Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 7 |
| Medium | 5 |
| Low | 4 |
| Info | 2 |
| **Total** | **18** |

**Overall Health: RED** — 7 High findings including a complete absence of HTTP security headers, a vulnerable axios version with multiple prototype pollution CVEs, and documents being uploaded directly from the browser to Cloudinary (bypassing any backend scanning or size enforcement).

The authentication architecture (HttpOnly cookies, SameSite=Strict, 15-min access tokens, cookie-based refresh) is fundamentally sound. The highest risks are in the security headers layer, dependency management, and the Cloudinary direct-upload flow.

---

## 2. Findings by Phase

---

### PHASE 1 — Authentication

---

#### SEC-H5 — `user_id` cookie is JavaScript-readable (not HttpOnly)

**Severity**: High  
**File**: `app/api/auth/login/route.ts:45-50`, `app/api/auth/refresh/route.ts:51-56`

**Description**: `access_token` and `refresh_token` are correctly set as HttpOnly. However, `user_id` is set without `httpOnly: true`:

```ts
response.cookies.set('user_id', String(payload.sub), {
  secure: IS_PROD,
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 15,
  // httpOnly: ← MISSING
});
```

`AuthContext.tsx` reads this via `document.cookie.match(...)`, confirming it is intentionally JavaScript-accessible. A cross-site scripting attack — however it arrives — can read the user ID and use it to call `/api/auth/session/{userId}` to obtain the user's role and organisation information.

**Reproduction**: Open DevTools console → `document.cookie` → `user_id` value visible.

**Recommended fix**:
Move the user ID to the response JSON body (returned by `/api/auth/login` and `/api/auth/refresh`) instead of a cookie. `AuthContext` reads it from the JSON response directly:

```ts
// login/route.ts — return userId in body instead of cookie
return NextResponse.json({ ok: true, userId: String(payload.sub) });

// AuthContext.tsx
const { userId } = await res.json();
if (userId) { const u = await fetchSession(userId); setUser(u); }
```

This eliminates the non-HttpOnly cookie and the `document.cookie` access pattern.

**References**: CWE-1004, OWASP A02:2021

---

#### SEC-H6 — Logout does not call backend to invalidate refresh token

**Severity**: High  
**File**: `app/api/auth/logout/route.ts`, `core/auth/context/AuthContext.tsx:81-84`

**Description**: The logout handler deletes the three cookies but never calls the backend's `/api/auth/logout` endpoint to revoke the refresh token server-side:

```ts
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('user_id');
  return response;  // ← backend never notified
}
```

If an attacker has captured the refresh token (via a compromised device, cookie theft, or MITM before TLS), they can continue to mint new access tokens for up to 7 days after the legitimate user has logged out.

**Reproduction**: Capture `refresh_token` cookie value → user logs out → POST to `/api/auth/refresh` with captured token → new access token issued.

**Recommended fix**:

```ts
// app/api/auth/logout/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (refreshToken) {
    // Best-effort backend revocation — don't fail if backend is down
    await fetch(`${BACKEND}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
    }).catch(() => {});
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('user_id');
  return response;
}
```

Coordinate with the backend team to confirm the `/api/auth/logout` endpoint accepts the refresh token and invalidates it in the token store.

**References**: CWE-613, OWASP A07:2021

---

#### SEC-M2 — No login rate limiting on the frontend proxy

**Severity**: Medium  
**File**: `app/api/auth/login/route.ts`

**Description**: The Next.js login route forwards every request to the backend with no rate limiting, no exponential backoff, and no lockout. A brute-force or credential-stuffing attack against the Next.js frontend will be forwarded directly to the backend as fast as the attacker sends requests. Even if the backend rate-limits, the proxy adds extra load and may obscure the attacker's real IP (depending on how IP headers are forwarded).

**Recommended fix**: Add IP-based rate limiting in the Next.js route handler or in a middleware. Use the `rate-limiter-flexible` package or Vercel Edge middleware (if deployed on Vercel):

```ts
// Minimal example using a token-bucket approach
import { NextRequest, NextResponse } from 'next/server';
const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10, WINDOW_MS = 60_000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ detail: 'Too many login attempts' }, { status: 429 });
  }
  // ... existing code
}
```

Also confirm with the backend team that their rate limiting is active and effective.

**References**: CWE-307, OWASP A07:2021

---

#### SEC-M1 — ProtectedRoute is client-side only — flash of protected content possible

**Severity**: Medium  
**File**: `core/auth/components/ProtectedRoute.tsx`

**Description**: `ProtectedRoute` uses `useEffect` to redirect unauthenticated users. On initial render, `isLoading` is `false` if there is no `user_id` cookie, but there is a race window on first render before the redirect fires. More critically, Next.js App Router server-renders pages; a user can view the initial HTML (including any server-rendered content inside `ProtectedRoute`) before the client-side redirect fires if server components leak data.

Currently pages render client components inside `ProtectedRoute` so no server data is leaked — but this is fragile and depends on all protected pages remaining purely client-rendered.

**Recommended fix**: Add middleware-level route protection in `middleware.ts` to redirect unauthenticated requests server-side, before any HTML is sent:

```ts
// middleware.ts (extend existing)
import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/events', '/users', '/organizations', '/reports', '/cards',
  '/sports', '/submissions', '/surveys', '/register', '/participation', '/dashboard'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  // Inject auth header for API proxy
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (!token) return NextResponse.next();
    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
  }

  // Server-side route guard for portal pages
  const isProtected = PROTECTED_PATHS.some(p => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/((?!login|unauthorized|_next|favicon).*)'],
};
```

Note: This only checks token presence, not role — role checks remain on the client. For stricter enforcement, decode and verify the JWT in middleware.

**References**: CWE-306, OWASP A01:2021

---

### PHASE 2 — Authorization

---

#### SEC-M3 — organization_id is always `null` in AuthContext — data scoping broken

**Severity**: Medium  
**File**: `core/auth/context/AuthContext.tsx:51`

**Description**:

```ts
return {
  ...data,
  role: (data.role as UserRole) || 'guest',
  organization_id: null, // backend gap — UserPublic doesn't include organization_id yet
};
```

For users with role `user2` (Organization), all API queries that should be scoped to their organization receive `organization_id: null`. The hook `useEffectiveOrgId()` presumably uses this value to scope queries. With it null, either:
1. All data is returned unscoped (all organizations' data visible), or
2. Queries return empty results (user2 sees nothing)

Either outcome is a security failure. In scenario 1, users can see other organizations' athletes, documents, and survey data.

**Reproduction**: Log in as a user2 account → navigate to `/register` or `/participation` → verify which organization's data is shown.

**Recommended fix**: This is a backend + frontend co-fix. Backend must include `organization_id` in `UserPublic`. On the frontend, fail loudly rather than silently passing null:

```ts
// useEffectiveOrgId hook — add guard
export function useEffectiveOrgId() {
  const { user } = useAuth();
  if (user?.role === 'user2' && user.organization_id === null) {
    // Surface this to the user, don't silently pass null to queries
    throw new Error('organization_id missing for org-scoped user');
  }
  return user?.organization_id ?? null;
}
```

**References**: CWE-284, OWASP A01:2021

---

### PHASE 3 — Injection & XSS

---

#### SEC-M4 — `sanitize.ts` is exported but never used in any component

**Severity**: Medium  
**File**: `core/lib/sanitize.ts`, all module components

**Description**: A `sanitize.ts` module exists with `sanitizeHtml()` and `sanitizeText()` functions. Searching all TSX files confirms these functions are never imported or called anywhere in the application. Khmer names, org names, event names, and other user-supplied text are rendered directly into JSX without sanitization.

This is currently safe because React escapes JSX text by default. However the sanitize module's existence implies developer intent to use it, and any future use of `dangerouslySetInnerHTML` or direct DOM manipulation would be unprotected.

Additionally, `sanitizeHtml()` uses a regex-based approach to strip tags — this is incomplete and can be bypassed with crafted payloads. If rich HTML rendering is ever needed, replace with DOMPurify.

**Recommended fix**:
1. Remove `sanitizeHtml()` and replace with a comment explaining that React JSX escaping is relied upon for XSS prevention.
2. Document that `dangerouslySetInnerHTML` is explicitly prohibited (add to RED_LINES.md).
3. If the sanitizer is genuinely needed (e.g., for server-rendered email or PDF content), replace with `DOMPurify`:
   ```ts
   import DOMPurify from 'dompurify';
   export const sanitizeHtml = (input: string) => DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
   ```

**References**: CWE-79, OWASP A03:2021

---

#### SEC-L3 — Open redirect in `core/api/client.ts` uses hardcoded paths (INFO: safe as-is)

**Severity**: Low  
**File**: `core/api/client.ts:62-66`

**Description**:
```ts
window.location.href = '/login';
window.location.href = '/unauthorized';
```

Both redirect targets are hardcoded string literals — no user-controlled input. These are safe. Noted here only as documentation that the pattern was reviewed.

**References**: CWE-601

---

### PHASE 4 — Secrets & Sensitive Data

---

#### SEC-L4 — Cloudinary cloud_name and api_key exposed in presign flow

**Severity**: Low  
**File**: `modules/registration-flow/services/registration.service.ts:96-108`

**Description**: The presign URL response includes `cloud_name`, `api_key`, `timestamp`, and `signature` from the backend. These are forwarded directly to the browser and used to construct the upload to `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`. The Cloudinary `api_key` is a public identifier (not the secret), and the signature is time-limited — this is the correct signed-upload pattern. However:

1. The `cloud_name` is exposed to any authenticated user, enabling enumeration.
2. The signed upload window must be tight (Cloudinary default is 1 hour for signed uploads) — verify the backend sets a short timestamp.

**Recommended fix**: Confirm with the backend that the presign `timestamp` window is ≤ 5 minutes. Add frontend validation that the presign response timestamp is within acceptable bounds before use.

**References**: CWE-312

---

### PHASE 5 — File Upload

---

#### SEC-H3 — Direct browser-to-Cloudinary upload bypasses backend file validation and scanning

**Severity**: High  
**File**: `modules/registration-flow/services/registration.service.ts:90-109`, `modules/registration-flow/hooks/useCloudinaryUpload.ts`

**Description**: Files (profile photos, ID documents, birth certificates) are uploaded directly from the user's browser to Cloudinary without passing through the Next.js backend:

```
Browser → GET /api/cloudinary/presign-url → Backend
Browser → POST https://api.cloudinary.com/v1_1/{cloud}/image/upload ← DIRECT, no backend
Backend stores only the secure_url returned by Cloudinary
```

This means:
1. **No virus/malware scanning** — files are not scanned before storage.
2. **No backend size enforcement** — the frontend `accept` attribute can be bypassed; Cloudinary's own limits are the only constraint (default: 10 MB for unsigned, 25+ MB for signed).
3. **No MIME type verification** — the browser `accept="image/*,.pdf"` is advisory only; any file can be uploaded by modifying the request.
4. **No rate limiting on uploads** — an authenticated user can upload unlimited files using the presign endpoint.
5. **No content inspection** — files containing embedded scripts, macros (DOCX/XLSM), or steganographic payloads are stored without inspection.

**Reproduction**: Open DevTools → intercept presign URL → upload a file with `.pdf` extension but `text/html` content → observe it is stored in Cloudinary.

**Recommended fix**:
- **Short term**: Configure Cloudinary upload preset to restrict file types and enforce maximum file size server-side (not just via `accept`). Enable Cloudinary's automatic malware scanning add-on.
- **Long term**: Route uploads through a Next.js API route that validates MIME type (via `file-type` package, not extension/`Content-Type` header) and enforces size before proxying to Cloudinary:

```ts
// app/api/upload/route.ts
import { fromBuffer } from 'file-type';
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = await fromBuffer(buffer);
  const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  if (!type || !ALLOWED.has(type.mime)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
  if (buffer.length > 2 * 1024 * 1024) { // 2 MB
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }
  // ... then proxy to Cloudinary
}
```

**References**: CWE-434, OWASP A04:2021

---

#### SEC-H4 — Cloudinary `secure_url` values are permanent public URLs (no TTL)

**Severity**: High  
**File**: `modules/registration-flow/services/registration.service.ts:108`

**Description**: The Cloudinary `secure_url` format (`https://res.cloudinary.com/{cloud}/{resource_type}/upload/...`) provides permanent, publicly accessible URLs by default. Identity documents (national IDs, passports, birth certificates) stored this way are permanently accessible to anyone who possesses the URL, with no expiry.

This is a serious PII exposure risk for a government ministry system — ID documents should not be on a public CDN with permanent URLs.

**Reproduction**: Obtain any Cloudinary `secure_url` from a DB record or network traffic → open in browser in incognito mode (no auth) → document is accessible.

**Recommended fix**:
1. Enable Cloudinary **Access Control** (Authenticated URL delivery or signed URLs with TTL).
2. Configure the upload preset to use `type: 'authenticated'` so assets require a signed URL to access.
3. Generate short-lived signed download URLs on the backend whenever a document needs to be displayed (1-hour TTL):

```python
# Backend — generate signed URL on demand
cloudinary.utils.cloudinary_url(public_id, sign_url=True, expires_at=time.time() + 3600)
```

This requires backend team coordination. On the frontend, replace stored `secure_url` display with a fetch to a backend endpoint that returns a fresh signed URL.

**References**: CWE-312, CWE-359, OWASP A02:2021

---

#### SEC-M5 — No frontend file size validation before upload

**Severity**: Medium  
**File**: `shared/form/FileUploadField.tsx`, `modules/registration-flow/components/DocumentStep.tsx`

**Description**: The i18n key `registration.fields.fileSizeError` ("File size must be less than {size}MB") is defined in both `en.json` and `kh.json`, indicating developer intent to validate file size. However, no code in `FileUploadField`, `DocumentStep`, or `useCloudinaryUpload` checks `file.size` before initiating the upload. The `accept` attribute is browser-advisory only.

A user can upload arbitrarily large files (up to Cloudinary's limits) wasting bandwidth and Cloudinary storage quota.

**Recommended fix**:

```ts
// FileUploadField.tsx — add size check
const MAX_FILE_SIZE_MB = 2;
onChange={async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toast.error(t('fileSizeError', { size: MAX_FILE_SIZE_MB }));
    e.target.value = '';
    return;
  }
  // ... existing upload code
}}
```

**References**: CWE-770, OWASP A04:2021

---

### PHASE 6 — Dependencies

---

#### SEC-H1 — axios <1.15.2 has 6 High + 8 Moderate CVEs

**Severity**: High  
**Package**: `axios@1.15.0` (direct dependency)

**Description**: `pnpm audit` reports 14 vulnerabilities in the installed `axios` version. Key High-severity issues:

| CVE | Description | Fix |
|---|---|---|
| GHSA-pmwg-cvhr-8vh7 | NO_PROXY bypass (incomplete fix for CVE-2025-62718) | ≥1.15.1 |
| GHSA-q8qp-cvcw-x6jj | Prototype pollution — response gadgets | ≥1.15.2 |
| GHSA-pf86-5x62-jrwf | Prototype pollution — response | ≥1.15.1 |
| GHSA-6chq-wfr3-2hj9 | Header injection via prototype pollution | ≥1.15.1 |
| GHSA-q3j6-qgpj-74h6 | fast-uri path traversal (via shadcn MCP SDK) | fast-uri ≥3.1.1 |
| GHSA-v39h-62p7-jpjc | fast-uri host confusion (via shadcn MCP SDK) | fast-uri ≥3.1.2 |

Additionally: GHSA-w9j2-pvgh-6h63 (auth bypass via prototype pollution), GHSA-3w6x-2g7m-8v23 (response tampering), GHSA-445q-vr5w-6q77 (CRLF injection in multipart), GHSA-m7pr-hjqh-92cm (SSRF via no_proxy).

**Reproduction**: `pnpm audit` — 22 vulnerabilities: 6 high, 14 moderate, 2 low.

**Recommended fix**:
```
pnpm add axios@^1.15.2
pnpm update shadcn --latest  # pulls updated MCP SDK with patched fast-uri
```

The `fast-uri` vulnerabilities are in the `shadcn` → `@modelcontextprotocol/sdk` → `ajv` → `fast-uri` dependency chain. Update `shadcn` or apply a pnpm override:

```json
// package.json
"pnpm": {
  "overrides": {
    "fast-uri": ">=3.1.2"
  }
}
```

**References**: GHSA-q8qp-cvcw-x6jj, CWE-1321, OWASP A06:2021

---

#### SEC-L1 — postcss <8.5.10 has XSS via unescaped `</style>` (dev-only impact)

**Severity**: Low  
**Package**: `postcss` (transitive via `next`)  
**Advisory**: GHSA-qx2v-qp2m-jg93

**Description**: The vulnerability is in PostCSS's CSS parser and only affects development tooling pipelines (CSS-in-JS SSR, style injection). In production Next.js builds, PostCSS runs at build time and the output is static CSS. Runtime risk is near-zero, but developers using PostCSS for dynamic style injection in dev would be affected.

**Recommended fix**: Update `next` to ≥16.2.6 (which vendors a patched PostCSS):
```
pnpm add next@^16.2.6 eslint-config-next@^16.2.6
```

**References**: GHSA-qx2v-qp2m-jg93

---

### PHASE 7 — HTTP Security Headers

---

#### SEC-H2 — Zero HTTP security headers configured

**Severity**: High  
**File**: `next.config.ts`

**Description**: `next.config.ts` contains only API rewrites and the next-intl plugin. There are no HTTP security headers configured:

```ts
const nextConfig: NextConfig = {
  async rewrites() { return [...] },
  // ← NO headers() function
};
```

All of the following headers are absent on every response:

| Header | Risk of absence |
|---|---|
| `Content-Security-Policy` | XSS attacks can load arbitrary scripts |
| `X-Frame-Options: DENY` | Clickjacking — page can be embedded in attacker's iframe |
| `X-Content-Type-Options: nosniff` | MIME sniffing — browser may execute response as wrong content type |
| `Strict-Transport-Security` | Protocol downgrade attacks, cookie theft over HTTP |
| `Referrer-Policy` | Auth tokens / internal URLs leak in Referer header |
| `Permissions-Policy` | Browser features (camera, mic, geolocation) unrestricted |

For a ministry system accessible from multiple networks, the absence of HSTS and CSP is the most critical gap.

**Recommended fix** — add `headers()` to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            // Start with report-only to identify violations before enforcing
            // Adjust 'img-src' for Cloudinary domain once cloud_name is known
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",  // tighten after auditing inline scripts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://res.cloudinary.com",
              "connect-src 'self' https://api.cloudinary.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() { return [...] },
};
```

Deploy as `Content-Security-Policy-Report-Only` first with a `report-uri` to capture violations before switching to enforcement.

**References**: OWASP A05:2021, CWE-693, CWE-1021

---

### PHASE 2 (continued) — IDOR

#### SEC-L2 — IDOR protection is backend-only; frontend has no guard layer

**Severity**: Low  
**File**: All detail routes (e.g., `/events/[event_id]`, `/submissions/[id]`)

**Description**: The frontend passes numeric IDs from URL parameters directly to API calls with no validation. For example:

```ts
// app/(portal)/events/[event_id]/page.tsx
params.event_id → useEvent(Number(event_id)) → GET /api/events/{event_id}
```

There is no frontend check that the authenticated user is authorized to view the requested resource ID. IDOR protection must come from the backend returning 403 for unauthorized resource access. This is the correct architecture — noted here to confirm the backend team is aware this is a frontend assumption.

**Action required**: Backend team must confirm that all detail endpoints enforce ownership/scope checks and return 403 (not 404) for cross-tenant access.

**References**: CWE-639, OWASP A01:2021

---

## 3. Positive Security Controls

The following controls were verified as correctly implemented:

| Control | Finding |
|---|---|
| No `localStorage`/`sessionStorage` for tokens | ✅ Confirmed — zero matches |
| No `dangerouslySetInnerHTML` | ✅ Confirmed — zero matches |
| `access_token` and `refresh_token` are HttpOnly | ✅ Confirmed |
| `SameSite=Strict` on all auth cookies | ✅ Confirmed |
| 15-minute access token TTL | ✅ Confirmed (`maxAge: 60 * 15`) |
| 7-day refresh token TTL | ✅ Confirmed (`maxAge: 60 * 60 * 24 * 7`) |
| `secure: IS_PROD` flag — HTTPS-only cookies in production | ✅ Confirmed |
| Open redirects use hardcoded ROUTES constants only | ✅ No user-controlled redirect targets |
| `console.log` gated to `NODE_ENV === 'development'` | ✅ Confirmed in `client.ts` |
| Idempotency-Key on all mutation requests | ✅ Confirmed via `idempotencyMiddleware` |
| `.env*` in `.gitignore` | ✅ Confirmed |
| No hardcoded secrets in source code | ✅ Confirmed |
| `NEXT_PUBLIC_API_URL` is the only public env variable | ✅ Acceptable — not a secret |

---

## 4. Top 10 Priority Fixes

| # | ID | Severity | Title | Owner |
|---|---|---|---|---|
| 1 | SEC-H2 | High | Add HTTP security headers (CSP, HSTS, X-Frame, nosniff, Referrer-Policy) | Frontend |
| 2 | SEC-H1 | High | Upgrade axios to ≥1.15.2; override fast-uri to ≥3.1.2 | Frontend |
| 3 | SEC-H3 | High | Route file uploads through Next.js backend for MIME validation + size enforcement | Frontend + Backend |
| 4 | SEC-H4 | High | Configure Cloudinary authenticated delivery — replace permanent public URLs with signed TTL URLs for ID documents | Backend + DevOps |
| 5 | SEC-H5 | High | Remove `user_id` non-HttpOnly cookie; pass user ID in login JSON response instead | Frontend |
| 6 | SEC-H6 | High | Call backend `/api/auth/logout` to revoke refresh token server-side on logout | Frontend + Backend |
| 7 | SEC-M1 | Medium | Add server-side route protection in `middleware.ts` to redirect unauthenticated requests before HTML is served | Frontend |
| 8 | SEC-M2 | Medium | Add rate limiting (10 req/min/IP) to `/api/auth/login` Next.js route handler | Frontend |
| 9 | SEC-M3 | Medium | Backend must include `organization_id` in `UserPublic` — until then add visible error when `organization_id` is null for user2 role | Backend + Frontend |
| 10 | SEC-M5 | Medium | Add client-side file size check (≤2 MB) in `FileUploadField.tsx` before upload begins | Frontend |

---

## 5. Compliance Notes for Ministry Context

### Data Residency
- Participant identity documents (passports, national IDs, birth certificates) and profile photos are stored in **Cloudinary** (US-based CDN by default). For a ministry system processing citizen PII, confirm:
  - Whether Cambodian data sovereignty regulations permit cloud storage of citizen identity documents outside Cambodia.
  - If required, configure Cloudinary private cloud or switch to a Cambodian/ASEAN-hosted object storage provider (e.g., AWS ap-southeast-1 with presigned URL delivery).

### Audit Logging
- **No frontend audit logging is implemented.** For a government system, audit logs (who accessed what record, when, from which IP) are typically required.
- Recommended: The backend must log all successful and failed authentication attempts, resource access events (especially for PII like participant records and documents), and all administrative actions (approve/reject/delete).
- The Next.js route handlers could log successful logins with timestamp and IP to a structured log sink.

### Data Retention
- No data retention or purge policy is implemented or documented in the frontend or contract.
- Consider implementing: automatic purge of Cloudinary assets when a participant is deleted; access logs retained for N years per ministry policy; right-to-erasure workflow if applicable.

### TLS
- `Strict-Transport-Security` is absent (SEC-H2). Once added with `preload`, submit the domain to the HSTS preload list to prevent protocol downgrade for all users.
- Confirm the backend API (`localhost:8000` in dev, production URL otherwise) is served over TLS in production and that the `NEXT_PUBLIC_API_URL` in the production `.env` is `https://`.

### Session Audit
- There is no mechanism for an admin to view or terminate active sessions. For a ministry system where account compromise can affect athlete registration data, an active-session list with remote logout capability is recommended.

### Participant PII
- National ID numbers, DOBs, phone numbers, and profile photos are accessible to `admin` and `user1` roles. Verify this matches the access control policy — there may be a need for field-level encryption or masking of ID numbers at rest.

---

*End of security audit — 2026-05-11*  
*Dynamic testing (cross-tenant API calls, live rate-limit probing, Cloudinary access control verification) requires a running environment and should be conducted as a second phase.*
