# Rebuild Conventions

Every module rebuild follows these rules exactly. Deviations must be documented in `_rebuild/SHARED_CHANGES.md` with reason.

---

## 1. Folder shape per module

```
modules/<domain>/
  components/        PascalCase .tsx files + index.ts barrel
  hooks/             use<X>.ts files + index.ts barrel
  services/          api call functions (camelCase named exports) + schema.ts (Zod)
  types/             domain-local types only — never duplicate _contract/ types
  index.ts           public surface: only what other modules import
```

Rules:
- **Never import across modules directly** — only via each module's `index.ts`
- Backend types come from `_contract/api.types.ts` only
- Domain-local types (UI state, form values, derived shapes) live in `modules/<domain>/types/`
- No `default` exports from modules — named exports only

---

## 2. API layer rules

### Client
All HTTP goes through `core/api/client.ts`. Components and hooks never call `fetch` or `axios` directly.

```ts
// core/api/client.ts — interface
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export function apiClient<T>(
  method: ApiMethod,
  path: string,
  options?: { body?: unknown; params?: Record<string, string> }
): Promise<T>
```

- Auto-injects `Authorization: Bearer <token>` from AuthContext (server-side: reads cookie)
- Auto-injects `Idempotency-Key: <uuid-v4>` on POST / PUT / PATCH
- On 401: attempts token refresh via `POST /api/auth/refresh`, retries once
- On 403: redirects to `/unauthorized`
- Parses RFC 7807 error bodies: `{ type, title, status, detail, instance }`
- Logs request + response in `process.env.NODE_ENV === 'development'`

### Services
```ts
// modules/<domain>/services/<domain>.service.ts
import type { paths } from '@/_contract/api.types'
import { apiClient } from '@/core/api/client'

export async function listEvents(params?: { page?: number; limit?: number }) {
  return apiClient<paths['/api/events/']['get']['responses']['200']['content']['application/json']>(
    'GET', '/api/events/', { params }
  )
}
```

### React Query keys
Each module defines a typed query key factory:
```ts
// modules/<domain>/services/keys.ts
export const eventKeys = {
  all:    () => ['events'] as const,
  lists:  () => [...eventKeys.all(), 'list'] as const,
  list:   (params: object) => [...eventKeys.lists(), params] as const,
  detail: (id: number) => [...eventKeys.all(), 'detail', id] as const,
}
```

### Mutations — standard pattern
```ts
const mutation = useMutation({
  mutationFn: createEvent,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: eventKeys.lists() })
    const previous = queryClient.getQueryData(eventKeys.lists())
    queryClient.setQueryData(eventKeys.lists(), (old) => /* optimistic update */)
    return { previous }
  },
  onError: (_err, _vars, ctx) => {
    queryClient.setQueryData(eventKeys.lists(), ctx?.previous) // rollback
    toast.error(t('events.error.create_failed'))
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  },
})
```

---

## 3. Form rules

- **Library:** React Hook Form + `@hookform/resolvers/zod`
- **Schema location:** `modules/<domain>/services/schema.ts`
- **Fields:** Always use `shared/form/*` — never bare `<input>`, `<select>`, `<textarea>`
- **Error display:** Inline under each field via `FormField` component
- **Submit button:** Disabled while `mutation.isPending`; spinner inside button

```ts
// modules/<domain>/services/schema.ts
import { z } from 'zod'

export const eventCreateSchema = z.object({
  name_kh: z.string().min(1, { message: 'events.validation.name_required' }),
  type: z.enum(['...', '...']),
  // ...
})
export type EventCreateForm = z.infer<typeof eventCreateSchema>
```

```tsx
// Usage in component
const form = useForm<EventCreateForm>({
  resolver: zodResolver(eventCreateSchema),
  defaultValues: { name_kh: '', ... },
})
```

---

## 4. List / table rules

- All tables use `shared/ui/DataTable.tsx` (TanStack Table v8)
- All lists wrapped in `<QueryBoundary>` from `shared/ui/QueryBoundary.tsx`
- Server-side pagination and filtering via URL search params (use `useSearchParams`)
- Column headers from `messages/kh.json` via `t('key')`
- Default page size: `20` (from `core/config/constants.ts`)

```tsx
// Standard list pattern
<QueryBoundary
  isLoading={isLoading}
  isEmpty={data?.data.length === 0}
  isError={isError}
  onRetry={refetch}
  emptyMessage={t('events.list.empty')}
>
  <DataTable columns={columns} data={data.data} pagination={...} />
</QueryBoundary>
```

---

## 5. Page shell rules

Every page follows this structure:

```
app/(portal)/<route>/
  page.tsx          — main page (use PageShell + PageHeader)
  loading.tsx       — shows <PageLoadingState />
  error.tsx         — shows recoverable error UI with retry button
```

```tsx
// page.tsx pattern
export default function EventsPage() {
  return (
    <PageShell>
      <PageHeader title={t('events.list.title')} action={<CreateButton />} />
      <ContentPanel>
        <EventList />
      </ContentPanel>
    </PageShell>
  )
}
```

```tsx
// loading.tsx
export default function Loading() {
  return <PageLoadingState />
}
```

```tsx
// error.tsx
'use client'
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorState message={error.message} onRetry={reset} />
}
```

---

## 6. Auth and RBAC rules

```tsx
// Protect a page
<ProtectedRoute requiredRoles={['admin', 'super_admin']}>
  <EventsPage />
</ProtectedRoute>
```

```ts
// Component-level gating
const { hasRole } = useRequireRole(['admin'])
if (!hasRole) return null
```

**Federation / Organization scoping:**
```ts
const { organizationId } = useAuth()

// Every list query for scoped resources
const { data } = useQuery({
  queryKey: registrationKeys.list({ org_id: organizationId }),
  queryFn: () => listRegistrations({ org_id: organizationId }),
  enabled: !!organizationId,
})
```

**Role strings (from backend):** `super_admin` | `admin` | `federation` | `organization` | `organizer`

---

## 7. i18n rules

- Zero hardcoded strings in JSX — always `t('key')`
- Every new key added to BOTH `messages/en.json` AND `messages/kh.json`
- Khmer is canonical — write Khmer value first, English is the fallback
- Key format: `<module>.<section>.<item>` e.g. `events.create.title`
- Use `useTranslations('events')` hook, not the full key every time

```tsx
// Correct
const t = useTranslations('events')
<h1>{t('create.title')}</h1>

// Wrong
<h1>Create Event</h1>
```

---

## 8. Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Component file | PascalCase | `EventCreateForm.tsx` |
| Component export | PascalCase named | `export function EventCreateForm()` |
| Hook file | camelCase with `use` prefix | `useEventList.ts` |
| Hook export | camelCase named | `export function useEventList()` |
| Service function | camelCase named | `export async function createEvent()` |
| Type / interface | PascalCase, no `I` prefix | `EventCreateForm`, `ApiError` |
| Type file | camelCase | `event.types.ts` |
| Schema file | `schema.ts` per module | `modules/events/services/schema.ts` |
| Query key factory | `<domain>Keys` | `eventKeys` |
| CSS / Tailwind | utility classes only — no custom CSS classes unless absolutely necessary | |

File name must match the primary export name exactly.

---

## 9. State machine rules

For any domain with status FSM (surveys, submissions):

```ts
// modules/<domain>/types/status.ts
export const SUBMISSION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
} as const
export type SubmissionStatus = keyof typeof SUBMISSION_STATUS

export const STATUS_COLOR_MAP: Record<SubmissionStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  FLAGGED: 'bg-yellow-100 text-yellow-700',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
}
```

Rules:
- Client **never** changes status directly in local state
- All status changes go through a mutation that calls the backend
- Optimistic update rolls back on error
- Status displayed via `<Badge className={STATUS_COLOR_MAP[status]}>` from `shared/ui/Badge.tsx`

---

## 10. Definition of Done for a module rebuild

A module is done when ALL of the following pass:

- [ ] All scenarios from `SCENARIOS.md` that touch this module pass manually
- [ ] `pnpm tsc --noEmit` — zero type errors for this module's files
- [ ] `pnpm lint` — zero lint errors for this module's files
- [ ] `pnpm build` — build succeeds
- [ ] All strings in `messages/en.json` and `messages/kh.json` — no hardcoded strings
- [ ] Loading + empty + error states implemented on every list component
- [ ] Form validation errors shown inline under every field
- [ ] RBAC enforced on routes and conditional UI elements
- [ ] Optimistic updates with rollback on all mutations
- [ ] No `console.error` or `console.warn` in normal flow
