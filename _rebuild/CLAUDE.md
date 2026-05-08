# Project: Cambodia Ministry National Sports Event Management Platform

## Repo layout
- `Backend-V2/` — FastAPI backend, **owned by my teammate, READ-ONLY** from this rebuild's perspective. Do not edit.
- `final/` — Next.js + shadcn/ui frontend, **rebuild target**.
- `final/_contract/` — auto-generated TypeScript types from backend OpenAPI.
- `final/_rebuild/` — rebuild plan, prompts, scenarios, conventions, safety files.

## Current focus
**Frontend-only rebuild from scratch** in `final/`. Backend is a contract.

## Always read these before starting work
1. `CLAUDE.md` (this file) — operating manual
2. `final/_rebuild/00_MASTER_PLAN.md` — what we're building
3. `final/_rebuild/02_DECISIONS.md` — decisions made
4. `final/_rebuild/03_TIMELINE.md` — 8-week schedule
5. `final/_rebuild/04_RELEASES.md` — W4 / W6 / W8 release scopes
6. `final/_rebuild/RED_LINES.md` — **HARD RULES — never violate these**
7. `final/_rebuild/SECURITY_CHECKLIST.md` — per-module self-audit
8. `final/_rebuild/CONVENTIONS.md` — folder shape, naming, patterns
9. `final/_rebuild/SCENARIOS.md` — the 10 user journeys
10. `final/_contract/api.types.ts` — backend types

## Stack
- **Frontend:** Next.js (App Router) + TypeScript + shadcn/ui + Tailwind + React Query + React Hook Form + Zod
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (teammate owns this)
- **Package manager:** pnpm only — never npm, never yarn
- **Node:** version 20+

## Localization
- Khmer is the canonical language. English is secondary.
- All strings via next-intl with keys in BOTH `messages/en.json` AND `messages/kh.json`.
- Khmer font: Battambang (primary).
- Zero hardcoded strings in JSX.

## Hard rules (see RED_LINES.md for full list)
- Do NOT modify `Backend-V2/` — teammate's work
- Do NOT hand-write API types — always use `_contract/api.types.ts`
- Do NOT add hardcoded strings — always i18n keys
- Do NOT touch `_contract/`, `_rebuild/` during module rebuilds
- Do NOT skip loading/empty/error states
- Do NOT use localStorage for tokens — HttpOnly cookies only
- Do NOT call services directly from components — go through hooks
- Do NOT compute age from today — always from event date
- Do NOT change status client-side — always via FSM mutation endpoint
- Do NOT skip federation_id / organization_id scoping in list queries

## Workflow rhythm
The user has limited evening review time. To match this:
- One module per evening, max
- Always end the session with a clean commit
- Always run pnpm tsc --noEmit && pnpm lint && pnpm build before commit
- After each module, walk through relevant SCENARIOS.md entries; report PASS/FAIL
- Self-audit using SECURITY_CHECKLIST.md before declaring done
- If unsure about anything, ASK — do not guess

## When you're unsure
Ask before guessing. The prompts and reference files are specific. If they don't cover something, ask the user. Improvisation is what made the previous codebase messy.

## Definition of "module done"
- All scenarios touching it pass manually
- `pnpm tsc --noEmit` clean
- `pnpm lint` clean
- `pnpm build` succeeds
- All strings in i18n (BOTH en + kh)
- Loading + empty + error states on every list
- Form validation visible inline
- RBAC enforced (federation_id / organization_id scoping verified)
- No console errors in normal flow
- SECURITY_CHECKLIST.md self-audit passes
- Commit message follows the template
