# Security Reference — Nation-Level Baseline

This system holds citizen and athlete personal data and official government records. The
frontend is part of the attack surface. These rules are mandatory and are enforced **at the
port/adapter boundary** so they compose with the existing architecture (see `architecture.md`).

## Threat model in one line

Assume the network, the browser, the user's device, and every API response are **hostile or
compromised**. The frontend's job is to fail safe, leak nothing, and never be the thing that
"enforces" a rule the server doesn't also enforce.

## Table of contents

1. [The frontend is never a security boundary](#1-the-frontend-is-never-a-security-boundary)
2. [Authentication & sessions](#2-authentication--sessions)
3. [Authorization & RBAC](#3-authorization--rbac)
4. [Validate at the boundary](#4-validate-at-the-boundary)
5. [Output safety — XSS, links, content](#5-output-safety--xss-links-content)
6. [CSRF & request integrity](#6-csrf--request-integrity)
7. [Secrets & configuration](#7-secrets--configuration)
8. [Secure adapters & audit logging](#8-secure-adapters--audit-logging)
9. [Error handling — leak nothing](#9-error-handling--leak-nothing)
10. [Dependencies & supply chain](#10-dependencies--supply-chain)
11. [Security checklist](#11-security-checklist)

---

## 1. The frontend is never a security boundary

Any UI gate — hidden button, disabled action, redirected route, omitted menu item — is **UX
only**. The server must independently authorize every request. Never write code whose comment
or structure implies the client is enforcing access control.

```tsx
// ✅ UX gate — fine, but the server re-checks on the mutation
{can('events.create') && <Button onClick={openCreate}>{t('actions.create')}</Button>}
```

```typescript
// ❌ NEVER — trusting a client flag as the authorization decision
if (user.isAdmin) { await eventsRepository.delete(id); } // server must verify, not the client
```

---

## 2. Authentication & sessions

- **Tokens live in `httpOnly`, `Secure`, `SameSite=Strict|Lax` cookies.** Never in
  `localStorage`, `sessionStorage`, IndexedDB, Zustand, Redux, or any JS-readable place. This
  removes token theft via XSS.
- All session logic stays in `core/auth/`. Do not re-implement auth in a module.
- Treat session expiry as normal: adapters surface `401` → `core/auth/` clears state and
  redirects to login. Never silently retry a `401`.
- No "remember me" that persists raw credentials client-side. Refresh is a server concern.
- Sensitive routes are also gated server-side (middleware / RSC). Client redirects are a
  convenience, not the lock.

---

## 3. Authorization & RBAC

- Centralize permission checks in one hook, e.g. `core/auth/usePermissions()` exposing
  `can(permission: string)`. Modules call `can('events.delete')`; they never inline role string
  comparisons.
- Permissions are **capability strings**, not role names, so policy can change server-side
  without frontend edits.
- Every mutation hook that performs a privileged action assumes the server enforces the same
  capability and handles a `403` gracefully (toast + no state mutation).
- Default to **deny**. If permission data hasn't loaded, render nothing actionable — never a
  brief flash of privileged UI.

```tsx
const { can } = usePermissions();
// hide, disable, or omit — never rely on this as the actual control
{can('reports.export.pii') && <ExportButton />}
```

---

## 4. Validate at the boundary

Zod is used twice, for two different reasons:

1. **Form schemas** (`schema/<module>.schema.ts`) — validate user input for UX and to reject
   malformed/oversized data before it leaves the browser.
2. **Adapter response parsing** — parse *every* API response with Zod inside the adapter. A
   compromised or buggy backend must not be able to inject unexpected shapes into the app.

```typescript
// In the adapter — never return unparsed data
getById: async (id) => eventDetailSchema.parse(await apiClient.get(`/events/${id}`)),
```

Rules:
- Reject, do not coerce. Use `.strict()` on object schemas so unknown keys are an error.
- Constrain strings (`.max()`), enums (`z.enum`), and IDs (`z.string().uuid()` where applicable).
- Never build a request URL or path from unvalidated user input — pass IDs that passed schema
  validation, and prefer route params over string concatenation.

---

## 5. Output safety — XSS, links, content

- **No `dangerouslySetInnerHTML`** unless the content is run through a reviewed sanitizer
  (e.g. DOMPurify) AND the use is justified in a code comment. Default: render as text.
- Never interpolate untrusted data into `href`/`src`. Validate URL scheme — allow only
  `https:` (and `mailto:`/`tel:` where intended); reject `javascript:` and `data:`.
- User-supplied file uploads (Cloudinary) go through a port; validate type/size client-side
  for UX and rely on server + Cloudinary policy for enforcement. Never trust the file name.
- Respect the app's Content-Security-Policy: no inline `<script>`, no `eval`, no dynamic
  `new Function`. If a library needs them, flag it rather than weakening CSP.

---

## 6. CSRF & request integrity

- With cookie-based auth, every state-changing request (`POST/PUT/PATCH/DELETE`) must carry the
  app's CSRF protection (token header or double-submit) — handled centrally in `apiClient`,
  not per-adapter. Do not bypass `apiClient`.
- Mutations on official records should be **idempotent where possible** (send a client-generated
  idempotency key) so a retried request can't double-create a record.
- Never disable `SameSite` or add permissive CORS from the frontend side.

---

## 7. Secrets & configuration

- **Nothing secret ships to the browser.** Only values that are genuinely public may use the
  `NEXT_PUBLIC_` prefix. API keys, signing secrets, and internal URLs stay server-side.
- Cloudinary, maps, analytics: use unsigned/public client keys only; signing happens server-side
  behind a port.
- Do not hardcode environment-specific URLs in adapters — read from `core/config`.
- Never log configuration objects that might contain tokens.

---

## 8. Secure adapters & audit logging

The adapter boundary is the single, auditable choke point for I/O. Use it.

- **Sensitive mutations must be auditable.** Creating/modifying/deleting official records or
  accessing Restricted-PII goes through a mutation hook that records an audit event. The audit
  trail itself is written **server-side** (the client cannot be trusted to log truthfully); the
  frontend's job is to ensure the action is attributable (authenticated request) and to surface
  audit-relevant context to the API. Never "log" sensitive audit data only in the browser.
- Adapters attach correlation/request IDs (via `apiClient`) so an action can be traced
  end-to-end without logging PII.
- A `securePort` for restricted data should expose the **minimum** methods needed — do not add
  a `getAll()` that returns full PII when the UI only needs a masked list.

```typescript
// A privileged action: server authorizes + audits; client routes through an auditable hook
export function useExportParticipantPII() {
  const t = useTranslations('reports');
  return useMutation({
    mutationFn: (dto: PiiExportRequest) => reportsRepository.exportPii(dto), // server checks cap + audits
    onSuccess: () => toast.success(t('messages.exportQueued')),
    onError: () => toast.error(t('messages.exportFailed')),
  });
}
```

---

## 9. Error handling — leak nothing

- UI errors are **generic and translated**: "Something went wrong" / "You don't have access",
  never a stack trace, SQL fragment, internal hostname, or raw backend message.
- Map backend error codes to friendly i18n messages in one place (`shared/utils/apiError`).
- `error.tsx` boundaries render `shared/ui/PageErrorState` with a generic message; full detail
  goes to the secure server log, not `console` and not the DOM.
- **Never `console.log`/`console.error` user data, tokens, or full API responses** — in
  production these reach the browser console and any installed extension. Remove all debug
  logging before commit (golden rule 20).

---

## 10. Dependencies & supply chain

- Never add an npm package without explicit instruction (golden rule 17). New dependencies are
  a supply-chain risk in a government system.
- When a package *is* approved: prefer well-maintained, widely-audited libraries; pin versions;
  avoid packages that require weakening CSP or run postinstall scripts you can't explain.
- Wrap any third-party SDK behind a port so it can be audited, mocked, or swapped in one place.

---

## 11. Security checklist

Run before completing any task that touches data, auth, or external calls.

- [ ] No auth token or PII in `localStorage`/`sessionStorage`/Zustand/Redux.
- [ ] Every API response is Zod-parsed inside its adapter; object schemas are `.strict()`.
- [ ] Every UI permission gate is mirrored by a server-side check (gate is UX only).
- [ ] No `dangerouslySetInnerHTML` without a reviewed sanitizer; URLs scheme-checked.
- [ ] State-changing requests go through `apiClient` (CSRF + correlation ID intact).
- [ ] No secrets in the bundle; only public values use `NEXT_PUBLIC_`.
- [ ] Sensitive mutations route through an auditable hook; server does the authoritative audit.
- [ ] Error UIs are generic + translated; no stack traces, internal URLs, or raw messages shown.
- [ ] No `console.*` of user data, tokens, or full responses anywhere.
- [ ] No new npm package added without explicit instruction.
