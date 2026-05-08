# Master Plan — 8-Week Frontend Rebuild

## Project
Cambodia Ministry of Education, Youth and Sport — National Sports Event Management Platform.

## What we are building

A government-grade web platform for managing national sports events with these actors:
- **Super Admin** — system owner
- **Admin** — ministry staff, runs events
- **Federation** — sport federations submitting surveys, registering athletes
- **Organization** — entities registering organizers (leaders, coaches)
- **Organizer** — individuals (leader / coach / asst-coach / staff)

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + shadcn/ui + Tailwind + React Query + React Hook Form + Zod
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (teammate owns this — read-only contract)
- **Package manager:** pnpm

## Scope

**In scope:**
- Full rebuild of Next.js frontend in `final/`
- API layer auto-generated from backend OpenAPI
- All 13 feature modules
- 8 Khmer ministry reports

**Out of scope:**
- Backend changes (teammate's work)
- Mobile app (future)
- Public-facing pages (future)

**Preserved from previous frontend (only):**
- `messages/en.json` and `messages/kh.json` — Khmer translations
- `package.json` (as starting reference, edited)
- Standard Next.js config files

Everything else is rebuilt from scratch.

## The 10 user scenarios

1. Admin creates event, attaches sports + per-sport quotas, publishes
2. Admin sends a "by-sport" survey to federations for the event
3. Federation submits a "by-sport" survey response (per-sport headcount)
4. Federation submits a "by-number" survey response (total only)
5. Federation submits a "by-category" survey response (M/F × age band)
6. Admin reviews surveys: approve, reject with revision request, or flag
7. Federation registers participants in ALONE mode (one at a time, with documents — birth cert if <18, NID/passport if ≥18)
8. Federation registers participants in TEAM mode (bulk entry)
9. Organization registers organizers (leader / coach / asst-coach / staff)
10. Admin generates the 8 Khmer reports

## The 8 Khmer ministry reports

1. **RPT-SPORT-LIST** — ចុះប្រភេទកីឡា — list of sport categories
2. **RPT-DELEGATION** — តារាងទិន្នន័យក្រុមចូលរួមកីឡា — delegation summary
3. **RPT-NUMBER-LIST** — បញ្ជីចំនួនតាមប្រភេទកីឡា — numbers per sport
4. **RPT-ALBUM** — អាល់ប៊ុមប្រតិភូ — delegate photo album
5. **RPT-ROSTER-ALL** — បញ្ជីរាយនាមរួម — combined roster
6. **RPT-LEADER-ALL** — បញ្ជីថ្នាក់ដឹកនាំ — leadership roster
7. **RPT-COACH-ATHLETE** — បញ្ជីគ្រូបង្វឹក កីឡាករ កីឡាការិនី — coaches and athletes
8. **RPT-DELEGATION-LEADERS** — បញ្ជីប្រតិភូ និងអ្នកដឹកនាំក្រុម — delegations and leaders

## Cross-cutting rules

- Khmer-first UI; all strings via i18n keys
- RBAC scoping enforced (Federation/Org users see only own data)
- Age computed from event date, never from today
- Document type by age (birth cert <18, NID/passport ≥18)
- FSM transitions: DRAFT → SUBMITTED → APPROVED / REJECTED / FLAGGED → REVISION_REQUESTED
- All mutations idempotent (Idempotency-Key header)
- Loading + empty + error states on every list
- Optimistic updates with rollback on mutations

## 13 modules in build order

1. `auth` — login, ProtectedRoute, role guards (Week 2)
2. `common` — sidebar, navigation, unauthorized (Week 2)
3. `dashboard` — landing per role (Week 2)
4. `users` — admin manages users (Week 2)
5. `events` — create events, attach sports (Week 3)
6. `sports` — sports + categories (Week 3)
7. `organizations` — federations + orgs (Week 3)
8. `survey` — 3 survey types (Week 4) ← W4 BETA RELEASE
9. `submissions` — review queue with FSM (Week 4)
10. `registration-flow` — participant registration (Week 5)
11. `participation` — organizer registration (Week 5–6)
12. `reports` — 8 Khmer reports (Week 6–7) ← W6 PILOT RELEASE
13. `cards` — last priority (Week 8) ← W8 PRODUCTION

## Three releases

- **W4 — Internal Beta** — Auth + events + sports + survey for ministry tech + 1–2 friendly federations
- **W6 — Pilot** — Beta scope + registrations + organizers + 4 reports for 3–5 federations on a real event
- **W8 — Production v1.0** — All modules + all 8 reports + hardening for all federations

See `04_RELEASES.md` for detailed scope per release.

## Definition of done (per module)

- All scenarios touching it pass
- TypeScript clean, lint clean, build succeeds
- All strings in i18n (BOTH en + kh)
- Loading/empty/error states on every list
- Form validation visible inline
- RBAC scoping verified
- Security checklist self-audit passes
- No console errors in normal flow
