# RED LINES — Hard rules. Never violate.

This file lists rules with **catastrophic consequences if violated**. If you (Claude Code) are about to do any of these, **STOP and ASK** the user — do not proceed.

If a user request seems to require violating a red line, the request is wrong. Surface the conflict. Do not satisfy a user request by violating a red line.

---

## Red line 1 — Never modify Backend-V2/

The backend is owned by the user's teammate. It is a contract.

- DO NOT edit any file under `Backend-V2/`
- DO NOT modify backend models, schemas, routes, services, or migrations
- DO NOT run alembic migrations against the backend
- IF a frontend feature seems to require a backend change, STOP and tell the user — they coordinate with the teammate

The only acceptable interaction with the backend is:
- Reading files for understanding
- Starting it via `make dev` to fetch OpenAPI
- Calling its HTTP endpoints

---

## Red line 2 — Never hand-write API types

All backend types come from `final/_contract/api.types.ts` (auto-generated from OpenAPI).

- DO NOT define backend response types manually
- DO NOT create types like `interface UserResponse {...}` for backend data
- DO NOT duplicate enum values from backend

If `_contract/api.types.ts` is missing a type, regenerate it via `pnpm contract:sync` — do not work around the problem with hand-written types.

---

## Red line 3 — Never compute age from today

Age is computed from the **event date**, not from `new Date()`.

```ts
// WRONG
const age = differenceInYears(new Date(), participant.dob);

// CORRECT
const age = differenceInYears(event.start_date, participant.dob);
```

Why this matters: a participant turning 18 between the registration date and the event date is still a minor for legal/document purposes — the event date is the legal boundary.

- DO NOT use `new Date()` or `Date.now()` for age calculations
- ALWAYS use the event's start date
- Use the helper in `core/lib/format.ts` (`computeAgeAtEvent`)

---

## Red line 4 — Never use localStorage for tokens

Tokens go in HttpOnly cookies set by Next.js route handlers.

- DO NOT store JWT, access_token, or refresh_token in `localStorage` or `sessionStorage`
- DO NOT pass tokens via URL query parameters
- USE Next.js route handlers (e.g., `app/api/auth/login/route.ts`) to set HttpOnly cookies
- The frontend never directly handles raw tokens — only the server-side route handlers do

---

## Red line 5 — Never change status client-side

FSM transitions go through dedicated mutation endpoints. Status is server-controlled.

```ts
// WRONG
await api.PATCH('/api/v1/registrations/{id}', {
  body: { status: 'APPROVED' }
});

// CORRECT
await api.POST('/api/v1/registrations/{id}/approve');
```

- DO NOT include `status` in PATCH/PUT request bodies
- USE the dedicated endpoints: `/approve`, `/reject`, `/flag`, `/submit`, `/transitions`
- The backend enforces legal transitions; the frontend never makes status decisions

---

## Red line 6 — Never skip federation_id / organization_id scoping

Federation users must see only their data. Organization users must see only their data.

For every list query made by a Federation/Organization user:

```ts
// WRONG — leaks all federations' data
useQuery(['surveys'], () => api.GET('/api/v1/surveys'))

// CORRECT — scoped to the user's federation
const { user } = useAuth();
useQuery(
  ['surveys', user.federation_id],
  () => api.GET('/api/v1/surveys', { params: { federation_id: user.federation_id } })
);
```

- DO NOT call list endpoints without scoping params for non-admin users
- DO NOT trust that the backend will scope automatically — pass the param explicitly
- The auth context exposes `federation_id` and `organization_id` for this purpose

If a backend endpoint doesn't accept the scoping parameter, STOP and tell the user — that's a backend bug to fix.

---

## Red line 7 — Never hardcode strings

All user-facing text comes from `messages/en.json` and `messages/kh.json`.

```tsx
// WRONG
<button>Submit</button>
<h1>Create Event</h1>

// CORRECT
<button>{t('common.submit')}</button>
<h1>{t('events.createTitle')}</h1>
```

- Every new key added to BOTH `messages/en.json` AND `messages/kh.json`
- Khmer is the canonical version (English may be approximate translation; Khmer must be precise)
- DO NOT skip the Khmer key with a `// TODO` — add it before committing

---

## Red line 8 — Never skip Idempotency-Key on mutations

All POST, PUT, PATCH requests must include `Idempotency-Key: <uuid>` header.

This is handled by `core/api/client.ts` automatically. If you bypass the client (e.g., direct fetch), you must add the header manually.

- DO NOT use raw `fetch()` for mutations — always go through the typed client
- DO NOT generate idempotency keys with `Math.random()` — use `crypto.randomUUID()`

---

## Red line 9 — Never skip loading/empty/error states

Every list and every page must handle these states explicitly.

- Loading: skeleton or spinner from `shared/ui/`
- Empty: friendly message + CTA from `PageEmptyState`
- Error: recoverable message + retry button from error.tsx or QueryBoundary

If a list shows blank when data is loading, the user thinks it's broken. This is an automatic UAT bug.

---

## Red line 10 — Never document or use a credential

If you discover credentials in any file (.env, seed.py, README), DO NOT:
- Print them in commit messages
- Print them in CLAUDE.md
- Echo them in console output beyond what's needed for the immediate command

Treat all credentials as sensitive. If you need to document a setup that involves credentials, use placeholders like `<SEED_ADMIN_PASSWORD>`.

---

## Red line 11 — Never proceed when unsure about a user requirement

If a prompt is ambiguous, or a feature seems to need information you don't have, STOP and ask the user.

Examples of when to STOP and ASK:
- Backend endpoint exists but its semantics are unclear
- Two valid interpretations of a scenario
- Khmer report column should map to a field but you're unsure which
- A new dependency is needed but you're not sure if the user wants to add it
- A breaking change to a shared file is needed

Improvisation is what made the previous codebase messy. The user prefers asking over guessing.

---

## Red line 12 — Never commit code that fails type-check, lint, or build

Before any `git commit`:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
```

If any fails, fix it before committing. Do not commit broken code with a "will fix later" note.

---

## How to handle a red line conflict

If a user request requires violating a red line:

1. Stop work immediately
2. Tell the user which red line and why
3. Propose alternatives that don't violate the red line
4. Wait for explicit user direction

Example response:

> "I'm pausing because this would require modifying Backend-V2/, which is red line 1. The feature you described needs a new endpoint at `/api/v1/events/{id}/clone`. Options:
>
> 1. Ask your teammate to add the endpoint, then we proceed
> 2. Use existing endpoints — I can clone client-side by GET-ing the source event then POST-ing a new one (slower but doesn't need backend changes)
> 3. Defer the feature to a later release
>
> Which would you like?"

---

## Self-check before every commit

Before committing, mentally run through:

1. Did I edit any file under `Backend-V2/`? → If yes, revert.
2. Did I hand-write any API response type? → If yes, replace with `_contract` import.
3. Did I use `new Date()` for age math? → If yes, fix to event date.
4. Did I touch `localStorage` for auth? → If yes, move to HttpOnly cookies.
5. Did I PATCH a `status` field? → If yes, replace with dedicated endpoint.
6. Did I make a list query without scoping for non-admin users? → If yes, add the scope param.
7. Did I hardcode any user-facing string? → If yes, move to i18n with both en and kh keys.
8. Did I skip the Idempotency-Key on a mutation? → If yes, route through the typed client.
9. Did I skip loading / empty / error state on any list? → If yes, add them.
10. Does `pnpm tsc --noEmit && pnpm lint && pnpm build` pass cleanly? → If not, fix first.

Answering "no" to all 10 = safe to commit.
