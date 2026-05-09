# 01_PROMPTS.md — All implementation prompts in order

This is the playbook. Each prompt is self-contained — paste it verbatim into Claude Code in VS Code.

After each prompt:
1. Review the diff in VS Code's source control panel
2. Verify the commit message follows the template
3. Run the prompt's verification commands yourself
4. Move to the next prompt

**Total prompts:** 13 + 1 evening kickoff + 1 weekly review + 1 feedback triage.

**Module rebuild order:** auth → common → dashboard → users → events → sports → organizations → survey → submissions → registration-flow → participation → reports → cards.

---

## EVENING KICKOFF PROMPT — Run at the start of every evening session

```
Evening session start.

Before doing anything:
1. Read CLAUDE.md
2. Read final/_rebuild/RED_LINES.md
3. Read final/_rebuild/03_TIMELINE.md and tell me what week and day we are on based on the most recent commits
4. Read the last 3 commits (git log -3 --stat) and summarize what state the codebase is in
5. Tell me what you understand the next prompt should be (from final/_rebuild/01_PROMPTS.md)

Confirm:
- Backend OpenAPI is reachable (curl http://localhost:8000/openapi.json | head -3)
- pnpm install is current (no missing dependencies)
- git is on a clean working tree (git status)

If anything is off, STOP and tell me. Do not start work until I confirm.

I'll review your summary and then paste the actual work prompt.
```

---

## PROMPT 1 — Lock in the backend contract

(You may have already run this. If you have, skip to Prompt 2.)

```
Working directory: ~/moeys/final

Goal: produce a single source of truth for what the backend exposes, so the frontend rebuild stays in sync. Do this BEFORE deleting anything else.

Steps:
1. Start the backend at ~/moeys/Backend-V2 (read its README/makefile for command). If you cannot start it, ask me — do not guess.
2. Fetch http://localhost:<port>/openapi.json and save to ~/moeys/final/_contract/openapi.json.
3. Verify the spec is healthy: it should have at least 30 paths. If it has 0 or near-0 paths, STOP and tell me — that's a backend problem.
4. Install openapi-typescript as a dev dependency: pnpm add -D openapi-typescript
5. Generate types: pnpm openapi-typescript _contract/openapi.json -o _contract/api.types.ts
6. Add an npm script "contract:sync" in package.json that re-runs steps 2 and 5.
7. Produce _contract/ENDPOINTS.md — a human-readable list grouped by domain (auth, events, sports, organizations, surveys, registrations, organizers, reports, users, dashboard, cards), with one line per endpoint:
   METHOD path → request shape → response shape → required role(s)

Do NOT modify any other files yet. The _contract/ folder is the only output.

Print at the end:
- Total endpoint count
- A list of every endpoint domain found
- Endpoints expected by the master plan but missing on the backend (gaps for the teammate to address)
- Endpoints on the backend that aren't mentioned in the master plan (potential extras)

Then commit: git add _contract/ package.json && git commit -m "rebuild: freeze backend contract"
```

---

## PROMPT 2 — Freeze the scenarios

```
Working directory: ~/moeys/final

Read final/_rebuild/00_MASTER_PLAN.md and final/_contract/ENDPOINTS.md first.

Create final/_rebuild/SCENARIOS.md as the canonical user-journey spec for the rebuild. Every later module rebuild will reference this file.

Structure: 10 numbered scenarios from 00_MASTER_PLAN.md, each with:
- Actor (Super Admin / Admin / Federation / Organization / Organizer)
- Precondition
- Steps (numbered, UI-level — what the user clicks/types/sees)
- Backend endpoints called (reference _contract/ENDPOINTS.md by exact path)
- Loading, empty, and error states required
- Success criterion
- Failure modes to handle (e.g., "what if quota exceeded", "what if document upload fails")
- i18n keys needed (sketch namespaces — final keys come during module rebuild)

Embed cross-cutting rules from 00_MASTER_PLAN.md into every scenario where relevant (Khmer-first, RBAC scoping, age from event date, document rule by age, FSM transitions, idempotency).

Also produce final/_rebuild/ROUTE_MAP.md — a table mapping each scenario to:
- Next.js route path(s) under app/(portal)/
- Module(s) under modules/
- Primary components rendered
- Backend endpoints touched

Do NOT modify any other files.

Then commit: git add final/_rebuild/ && git commit -m "rebuild: freeze user scenarios and route map"
```

---

## PROMPT 3 — Establish the rebuild conventions

```
Working directory: ~/moeys/final

Read final/_rebuild/00_MASTER_PLAN.md, final/_rebuild/SCENARIOS.md, final/_contract/api.types.ts.

Produce final/_rebuild/CONVENTIONS.md covering:

1. Folder shape per module:
   modules/<domain>/
     components/    PascalCase .tsx files + index.ts barrel
     hooks/         use<X>.ts files + index.ts
     services/      api calls typed via _contract/api.types.ts
     types/         domain-local types only (backend types come from _contract/)
     index.ts       public surface — only what other modules import

2. API layer rules:
   - All HTTP via core/api/client.ts (typed with _contract types)
   - Hooks wrap services; components never call services directly
   - React Query keys via typed queryKey factory per module
   - Mutations: optimistic update + onError rollback + onSettled invalidation
   - Idempotency-Key header on all POST/PUT/PATCH (handled by client)

3. Form rules:
   - React Hook Form + zodResolver
   - Zod schema in modules/<domain>/services/schema.ts
   - Use shared/form/* fields, never bare inputs
   - Errors shown inline under each field
   - Submit button disabled while pending; spinner inside button
   - Server-side RFC7807 errors mapped back to fields

4. List/table rules:
   - Use shared/ui/DataTable.tsx (TanStack Table)
   - Wrap in shared/ui/QueryBoundary.tsx for loading/empty/error
   - Server-side pagination + filtering via URL search params
   - Khmer column headers from messages/kh.json

5. Page shell rules:
   - Every page uses shared/layout/PageShell.tsx
   - Page header from shared/ui/page/PageHeader.tsx
   - loading.tsx file shows shared/ui/page/PageLoadingState.tsx
   - error.tsx shows recoverable error UI with retry

6. Auth and RBAC rules:
   - Wrap protected pages in <ProtectedRoute requiredRoles={[...]} />
   - useRequireRole hook for component-level gating
   - Federation/Org scoping: pass federation_id or organization_id from auth context to every list query

7. i18n rules:
   - No hardcoded strings in JSX; always t('key')
   - Every new key added to BOTH messages/en.json AND messages/kh.json
   - Khmer is canonical; English secondary

8. Naming:
   - Components PascalCase, hooks useCamelCase, services camelCase named exports, types PascalCase no I-prefix
   - File name matches the export name

9. State machine rules:
   - Status enum in single file per domain
   - Transitions handled by mutations only (no client-side status changes)
   - Status badges via shared/ui/Badge.tsx with color map

10. Definition of Done for a module rebuild — see SECURITY_CHECKLIST.md

Also create final/_rebuild/MODULE_TEMPLATE/ — empty stencil files matching the conventions, so each module rebuild starts from the same shape.

Do NOT modify any other files.

Then commit: git add final/_rebuild/ && git commit -m "rebuild: establish conventions and module template"
```

---

## PROMPT 4 — Nuke and start clean

```
Working directory: ~/moeys/final

You are about to delete the current frontend implementation EXCEPT specific files we preserve.

PRESERVE (do not touch):
- messages/en.json and messages/kh.json
- package.json (will be edited, not replaced)
- pnpm-lock.yaml
- tsconfig.json (review and keep)
- next.config.ts
- next-env.d.ts
- .gitignore
- README.md
- public/ folder
- _contract/ folder
- _rebuild/ folder (including 00_MASTER_PLAN.md, 02_DECISIONS.md, 03_TIMELINE.md, 04_RELEASES.md, RED_LINES.md, SECURITY_CHECKLIST.md, SCENARIOS.md, ROUTE_MAP.md, CONVENTIONS.md, MODULE_TEMPLATE/)
- env.ts (review env var names; rebuild typed)

DELETE the rest:
- app/ folder (entire) — except keep app/favicon.ico if present, will rebuild app shell
- components/ folder (entire)
- core/ folder (entire) — will be rebuilt cleanly
- lib/ folder
- modules/ folder (entire)
- shared/ folder (entire) — will be rebuilt to match conventions
- proxy.ts
- package-lock.json (project uses pnpm)
- components.json (regenerate fresh with shadcn init)
- postcss.config.mjs (regenerate fresh)
- eslint.config.mjs (regenerate fresh)
- pnpm-workspace.yaml (only if not actually used as a workspace)
- scripts/create-feature.sh
- tsconfig.tsbuildinfo (build artifact)

Steps:
1. Confirm git is clean and we are on the `rebuild` branch: git status; git branch --show-current
2. Back up messages/en.json and messages/kh.json to _rebuild/_preserved/ as safety copies
3. Delete the listed folders/files
4. Run: pnpm install — confirm clean install
5. Re-initialize shadcn/ui:
   pnpm dlx shadcn@latest init
   Choose: TypeScript yes, Tailwind yes, src/ no (we use root), import alias @/*, base color slate, CSS variables yes, app router yes
6. Re-create app/ with minimal Next.js App Router scaffolding:
   - app/layout.tsx (root layout, fonts loaded for Khmer + English)
   - app/page.tsx (redirect to /dashboard or /login based on auth)
   - app/globals.css
7. Verify: pnpm tsc --noEmit and pnpm build (build will be minimal but must succeed)

Print a summary:
- What was deleted
- What was preserved
- What was reinitialized
- Any errors and how you resolved them

Then commit: git add -A && git commit -m "rebuild: nuke old frontend, reinit shadcn and Next.js shell"
```

---

## PROMPT 5 — Build the foundation layer

```
Working directory: ~/moeys/final

Read final/_rebuild/CONVENTIONS.md, final/_rebuild/SCENARIOS.md, final/_rebuild/RED_LINES.md, final/_contract/api.types.ts.

Build the foundation pieces ALL modules will depend on. Build in this order:

1. core/api/client.ts
   - Typed fetch wrapper using _contract/api.types.ts (use openapi-fetch or similar pattern)
   - Auto-injects Authorization header from auth context
   - Auto-injects Idempotency-Key (crypto.randomUUID()) on POST/PUT/PATCH
   - Handles 401 (refresh token via Next.js route handler) and 403 (redirect to /unauthorized)
   - RFC7807 error parser
   - Request/response logger in dev only

2. core/auth/
   - AuthContext + AuthProvider (currentUser, roles, federation_id, organization_id, login, logout)
   - ProtectedRoute component (requiredRoles prop; redirects to /unauthorized if not allowed)
   - useRequireRole hook
   - Token storage via Next.js route handlers — HttpOnly cookies. NOT localStorage.
     Create app/api/auth/login/route.ts, app/api/auth/refresh/route.ts, app/api/auth/logout/route.ts
   - Login service calls

3. core/i18n/
   - next-intl setup
   - LanguageProvider with km/en switch
   - LanguageSwitcher component
   - Default to km

4. core/config/
   - Typed env (env.ts) with zod validation at boot
   - constants.ts (app name, default page size, etc.)
   - routes.ts (typed route paths)

5. core/lib/
   - cn.ts (tailwind-merge wrapper)
   - sanitize.ts (basic HTML sanitization)
   - format.ts (date formatting in Khmer + English, computeAgeAtEvent helper, Khmer numerals helper)
   - validation.ts (shared zod schemas: phone, email, ID number formats)

6. shared/ui/ — primitives (rebuild, don't import from old shared/ui)
   - Button, Input, Label, Select, Textarea (wrap shadcn primitives with our defaults)
   - Card, Modal, Badge, Skeleton, Spinner
   - DataTable (TanStack Table-based, server pagination + filter via URL params)
   - QueryBoundary (wraps loading/empty/error)
   - StepIndicator
   - StatCard
   - SectionHeader
   - page/ folder: PageShell, PageHeader, PageLoadingState, PageEmptyState, PageNotFound, BackLink, ContentPanel, DetailHeader

7. shared/form/
   - FormField, TextInputField, SelectField, FileUploadField, DateField (Khmer-aware)
   - All wrap React Hook Form's Controller
   - All use shared/ui/ primitives

8. shared/layout/
   - PageShell (sidebar + header + content)
   - Sidebar (role-aware nav)
   - TopBar (language switcher, user menu, logout)

9. app/ root layout updates
   - Wrap children in: <QueryProvider> → <AuthProvider> → <LanguageProvider>
   - Set up fonts: Battambang for Khmer, Inter for English, font-display: swap
   - Toaster (sonner) for notifications

10. _rebuild/MODULE_TEMPLATE/ — verify the stencil matches what you just built; update if needed

After building, run:
- pnpm tsc --noEmit (must be clean)
- pnpm lint (must be clean)
- pnpm build (must succeed)

Print a summary of files created and any deviations from CONVENTIONS.md.

Then commit: git add -A && git commit -m "rebuild: foundation layer (core, shared, app shell)"
```

---

## PROMPT 6 — Module rebuild template (run once per module)

This is the **reusable per-module prompt**. Replace `<MODULE_NAME>` and run once per module in this order:
1. auth → 2. common → 3. dashboard → 4. users → 5. events → 6. sports → 7. organizations → 8. survey → 9. submissions → 10. registration-flow → 11. participation → 12. reports → 13. cards

```
Working directory: ~/moeys/final

Module to build: <MODULE_NAME>          ← REPLACE THIS each run

REQUIRED reading before writing any code:
1. final/_rebuild/RED_LINES.md — hard rules
2. final/_rebuild/SECURITY_CHECKLIST.md — what counts as done
3. final/_contract/api.types.ts — backend types
4. final/_contract/ENDPOINTS.md — endpoint reference
5. final/_rebuild/SCENARIOS.md — find every scenario that touches this module
6. final/_rebuild/ROUTE_MAP.md — find every route that renders this module
7. final/_rebuild/CONVENTIONS.md — the rules
8. final/_rebuild/MODULE_TEMPLATE/ — the stencil
9. shared/ui/, shared/form/, shared/layout/, core/api/client.ts — reuse these

Build modules/<MODULE_NAME>/ from scratch:
1. Copy the stencil from _rebuild/MODULE_TEMPLATE/ into modules/<MODULE_NAME>/
2. Implement components, hooks, services, types per SCENARIOS.md and CONVENTIONS.md
3. Wire it into the relevant app/(portal)/<route>/page.tsx (also create those pages following the page-shell rules; include loading.tsx and error.tsx)
4. Add all i18n keys to BOTH messages/en.json AND messages/kh.json — Khmer is canonical
5. Implement loading + empty + error states on every list
6. Implement RBAC guards on the routes
7. Implement form validation with inline errors
8. Implement optimistic updates + rollback on mutations

Constraints:
- Do NOT touch any module other than <MODULE_NAME> and its app routes
- Do NOT modify _contract/ or _rebuild/
- Do NOT modify shared/ui/ unless a genuinely reusable improvement is needed (and document the change in _rebuild/SHARED_CHANGES.md)
- All backend types from _contract/api.types.ts only — no hand-written duplicates
- Follow every rule in RED_LINES.md without exception

After implementation:
- Run pnpm tsc --noEmit (must be clean for whole repo)
- Run pnpm lint (must be clean for whole repo)
- Run pnpm build (must succeed)
- Run through SECURITY_CHECKLIST.md and produce results
- Manually verify every relevant scenario from SCENARIOS.md — print a table:
  scenario # | description | PASS / NEEDS-BACKEND-FIX / FAIL with reason

Print a final report:
- Files created (full list)
- Scenarios passing
- Scenarios needing backend fixes (so the team can address)
- Security checklist results (use the format from SECURITY_CHECKLIST.md)
- Any conventions you had to bend, with reason

Then commit using this template:
git add -A
git commit -m "rebuild: <MODULE_NAME> module

Security checklist results:
A. Auth & tokens: PASS / NO
B. RBAC & scoping: PASS / NO
C. FSM & transitions: PASS / NO
D. Forms & validation: PASS / NO
E. Age & documents: N/A or PASS / NO
F. Idempotency: PASS / NO
G. i18n: PASS / NO
H. Loading/empty/error: PASS / NO
I. Audit: PASS / NO
J. Contract integrity: PASS / NO
K. Build & quality: PASS / NO
L. Conventions: PASS / NO
M. Scenarios: N PASS / N FAIL / N NEEDS-BACKEND-FIX

Scenarios needing backend fixes:
- (list any with the endpoint and expected behavior)
"
```

---

## PROMPT 7 — Smoke test (run every Friday)

```
Working directory: ~/moeys/final

Goal: verify the rebuild hasn't regressed.

Steps:
1. Ensure backend is running (curl http://localhost:8000/openapi.json | head -3)
2. pnpm dev
3. For every scenario in final/_rebuild/SCENARIOS.md:
   a. Note whether the involved module(s) have been rebuilt yet (check git log + modules/ directory)
   b. If rebuilt: walk through the scenario manually using the UI; mark PASS / FAIL with the failing step
   c. If not yet: mark NOT-YET

Produce final/_rebuild/SMOKE_<YYYY-MM-DD>.md with:
- Date and week number (e.g., Week 3)
- Modules currently rebuilt (list)
- Per-scenario results table
- Any failure traces
- Top 5 priorities for next week

Do NOT fix bugs in this run — just report. Fixes happen in the next module-rebuild prompt where you reference this report.

Then commit: git add final/_rebuild/SMOKE_*.md && git commit -m "smoke: week N friday checkpoint"
```

---

## PROMPT 8 — Weekly review (run every Sunday evening)

```
Working directory: ~/moeys/final

Read final/_rebuild/RED_LINES.md and final/_rebuild/SECURITY_CHECKLIST.md.

Audit the past week's commits for drift, accumulated debt, and red-line violations.

Steps:
1. Get last week's commits: git log --since='7 days ago' --no-merges --stat
2. For each commit, scan the diff for these specific patterns:

A. localStorage / sessionStorage references (red line 4 violation)
   grep -rn "localStorage\|sessionStorage" --include="*.ts" --include="*.tsx" .

B. Hand-written backend types (red line 2 violation)
   Look for interface/type definitions that mirror backend response shapes
   especially in services/ folders

C. new Date() in age math (red line 3 violation)
   grep -rn "differenceInYears\|getAge\|computeAge" --include="*.ts" --include="*.tsx"
   For each match, verify it uses event date, not new Date()

D. status in mutation bodies (red line 5 violation)
   grep -rn "status:" --include="*.ts" --include="*.tsx" services/
   Verify none are inside mutation request bodies (PATCH/PUT)

E. Hardcoded strings (red line 7 violation)
   grep -rn "<button>\|<h1>\|<h2>\|<p>" --include="*.tsx" modules/
   Spot-check 10 random matches — should all use {t('...')}

F. Missing i18n keys
   For each key in messages/en.json, verify it exists in messages/kh.json
   Print any missing keys

G. Federation list queries without scoping (red line 6 violation)
   grep -rn "useQuery" --include="*.ts" --include="*.tsx" modules/
   Spot-check 5 — verify they pass federation_id from auth context for non-admin users

H. Console logs / debug code left in
   grep -rn "console.log\|console.debug\|debugger" --include="*.ts" --include="*.tsx" modules/

I. TODO / FIXME comments
   grep -rn "TODO\|FIXME\|XXX\|HACK" --include="*.ts" --include="*.tsx" modules/

3. For each violation found:
   - File + line number
   - Type of violation (which red line)
   - Severity (P0 = catastrophic, P1 = high, P2 = medium)
   - Suggested fix

Produce final/_rebuild/REVIEW_<YYYY-MM-DD>.md with:
- Week number
- Total commits reviewed
- Violations found (table: file | line | type | severity | suggested fix)
- Top 5 priorities for fix in next session
- Health score: GREEN (no P0/P1) / YELLOW (P1 only) / RED (any P0)

Do NOT fix anything during this audit. Report only.

Then commit: git add final/_rebuild/REVIEW_*.md && git commit -m "review: week N sunday audit"

If health is RED, the user MUST address P0 issues before starting the next module.
```

---

## PROMPT 9 — Beta / Pilot feedback triage (run after W4 and W6 releases)

```
Working directory: ~/moeys/final

Goal: triage feedback from the beta (W4) or pilot (W6) release into actionable fixes.

Inputs (the user will provide):
- A list of bug reports or feedback items
- Severity if known
- Which release the feedback came from (W4 beta / W6 pilot)

For each feedback item:
1. Reproduce it in the local environment if possible
2. Categorize:
   - BUG (P0/P1/P2/P3) — actual defect
   - UX (improvement) — the system works but is confusing
   - FEATURE_REQUEST — new functionality
   - WONT_FIX — out of scope or working as designed
3. For bugs:
   - File a one-line summary
   - Identify the responsible module
   - Identify the responsible file/component if possible
   - Estimate fix time (minutes/hours)

Produce final/_rebuild/FEEDBACK_<release>_<date>.md with:
- Total items: N
- Categorized counts (P0/P1/P2/P3 bugs, UX, feature requests, won't-fix)
- Per-item triage table
- Recommended fix order (P0 first, then P1, then UX wins, then P2)
- Estimated total fix time

Then for each P0 and P1 bug, create a short fix prompt I can run:

```
Fix bug: <one-line summary>
Module: <module>
File: <file>
Reproduce: <steps>
Expected: <what should happen>
Actual: <what happens>
Constraints: do NOT touch any module other than <module>; respect RED_LINES.md
```

Output these as a numbered list.

Then commit: git add final/_rebuild/FEEDBACK_*.md && git commit -m "feedback: <release> triage"
```

---

## PROMPT 10 — W4 Beta deploy

```
Working directory: ~/moeys/final

It is end of Week 4. Time to deploy the W4 Beta release.

Read final/_rebuild/04_RELEASES.md section "W4 — Internal Beta" — verify all in-scope modules are completed.

Steps:
1. Run all checks:
   - pnpm tsc --noEmit
   - pnpm lint
   - pnpm build
2. Run smoke test (Prompt 7) — must be all PASS for W4 scope scenarios
3. Tag the release: git tag v0.4-beta -m "W4 Beta release"
4. Deploy to staging environment (use whatever deploy mechanism is configured; if none, ask the user)
5. Verify staging URL is reachable
6. Seed staging with test data (use seed.py from backend if not already; coordinate with teammate if needed)
7. Test on staging with the demo flow from 04_RELEASES.md "W4 Demo flow":
   - Each step PASS / FAIL
   - Khmer text rendering correctly
   - HttpOnly cookies set correctly (check browser dev tools)
   - RBAC verified (Federation A cannot see Federation B's data)
8. Print a release notes draft (final/_rebuild/RELEASE_NOTES_v0.4-beta.md):
   - In scope (list)
   - NOT in scope (list)
   - Known issues
   - Demo URL
   - Test credentials (use placeholders, do NOT commit real ones)
9. Push the tag: git push origin v0.4-beta

Then commit any deploy-related files: git add -A && git commit -m "release: W4 Beta v0.4-beta"
```

---

## PROMPT 11 — W6 Pilot deploy

(Same shape as PROMPT 10 but for W6 Pilot release. Adjust scope per 04_RELEASES.md "W6 — Pilot" section. Tag as v0.6-pilot.)

```
Working directory: ~/moeys/final

It is end of Week 6. Time to deploy the W6 Pilot release.

Read final/_rebuild/04_RELEASES.md section "W6 — Pilot" — verify all in-scope modules are completed.

Run all the steps from PROMPT 10 but for the W6 Pilot scope:
- Tag: v0.6-pilot
- Release notes file: final/_rebuild/RELEASE_NOTES_v0.6-pilot.md
- 4 reports tested with sample data and verified against ministry templates side-by-side
- Pilot federation credentials prepared (in a separate, NOT-committed file)
- 1-hour training session materials prepared

Special pilot checks:
- All 4 W6 reports generate correctly
- PDF Khmer rendering verified (Battambang font embedded, characters display correctly)
- Excel Khmer rendering verified (UTF-8 BOM if needed for Excel on Windows)
- File downloads work via signed URL with TTL
- Federation users can register at least 1 participant successfully end-to-end

Then commit: git add -A && git commit -m "release: W6 Pilot v0.6-pilot"
```

---

## PROMPT 12 — W8 Production deploy

```
Working directory: ~/moeys/final

It is end of Week 8. Time to deploy the W8 Production release.

Read final/_rebuild/04_RELEASES.md section "W8 — Production" — verify all in-scope modules are completed.

PRODUCTION DEPLOY CHECKLIST — do NOT skip any step:

1. Code quality:
   - pnpm tsc --noEmit clean
   - pnpm lint clean
   - pnpm build succeeds
   - All scenarios PASS in latest smoke test
   - Latest weekly review has GREEN health

2. RBAC audit:
   - Run a scripted check: for 10 random list endpoints, simulate a Federation user calling without scoping params — verify backend rejects or returns empty
   - Manual check: 5 random screens, log in as Federation A, verify cannot see Federation B's data

3. Khmer rendering audit:
   - All 8 reports generated and verified side-by-side with ministry templates
   - Khmer rendering on Windows / macOS / iOS preview all checked

4. Performance:
   - Load test: 1000 concurrent users via k6 or similar
   - p95 API latency must be < 400ms
   - p99 < 800ms
   - Error rate < 0.1%

5. Accessibility:
   - axe-core run on all major screens — zero critical violations
   - Keyboard navigation works on all forms
   - Color contrast ≥ 4.5:1

6. Backup / restore:
   - Backup procedure documented
   - Restore drill performed on staging — RTO < 1h

7. Monitoring:
   - Prometheus / Grafana dashboards live
   - Alert routing tested (Slack / email)
   - Sentry or equivalent error tracking active

8. Documentation:
   - Runbook published
   - Training materials delivered to ministry
   - On-call rotation defined

9. Deploy:
   - Tag: v1.0
   - Release notes file: final/_rebuild/RELEASE_NOTES_v1.0.md
   - DNS cutover plan documented
   - Rollback procedure tested

10. Sign-off:
    - Ministry stakeholder approval email received (note in release notes)
    - Production deploy executed
    - Post-deploy smoke test on production URL passes

If ANY step fails or is incomplete, STOP and tell the user. Production deploy is not a "do it anyway" event.

Then commit: git add -A && git commit -m "release: W8 Production v1.0"
git tag v1.0 -m "Production release v1.0"
git push origin v1.0
```

---

## PROMPT 13 — Wire up backend fixes (run when teammate delivers a gap)

This prompt is **not scheduled** — run it each time the backend teammate closes one or more of the documented gaps below. One run per batch of related fixes is fine.

### Full backend gap registry

These gaps are currently worked around in the frontend. Each row shows: the gap, which file contains the workaround, and what needs to happen to remove it.

| # | Gap | Workaround file(s) | What teammate must add |
|---|-----|--------------------|------------------------|
| 1 | ✅ CLOSED 2026-05-09 `UserPublic.organization_id` | ~~cookie override~~ — `useEffectiveOrgId` now reads from session | Done |
| 2 | ✅ CLOSED 2026-05-09 `SportsEventPublic.sports_id` | ~~name-match workaround~~ — `sport.sports_id` used directly | Done |
| 3 | No event `status` field / no publish endpoint | `modules/events/components/EventList.tsx` — computed badge from dates | Add `status` to `EventPublic`; add `POST /api/events/{event_id}/publish` |
| 4 | No sport quota field on `SportsEventPublic` | (quota UI never built — silently omitted) | Add `quota: int \| null` to `SportsEventPublic` |
| 5 | ✅ CLOSED 2026-05-09 FSM transitions | ~~disabled buttons~~ — approve/reject/flag buttons enabled, status badge shown | Done |
| 6 | `ParticipationPerSportCreate` has no `category_id` | `modules/survey/components/ByCategorySurveyForm.tsx` — aggregates to totals | Add `category_id: int \| null` to create schema |
| 7 | ✅ CLOSED 2026-05-09 participation-per-sport filter params | ~~client-side event_name filter~~ — server-side `events_id` param used | Done |
| 8 | ✅ CLOSED 2026-05-09 Sport `PUT`/`DELETE` endpoints | ~~disabled buttons~~ — edit modal + delete on SportDetailPage and SportList | Done |
| 9 | ✅ CLOSED 2026-05-09 6 of 8 report endpoints | ~~disabled cards~~ — all 8 reports enabled with real `.xlsx` downloads | Done |
| 10 | `POST /api/registration/` body undocumented in OpenAPI | `modules/registration-flow/services/registration.service.ts` — body cast to `Record<string, unknown>` | Document the request body schema in OpenAPI |
| 11 | No `federation_id`/`organization_id` scoping on list endpoints | All module list hooks — pass params but backend may ignore | Add query param filtering to: `/api/registration/`, `/api/participation-per-sport/`, `/api/events/`, `/api/organization/` |

```
Working directory: ~/moeys/final

The backend teammate has delivered one or more fixes. Before doing anything:
1. Tell me which gap number(s) from the registry above are now fixed (I will confirm)
2. Run: pnpm contract:sync
   This re-fetches openapi.json from http://localhost:8000/openapi.json and regenerates _contract/api.types.ts
3. Diff the new api.types.ts against the previous version — print every changed type
4. For each closed gap, find the workaround in the file(s) listed in the registry and remove it:

   Gap 1 — UserPublic.organization_id now present:
   - Delete core/auth/hooks/useOrgOverride.ts and useEffectiveOrgId.ts
   - Replace all useEffectiveOrgId() calls with useAuth().user?.organization_id directly
   - Remove OrgSelectorBanner from all pages that show it

   Gap 2 — SportsEventPublic.sports_id now present:
   - In modules/events/components/EventSportManager.tsx, remove the name-match workaround
   - Use s.sports_id directly instead of resolving by name

   Gap 3 — EventPublic.status + publish endpoint:
   - Add status badge using the contract enum (do NOT hand-write the enum)
   - Add a Publish button in EventDetailPage → POST /api/events/{event_id}/publish
   - Remove the computed-from-dates status badge

   Gap 5 — ParticipationPerSportPublic.status + FSM endpoints:
   - Enable ReviewActions.tsx buttons: each calls POST .../approve, .../reject, .../flag
   - Remove the yellow "FSM gap" banner from ReviewActions.tsx
   - Add status badge to SubmissionList and SubmissionDetail
   - Invalidate React Query cache on transition success

   Gap 6 — ParticipationPerSportCreate.category_id:
   - Update ByCategorySurveyForm.tsx to send category_id per row instead of aggregating to totals
   - Remove the aggregation workaround comment

   Gap 7 — Filter params on participation-per-sport list:
   - In SurveyAdminTab.tsx, replace client-side event_name filter with server-side events_id param
   - Remove the "gap #5 workaround" comment
   - Pass organization_id param from auth context

   Gap 8 — Sport PUT/DELETE:
   - Enable edit/delete in SportForm.tsx and SportList.tsx
   - Add useUpdateSport and useDeleteSport hooks
   - Add PUT /api/sports/{sport_id} and DELETE /api/sports/{sport_id} calls to sports.service.ts

   Gap 9 — Missing report endpoints (one or more):
   - For each newly available endpoint, update modules/reports/services/reports.service.ts
   - Add a hook in modules/reports/hooks/
   - Enable the corresponding ReportCard (remove disabled state and "backend needed" label)
   - Verify Khmer column headers match the ministry template exactly

   Gap 10 — Registration body schema documented:
   - Remove the Record<string,unknown> cast in registration.service.ts
   - Use the proper typed body from _contract/api.types.ts

   Gap 11 — Server-side scoping:
   - Remove client-side filter comments; confirm backend actually filters
   - Verify with a test call: pass organization_id for org A, confirm org B's data is absent

5. After each workaround is removed:
   - pnpm tsc --noEmit (must be clean)
   - pnpm lint (must be clean)
   - pnpm build (must succeed)
   - Walk through the affected scenario(s) from SCENARIOS.md — print PASS / FAIL

6. Update the gap registry in this file: mark closed gaps as ✅ CLOSED with the date.

7. Commit:
   git add -A
   git commit -m "fix: wire up backend gap(s) <list gap numbers>

   Gaps closed: #N, #N
   Contract regenerated: pnpm contract:sync
   Workarounds removed: (list files)
   Scenarios now passing: (list)
   "

Do NOT fix more than one gap batch per session. If the teammate delivers 3 gaps at once, still run pnpm contract:sync once, then fix all 3 in one commit.
```

---

## How to use this file

1. Run the **Evening Kickoff prompt** at the start of every session
2. Identify the next prompt from the timeline (`03_TIMELINE.md`)
3. Paste that prompt verbatim
4. Review the diff
5. Confirm the verification commands ran clean
6. Commit happens via the prompt's commit step

Module rebuild order (Prompt 6, run 13 times):
1. auth (Week 2 Mon)
2. common (Week 2 Tue)
3. dashboard (Week 2 Wed)
4. users (Week 2 Thu)
5. events (Week 3 Mon–Tue)
6. sports (Week 3 Wed)
7. organizations (Week 3 Thu)
8. survey (Week 4 Mon–Wed)
9. submissions (Week 4 Thu)
10. registration-flow (Week 5 Wed–Thu)
11. participation (Week 5 Fri – Week 6 Mon)
12. reports — partial W6 (4 reports), complete W7 (4 more)
13. cards (Week 8 Mon)

Run smoke (Prompt 7) every Friday.
Run review (Prompt 8) every Sunday.
Run feedback triage (Prompt 9) after W4 and W6 releases.
Run release prompts (10, 11, 12) at end of W4, W6, W8.