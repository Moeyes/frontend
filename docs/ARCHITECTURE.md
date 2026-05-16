# Architecture

## System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
│                   Next.js React App (CSR/SSR)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js Server (Node.js)                        │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────────────────────────┐ │
│  │  Route Handlers   │    │           Middleware                │ │
│  │  /api/auth/login │    │  - injects Bearer token for /api/*  │ │
│  │  /api/auth/me    │    │  - redirects unauthenticated users  │ │
│  │  /api/auth/logout│    │  - serves security headers          │ │
│  │  /api/auth/refresh│   └─────────────────────────────────────┘ │
│  └──────────────────┘                                            │
│                                                                  │
│  next.config.ts rewrites: /api/* → backend                      │
└────────────────────────────┬────────────────────────────────────┘
                             │  Internal HTTP (Bearer token)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                         │
│                  (separate repo — teammate owns)                 │
│                                                                  │
│  - REST API, 42 paths / 53 methods                               │
│  - JWT auth (access 15min + refresh 7 days)                      │
│  - Role-based endpoint guards                                    │
│  - RFC7807 error responses                                       │
└──────────┬─────────────────────────────────────────┬────────────┘
           │  SQL                                     │  Presign URL
           ▼                                          ▼
┌──────────────────┐                    ┌─────────────────────────┐
│   PostgreSQL     │                    │       Cloudinary        │
│   (primary DB)   │                    │  (profile photos,       │
│                  │                    │   ID documents,         │
│                  │                    │   birth certificates)   │
└──────────────────┘                    └─────────────────────────┘
           │  Excel/PDF generation
           ▼
┌──────────────────────────────────────────┐
│  Report Worker (backend)                 │
│  - 8 Khmer Excel reports                 │
│  - Returns binary blob via /api/excel/*  │
└──────────────────────────────────────────┘
```

---

## Request flows

### Authentication (login)

```
1. User submits username + password
2. Browser → POST /api/auth/login (Next.js route handler)
3. Route handler → POST ${BACKEND}/api/auth/login
4. Backend validates → returns { access_token, refresh_token }
5. Route handler sets HttpOnly cookies:
     access_token  (maxAge: 15 min, SameSite=Strict)
     refresh_token (maxAge: 7 days, SameSite=Strict)
6. Browser calls GET /api/auth/me → route handler decodes
   user_id from the HttpOnly access_token → returns { userId }
7. AuthContext calls GET /api/auth/session/{userId} → user object
8. React state updated, router redirects to dashboard
```

### Authenticated list request

```
1. Component mounts → React Query fires useQuery
2. openapi-fetch client → GET /api/events/ (relative URL)
3. Request hits Next.js server → middleware intercepts
4. Middleware reads access_token from HttpOnly cookie
5. Middleware sets Authorization: Bearer <token> header
6. Next.js rewrites /api/* → ${BACKEND}/api/* (with auth header)
7. Backend validates JWT, returns paginated list
8. React Query caches response, component renders
```

### Token refresh (automatic)

```
1. Any API call returns 401
2. authMiddleware (core/api/client.ts) calls POST /api/auth/refresh
3. Next.js refresh route handler reads refresh_token HttpOnly cookie
4. Sends it to backend → backend rotates both tokens
5. New HttpOnly cookies set in response
6. Original request retried (new token injected by middleware)
7. If refresh also fails → window.location = '/login'
```

### Mutation (create / update / delete)

```
1. Form submits → useMutation hook fires
2. openapi-fetch → POST/PATCH/DELETE with Idempotency-Key header
3. React Query optimistically updates cache (instant UI feedback)
4. Backend processes → 200 OK with updated resource
5. React Query invalidates list queries → refetch in background
6. On error → cache rolled back, error displayed in form
```

### Report download

```
1. Admin selects event + org, clicks Download
2. Frontend → GET /api/excel/org-sport?org_id=N&events_id=N
3. Next.js middleware injects Bearer token → forwards to backend
4. Backend generates Excel in memory → returns binary blob
5. Frontend receives blob → creates object URL → triggers download
6. URL revoked after download
```

---

## Why this stack

See `_rebuild/02_DECISIONS.md` for the full rationale. Key choices:

| Decision | Reason |
|---|---|
| Next.js App Router | SSR for Khmer SEO, server-side auth without separate auth service |
| openapi-fetch | Zero-drift types auto-generated from backend OpenAPI spec |
| React Query | Server state separated from UI state; automatic refetch, optimistic updates |
| Zod v4 | Schema-first validation; same schema drives form validation and TypeScript types |
| pnpm | Strict hoisting prevents phantom dependencies; faster installs |
| Cloudinary | Presigned uploads; no file storage on the Next.js server |
| PostgreSQL | Relational model suits event/sport/org hierarchy; backend's choice |
| No Redux | React Query handles server state; useState handles UI state |
| No Supabase | Data sovereignty requirement — citizen ID data must stay on ministry infrastructure |

---

## Repo layout

```
final/                           ← frontend root (this repo)
│
├─ app/                          ← Next.js App Router pages
│   ├─ (auth)/                   ← Route group: login (no sidebar)
│   │   ├─ login/page.tsx
│   │   └─ layout.tsx
│   ├─ (portal)/                 ← Route group: authenticated portal
│   │   ├─ layout.tsx            ← wraps all portal pages in CommonLayout
│   │   ├─ dashboard/page.tsx
│   │   ├─ events/
│   │   ├─ sports/
│   │   ├─ organizations/
│   │   ├─ users/
│   │   ├─ surveys/
│   │   ├─ submissions/
│   │   ├─ register/
│   │   ├─ participation/
│   │   ├─ reports/
│   │   └─ cards/
│   ├─ api/                      ← Next.js route handlers (server only)
│   │   └─ auth/                 ← login, logout, refresh, me
│   └─ layout.tsx                ← root layout (providers, fonts)
│
├─ modules/                      ← 13 feature modules (see MODULES.md)
│   ├─ auth/
│   ├─ common/                   ← sidebar, topbar, layout
│   ├─ dashboard/
│   ├─ events/
│   ├─ sports/
│   ├─ organizations/
│   ├─ users/
│   ├─ survey/
│   ├─ submissions/
│   ├─ registration-flow/
│   ├─ participation/
│   ├─ reports/
│   └─ cards/
│
├─ core/                         ← shared cross-cutting concerns
│   ├─ api/client.ts             ← typed HTTP client, auth middleware
│   ├─ auth/                     ← AuthContext, ProtectedRoute, hooks
│   ├─ config/                   ← constants, routes, env
│   ├─ i18n/                     ← LanguageProvider, LanguageSwitcher
│   └─ lib/                      ← format.ts, validation.ts, sanitize.ts
│
├─ shared/                       ← reusable UI and form components
│   ├─ ui/                       ← DataTable, Button, Badge, Modal, etc.
│   └─ form/                     ← TextInputField, SelectField, DateField, FileUploadField
│
├─ messages/                     ← i18n translation files
│   ├─ en.json                   ← English (593 keys)
│   └─ kh.json                   ← Khmer canonical (593 keys)
│
├─ _contract/                    ← auto-generated from backend OpenAPI
│   ├─ api.types.ts              ← TypeScript types for all endpoints
│   ├─ openapi.json              ← raw spec
│   └─ ENDPOINTS.md             ← human-readable endpoint reference
│
├─ _rebuild/                     ← rebuild planning docs (not shipped)
│   ├─ 00_MASTER_PLAN.md
│   ├─ SCENARIOS.md
│   ├─ CONVENTIONS.md
│   └─ RED_LINES.md
│
├─ docs/                         ← this documentation folder
├─ middleware.ts                 ← auth injection + portal route guard
├─ next.config.ts                ← rewrites, security headers
├─ vitest.config.ts              ← test runner config
└─ env.ts                        ← validated env vars (Zod schema)
```

---

## Security headers

All responses carry:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: res.cloudinary.com; ...
```

Configured in `next.config.ts` → `headers()`.
