# Hardening Prompts — Post-Build Audits

You've finished building features. Now harden the system before production. Run these 6 prompts over 5–7 evenings (don't batch them — each produces a large report you need to review).

**Order:**
1. **API integration audit** — every endpoint call works, returns expected shape, handles errors
2. **UI/UX audit** — every screen displays information correctly, accessibly, in Khmer
3. **Security audit** — RBAC, auth, XSS, CSRF, injection, secrets
4. **QA test plan + coverage** — what's tested, what's not, fix coverage gaps
5. **Code quality + dead code** — unused files, duplication, technical debt, maintainability
6. **Documentation generation** — long-lived docs for the team

---

## PROMPT H1 — API Integration Audit

```
Working directory: ~/moeys/final

Goal: verify every API endpoint call in the frontend works correctly against the backend. Find drift, broken calls, missing error handling, and contract violations.

PHASE 1 — Inventory (read-only)

1. Read final/_contract/api.types.ts and final/_contract/ENDPOINTS.md — these are the source of truth
2. Find every API call site in the frontend:
   grep -rn "api.GET\|api.POST\|api.PATCH\|api.PUT\|api.DELETE" --include="*.ts" --include="*.tsx" .
3. Also find any non-typed-client calls (potential bypass):
   grep -rn "fetch(\|axios\." --include="*.ts" --include="*.tsx" .

PHASE 2 — Static analysis

For each API call site, produce a row with:
- File + line number
- Module
- HTTP method + path
- Purpose (e.g. "list events", "submit survey")
- Request payload type (from _contract or hand-written)
- Response handling (typed or `any`)
- Error handling (try/catch, onError, none)
- Loading state handling (isLoading used? skeleton shown?)
- Empty state handling (data length 0 case)
- Idempotency-Key header (POST/PUT/PATCH)
- RBAC scoping params (federation_id / organization_id passed for non-admin?)
- Mutation invalidation (which queryKeys invalidated on success?)

PHASE 3 — Runtime testing

1. Start the backend if not running
2. pnpm dev
3. For every endpoint in _contract/ENDPOINTS.md, find the frontend call site and:
   a. Trigger the call from the UI (or via API directly with seeded data)
   b. Check Network tab in browser dev tools
   c. Verify: status code, response shape matches type, error format on 4xx/5xx
   d. Log: PASS / DRIFT (response shape mismatch) / BROKEN (call fails) / NOT-CALLED (endpoint exists but frontend never calls)

PHASE 4 — Cross-checks

A. Endpoints in _contract/ENDPOINTS.md never called by frontend → could be dead backend code, or frontend missing feature
B. Frontend calls to paths NOT in _contract/ENDPOINTS.md → drift! must be fixed (hand-rolled URL or stale path)
C. Mutations missing Idempotency-Key → red line 8 violation
D. List queries by Federation/Org users without scoping params → red line 6 violation
E. Calls with `: any` typing or response cast as `any` → contract integrity violation

PHASE 5 — Output

Produce final/_rebuild/AUDIT_API_<YYYY-MM-DD>.md with:

1. Executive summary
   - Total endpoints in contract: N
   - Total endpoints called by frontend: N
   - Endpoints PASS: N | DRIFT: N | BROKEN: N | NOT-CALLED: N
   - Health score: GREEN / YELLOW / RED

2. Detailed findings table (one row per call site)

3. Cross-check violations (sections A–E above)

4. Top 10 priority fixes ranked by:
   - P0 — broken core flow (e.g., login, registration submit)
   - P1 — data integrity risk (RBAC scoping missing)
   - P2 — UX issue (missing loading state)
   - P3 — cleanup (dead endpoint, type drift)

5. For each P0 and P1, generate a fix prompt (one-line summary + module + file + suggested fix)

Do NOT fix anything during the audit. Report only.

Then commit: git add final/_rebuild/AUDIT_API_*.md && git commit -m "audit: api integration"
```

---

## PROMPT H2 — UI / UX & Information Display Audit

```
Working directory: ~/moeys/final

Goal: verify every screen displays the right information correctly, accessibly, and in Khmer-first.

PHASE 1 — Screen inventory

1. List every page: find app/(portal) -name "page.tsx" -o -name "layout.tsx"
2. For each, identify:
   - Route path
   - Module rendered
   - Primary purpose (e.g., "list events", "submit survey")
   - Required role(s)
   - Backend data displayed

PHASE 2 — Information completeness audit

For each screen, check:
- A. Does it show all the data fields the user needs to make decisions? (Compare against backend response)
- B. Does it show data in the user's language by default (Khmer)?
- C. Does it format dates correctly? (Khmer numerals optional, dd/mm/yyyy)
- D. Does it format numbers correctly? (Thousands separator, locale-aware)
- E. Does it show empty/loading/error states properly? (Not just blank)
- F. Does it show status with consistent badge color across the system?
- G. Does it show pagination info? (Page X of Y, total count)
- H. Does it show filters with current applied filters visible?
- I. Does it show "last updated" or freshness indicator on data?
- J. Does it show user feedback after actions? (Toast on save, etc.)

PHASE 3 — Khmer text rendering audit

For each screen with Khmer text:
- Open the page in browser
- Take a screenshot (if possible) or describe what's rendered
- Verify: Battambang font loaded, no fallback boxes/tofu, line-height OK for Khmer (Khmer needs more vertical space than Latin)
- Verify: Khmer column headers in tables are not cut off or overlapping
- Check: Khmer in PDFs (if any rendered client-side) — selectable text, not images

PHASE 4 — Accessibility audit

Run for every major screen:
1. axe-core check: pnpm dlx @axe-core/cli http://localhost:3000/<path> (or use browser extension)
2. Manual keyboard navigation: can you Tab through all interactive elements?
3. Color contrast: every text/button has ≥4.5:1 contrast ratio?
4. Form labels: every input has an associated <label>?
5. Error messages: announced to screen readers (aria-live)?
6. Focus visible: keyboard users see focus ring on every focusable element?

PHASE 5 — Responsive layout audit

For each major screen, check at:
- Mobile (375px) — sidebar collapses? tables scroll horizontally?
- Tablet (768px) — layout reasonable?
- Desktop (1280px+) — content not stretched too wide?

PHASE 6 — Information architecture audit

For each list/table:
- Are columns ordered by importance left-to-right?
- Are sortable columns indicated?
- Are filterable columns indicated?
- Is the primary action (edit/view) reachable in 1 click?
- Are destructive actions (delete) requiring confirmation?
- Are bulk actions available for repetitive tasks?

For each form:
- Are required fields marked (* or "required")?
- Is the submit button positioned consistently (bottom-right)?
- Is field order logical (most important first)?
- Are related fields grouped visually?
- Is help text shown for non-obvious fields?

PHASE 7 — Output

Produce final/_rebuild/AUDIT_UI_<YYYY-MM-DD>.md with:

1. Executive summary
   - Total screens audited: N
   - Screens passing all checks: N
   - Top 3 systemic UX issues
   - Khmer rendering health: GREEN / YELLOW / RED
   - Accessibility health: GREEN / YELLOW / RED

2. Per-screen audit table (columns: route | info completeness | km | a11y | responsive | issues)

3. Cross-cutting issues (problems appearing on 3+ screens — these are template/component bugs)

4. Top 10 priority fixes ranked by user impact

5. Generate fix prompts for top 5 issues

Do NOT fix anything. Report only.

Then commit: git add final/_rebuild/AUDIT_UI_*.md && git commit -m "audit: ui and ux"
```

---

## PROMPT H3 — Security Audit

```
Working directory: ~/moeys/final

Goal: verify the system is secure against common attacks. This is a ministry production system — security is non-negotiable.

PHASE 1 — Authentication audit

A. Token storage
- grep -rn "localStorage\|sessionStorage" --include="*.ts" --include="*.tsx" .
- Verify ZERO matches. Tokens must only be in HttpOnly cookies via Next.js route handlers.
- Check app/api/auth/*/route.ts files set: HttpOnly, Secure, SameSite=Lax (or Strict), Path=/, with appropriate Max-Age

B. Token lifetime
- Access token expiry: should be short (15min recommended)
- Refresh token expiry: longer but bounded (7-30 days)
- Refresh token rotation: each refresh invalidates the previous

C. Logout
- Clears HttpOnly cookies
- Calls backend /logout to invalidate refresh token
- Redirects to login

D. Login rate limiting
- Backend should rate-limit login attempts (verify via _contract or test by spamming)
- Frontend should NOT enable infinite retries

PHASE 2 — Authorization (RBAC) audit

A. Route-level guards
- Every page under (portal) wraps in <ProtectedRoute requiredRoles={[...]} />
- /unauthorized page exists and is reachable

B. Component-level guards
- Admin-only buttons (Approve, Reject, Flag) hidden from Federation/Org users
- Verified via: log in as Federation, navigate to admin pages, verify redirect

C. Data-level scoping
For each list query made by Federation/Organization users:
- Verify it includes federation_id or organization_id from auth context
- Test cross-tenant: log in as Federation A, attempt to fetch Federation B's data via direct API call (should return 403 or empty)
- Run script:
  for endpoint in events surveys registrations; do
    # As Federation A user
    curl -H "Cookie: <FED_A_COOKIE>" http://localhost:8000/api/v1/$endpoint?federation_id=<FED_B_ID>
    # Should NOT return Federation B's data
  done

D. Direct object reference (IDOR)
- Try: as Federation A, GET /api/v1/registrations/{registration_id_belonging_to_fed_b}
- Should return 403, not the data

PHASE 3 — Injection & XSS audit

A. XSS — user-generated content rendering
- grep -rn "dangerouslySetInnerHTML\|innerHTML" --include="*.tsx" --include="*.ts" .
- Verify any matches sanitize input (using DOMPurify or core/lib/sanitize.ts)

B. SQL injection (backend's responsibility, but verify frontend doesn't enable it)
- grep -rn "raw\|executeRaw\|\\\$\\{.*\\}.*query" backend (should not exist; if frontend ever passes raw SQL, that's a bug)

C. Open redirects
- grep -rn "router.push\|router.replace\|window.location" --include="*.ts" --include="*.tsx" .
- Verify none use untrusted user input as redirect target without allowlist check

D. CSRF protection
- Mutations should require either:
  - SameSite=Strict cookie + Origin/Referer check
  - OR explicit CSRF token in custom header
- If using HttpOnly cookies with SameSite=Lax, double-submit cookie pattern needed
- Verify with backend team

PHASE 4 — Secrets & sensitive data audit

A. No secrets in code
- grep -rn "api_key\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.env*" .
- Filter to actual hardcoded values (not variable names)
- Verify .env files in .gitignore
- Verify no secrets committed to git history: git log -p --all | grep -i "secret\|password\|api_key" | head -20

B. Logging
- grep -rn "console.log" --include="*.ts" --include="*.tsx" .
- Verify nothing logs: passwords, full tokens, full ID numbers, full DOBs
- Production logging should be via a proper logger (not console.log)

C. PII handling
- Birth dates, ID numbers, phone numbers shown only to authorized users
- ID numbers masked in lists (show last 4 digits) — verify
- Photos accessible only via signed URLs with TTL

PHASE 5 — File upload audit

A. Validation
- Document upload accepts only allowed types (PDF, JPG, PNG, etc.)
- Max file size enforced (frontend + backend)
- Filename sanitized before display

B. Virus scanning
- Backend scans uploads (verify)
- Files quarantined until scan completes

C. Storage
- Files in object storage (S3/MinIO), not on web server filesystem
- Access via signed URLs with TTL
- No public bucket access

PHASE 6 — Dependency audit

A. Vulnerabilities
- pnpm audit
- Note any HIGH or CRITICAL vulnerabilities
- Update if patches available

B. Outdated packages
- pnpm outdated
- Note major version gaps

PHASE 7 — Configuration audit

A. Production headers
- Content-Security-Policy set?
- X-Content-Type-Options: nosniff?
- X-Frame-Options: DENY (no clickjacking)?
- Strict-Transport-Security (HSTS)?
- Referrer-Policy?

B. Error pages
- 404 page custom and doesn't leak stack traces
- 500 page custom and doesn't leak stack traces
- API errors return RFC7807 without stack traces in production

PHASE 8 — Output

Produce final/_rebuild/AUDIT_SECURITY_<YYYY-MM-DD>.md with:

1. Executive summary
   - Total findings: N (Critical: N, High: N, Medium: N, Low: N)
   - Health score: GREEN (no Critical/High) / YELLOW (High only) / RED (any Critical)

2. Findings by phase (Auth, RBAC, Injection, Secrets, Uploads, Dependencies, Config)

3. Per-finding format:
   - Severity (Critical / High / Medium / Low / Info)
   - Title
   - Description
   - Affected file(s) / code
   - Reproduction steps
   - Recommended fix
   - References (OWASP, CWE)

4. Top 10 priority fixes (Critical and High first)

5. Compliance notes for ministry context (data residency, audit logging, retention)

Do NOT fix anything. Report only. Some findings may need backend team coordination.

Then commit: git add final/_rebuild/AUDIT_SECURITY_*.md && git commit -m "audit: security review"
```

---

## PROMPT H4 — QA Test Plan + Coverage Audit

```
Working directory: ~/moeys/final

Goal: assess test coverage, identify gaps, set up a sustainable testing strategy.

PHASE 1 — Current coverage audit

1. List every test file: find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx"
2. List every __tests__ folder
3. Run: pnpm test --coverage (if test setup exists; if not, note this as a gap)
4. Note coverage by file/module
5. Identify which scenarios from SCENARIOS.md have NO automated test coverage

PHASE 2 — Test pyramid audit

For each module, count:
- Unit tests (pure logic, hooks, utils)
- Integration tests (API client + service + hook)
- Component tests (rendering, user interactions)
- E2E tests (full user journey through UI)

Healthy distribution:
- ~70% unit
- ~20% integration
- ~10% E2E

Note imbalances.

PHASE 3 — Gap analysis

Critical paths that MUST be tested:
A. Auth — login, logout, token refresh, expired token handling
B. RBAC — role-based access denial (each role tries forbidden actions)
C. Form validation — every Zod schema tested with invalid + valid inputs
D. Age computation — computeAgeAtEvent with edge cases (born day-before-event, born day-of-event)
E. Document type rule — <18 requires birth cert, ≥18 requires NID/passport
F. FSM transitions — every legal and illegal transition for events, surveys, registrations
G. Quota enforcement — registration blocked when quota full
H. i18n — every key exists in both en and km files
I. Khmer rendering — sample Khmer text renders without tofu
J. Idempotency — duplicate POST with same key returns same response

For each, note:
- Tested? Y/N
- If Y, which file
- If N, recommend test type and a starter test outline

PHASE 4 — E2E test plan

Recommend Playwright (or your chosen E2E tool) test plan covering all 10 SCENARIOS.md journeys.

For each scenario, outline:
- Setup (seed data, login as role)
- Steps (UI interactions)
- Assertions
- Teardown

PHASE 5 — Manual QA test plan

For things hard to automate (visual Khmer rendering, real Excel/PDF generation), produce a manual test plan checklist:
- Tester: who runs it
- Frequency: per release / weekly / per deploy
- Steps: numbered
- Expected outcome
- Pass criteria

PHASE 6 — UAT scripts

For each of the 10 scenarios, produce a UAT script suitable for handing to a non-technical ministry tester:
- Plain-language steps in Khmer + English
- What "success" looks like
- What to flag as a bug

PHASE 7 — Test infrastructure recommendations

A. Test runner: Vitest (fast, ESM-friendly) or Jest
B. Component testing: Testing Library + Vitest
C. E2E: Playwright
D. Mock backend: MSW (Mock Service Worker) for unit/integration
E. CI integration: GitHub Actions or equivalent — run on every PR
F. Coverage threshold: enforce ≥70% for critical modules

PHASE 8 — Output

Produce final/_rebuild/AUDIT_QA_<YYYY-MM-DD>.md with:

1. Executive summary
   - Current coverage: N% lines, N% branches
   - Critical paths covered: N/10
   - Critical paths uncovered: N/10
   - Health: GREEN / YELLOW / RED

2. Per-module coverage table

3. Gap analysis (the 10 critical paths)

4. E2E test plan (10 scenarios outlined)

5. Manual QA checklist (release-day checklist)

6. UAT scripts (Khmer + English)

7. Test infrastructure setup recommendations

8. Top 10 priority tests to write first

9. Generate prompts for writing the top 5 tests:

```
Test prompt: Write <test type> for <feature>
Module: <module>
File: <test file path>
Setup: <preconditions>
Test cases: <list>
Constraints: do NOT modify production code; only add test files
```

Do NOT write any tests during this audit. Plan only.

Then commit: git add final/_rebuild/AUDIT_QA_*.md && git commit -m "audit: qa coverage and test plan"
```

---

## PROMPT H5 — Code Quality, Dead Code & Maintainability Audit

```
Working directory: ~/moeys/final

Goal: identify dead code, duplication, technical debt, and maintainability issues. Prepare the codebase for long-term maintenance.

PHASE 1 — Dead code detection

A. Unused exports
- Install knip: pnpm add -D knip
- Run: pnpm knip
- Categorize findings: unused files, unused exports, unused dependencies, unused devDependencies
- For each: KEEP (deferred feature) / REMOVE (dead) / UNCLEAR (need user input)

B. Unused imports
- Run: pnpm dlx eslint --no-eslintrc --rule '{"no-unused-vars":"error","unused-imports/no-unused-imports":"error"}' --ext .ts,.tsx .

C. Unreachable code
- TypeScript compiler will flag these with strict mode
- Verify tsconfig.json has: strict: true, noUnusedLocals: true, noUnusedParameters: true

D. Empty files / barely-populated stubs
- find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | head -30
- Files under 5 lines that aren't index.ts barrels are suspicious

PHASE 2 — Duplication detection

A. Similar code blocks
- Install jscpd: pnpm dlx jscpd --pattern "**/*.{ts,tsx}" --ignore "**/node_modules/**,**/.next/**" --reporters console,json
- Note duplications > 30 lines

B. Duplicate components
- find . -name "*.tsx" | xargs grep -l "export default" | sort | uniq
- Look for components with similar names that may overlap (e.g., ButtonPrimary, PrimaryButton)

C. Duplicate hooks
- find . -path "*/hooks/*.ts" -exec head -20 {} \;
- Scan for hooks doing similar things

D. Duplicate types
- grep -rn "interface\|type " --include="*.ts" --include="*.tsx" . | sort | uniq -c | sort -rn | head -30
- Note types with very similar shapes

PHASE 3 — Complexity analysis

A. Function length
- Find functions over 50 lines (refactor candidate)
- Find functions over 100 lines (urgent refactor)

B. File length
- Find files over 300 lines
- Files over 500 lines should split

C. Cyclomatic complexity
- Use eslint-plugin-complexity or similar
- Flag functions with complexity > 10

D. Component nesting
- JSX nested more than 5 levels deep is a smell

PHASE 4 — Naming & convention consistency

A. File naming
- All component files PascalCase? (Foo.tsx not foo.tsx)
- All hook files start with "use"?
- All service files lowercase?
- Inconsistencies flagged

B. Export naming
- Exports match file name?

C. Import paths
- All imports use @/* alias (not relative ../../../)?
- grep -rn "from '\\.\\./\\.\\./\\.\\./'" --include="*.ts" --include="*.tsx" .

D. CONVENTIONS.md compliance
- For each module, verify folder shape matches:
  components/ hooks/ services/ types/ index.ts
- Flag deviations

PHASE 5 — Type safety audit

A. `any` usage
- grep -rn ": any\| as any\|<any>" --include="*.ts" --include="*.tsx" .
- Each occurrence is a type-safety hole

B. `@ts-ignore` / `@ts-expect-error`
- grep -rn "@ts-ignore\|@ts-expect-error" --include="*.ts" --include="*.tsx" .
- Each suggests a bug being suppressed

C. Non-null assertions (`!`)
- grep -rn "![.]" --include="*.ts" --include="*.tsx" .
- Each is a "trust me bro" — verify justified

D. Strict mode
- Verify tsconfig.json has strict: true and all strict options enabled

PHASE 6 — React-specific quality

A. useEffect smell
- Effects with empty deps that should have deps (stale closure bugs)
- Effects that fetch data (should be React Query instead)
- Cleanup function missing where needed

B. State management smell
- Server data in useState (should be React Query)
- Form data in useState (should be React Hook Form)
- Derived state in useState (should be computed)

C. Performance
- Components without React.memo where they re-render often
- Inline objects/arrays in props (causes re-renders)
- Missing useMemo/useCallback for expensive computations

PHASE 7 — Maintenance readiness

A. Documentation in code
- Public functions have JSDoc comments?
- Complex logic explained inline?
- Module README files exist for non-trivial modules?

B. TODO/FIXME inventory
- grep -rn "TODO\|FIXME\|XXX\|HACK" --include="*.ts" --include="*.tsx" .
- Each should have an owner and a ticket

C. Magic numbers / strings
- Numeric literals other than 0, 1, -1 should be named constants
- Repeated string literals should be constants

D. Configuration centralization
- All env vars accessed via core/config/env.ts (typed)
- All routes accessed via core/config/routes.ts
- All API paths via _contract/api.types.ts

PHASE 8 — Output

Produce final/_rebuild/AUDIT_QUALITY_<YYYY-MM-DD>.md with:

1. Executive summary
   - Total files: N | Total LOC: N
   - Dead code: N files, N exports
   - Duplication: N% by jscpd
   - Type safety: N `any`, N `@ts-ignore`
   - Maintainability score: A/B/C/D/F (with reasoning)

2. Phase-by-phase findings (1–7 above)

3. Top 20 cleanup items prioritized by:
   - HIGH — actively confusing or causing bugs
   - MEDIUM — increases future maintenance cost
   - LOW — cosmetic

4. Refactor recommendations (which files to split, which to merge, which patterns to extract)

5. Tooling recommendations (which lint rules to enable, which CI checks to add)

6. Generate cleanup prompts for top 5 items:

```
Cleanup: <one-line summary>
Type: dead-code-removal / refactor / type-safety / convention
Files: <list>
Action: <specific change>
Verification: <how to confirm safe>
```

Do NOT fix anything. Report only.

Then commit: git add final/_rebuild/AUDIT_QUALITY_*.md && git commit -m "audit: code quality and maintainability"
```

---

## PROMPT H6 — Generate Comprehensive Documentation

```
Working directory: ~/moeys/final

Goal: produce long-lived documentation that makes the system easy to maintain and scale. This is the documentation new team members will read on day one.

Read all previous audit files first:
- AUDIT_API_*.md
- AUDIT_UI_*.md
- AUDIT_SECURITY_*.md
- AUDIT_QA_*.md
- AUDIT_QUALITY_*.md

Also read:
- _rebuild/00_MASTER_PLAN.md
- _rebuild/02_DECISIONS.md
- _rebuild/03_TIMELINE.md
- _rebuild/04_RELEASES.md
- _rebuild/CONVENTIONS.md
- _rebuild/SCENARIOS.md
- _contract/ENDPOINTS.md
- CLAUDE.md

Produce a docs/ folder with these files:

1. docs/README.md — Project overview
   - What the system does (1 paragraph for non-technical reader)
   - Who uses it (5 actors)
   - Key features
   - Tech stack
   - Links to other docs
   - Status (current version, release stage)

2. docs/ARCHITECTURE.md — High-level architecture
   - System diagram (text-based or mermaid)
   - Frontend / backend / database / object storage / report worker
   - Request flow for typical operations (auth, list, mutation, report)
   - Why we chose this stack (link to DECISIONS.md)
   - What's where in the repo (folder structure annotated)

3. docs/GETTING_STARTED.md — Developer onboarding
   - Prerequisites (Node, pnpm, Postgres, etc.)
   - Clone + install steps
   - Environment variables (with placeholders, not real values)
   - Running backend locally
   - Running frontend locally
   - Seed data
   - Running tests
   - First-day tasks for a new developer (orient yourself: read these 5 files, run these 3 commands)

4. docs/DEVELOPMENT.md — Day-to-day development guide
   - Branching strategy (main, rebuild, feature/*, etc.)
   - Commit message convention
   - PR workflow
   - Code review checklist
   - How to add a new module (step-by-step)
   - How to add a new page
   - How to add a new API endpoint call
   - How to add a new i18n string
   - How to add a new shared UI component
   - Common gotchas

5. docs/API.md — API integration guide
   - How _contract/api.types.ts works (auto-generated)
   - How to regenerate after backend changes
   - Typed client usage (with examples)
   - Error handling pattern
   - Mutation pattern with optimistic updates
   - How to handle pagination
   - How to handle file uploads
   - List of all endpoints (link to _contract/ENDPOINTS.md)

6. docs/AUTH_AND_RBAC.md — Authentication and authorization
   - How auth works end-to-end (cookie-based, HttpOnly, refresh)
   - The 5 roles and what each can do (matrix)
   - How to protect a new page
   - How to scope queries by federation_id / organization_id
   - Common mistakes and how to avoid them

7. docs/I18N.md — Internationalization guide
   - Why Khmer-first
   - How next-intl is configured
   - How to add a new key (workflow)
   - Khmer fonts (Battambang setup)
   - Khmer numerals
   - Date/time formatting
   - PDF/Excel Khmer rendering notes

8. docs/REPORTS.md — Report generation
   - The 8 ministry reports — name, Khmer title, purpose, columns
   - How report generation works (async job, signed URL)
   - How to add a new report
   - Khmer template files location
   - Testing report output (PDF + Excel)

9. docs/TESTING.md — Testing guide
   - Test pyramid (unit / integration / component / E2E)
   - How to run tests
   - How to write a unit test (example)
   - How to write a component test (example)
   - How to write an E2E test (example)
   - Coverage thresholds
   - CI integration
   - Manual QA checklist

10. docs/SECURITY.md — Security guide
    - Threat model (who attacks, what they want)
    - How auth tokens are handled
    - How RBAC is enforced
    - Input validation strategy
    - File upload safety
    - Dependency management (pnpm audit, update cadence)
    - Incident response runbook
    - Audit log access for compliance

11. docs/DEPLOYMENT.md — Deployment guide
    - Environments (dev, staging, production)
    - CI/CD pipeline (GitHub Actions etc.)
    - Build process
    - Environment variables required (production)
    - DNS and TLS setup
    - Database migrations process
    - Rollback procedure
    - Smoke tests post-deploy

12. docs/OPERATIONS.md — Day-2 operations
    - Monitoring (what metrics matter, alert thresholds)
    - Logging (where logs go, how to search)
    - Backup / restore procedure
    - Common issues and resolutions (runbook)
    - On-call rotation
    - Escalation paths
    - Performance tuning

13. docs/MODULES.md — Module reference
    - Index of all 13 modules with one-paragraph description each
    - For each module, link to its source folder
    - For each module, list the scenarios it implements

14. docs/CONTRIBUTING.md — How to contribute
    - Code of conduct
    - How to propose a change (RFC if architectural)
    - How to file a bug report
    - How to ask for help
    - Style guide pointer (link to CONVENTIONS.md)

15. docs/GLOSSARY.md — Terms and abbreviations
    - Define ministry-specific terms (Federation, Organization, etc.)
    - Define technical terms a non-technical reader might encounter
    - Khmer-English term map for the 8 reports

16. docs/CHANGELOG.md — Version history
    - v0.4-beta (date) — Internal beta scope
    - v0.6-pilot (date) — Pilot scope
    - v1.0 (date) — Production release
    - Per release: what was added / changed / fixed

17. docs/ROADMAP.md — Future plans
    - Card module enhancements
    - Medalist module
    - Mobile app
    - Public-facing pages
    - Performance/scale improvements
    - Note: features deferred from each release

For each doc:
- Use clear headings (H2 sections)
- Include code examples where applicable
- Use tables for lists of items
- Cross-link to other docs
- Keep tone: practical, not academic
- Length target: 200-1000 lines per doc; longer is fine if needed

Also produce a docs/INDEX.md that's a table of contents linking all 17 docs.

After writing all docs, verify:
- No broken internal links (all referenced files exist)
- Code examples actually compile (type-check the snippets mentally)
- Khmer text used where appropriate (especially in REPORTS.md and I18N.md)

Then commit: git add docs/ && git commit -m "docs: comprehensive maintenance documentation"
```

---

## How to schedule these 6 prompts

Don't run all 6 in one week. Spread them out:

| Day | Prompt | What you'll do |
|-----|--------|---------------|
| Mon evening | H1 — API audit | Review API integration report, file P0/P1 fixes |
| Tue evening | (fix P0/P1 from H1) | Don't audit; fix what was found |
| Wed evening | H2 — UI audit | Review UI report, file fixes |
| Thu evening | (fix UI P0/P1 from H2) | Don't audit; fix |
| Fri evening | H3 — Security audit | Review security report — this is the big one |
| Sat morning | (fix security Critical/High) | Coordinate with backend teammate on shared fixes |
| Sun evening | H4 — QA audit | Plan tests, don't write them yet |
| Mon evening | H5 — Code quality | Review quality report |
| Tue evening | (fix top quality items) | Refactor/cleanup |
| Wed evening | H6 — Documentation | Generate docs |
| Thu evening | (review docs, fill gaps) | Read what was generated, correct anything wrong |
| Fri | Wrap up — final smoke test | Last check before declaring hardening done |

That's roughly 2 weeks of hardening on top of your 8-week build. So your real timeline becomes 10 weeks if you do this seriously.

## Where to put this file

Save it in your project at `final/_rebuild/HARDENING_PROMPTS.md`:

```bash
cp ~/Downloads/HARDENING_PROMPTS.md ~/moeys/final/_rebuild/HARDENING_PROMPTS.md
git add final/_rebuild/HARDENING_PROMPTS.md
git commit -m "chore: add hardening audit prompts"
```

Reference it from CLAUDE.md so Claude Code knows it exists when you start mentioning audits.
