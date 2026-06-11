---
name: national-frontend-architecture
description: >-
  Authoritative frontend engineering standard for a nation-level Next.js 15
  application (national sports/games management platform: events, sports,
  organizations, registration, participation, reports). Enforces a Ports &
  Adapters (Hexagonal) architecture AND a strict security + data-governance
  baseline suitable for government / public-sector systems handling citizen and
  athlete PII. Use this skill for ANY frontend work in this codebase — writing,
  refactoring, reviewing, or planning React/Next.js/TypeScript code, building
  forms, hooks, modules, adapters, Zustand stores, i18n, or any component.
  Trigger it even when the user does not say "skill": any mention of a module,
  page, form, hook, adapter, port, schema, TanStack Query, RHF, Zustand,
  next-intl, auth, permissions, PII, audit logging, data handling, security
  review, or refactoring is in scope. When in doubt on a frontend task here,
  consult this skill BEFORE writing code.
---

# National Frontend Architecture Standard

> **This is a public-sector, nation-level system.** Code defects here can leak
> citizen/athlete personal data, corrupt official records, or expose government
> infrastructure. Architecture discipline and security discipline are the same
> priority — never trade one for the other.

## How to use this skill

1. **Read this SKILL.md fully** — it holds the universal rules that apply to every task.
2. **Load the relevant reference file(s)** from `references/` for the specifics (see router below). Read them *before* writing code, not after.
3. **Run the [Pre-Task Checklist](#pre-task-checklist)** and the [Decision Tree](#decision-tree-condensed) before producing any code.
4. **Implement one concern at a time.** Never mix a refactor with new feature work.

### Reference router — read the file that matches the task

| If the task touches…                                                        | Read |
| --------------------------------------------------------------------------- | ---- |
| Ports, adapters, folder layout, hooks, forms, component/state structure     | `references/architecture.md` |
| Authentication, authorization/RBAC, secrets, XSS/CSRF, input validation, secure adapters | `references/security.md` |
| PII, data classification, audit logging, retention, residency, telemetry    | `references/data-governance.md` |
| Next.js App Router (server/client, page/loading/error files), i18n          | `references/nextjs-and-i18n.md` |
| Migrating an existing module, naming conventions, full decision tree        | `references/migration.md` |

The reference files are authoritative and detailed. This SKILL.md is the contract everything obeys.

---

## Stack

Next.js 15 (App Router) · TypeScript (strict) · TanStack Query · React Hook Form · Zod ·
Zustand · Tailwind CSS · ShadCN UI · next-intl · Vitest · Cloudinary

---

## Golden Rules — non-negotiable

Violating any of these during a task is a **defect**, not a shortcut. They fall into three groups.

### A. Architecture integrity

1. Never call `fetch` / `apiClient` directly inside a hook or component — go through the **port**, via the registered adapter.
2. Never import an adapter directly from a hook or component — always import from `adapters/index.ts`. No layer skips a level downward.
3. All external dependencies (HTTP, Cloudinary, storage, analytics) must sit behind a **port interface**.
4. Never put business logic, DTO mapping, `fetch`, or hooks in a Next.js `page.tsx` file.
5. Consolidate hooks into `useXxx.ts` (queries) and `useMutateXxx.ts` (mutations) — never one-hook-per-file.
6. Never prop-drill deeper than 2 levels — use Zustand or composition.
7. Never duplicate logic — extract to hooks or utilities.
8. Never introduce `any` — use `unknown` + type guards. Strict TypeScript is mandatory.
9. Never change port interface method signatures without a full impact analysis.

### B. Security & data — the public-sector baseline

10. **The frontend is never a security boundary.** Any UI-level gate (hidden buttons, route guards) is UX only; the server re-checks every permission. Never assume the client enforces anything.
11. **Auth tokens never live in JS-readable storage** (`localStorage`/`sessionStorage`/Zustand/Redux). Sessions ride in `httpOnly`, `Secure`, `SameSite` cookies handled by `core/auth/`.
12. **Validate every input with Zod** at the adapter boundary. Client validation is for UX; treat all server responses as untrusted and parse them too.
13. **Never put PII in URLs, query strings, logs, analytics, or error messages.** No `console.log` of user data — ever. (See `references/data-governance.md` for the PII list.)
14. **Never render unsanitized HTML.** No `dangerouslySetInnerHTML` without an explicit, reviewed sanitizer. No untrusted URLs in `href`/`src`.
15. **No secrets in the frontend bundle.** Only genuinely public values use `NEXT_PUBLIC_`. Anything sensitive stays server-side.
16. **Sensitive actions must be auditable.** Mutations that create/modify/delete official records or access restricted data go through hooks that emit an audit event (see security ref). Errors shown to users must be generic; details go to the secure log, never the DOM.
17. Never add an npm package without explicit instruction (supply-chain risk).

### C. Preservation

18. Never change `className`, Tailwind classes, `style`, icons, colors, or layout without explicit instruction.
19. Always preserve existing behavior exactly when refactoring.
20. Never leave `console.log`, dead code, mock data, or hardcoded user-facing strings — all strings go through `next-intl`.

> Rules 10–17 are the upgrade that makes this codebase "nation-level." They are
> enforced **at the port/adapter boundary**, so they compose with the existing
> architecture instead of bolting on. See `references/security.md`.

---

## Decision Tree (condensed)

Answer in order before writing code. The full 14-point tree is in `references/migration.md`.

1. File > 200 lines? → extract subcomponents / custom hooks.
2. Page component has > 6 `useState`? → move filters/sort/pagination to a Zustand store; collapse modals into one state object.
3. `hooks/` has > 2 files? → consolidate into `useXxx.ts` + `useMutateXxx.ts`.
4. `services/` still holds API calls or `schema.ts`? → create `ports/` + `adapters/`, rename to `api/`, move schema to `schema/`.
5. `useQuery`/`useMutation` inside a form? → move to `use<Module>Form.ts`.
6. Toast inside a page component? → move to mutation `onSuccess`/`onError`.
7. Hardcoded user-facing string? → `messages/en.json` + `messages/kh.json`.
8. Component imports from `adapters/` or `api/`? → it must import only from `hooks/`.
9. **Does this read/write PII or a restricted record?** → classify the data, confirm the adapter validates I/O, ensure no PII leaks to logs/URLs/telemetry, and route the mutation through an auditable hook. (See data-governance ref.)
10. **Does this gate UI by role/permission?** → confirm the server enforces the same check; the UI gate is cosmetic only.
11. **Any new external call/dependency?** → it must sit behind a port; secrets stay server-side.

---

## Pre-Task Checklist

- [ ] Read this SKILL.md and the matching `references/` file(s).
- [ ] List every file to be created or modified, with planned line counts and extractions.
- [ ] Confirm the module has `ports/` + `adapters/`; if not, create them first.
- [ ] Classify any data the task handles (Public / Internal / Confidential / Restricted-PII).
- [ ] Confirm no PII reaches logs, URLs, query strings, analytics, or error UIs.
- [ ] Confirm every external call goes through a port; no secrets in the client bundle.
- [ ] Confirm any role/permission gate is mirrored server-side (UI gate is UX only).
- [ ] Confirm sensitive mutations route through an auditable hook.
- [ ] Confirm no style, layout, translation key, route, or API URL changes by accident.
- [ ] Plan order: `ports/` → `adapters/` → `api/` → `schema/`/`mappers/` → `hooks/` → `components/` → page.
- [ ] After implementing: `tsc --noEmit` passes; all user-facing strings use i18n; one concern only.

---

## What never changes (without explicit instruction)

`className`/Tailwind values · `style` props · icons · color tokens (`globals.css`) ·
ShadCN variants (`components.json`) · layout structure · port interface signatures ·
existing `messages/` keys · routes in `core/config/routes.ts` · `core/auth/` ·
`shared/ui/` primitives · session/cookie handling.
