# Contributing

## Code of conduct

This is a government system handling citizen data. We maintain a respectful, professional working environment. All contributors are expected to:
- Be respectful in code reviews and issue discussions
- Not share citizen data (test data should use fictional names and IDs)
- Follow the security guidelines in [SECURITY.md](./SECURITY.md)
- Protect the confidentiality of ministry decisions and pre-release features

---

## How to propose a change

### Small changes (bug fixes, UI improvements)

1. Open an issue describing the problem and your proposed fix
2. Assign yourself and create a branch: `fix/describe-the-bug`
3. Make the change, write a test if the fix touches business logic
4. Open a PR with a description of what changed and why
5. Tag a reviewer

### Large changes (new module, new report, architectural change)

1. Write an RFC (Request for Comment) — a short markdown document covering:
   - Problem statement
   - Proposed solution
   - Alternatives considered
   - Impact on RBAC, i18n, tests, and deployment
2. Share the RFC in the team chat for discussion (minimum 2 business days)
3. If approved, create a feature branch and proceed as normal
4. Link the RFC in the PR description

### Breaking changes (API contract, data model)

Breaking changes that affect the backend contract require coordination with the backend teammate. The flow:
1. Backend teammate updates the OpenAPI spec
2. You run `pnpm contract:sync`
3. Fix all TypeScript errors that surface from the updated types
4. Test on staging with the updated backend

---

## How to file a bug report

Include in your bug report:
1. **Steps to reproduce** — which screens, which user role, what data
2. **Expected behaviour** — what should happen
3. **Actual behaviour** — what actually happens (screenshot if visual)
4. **Environment** — browser, OS, production or staging
5. **Console errors** — paste any red errors from the browser DevTools console

**For security bugs:** Do not file a public issue. Send directly to the tech lead or Ministry IT Security. See [SECURITY.md § Incident Response](./SECURITY.md#incident-response-runbook).

---

## How to ask for help

1. Check this documentation first (especially [GLOSSARY.md](./GLOSSARY.md) for Khmer terms)
2. Check `_rebuild/SCENARIOS.md` — it describes every workflow in detail
3. Check `_rebuild/RED_LINES.md` — hard rules that explain *why* things are done a certain way
4. Ask in the team chat with context: what you're trying to do, what you tried, what went wrong

For backend API questions, check `_contract/ENDPOINTS.md` first, then ask the backend teammate.

---

## Style guide

See [`_rebuild/CONVENTIONS.md`](../_rebuild/CONVENTIONS.md) for the complete style guide. Key points:

- Every module follows the same folder structure: `components/ hooks/ services/ types/ index.ts`
- Components are PascalCase `.tsx` files
- Hooks start with `use` and are `.ts` files
- Services contain only API calls — no React, no state, no side effects
- All strings go through `useTranslations()` — zero hardcoded text in JSX
- Never import from a module's sub-path: `import from '@/modules/events'` not `'@/modules/events/components/EventForm'`

---

## Definition of done

A change is done when:
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test:run` — all tests pass (including new tests for the change)
- [ ] `pnpm build` succeeds
- [ ] Both `en.json` and `kh.json` updated for any new strings
- [ ] Loading / empty / error states on any new lists
- [ ] PR reviewed and approved by at least one team member
