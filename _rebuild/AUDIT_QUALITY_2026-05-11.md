# Code Quality & Maintainability Audit — 2026-05-11

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Total TS/TSX files (excl. generated) | **361** |
| Total LOC (excl. node_modules, .next, _contract, _rebuild) | **10,803** |
| `any` type usages in production code | **0** ✅ |
| `@ts-ignore` / `@ts-expect-error` | **0** ✅ |
| Dead directories (shared/layout) | **1** |
| Convention violations | **3** |
| Magic number occurrences | **14** |
| Local `PAGE_SIZE` redefinitions | **4** (constant already exists in core) |
| Largest file (TeamRegistrationPage.tsx) | **498 lines** |
| Cross-module barrel bypasses | **1** |
| Raw `fetch()` bypassing typed API client | **1** (reports service) |

**Maintainability Score: B**

The codebase is well-structured by module convention, has excellent TypeScript hygiene (zero `any`, zero `@ts-ignore`), and follows the CONVENTIONS.md folder layout perfectly. The main issues are a dead layout directory that creates confusion about which implementation is canonical, a handful of magic number constants scattered instead of using the already-defined `DEFAULT_PAGE_SIZE`, one oversized component (`TeamRegistrationPage.tsx` at 498 lines), and one security-adjacent bug where the Excel download uses raw `fetch()` without auth headers.

---

## 2. Phase-by-Phase Findings

---

### PHASE 1 — Dead Code

#### 1A. Dead Directory: `shared/layout/`

**Severity**: High (causes confusion, not a runtime bug)

`shared/layout/` contains `Sidebar.tsx`, `TopBar.tsx`, and `PageShell.tsx`. **None of these are imported by any production file.** The active implementations live in `modules/common/components/`. The two pairs are different:

| File | shared/layout (dead) | modules/common (live) |
|---|---|---|
| Sidebar.tsx | Missing `aria-label="Main navigation"` | Has aria-label |
| Sidebar.tsx | Missing `aria-current="page"` | Has aria-current |
| Sidebar.tsx | No dashboard-exact-match logic | Has exact match for dashboard |
| TopBar.tsx | Hardcoded `'/login'` string | Uses `ROUTES.login` |
| TopBar.tsx | Missing `aria-hidden="true"` on icons | Has aria-hidden |

A developer finding `shared/layout/Sidebar.tsx` would think it is the canonical implementation. It is not — it is a stale earlier version that accumulated accessibility regressions.

**Action**: Delete `shared/layout/Sidebar.tsx`, `shared/layout/TopBar.tsx`, `shared/layout/PageShell.tsx`, `shared/layout/index.ts`, and the `shared/layout/` directory.

---

#### 1B. Empty / Placeholder Type Files

Several `types/index.ts` files contain only a single type alias that could be inlined or is already derivable from contract types:

| File | Content | Assessment |
|---|---|---|
| `modules/sports/types/index.ts` | `type SportGender = 'MALE' \| 'FEMALE'` | Duplicates `genderEnum` from `_contract/api.types.ts` |
| `modules/common/types/index.ts` | `type NavKey = 'dashboard' \| 'events' \| ...` | Derivable from the sidebar nav array |
| `modules/cards/types/index.ts` | `type CardTypeCode = 'F' \| 'O' \| 'A' \| string` | The `\| string` negates the union's value |
| `modules/submissions/types/index.ts` | `type SubmissionStatus = 'PENDING'` | **Wrong**: statuses SUBMITTED, APPROVED, REJECTED, FLAGGED are used in `ReviewActions.tsx` but absent from this type |
| `modules/dashboard/types/index.ts` | `type DashboardTab = 'overview' \| 'events' \| 'sports'` | The tab switcher UI doesn't exist; type is unused |
| `modules/auth/types/index.ts` | `type LoginStep = 'idle' \| 'submitting' \| 'success' \| 'error'` | Not used anywhere in `LoginForm.tsx` |

The most impactful is `SubmissionStatus` — it is actively wrong and will mislead a developer adding typed checks.

---

#### 1C. Dead Exports from Template

`_rebuild/MODULE_TEMPLATE/` contains files with `as any` casts. These are excluded from `tsconfig.json` (`"exclude": ["_rebuild"]`) so they don't affect TypeScript compilation, but they do appear in grep results and create noise.

---

#### 1D. Unused `tsconfig` strict sub-options

`tsconfig.json` has `"strict": true` but is missing two sub-options that `strict` does **not** enable:

```json
// Currently missing:
"noUnusedLocals": true,
"noUnusedParameters": true
```

Without these, unused local variables and unused function parameters are silently allowed. The TypeScript compiler would catch dead code at CI time if these were enabled.

---

### PHASE 2 — Duplication

#### 2A. `PAGE_SIZE = 20` Defined 4 Times Locally

`core/config/constants.ts` already exports `DEFAULT_PAGE_SIZE = 20` and `MAX_PAGE_SIZE = 100`. Despite this, four list components define their own local constant:

```ts
// modules/events/components/EventList.tsx:16
const PAGE_SIZE = 20;

// modules/sports/components/SportList.tsx:18
const PAGE_SIZE = 20;

// modules/organizations/components/OrganizationList.tsx:18
const PAGE_SIZE = 20;

// modules/users/components/UserList.tsx:16
const PAGE_SIZE = 20;
```

If the page size policy changes, it must be updated in 5 places (4 locals + 1 constant that nobody uses). The fix is one import per file.

---

#### 2B. Magic `limit: 200` / `limit: 100` Across 8+ Files

When populating dropdowns (event picker, org picker, sport picker), components use hardcoded limits with no explanation:

| File | Value | Count |
|---|---|---|
| `modules/events/services/events.service.ts` | `limit: 200` | 2× |
| `modules/cards/components/CardsPage.tsx` | `limit: 100` (events), `limit: 200` (orgs) | 2× |
| `modules/reports/components/ReportFilterBar.tsx` | `limit: 100` (events), `limit: 200` (orgs) | 2× |
| `modules/sports/components/SportCategoryManager.tsx` | `limit: 200` | 1× |
| `modules/survey/hooks/useSurveyEntries.ts` | `limit: 200` | 1× |
| `modules/submissions/services/submissions.service.ts` | `limit: 200` | 1× |
| `modules/participation/components/OrganizerForm.tsx` | `limit: 100` | 1× |
| `modules/registration-flow/components/EventSportStep.tsx` | `limit: 100` | 1× |

200 appears to mean "fetch all for dropdown" and 100 means "fetch all events for picker". Neither is documented. The existing `MAX_PAGE_SIZE = 100` constant is ignored for this use case. A `DROPDOWN_LIMIT = 200` (or `ALL_RECORDS_LIMIT`) constant would make intent clear and centralise the value.

---

#### 2C. `StatusBadge` Exported from `ReviewActions.tsx`

`ReviewActions.tsx` exports two named exports: `StatusBadge` and `ReviewActions`. The `StatusBadge` component is a standalone display component that is or could be used independently of the review actions. Its placement inside a different component's file means:
- It doesn't appear in a predictable file location
- The filename-mismatch grep catches it as `StatusBadge` exported from `ReviewActions.tsx`

---

#### 2D. `SubmissionStatus` Type Is Incomplete / Wrong

```ts
// modules/submissions/types/index.ts
export type SubmissionStatus = 'PENDING'; // placeholder
```

But `ReviewActions.tsx` uses: `PENDING`, `SUBMITTED`, `APPROVED`, `REJECTED`, `FLAGGED`. The type is wrong and could cause runtime errors if it is ever used for type-narrowing.

---

### PHASE 3 — Complexity

#### 3A. `TeamRegistrationPage.tsx` — 498 Lines, 6 Responsibilities

This is the only file that requires urgent decomposition. It currently handles:

1. **CSV parsing** — `parseCsvLine()` function (lines 39–57), inline CSV text-to-rows logic
2. **Row validation** — age computation, field validation, document rule determination (lines 140–190)
3. **Batch submission state machine** — `useBulkCreateRegistration` hook manages row states (valid/error/pending/success/failed)
4. **Setup form** — event/sport selection via `setupSchema` + React Hook Form
5. **Preview table** — 100+ lines of JSX rendering a complex table with per-row status
6. **File upload trigger** — CSV file input + change handler

**Recommended split**:
```
modules/registration-flow/components/
  TeamRegistrationPage.tsx     ← coordinator only (~100 lines)
  TeamSetupForm.tsx            ← event/sport selection form (~60 lines)
  TeamCsvUpload.tsx            ← file input + parseCsvLine + row validation (~120 lines)
  TeamPreviewTable.tsx         ← preview table JSX (~150 lines)

modules/registration-flow/lib/
  csv-parser.ts                ← parseCsvLine() pure function (testable)
  team-row-validator.ts        ← validateRow() pure function (testable)
```

---

#### 3B. Files Between 150–230 Lines (Monitor, Not Urgent)

| File | Lines | Note |
|---|---|---|
| `SportCategoryManager.tsx` | 226 | Two panels (category list + add form); consider splitting |
| `OrganizerForm.tsx` | 188 | Complex multi-field form; acceptable for a form component |
| `ByCategorySurveyForm.tsx` | 187 | Dense but cohesive |
| `UserList.tsx` | 181 | Includes delete modal; acceptable |
| `EventSportManager.tsx` | 179 | Two sub-components inline; could extract |
| `BySportSurveyForm.tsx` | 177 | Cohesive survey form |

None of these are urgent, but `SportCategoryManager.tsx` mixing list and add-form panels is worth splitting when touched next.

---

### PHASE 4 — Naming & Convention

#### 4A. Module Folder Compliance — All 13 Modules Pass ✅

All modules have `components/`, `hooks/`, `services/`, `types/`, and `index.ts`. No deviations from CONVENTIONS.md.

---

#### 4B. One Cross-Module Barrel Bypass

```ts
// modules/participation/hooks/useCreateOrganizer.ts:2
import { createRegistration, type ParticipantCreateBody }
  from '@/modules/registration-flow/services/registration.service';
//                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                  direct sub-path import, bypasses barrel
```

Per CONVENTIONS.md: "A module only exports from its `index.ts`. Other modules import from `modules/<domain>` — never from a sub-path."

The `registration-flow` module exports `createRegistration` via its `index.ts` already. The fix is changing the import path from the full sub-path to `'@/modules/registration-flow'`.

---

#### 4C. App Router Convention — `page.tsx` Export Names

Next.js requires `page.tsx` to have a `default` export. The codebase uses named exports like `EventsRoute`, `CardsRoute`, etc. This is intentional and valid — Next.js uses the default export, and the named export aids IDE navigation. **Not a bug; not flagged.**

`loading.tsx` and `error.tsx` files exporting `Loading` / `Error` / `DashboardLoading` etc. are also Next.js convention-compliant. The mismatch-check script flagged these correctly but they are all intentional and correct.

---

#### 4D. `StatusBadge` Co-located with `ReviewActions.tsx`

`StatusBadge` is exported from `ReviewActions.tsx`. By convention, each file exports one primary named component matching the filename. Extract `StatusBadge` to its own `StatusBadge.tsx` file.

---

### PHASE 5 — Type Safety

#### 5A. Zero `any` in Production — ✅

No `any` type usages were found in any production TypeScript file. The only occurrences are in `_rebuild/MODULE_TEMPLATE/` which is excluded from compilation.

---

#### 5B. Zero `@ts-ignore` / `@ts-expect-error` — ✅

No TypeScript suppressions exist anywhere in the codebase.

---

#### 5C. Non-null Assertions `!` — All Legitimate

All `!` occurrences were reviewed. Every instance is a boolean coercion (`!!user`, `!!deleteId`, `!res.ok`, etc.) — none are non-null postfix assertions (`value!.property`). No unsafe non-null assertions exist.

---

#### 5D. Missing `noUnusedLocals` / `noUnusedParameters` in tsconfig

```json
// tsconfig.json — currently missing:
"noUnusedLocals": true,      // catches unused local variables
"noUnusedParameters": true,  // catches unused function parameters
```

`strict: true` does **not** include these. Adding them will surface any dead local code at build time rather than silently compiling it.

**Note**: These may produce false positives in `.d.ts` files and function signatures using `_prefixed` parameters. Test with `pnpm build` before enforcing in CI.

---

#### 5E. `SubmissionStatus` Type Mismatch

```ts
// modules/submissions/types/index.ts
export type SubmissionStatus = 'PENDING'; // placeholder until backend adds status field
```

Actual values in use across the codebase: `'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FLAGGED'`. The backend now has a status field (per `ReviewActions.tsx` and the `submissions.status.*` i18n keys which cover all 5 values). This type needs updating.

---

#### 5F. `CardTypeCode = 'F' | 'O' | 'A' | string`

The `| string` escape hatch completely negates the discriminated union — any string passes. If the intent is to document the known values while allowing unknowns, use:

```ts
type CardTypeCode = 'F' | 'O' | 'A' | (string & {});
// This preserves autocomplete for known values while allowing unknowns
```

---

### PHASE 6 — React-Specific Quality

#### 6A. `downloadExcelBlob` Uses Raw `fetch()` Without Auth Header

```ts
// modules/reports/services/reports.service.ts:42
const res = await fetch(`${path}?${qs}`);
```

This is the only raw `fetch()` call in production services (outside of route handlers and Cloudinary direct upload, which are intentional). The comment in `client.ts` notes that the Next.js rewrite at `/api/:path*` injects the `Authorization` header via `middleware.ts`. However, this only works because the raw fetch goes to a relative path (`/api/excel/...`) which is rewritten by Next.js, and the middleware injects the header before forwarding.

**The auth token injection works accidentally**, not by design. If the URL structure changes, or if this is ever called from a context where the Next.js middleware is not in the path, the auth header will be missing.

**Recommended fix**: Use the typed `api` client or an explicit `fetch()` with `Authorization: Bearer ${token}` header, extracted from the cookie (server-side) or passed as a parameter.

---

#### 6B. No `useEffect` Smell — ✅

All data fetching is via React Query hooks. No `useEffect` data-fetching patterns were found. State is managed with `useState` only for UI state (pagination, delete modal, search term, CSV rows) — not server state.

---

#### 6C. `TeamRegistrationPage` Inline Functions in JSX

Due to the file's length, several event handlers are defined inline or as closures that recreate on each render. This is acceptable given the component is a page-level coordinator, but will be resolved naturally when the component is split (see 3A).

---

### PHASE 7 — Maintenance Readiness

#### 7A. TODO/FIXME Inventory

Only one comment matching TODO/FIXME/HACK was found in production code, and it is a standard code comment, not a deferred task:

```ts
// core/lib/validation.ts:3
// Cambodian phone: 0XX-XXX-XXX or +855-XX-XXX-XXX
```

This is a legitimate comment explaining the regex — not a deferred TODO.

In `_rebuild/` (excluded from compilation), there are several `// Gap #N — ...` and `// TODO:` comments documenting backend gaps. These are in the correct place.

**Verdict**: TODO debt is zero in production code. ✅

---

#### 7B. Magic Numbers

| Location | Value | Context | Status |
|---|---|---|---|
| `EventList.tsx:16`, `SportList.tsx:18`, `OrgList.tsx:18`, `UserList.tsx:16` | `20` | `PAGE_SIZE` | ❌ Use `DEFAULT_PAGE_SIZE` |
| 8 files | `100` or `200` | Dropdown fetch limits | ❌ Need named constant |
| `app/api/auth/login/route.ts:32` | `60 * 15` | Access token TTL | ✅ Self-documenting |
| `app/api/auth/login/route.ts:36` | `60 * 60 * 24 * 7` | Refresh token TTL | ✅ Self-documenting |
| `GenderDistributionCard.tsx:14` | `100` | Percentage calculation | ✅ Math literal, fine |
| `core/api/client.ts:54,65` | `401`, `403` | HTTP status codes | ✅ Acceptable |

---

#### 7C. Configuration Centralization

| Resource | Status |
|---|---|
| Env vars via `env.ts` | ✅ Typed and validated |
| Routes via `core/config/routes.ts` | ✅ All navigation uses `ROUTES.*` |
| API paths via `_contract/api.types.ts` | ✅ Type-safe endpoint paths |
| Page size constant in `core/config/constants.ts` | ⚠️ Exists but not used by 4 components |
| Dropdown limit constant | ❌ Missing — magic number scattered 8× |

---

#### 7D. JSDoc on Public Functions

`core/lib/format.ts` exports 6 public functions used across many modules (`computeAgeAtEvent`, `isMinorAtEvent`, `formatDate`, `formatDateTime`, `formatNumber`, `toKhmerNumerals`). None have JSDoc comments. Given the business-criticality of `computeAgeAtEvent` (Red Line #3), at minimum this function should have a JSDoc explaining the age-at-event contract.

---

## 3. Top 20 Cleanup Items

### HIGH — Actively confusing or potentially causing bugs

| # | Item | File(s) | Impact |
|---|---|---|---|
| H1 | **Delete `shared/layout/` directory** | `shared/layout/Sidebar.tsx`, `TopBar.tsx`, `PageShell.tsx`, `index.ts` | Developers may edit the dead version; dead files have accessibility regressions vs. live versions |
| H2 | **Fix `SubmissionStatus` type — add missing values** | `modules/submissions/types/index.ts` | Type is wrong; APPROVED/REJECTED/FLAGGED/SUBMITTED not included |
| H3 | **`downloadExcelBlob` uses raw `fetch()` not the typed client** | `modules/reports/services/reports.service.ts:42` | Auth header injection works by accident; breaks if architecture changes |
| H4 | **Fix barrel bypass in `useCreateOrganizer.ts`** | `modules/participation/hooks/useCreateOrganizer.ts:2` | Violates CONVENTIONS.md; breaks module encapsulation |
| H5 | **Add `noUnusedLocals: true`, `noUnusedParameters: true` to tsconfig** | `tsconfig.json` | Compiler silently accepts dead local code |

### MEDIUM — Increases future maintenance cost

| # | Item | File(s) | Impact |
|---|---|---|---|
| M1 | **Replace 4× local `PAGE_SIZE = 20` with `DEFAULT_PAGE_SIZE` import** | EventList, SportList, OrgList, UserList | 5 places to update on policy change instead of 1 |
| M2 | **Add `DROPDOWN_LIMIT = 200` constant; replace 8× magic `limit: 100/200`** | 8 files across modules | No indication why 200 was chosen; hard to change consistently |
| M3 | **Split `TeamRegistrationPage.tsx` (498 lines)** | `modules/registration-flow/components/TeamRegistrationPage.tsx` | CSV parsing, validation, state machine, UI all in one file |
| M4 | **Extract `StatusBadge` from `ReviewActions.tsx` to its own file** | `modules/submissions/components/ReviewActions.tsx` | Unexpected export; confusing for module consumers |
| M5 | **Fix `CardTypeCode = 'F' \| 'O' \| 'A' \| string` escape hatch** | `modules/cards/types/index.ts` | `\| string` makes the union meaningless |
| M6 | **Add JSDoc to `computeAgeAtEvent` and `isMinorAtEvent`** | `core/lib/format.ts` | Most critical business-logic function has no documentation |
| M7 | **Remove `SportGender` — duplicate of contract `genderEnum`** | `modules/sports/types/index.ts` | Two sources of truth for same enum |
| M8 | **Remove `DashboardTab` and `LoginStep` unused types** | `modules/dashboard/types/index.ts`, `modules/auth/types/index.ts` | Unused types create false impression of complexity |
| M9 | **Remove `NavKey` — derivable from sidebar nav array** | `modules/common/types/index.ts` | Maintains manually what can be computed from nav config |
| M10 | **Verify and update `OrganizerRecord` re-export in participation types** | `modules/participation/types/index.ts` | Exports a service-layer type from types/ — violates convention |

### LOW — Cosmetic or minor cleanup

| # | Item | File(s) | Impact |
|---|---|---|---|
| L1 | Add `// @vitest-environment node` pattern for future i18n parity tests | `core/lib/` | Preparation for testing infrastructure |
| L2 | Extract `SportCategoryManager.tsx` into list panel + form panel | `modules/sports/components/SportCategoryManager.tsx` | 226 lines; two concerns mixed |
| L3 | Document why `limit: 200` is different from `MAX_PAGE_SIZE = 100` in a comment | `core/config/constants.ts` | Intent unclear to future developers |
| L4 | Add `// Note: parseCsvLine is extracted for testability` comment in TeamRegistrationPage | `TeamRegistrationPage.tsx` | Intent of extraction not documented |
| L5 | Ensure `modules/common/services/` has content or is removed | `modules/common/services/` | Common module has no service layer; `index.ts` is empty |

---

## 4. Refactor Recommendations

### Split: `TeamRegistrationPage.tsx` → 5 Files

**Why**: 498 lines, 6 distinct responsibilities, embedded `parseCsvLine` pure function that needs unit tests.

```
modules/registration-flow/
  lib/
    csv-parser.ts          ← parseCsvLine() (pure, testable)
    team-row-validator.ts  ← validateRow() (pure, testable)
  components/
    TeamRegistrationPage.tsx  ← coordinator: state + navigation (~80 lines)
    TeamSetupForm.tsx         ← event/sport/role selection form (~60 lines)
    TeamCsvUpload.tsx         ← file input + parse trigger (~70 lines)
    TeamPreviewTable.tsx      ← table + progress + submit button (~120 lines)
```

### Extract: `StatusBadge` → Its Own File

```
modules/submissions/components/
  StatusBadge.tsx    ← NEW — contains StatusBadge + STATUS_VARIANT map
  ReviewActions.tsx  ← contains only ReviewActions; imports StatusBadge
```

Export both from the module's `index.ts`.

### Delete: `shared/layout/`

No imports reference this directory from production code. Delete the entire folder. If `PageShell.tsx` had a purpose, its structure is superseded by `CommonLayout` in `modules/common`.

### Merge: Duplicate Dropdown Fetch Logic → Custom Hook

Instead of 8 files each calling `useEvents({ limit: 100 })` or `useOrganizations({ limit: 200 })`:

```ts
// modules/events/hooks/useAllEvents.ts (new)
export function useAllEvents() {
  return useEvents({ limit: DROPDOWN_LIMIT });
}

// modules/organizations/hooks/useAllOrganizations.ts (new)
export function useAllOrganizations() {
  return useOrganizations({ limit: DROPDOWN_LIMIT });
}
```

Centralises the "fetch all for dropdown" pattern and makes `DROPDOWN_LIMIT` the single place to change if pagination is added to dropdowns.

---

## 5. Tooling Recommendations

### ESLint Rules to Enable

Add to `eslint.config.mjs`:

```js
// Recommended additions:
{
  rules: {
    // Catch magic numbers (with exceptions for common values)
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, -1, 2, 10, 100],
      ignoreArrayIndexes: true,
      enforceConst: true,
    }],
    // Enforce @/* imports over relative ../../..
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['../*/../*'], message: 'Use @/* path alias instead' }]
    }],
    // Catch unused variables (pair with tsconfig noUnusedLocals)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  }
}
```

### Additional tsconfig Settings

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

Enable `exactOptionalPropertyTypes` to catch the common bug of passing `undefined` where a property is omitted vs. explicitly optional.

### CI Checks to Add

| Check | Command | Trigger |
|---|---|---|
| TypeScript strict compile | `pnpm tsc --noEmit` | Every PR |
| ESLint with new rules | `pnpm lint` | Every PR |
| knip (dead exports) | `pnpm knip` | Weekly scheduled job |
| Bundle size check | `pnpm build && size-limit` | Every PR to main |
| Dependency audit | `pnpm audit --audit-level moderate` | Every PR |

### knip Configuration

After installing knip (`pnpm add -D knip`), create `knip.json`:

```json
{
  "entry": ["app/**/*.tsx", "app/**/*.ts"],
  "project": ["**/*.{ts,tsx}", "!_rebuild/**", "!_contract/**"],
  "ignore": ["messages/**"]
}
```

Then run `pnpm knip` to find unused exports and files. Expected findings after `shared/layout/` deletion: near-zero unused exports.

---

## 6. Cleanup Prompts for Top 5 Items

---

### CLEANUP-1 — Delete Dead `shared/layout/` Directory

```
Cleanup: Remove the dead shared/layout/ directory — superseded by modules/common/components/
Type: dead-code-removal
Files:
  shared/layout/Sidebar.tsx   ← DELETE
  shared/layout/TopBar.tsx    ← DELETE
  shared/layout/PageShell.tsx ← DELETE
  shared/layout/index.ts      ← DELETE
  shared/layout/              ← DELETE directory

Action:
  1. Confirm zero imports: grep -rn "shared/layout" --include="*.ts" --include="*.tsx" . | grep -v node_modules
     Expected output: empty (already verified: no production imports exist)
  2. Delete the directory: rm -rf shared/layout/
  3. Run pnpm build to confirm no breakage

Verification:
  - pnpm build completes without error
  - grep -rn "shared/layout" should return zero results in .ts/.tsx files
  - The live implementations in modules/common/components/ are unchanged
```

---

### CLEANUP-2 — Fix `SubmissionStatus` Type

```
Cleanup: Update SubmissionStatus type to match the 5 values actually used in the codebase
Type: type-safety
Files:
  modules/submissions/types/index.ts  ← UPDATE

Action:
  Replace:
    export type SubmissionStatus = 'PENDING'; // placeholder until backend adds status field

  With:
    // Backend status field is now live. All 5 values are used in ReviewActions.tsx and
    // the submissions.status.* i18n namespace.
    export type SubmissionStatus =
      | 'PENDING'
      | 'SUBMITTED'
      | 'APPROVED'
      | 'REJECTED'
      | 'FLAGGED';

  Then update STATUS_VARIANT in modules/submissions/components/ReviewActions.tsx:
    const STATUS_VARIANT: Record<SubmissionStatus, BadgeVariant> = { ... };
  (Replace Record<string, BadgeVariant> with Record<SubmissionStatus, BadgeVariant>
   to get exhaustiveness checking)

Verification:
  - pnpm tsc --noEmit passes
  - pnpm build passes
  - STATUS_VARIANT map produces a TypeScript error if any status value is added/removed
    without updating the map (exhaustiveness check enabled by the stricter Record type)
```

---

### CLEANUP-3 — Replace Local `PAGE_SIZE` Constants with `DEFAULT_PAGE_SIZE`

```
Cleanup: Remove 4 locally-defined PAGE_SIZE = 20 constants; use DEFAULT_PAGE_SIZE from core
Type: dead-code-removal / convention
Files:
  modules/events/components/EventList.tsx         ← UPDATE line 16
  modules/sports/components/SportList.tsx         ← UPDATE line 18
  modules/organizations/components/OrganizationList.tsx  ← UPDATE line 18
  modules/users/components/UserList.tsx           ← UPDATE line 16

Action per file:
  1. Remove: const PAGE_SIZE = 20;
  2. Add import: import { DEFAULT_PAGE_SIZE } from '@/core/config';
  3. Replace all PAGE_SIZE references with DEFAULT_PAGE_SIZE (4 occurrences per file)

Also:
  4. Add DROPDOWN_LIMIT = 200 to core/config/constants.ts
  5. Replace all 'limit: 200' occurrences in dropdown fetches with DROPDOWN_LIMIT
  6. Replace all 'limit: 100' event-picker fetches with DROPDOWN_LIMIT (or a separate
     EVENTS_DROPDOWN_LIMIT = 100 if the distinction between 100 and 200 is intentional)

Verification:
  - pnpm tsc --noEmit passes
  - grep -n "PAGE_SIZE = 20\|limit: 200\|limit: 100" in .tsx/.ts files
    should return zero results in module components
  - Runtime behaviour is unchanged (same numeric values, just sourced from constants)
```

---

### CLEANUP-4 — Fix Barrel Bypass in `useCreateOrganizer.ts`

```
Cleanup: Fix cross-module import that bypasses registration-flow barrel
Type: convention
Files:
  modules/participation/hooks/useCreateOrganizer.ts  ← UPDATE line 2

Action:
  Change:
    import { createRegistration, type ParticipantCreateBody }
      from '@/modules/registration-flow/services/registration.service';

  To:
    import { createRegistration, type ParticipantCreateBody }
      from '@/modules/registration-flow';

  Verify that modules/registration-flow/index.ts already exports these:
    grep "createRegistration\|ParticipantCreateBody" modules/registration-flow/index.ts

  If they are not exported, add to modules/registration-flow/index.ts:
    export { createRegistration } from './services/registration.service';
    export type { ParticipantCreateBody } from './services/registration.service';

Verification:
  - pnpm tsc --noEmit passes
  - pnpm build passes
  - grep -rn "registration-flow/services\|registration-flow/hooks\|registration-flow/components"
    should return zero results in other modules (all cross-module imports go through the barrel)
```

---

### CLEANUP-5 — Add JSDoc to `computeAgeAtEvent` (Red Line #3 Documentation)

```
Cleanup: Add JSDoc to the two most critical public functions in core/lib/format.ts
Type: documentation
Files:
  core/lib/format.ts  ← ADD JSDoc above computeAgeAtEvent and isMinorAtEvent

Action:
  Add JSDoc immediately before computeAgeAtEvent:

  /**
   * Computes a participant's age at the start of an event.
   *
   * RED LINE #3: Always pass the event start date — never use new Date() or the current date.
   * Age determines the required document type (birth certificate for minors, NID/passport for adults).
   *
   * @param dob - Date of birth (YYYY-MM-DD string or Date object)
   * @param eventStartDate - The event's start_date from the backend (YYYY-MM-DD string or Date)
   * @returns Age in whole years as of the event start date, or null if either input is invalid.
   * @example
   *   computeAgeAtEvent('2006-03-15', '2024-03-14') // → 17 (birthday not yet reached)
   *   computeAgeAtEvent('2006-03-15', '2024-03-15') // → 18 (birthday is event day)
   */

  Add JSDoc immediately before isMinorAtEvent:

  /**
   * Returns true if the participant is under MINOR_AGE_THRESHOLD (18) at the event start date.
   * Uses computeAgeAtEvent internally — inherits Red Line #3 constraint.
   * Returns false if age cannot be computed (null DOB or null event date).
   */

Verification:
  - pnpm tsc --noEmit passes (JSDoc is comments, cannot break compilation)
  - TypeScript IDE hover shows the JSDoc description on all call sites
  - The example values in JSDoc match the edge cases documented in AUDIT_QA_2026-05-11.md
```

---

*End of Quality Audit — 2026-05-11*
