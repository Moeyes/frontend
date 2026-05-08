# 8-Week Timeline

The week-by-week schedule. Each week has a goal, modules, deliverables, and a Friday checkpoint.

## Overview

| Week | Goal | Modules | Release |
|------|------|---------|---------|
| 1 | Foundation | (none — setup only) | — |
| 2 | Identity + reference data | auth, common, dashboard, users | — |
| 3 | Event lifecycle | events, sports, organizations | — |
| 4 | Survey engine | survey, submissions | **W4 BETA** |
| 5 | Registration flow + beta feedback | registration-flow, participation start | — |
| 6 | Reports v1 | reports (4 of 8) | **W6 PILOT** |
| 7 | Reports v2 + pilot feedback | reports (remaining 4), team mode, flag/review | — |
| 8 | Polish, cards, hardening | cards, hardening | **W8 PRODUCTION** |

## Week 1 — Foundation

**Goal:** Contract frozen, scenarios frozen, conventions frozen, foundation layer built. No feature modules yet.

**Run prompts (in order):**
- Prompt 1 — Lock backend contract
- Prompt 2 — Freeze scenarios
- Prompt 3 — Establish conventions
- Prompt 4 — Nuke and start clean
- Prompt 5 — Build foundation layer

**Deliverables:**
- `_contract/openapi.json`, `_contract/api.types.ts`, `_contract/ENDPOINTS.md`
- `_rebuild/SCENARIOS.md`, `_rebuild/ROUTE_MAP.md`
- `_rebuild/CONVENTIONS.md`, `_rebuild/MODULE_TEMPLATE/`
- Foundation code: `core/api/`, `core/auth/`, `core/i18n/`, `core/config/`, `core/lib/`, `shared/ui/`, `shared/form/`, `shared/layout/`, `app/` shell

**Friday checkpoint:**
- `pnpm build` succeeds
- Login page renders, can log in as seed admin user
- Sidebar, top bar, language switcher all work
- Dark/light themes work (or one consistent theme picked)
- Khmer renders correctly in test strings

**Blocker if:** backend OpenAPI is incomplete. Stop and resolve with teammate before W2.

## Week 2 — Identity + Reference Data

**Goal:** Users log in as any role, see their scoped landing page; admin manages users.

**Modules to build (use Prompt 6, run once per module):**
- Mon evening: `auth` (full module — login UI, ProtectedRoute integration, role guards)
- Tue evening: `common` (sidebar, navigation, unauthorized page, language switcher placement)
- Wed evening: `dashboard` (role-aware landing — Super Admin sees system stats, Admin sees event KPIs, Federation sees their pending tasks, Org sees their pending tasks)
- Thu evening: `users` (admin CRUD for users, role assignment, password reset trigger)
- Fri evening: smoke test (Prompt 7) + fix top issues

**Friday checkpoint:**
- Login as Super Admin, Admin, Federation, Organization — each sees correct dashboard
- Admin creates new user with Federation role; that user can log in
- Sidebar shows correct nav items per role
- All UI in Khmer by default; language switch to English works

## Week 3 — Event Lifecycle + Sports + Organizations

**Goal:** Admin creates an event, attaches sports with quotas, publishes; federations and orgs are seeded.

**Modules to build:**
- Mon: `events` (create/edit, status transitions DRAFT → PUBLISHED, sport attachment with quotas)
- Tue: `events` continued — event detail page, dashboard tile per event
- Wed: `sports` (sport CRUD, category management, federation linkage)
- Thu: `organizations` (federation CRUD, organization CRUD, contact info)
- Fri: smoke test + fix

**Friday checkpoint:**
- Scenario 1 fully works: Admin creates event → attaches 3 sports with quotas → transitions to PUBLISHED
- Federations exist in the system; Federation user sees the published event
- Sport categories visible per sport
- Audit log shows event creation, status change, sport attachment events (assuming backend logs these)

## Week 4 — Survey Engine + W4 BETA RELEASE

**Goal:** Federations submit all 3 survey types; admin reviews them; **W4 BETA RELEASE** at end of week.

**Modules to build:**
- Mon: `survey` foundation (3 types: by-sport, by-number, by-category)
- Tue: `survey` BY_SPORT form (per-sport headcount entry)
- Wed: `survey` BY_NUMBER and BY_CATEGORY forms
- Thu: `submissions` (admin review queue with FSM transitions — approve / reject with revision / flag)
- Fri morning: deploy to staging
- Fri evening: **BETA DEMO** to ministry tech + 1–2 friendly federations

**W4 Beta scope (see 04_RELEASES.md):** Auth + events + sports + 3 survey types + admin review.

**Friday checkpoint:**
- Federation user logs in, sees pending survey, submits BY_SPORT
- Admin user reviews survey, can approve, reject (with reason), or flag
- Federation receives notification (or sees status change) on rejection
- All FSM transitions work; cannot skip states
- Beta deployed to staging; demo URL shared

## Week 5 — Registration Flow + Beta Feedback

**Goal:** Federations register participants (alone mode) with documents and age validation; absorb W4 feedback.

**Days 1–2: W4 beta feedback bugs**
- Run Prompt 9 (beta feedback triage) Monday morning
- Fix top 5 issues from W4 beta
- Reserve a full 2 days — there will be feedback

**Days 3–5: registration-flow module**
- Wed: `registration-flow` setup (multi-step form: event → sport → personal → documents → review)
- Thu: documents upload + age validation rules + quota enforcement
- Fri morning: organizer registration start (`participation` module)
- Fri evening: smoke test + fix

**Friday checkpoint:**
- Scenario 7 works: Federation registers participant born 2010 → form requires birth certificate
- Federation registers participant born 2000 → form requires NID or passport
- Quota enforcement: cannot register more than the per-sport quota
- Age computed correctly using event date (test with multiple event dates)

## Week 6 — Reports v1 + W6 PILOT RELEASE

**Goal:** 4 most-critical Khmer reports; **W6 PILOT RELEASE** to 3–5 real federations.

**Modules to build:**
- Mon: complete `participation` (organizer registration approve/reject)
- Tue: `reports` foundation (list, generation, download, polling for async jobs)
- Wed: RPT-DELEGATION + RPT-ROSTER-ALL
- Thu: RPT-NUMBER-LIST + RPT-SPORT-LIST
- Fri morning: deploy pilot
- Fri evening: **PILOT KICKOFF** with 3–5 federations on a real event

**W6 Pilot scope:** Beta scope + alone-mode registration + organizers + 4 reports.

**Friday checkpoint:**
- Each of 4 reports generates correctly with sample data
- Khmer column headers exactly match official ministry templates (verify side-by-side)
- PDF downloads work; Excel downloads work
- Pilot federations have credentials and are logged in

## Week 7 — Reports v2 + Pilot Feedback + Hardening

**Goal:** Remaining 4 reports + pilot feedback fixes + team registration + flag/review hardening.

**Days 1–3: pilot feedback bugs**
- Run Prompt 9 (pilot feedback triage) Monday morning
- Fix top 10 issues from W6 pilot
- Reserve 3 days for this

**Days 4–5: build forward**
- Thu: RPT-ALBUM + RPT-LEADER-ALL
- Fri: RPT-COACH-ATHLETE + RPT-DELEGATION-LEADERS

**Side stream:**
- Add team mode to `registration-flow` (bulk participant entry via CSV)
- Add flag/review workflow to `submissions`

**Friday checkpoint:**
- All 8 reports work end-to-end
- Team mode registration works (10+ participants in one form)
- Admin can flag a registration; flagged registrations appear in dedicated queue

## Week 8 — Polish, Cards, Hardening, W8 PRODUCTION

**Goal:** Cards module, performance, accessibility, audit verification, production deploy.

**Days 1–2: cards module + final polish**
- Mon: `cards` module (lower priority, MVP only)
- Tue: i18n review (any missing Khmer keys), spelling, copy review

**Days 3–4: hardening sprint**
- Wed: load test (1000 concurrent users), index tuning if needed
- Thu: RBAC audit (verify federation_id scoping on every list endpoint), accessibility pass (axe-core)

**Day 5: production release**
- Fri morning: backup/restore drill on staging
- Fri afternoon: deploy to production
- Fri evening: **W8 PRODUCTION RELEASE v1.0**

**Friday checkpoint:**
- All 13 modules in production
- All 8 reports validated against ministry templates
- Performance: p95 API latency < 400ms under load
- RBAC: zero cross-tenant data leaks in test
- Backups: nightly + WAL working
- Training materials handed to ministry

## Daily evening rhythm

- 6pm–7pm: review previous evening's commits, smoke test
- 7pm–9pm: run today's prompt, review diff, walk through scenarios
- 9pm–10pm: commit, update CLAUDE.md if patterns emerged

## Weekly rhythm

- **Mon–Thu:** one prompt per evening
- **Fri:** smoke test prompt + fix top issues + (release weeks: deploy)
- **Sat morning:** light cleanup, plan next week's queue
- **Sun evening:** weekly review prompt — catch drift, audit week's commits

## Buffers and risk

Built-in buffers:
- W5 days 1–2 reserved for beta feedback
- W7 days 1–3 reserved for pilot feedback
- Friday smoke tests every week catch regressions early

Critical-path risks:
- Backend contract incomplete (W1 risk)
- Khmer report templates not validated (W6 risk)
- Pilot federation availability (W6 risk)
- Cross-tenant RBAC bug (any week, hardest to catch)

If any release date slips, the next one slips by the same amount. No catch-up — rushing causes bugs.
