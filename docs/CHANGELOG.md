# Changelog

All notable changes to the frontend.

---

## v1.0 — Production Release

**Date:** Week 8 of the 8-week rebuild (2026-05-xx)  
**Audience:** All federations, all organizations, ministry staff

### Added
- All 13 modules complete: auth, common, dashboard, users, events, sports, organizations, survey, submissions, registration-flow, participation, reports, cards
- Team registration mode (CSV bulk upload with per-row validation and progress tracking)
- All 8 Khmer ministry report download buttons (6 show "Backend required" label until backend implements the endpoints)
- Participant ID cards filterable by event + organization
- Responsive sidebar with hamburger toggle on mobile
- Server-side route protection in middleware (redirects unauthenticated requests before HTML renders)
- IP-based login rate limiting (10 attempts/min)
- Full HTTP security header suite (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy)
- `GET /api/auth/me` — user identity decoded from HttpOnly access_token (removes non-HttpOnly `user_id` cookie)
- Backend logout call on user sign-out (revokes refresh token)
- Client-side file size validation in upload fields (≤2 MB)
- Pagination total count ("Showing 1–20 of 247") on all list screens
- `aria-label` on pagination buttons and search inputs
- `<label>` elements on CardsPage select filters
- Success toast notifications on all admin create/edit forms

### Changed
- `user_id` cookie removed; user identity read via `/api/auth/me` (HttpOnly access_token) — security fix SEC-H5
- `axios` upgraded to 1.16.0 (fixes 6 High CVEs: prototype pollution, header injection)
- `next` upgraded to 16.2.6 (fixes postcss XSS in dev tooling)
- `fast-uri` pinned to ≥3.1.2 via pnpm override (fixes path traversal and host confusion CVEs)
- OrganizerList: fixed mislabeled "Role" column header that was showing date_of_birth data; added Sport column
- SubmissionStatus type corrected: now includes all 5 values (PENDING, SUBMITTED, APPROVED, REJECTED, FLAGGED)
- FLAGGED submission badge changed from `outline` to `secondary` variant (visually distinct from PENDING)
- All list components now use `DEFAULT_PAGE_SIZE` from `core/config/constants` instead of local `const PAGE_SIZE = 20`
- `downloadExcelBlob` now sends `credentials: 'include'` for reliable auth cookie forwarding
- `sanitize.ts` documented to clarify XSS strategy (React JSX escaping; DOMPurify stub for future rich HTML)
- `shared/layout/` dead directory deleted (stale duplicate of `modules/common/components/`)

### Fixed
- FLAGGED and PENDING badges were visually identical (both `outline` variant)
- Pagination showed only "X / Y" with no total record count
- No toast feedback on admin create/edit (users, orgs, sports, events)
- Search inputs had no `aria-label` (placeholder only)
- CardsPage `<select>` filters had no associated `<label>`
- OrganizerList: `date_of_birth` column header was `tc('role')` ("Role") — wrong
- Barrel bypass: `useCreateOrganizer` now imports from `@/modules/registration-flow` not the sub-path

### Security
- SEC-H1: Added complete HTTP security header suite
- SEC-H2: Upgraded axios + fast-uri override (High CVEs cleared)
- SEC-H5: Removed non-HttpOnly `user_id` cookie
- SEC-H6: Logout now revokes refresh token on backend
- SEC-M1: Middleware-level portal route protection added
- SEC-M2: Login rate limiting (10/min/IP) added
- SEC-M5: File size validation (≤2 MB) added in FileUploadField

---

## v0.6-pilot — Pilot Release

**Date:** Week 6 of the 8-week rebuild  
**Audience:** 3–5 real federations + ministry admin for one real event

### Added
- Participant registration ALONE mode with 4-step stepper
- Document upload: birth certificate (< 18) or NID/passport (≥ 18)
- Age computation from event start_date (`computeAgeAtEvent` — Red Line #3)
- Organizer registration (leaders, coaches, managers, delegates)
- Per-sport quota enforcement at registration time
- RPT-ROSTER-ALL and RPT-NUMBER-LIST reports (first 2 of 8 working)
- Report filter bar (event + organization selection)

### Changed
- Survey submission FSM: PENDING → SUBMITTED → APPROVED/REJECTED/FLAGGED
- Dashboard stats wired to live API data

### Fixed
- Multiple beta feedback items from W4 (auth edge cases, Khmer text truncation)

---

## v0.4-beta — Internal Beta

**Date:** Week 4 of the 8-week rebuild  
**Audience:** Ministry tech team + 1–2 friendly federations

### Added
- Login with HttpOnly cookie auth (access + refresh tokens)
- Role-aware dashboard for all 4 roles (Admin, Federation, Organization, Guest)
- User management (Admin CRUD)
- Sport management + category management
- Organization management
- Event lifecycle (DRAFT → PUBLISHED → ARCHIVED)
- Event sport attachment + organization linking
- Survey submission: By-Sport, By-Number, By-Category forms
- Admin survey review queue: Approve / Reject / Flag actions
- Khmer + English UI with language switcher
- Battambang font for Khmer text
