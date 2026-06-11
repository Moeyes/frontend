# Migration & Decision Tree Reference

Use this when refactoring an existing module. The condensed tree lives in `SKILL.md`; this is
the full version plus the migration table and recommended order.

## Full refactor decision tree

Answer in order before writing code.

1. **File over 200 lines?** → extract subcomponents for rendering; extract custom hooks for logic.
2. **Page component has more than 6 `useState`?** → move filter/sort/pagination to a Zustand
   store; collapse modal booleans into one state object.
3. **`hooks/` has more than 2 files?** → consolidate into `useXxx.ts` (queries) and
   `useMutateXxx.ts` (mutations).
4. **`services/` contains a `schema.ts`?** → move to `schema/<module>.schema.ts`.
5. **`services/index.ts` contains API calls directly?** → create `ports/IXxxRepository.ts`,
   create `adapters/xxxHttpAdapter.ts` (parsing responses with Zod), wire `adapters/index.ts`,
   rename `services/` → `api/`.
6. **`useQuery` inside a form component?** → move to `use<Module>Form.ts`.
7. **Toast calls inside a page component?** → move to mutation `onSuccess`/`onError`.
8. **Hardcoded user-facing string?** → extract to `messages/en.json` + `messages/kh.json`.
9. **Hardcoded API path inside a hook?** → move to `core/config/routes.ts` or the adapter.
10. **Repeated `<Controller>` / field code?** → use/expand `shared/form/` wrappers.
11. **Component imports from `adapters/` or `api/` directly?** → components import only from
    `hooks/`; hooks import only from `adapters/index.ts`.
12. **`core/lib/` holds service logic belonging to a module?** → move to that module's `api/`.
13. **Does the code read/write PII or a restricted record?** → classify the data (see
    `data-governance.md`); confirm the adapter validates I/O; ensure no PII in
    logs/URLs/telemetry; use `staleTime:0`+`gcTime:0`; route privileged mutations through an
    auditable hook.
14. **Does the code gate UI by role/permission?** → confirm the server enforces the same check;
    the UI gate is cosmetic only (see `security.md`).

---

## Migration table

| Current file/pattern                                                   | Target                                                                              | Action          |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------- |
| `modules/events/services/index.ts`                                     | `modules/events/api/index.ts` + `ports/IEventsRepository.ts` + `adapters/eventsHttpAdapter.ts` | Split + rename  |
| `modules/registration/services/schema.ts`                             | `modules/registration/schema/registration.schema.ts`                                | Move + rename   |
| `modules/survey/services/schema.ts`                                   | `modules/survey/schema/survey.schema.ts`                                            | Move + rename   |
| `modules/bynumber/services/schema.ts`                                 | `modules/bynumber/schema/bynumber.schema.ts`                                        | Move + rename   |
| `useCreateEvent.ts` + `useUpdateEvent.ts` + `useDeleteEvent.ts` + …    | `modules/events/hooks/useMutateEvents.ts`                                           | Consolidate     |
| `useEvents.ts` + `useEventDetail.ts` + `useEventSports.ts` + …         | `modules/events/hooks/useEvents.ts`                                                 | Consolidate     |
| `useCreateSport.ts` + `useUpdateSport.ts` + …                         | `modules/sports/hooks/useMutateSports.ts`                                           | Consolidate     |
| `useSports.ts` + `useSportDetail.ts` + …                              | `modules/sports/hooks/useSports.ts`                                                 | Consolidate     |
| `core/lib/dashboard.service.ts`                                       | `modules/dashboard/api/index.ts` (or keep in core if truly global)                  | Evaluate + move |
| `core/lib/reference-data.ts`                                          | `core/api/referenceData.ts` or `modules/reference/`                                 | Evaluate + move |
| Module-level `index.ts` barrel                                        | Keep — re-export public API only                                                    | Maintain        |

---

## Recommended module migration order

Refactor in dependency order — simpler modules first, and prioritize modules that touch the most
sensitive data for a security pass early.

1. `users` — no module dependencies (handles PII → apply data-governance rules first).
2. `organizations` — no module dependencies.
3. `sports` — depends on reference data.
4. `events` — depends on sports + organizations.
5. `registration` — depends on events + sports (PII-heavy).
6. `participation` — depends on registration (PII-heavy, possibly minors).
7. `reports` — depends on most modules (PII export → auditable, permission-gated).
8. `dashboard` — reads from everything.
9. `survey`, `bynumber`, `cards` — self-contained.

> For any PII-heavy module (`users`, `registration`, `participation`, `reports`), do the
> data-governance + security checklist pass in the **same** migration, not as a follow-up.
