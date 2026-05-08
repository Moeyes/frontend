# Security Checklist — per-module self-audit

Run this checklist **before declaring a module done**. Output the results in your final commit message.

For each item, answer YES / NO / N/A. If any answer is NO and not N/A, fix it before committing.

---

## A. Authentication & token handling

- [ ] All HTTP calls go through `core/api/client.ts` (not raw `fetch()`)
- [ ] No tokens in `localStorage` or `sessionStorage` anywhere in this module
- [ ] No tokens in URL query parameters
- [ ] Token refresh handled transparently by the client (401 → refresh → retry once)
- [ ] Logout clears HttpOnly cookies via the route handler

## B. RBAC & data scoping

- [ ] Every protected page wraps in `<ProtectedRoute requiredRoles={[...]}/>` with the correct roles
- [ ] Component-level role checks use `useRequireRole`, not manual role string comparison
- [ ] Every list query made by Federation users includes `federation_id` from auth context
- [ ] Every list query made by Organization users includes `organization_id` from auth context
- [ ] Detail page queries verify the resource belongs to the user (or user is admin)
- [ ] No "view all" mode accidentally exposed to scoped users
- [ ] Role-based UI gating: federation users don't see Admin-only buttons (e.g., Approve, Flag)

## C. FSM & state transitions

- [ ] No mutation includes `status` in the request body
- [ ] All status changes go through dedicated endpoints (`/approve`, `/reject`, `/flag`, `/submit`, `/transitions`)
- [ ] UI surfaces only legal transitions for the current status (e.g., can't approve a DRAFT)
- [ ] Status badges use the centralized status enum + color map (no string literals like `"APPROVED"` scattered in components)
- [ ] After a mutation, React Query invalidates the right keys to reflect the new status

## D. Forms & validation

- [ ] All forms use React Hook Form + zodResolver
- [ ] Zod schema lives in `modules/<domain>/services/schema.ts`
- [ ] Errors shown inline under each field (not just toast)
- [ ] Submit button disabled while pending; spinner inside button
- [ ] Required fields marked clearly in UI
- [ ] Field-level validation runs on blur or change (not only on submit)
- [ ] Server-side errors (RFC7807 `errors[]`) mapped to fields, not just shown as a toast

## E. Age & document rules (registration-flow only — N/A for other modules)

- [ ] Age computed using `core/lib/format.ts` `computeAgeAtEvent(dob, eventDate)`, never `new Date()`
- [ ] If age < 18: form requires `birth_certificate` document type
- [ ] If age >= 18: form requires `national_id` OR `passport` document type
- [ ] Document type rule re-validated on submit (not just on field change)
- [ ] Quota enforcement check runs before final submit (server is authoritative; client checks for UX)

## F. Idempotency

- [ ] Every POST / PUT / PATCH request includes `Idempotency-Key` header (handled by typed client)
- [ ] No raw `fetch()` calls bypass the typed client
- [ ] Idempotency keys generated via `crypto.randomUUID()`, not `Math.random()`

## G. i18n

- [ ] Zero hardcoded English or Khmer strings in JSX
- [ ] Every new key added to BOTH `messages/en.json` AND `messages/kh.json`
- [ ] Khmer is the canonical version (verify with the user if uncertain)
- [ ] Date formatting respects current locale (Khmer numerals optional, Arabic numerals default in tables)
- [ ] Number formatting respects locale

## H. Loading / empty / error states

- [ ] Every list wraps in `<QueryBoundary>` for loading/empty/error
- [ ] Loading: skeleton or spinner — not blank
- [ ] Empty: `PageEmptyState` with friendly message + CTA
- [ ] Error: recoverable UI with retry button (via `error.tsx` or QueryBoundary)
- [ ] No infinite loaders (every loading state has a timeout or error fallback)

## I. Audit & traceability

- [ ] Every mutation in this module corresponds to a backend endpoint that writes an audit row (assumed by frontend)
- [ ] User actions that should be auditable are not done in pure client-side state
- [ ] No "soft updates" that bypass backend (e.g., updating local cache without a mutation)

## J. Backend contract integrity

- [ ] All backend response types come from `_contract/api.types.ts`
- [ ] No hand-written backend type duplications
- [ ] Backend types are re-exported with sensible aliases if needed (e.g., `type Event = components['schemas']['EventResponse']`)
- [ ] If contract changed during this module, ran `pnpm contract:sync` before committing

## K. Build & quality

- [ ] `pnpm tsc --noEmit` passes for the whole repo
- [ ] `pnpm lint` passes for the whole repo
- [ ] `pnpm build` succeeds
- [ ] No new console warnings introduced
- [ ] No `console.log()` left in shipped code (use a proper logger)

## L. Module conventions

- [ ] Folder shape matches `_rebuild/CONVENTIONS.md`
- [ ] Components are PascalCase, hooks are useCamelCase
- [ ] `index.ts` barrel exists; only public surface is exported
- [ ] No imports from another module's internal files (only from its `index.ts`)
- [ ] Page files (`page.tsx`) are thin — they import the module and render it

## M. Scenarios coverage

- [ ] Every scenario in `_rebuild/SCENARIOS.md` that touches this module has been manually walked through
- [ ] Each scenario marked PASS / NEEDS-BACKEND-FIX / FAIL with reason
- [ ] PASS scenarios verified end-to-end in the browser, not just by reading code

---

## Output format

In your final commit message for this module, include:

```
rebuild: <module> module

Security checklist results:
A. Auth & tokens: PASS
B. RBAC & scoping: PASS
C. FSM & transitions: PASS
D. Forms & validation: PASS
E. Age & documents: N/A
F. Idempotency: PASS
G. i18n: PASS
H. Loading/empty/error: PASS
I. Audit: PASS
J. Contract integrity: PASS
K. Build & quality: PASS
L. Conventions: PASS
M. Scenarios: 3 PASS / 0 FAIL / 1 NEEDS-BACKEND-FIX

Scenarios needing backend fixes:
- Scenario 6: /api/v1/surveys/{id}/flag returns 405 — backend route missing
```

If any letter is NOT pass, FIX before committing. The audit is a gate, not a report.

---

## Reviewer note for the user

When reviewing the commit, focus on:

1. The "M. Scenarios" line — anything other than all PASS needs your attention
2. Any "N/A" answers — verify they're truly not applicable
3. Spot-check 1–2 RBAC scoping queries by looking at the network tab in browser dev tools
4. Run the relevant scenarios yourself for 5 minutes

If you don't have time to spot-check, that's the signal to slow down — not to push more modules.
