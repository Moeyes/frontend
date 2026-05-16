# Development Guide

Day-to-day development workflow, conventions, and how-to recipes.

---

## Branching strategy

```
main          ← production-ready, protected; only PRs merge here
rebuild       ← 8-week rebuild working branch (now merged to main)
feature/*     ← new feature work (branch from main)
fix/*         ← bug fixes
chore/*       ← dependency updates, config changes, docs
```

Rules:
- Never push directly to `main`
- Branch names use kebab-case: `feature/add-category-filter`
- Keep branches short-lived (< 1 week); split large features into smaller PRs

---

## Commit message convention

```
<type>(<scope>): <short imperative summary>

Types:  feat | fix | refactor | test | docs | chore | style | perf
Scope:  module name or file (events, auth, DataTable, i18n, etc.)

Examples:
  feat(events): add date range validation to event form
  fix(participation): correct mislabeled date_of_birth column header
  test(format): add leap-year edge cases to computeAgeAtEvent
  chore(deps): upgrade axios to 1.16.0 (fixes prototype-pollution CVEs)
  docs: add GETTING_STARTED.md for new developers
```

---

## PR workflow

1. Branch from `main`, do your work
2. Run: `pnpm tsc --noEmit && pnpm lint && pnpm test:run && pnpm build`
3. All four must pass — fix failures before opening PR
4. Open PR with a description covering: what changed, why, how to test
5. Assign at least one reviewer
6. Reviewer uses the checklist below
7. Squash and merge when approved

---

## Code review checklist

**Reviewer checks:**

- [ ] TypeScript compiles clean (`pnpm tsc --noEmit`)
- [ ] New/changed UI strings have keys in **both** `en.json` and `kh.json`
- [ ] Loading, empty, and error states on every new list
- [ ] Required form fields marked with `required` prop (renders `*`)
- [ ] Server data fetched via React Query hooks, not `useEffect`
- [ ] Components never import from module sub-paths (only from `modules/<name>`)
- [ ] New pages wrapped in `<ProtectedRoute requiredRoles={[...]}>`
- [ ] No `any` types, no `@ts-ignore`
- [ ] File uploads check size before uploading (`MAX_FILE_SIZE_BYTES`)
- [ ] Toast shown after create/update/delete actions
- [ ] Tests added for new pure functions or schemas

---

## How to add a new module

Follow the standard module shape from `_rebuild/CONVENTIONS.md`:

```bash
# 1. Create folder structure
mkdir -p modules/mymodule/{components,hooks,services,types}

# 2. Create the required files
touch modules/mymodule/index.ts
touch modules/mymodule/components/index.ts
touch modules/mymodule/hooks/index.ts
touch modules/mymodule/services/mymodule.service.ts
touch modules/mymodule/services/schema.ts
touch modules/mymodule/services/keys.ts
touch modules/mymodule/types/index.ts
```

**`services/keys.ts`** — React Query key factory:
```ts
export const mymoduleKeys = {
  all:    () => ['mymodule'] as const,
  lists:  () => [...mymoduleKeys.all(), 'list'] as const,
  detail: (id: number) => [...mymoduleKeys.all(), 'detail', id] as const,
};
```

**`services/mymodule.service.ts`** — raw API calls:
```ts
import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type MyResource = components['schemas']['MyResource'];

export async function listMyResources() {
  const { data, error } = await api.GET('/api/myresource/');
  if (error) throw error;
  return data;
}
```

**`hooks/useMyResources.ts`** — React Query wrapper:
```ts
import { useQuery } from '@tanstack/react-query';
import { listMyResources } from '../services/mymodule.service';
import { mymoduleKeys } from '../services/keys';

export function useMyResources() {
  return useQuery({
    queryKey: mymoduleKeys.lists(),
    queryFn:  listMyResources,
  });
}
```

**`index.ts`** — public surface (only export what other modules need):
```ts
export { MyList } from './components';
export type { MyResource } from './services/mymodule.service';
```

---

## How to add a new page

1. Create `app/(portal)/mypage/page.tsx`:

```tsx
import { ProtectedRoute } from '@/core/auth';
import { MyListComponent } from '@/modules/mymodule';

export default function MyPageRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <MyListComponent />
    </ProtectedRoute>
  );
}
```

2. Add the route to `core/config/routes.ts`:

```ts
mypage: '/mypage',
```

3. Add a nav item to `modules/common/components/Sidebar.tsx`:

```ts
{ labelKey: 'mypage', href: ROUTES.mypage, icon: SomeIcon, roles: ['admin'] },
```

4. Add i18n keys to both `messages/en.json` and `messages/kh.json`:

```json
"nav": {
  "mypage": "My Page"
}
```

5. Create `app/(portal)/mypage/loading.tsx` (2-line skeleton boundary):

```tsx
export default function Loading() { return null; }
```

---

## How to add a new API endpoint call

1. Ensure `_contract/api.types.ts` has the endpoint (run `pnpm contract:sync` if needed)
2. Add the function to the module's `services/<name>.service.ts`:

```ts
export async function createThing(body: ThingCreate): Promise<ThingPublic> {
  const { data, error } = await api.POST('/api/things/', { body });
  if (error) throw error;
  return data;
}
```

3. Add a mutation hook in `hooks/useCreateThing.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createThing } from '../services/things.service';
import { thingKeys } from '../services/keys';

export function useCreateThing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createThing,
    onSettled: () => qc.invalidateQueries({ queryKey: thingKeys.lists() }),
  });
}
```

---

## How to add a new i18n string

**Always add to both files at the same time.**

1. Add to `messages/en.json`:
```json
"mymodule": {
  "newKey": "My new string"
}
```

2. Add to `messages/kh.json`:
```json
"mymodule": {
  "newKey": "ខ្សែអក្សរថ្មី"
}
```

3. Use in a component:
```tsx
const t = useTranslations('mymodule');
return <span>{t('newKey')}</span>;
```

Run `pnpm test:run` — the i18n parity test (`core/lib/__tests__/i18n-parity.test.ts`) will fail if the counts don't match.

---

## How to add a new shared UI component

Add to `shared/ui/` and export from `shared/ui/index.ts` (or create one if it doesn't exist):

```ts
// shared/ui/MyWidget.tsx
export function MyWidget({ ... }) { ... }

// shared/ui/index.ts
export { MyWidget } from './MyWidget';
```

Then import in any module:
```ts
import { MyWidget } from '@/shared/ui';
```

---

## Common gotchas

| Gotcha | The right way |
|---|---|
| Fetching data in `useEffect` | Use a React Query `useQuery` hook instead |
| Hardcoding a string in JSX | Add an i18n key to both message files |
| Importing from `modules/events/components/EventForm` | Import from `@/modules/events` (barrel only) |
| Using `new Date()` for age calculation | Use `computeAgeAtEvent(dob, event.start_date)` |
| Patching `status` field directly | Use the FSM endpoint (`/publish`, `/approve`, etc.) |
| Showing data before loading completes | Wrap in `<QueryBoundary>` with skeleton fallback |
| Storing tokens in `localStorage` | Never — tokens live in HttpOnly cookies only |
| Adding `any` to fix a TypeScript error | Fix the type instead; `any` is banned |
| Calling a service function from a component | Call it through a hook |
| Forgetting `aria-label` on icon-only buttons | Every icon button needs `aria-label={tc('action')}` |
