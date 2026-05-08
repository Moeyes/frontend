# CONVENTIONS.md — Frontend Rebuild Rules

> Every module rebuild (Prompt 6) must follow these rules exactly.  
> Deviations require explicit justification documented in `_rebuild/SHARED_CHANGES.md`.  
> Cross-reference: `RED_LINES.md` for hard stops · `SCENARIOS.md` for what to build · `SECURITY_CHECKLIST.md` for done criteria.

---

## 1. Folder Shape Per Module

```
modules/<domain>/
  components/           PascalCase .tsx files
    <Domain>List.tsx
    <Domain>Form.tsx
    <Domain>Detail.tsx
    index.ts            barrel — re-exports everything in this folder
  hooks/
    use<Domain>List.ts
    use<Domain>Create.ts
    use<Domain>Update.ts
    use<Domain>Delete.ts
    index.ts            barrel
  services/
    <domain>.service.ts   raw API calls, typed via _contract/api.types.ts
    schema.ts             Zod schemas for all forms in this module
    keys.ts               React Query key factory
  types/
    index.ts              domain-local types ONLY (UI state, form shapes, etc.)
                          Never redeclare backend response types here.
  index.ts                public surface — only what other modules import
```

### Rules
- A module **only exports** from its `index.ts`. Other modules import from `modules/<domain>` — never from a sub-path like `modules/<domain>/components/EventForm`.
- `types/index.ts` holds UI-only types (e.g., `EventStatusBadgeVariant`, `RegistrationStep`). **Never** define backend response shapes here — those come from `_contract/api.types.ts`.
- `services/<domain>.service.ts` holds raw `client.get/post/patch/delete` calls. No React state, no hooks, no side effects.
- `hooks/` wraps services with React Query. Components never call services directly.

### Concrete example — `events` module

```
modules/events/
  components/
    EventList.tsx
    EventForm.tsx
    EventDetail.tsx
    EventSportManager.tsx
    EventSportOrgManager.tsx
    index.ts
  hooks/
    useEvents.ts          useQuery for list
    useEvent.ts           useQuery for single
    useCreateEvent.ts     useMutation
    useUpdateEvent.ts     useMutation
    useDeleteEvent.ts     useMutation
    useAddSport.ts        useMutation
    useRemoveSport.ts     useMutation
    index.ts
  services/
    events.service.ts
    schema.ts
    keys.ts
  types/
    index.ts
  index.ts
```

---

## 2. API Layer Rules

### Client usage pattern

`core/api/client.ts` exports a typed fetch wrapper built on top of `openapi-fetch` (or equivalent) using `_contract/api.types.ts`:

```ts
import type { paths } from '@/_contract/api.types';
import createClient from 'openapi-fetch';

export const client = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
```

All API calls go through this client. **Never use raw `fetch()` for backend calls.**

### Service pattern

```ts
// modules/events/services/events.service.ts
import { client } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type EventPublic = components['schemas']['EventPublic'];
export type EventCreate = components['schemas']['EventCreate'];

export async function listEvents(params?: { skip?: number; limit?: number; name?: string }) {
  const { data, error } = await client.GET('/api/events/', { params: { query: params } });
  if (error) throw error;
  return data;
}

export async function createEvent(body: EventCreate) {
  const { data, error } = await client.POST('/api/events/', { body });
  if (error) throw error;
  return data;
}

export async function updateEvent(event_id: number, body: components['schemas']['EventUpdate']) {
  const { data, error } = await client.PATCH('/api/events/{event_id}', {
    params: { path: { event_id } },
    body,
  });
  if (error) throw error;
  return data;
}
```

**Rules:**
- Import backend types from `@/_contract/api.types` — never hand-write them (Red Line #2).
- Service functions return data or throw. No React state inside services.
- `client.ts` handles: Authorization header injection, Idempotency-Key on POST/PATCH/PUT, 401 refresh, 403 redirect.

### React Query key factory

```ts
// modules/events/services/keys.ts
export const eventKeys = {
  all:    () => ['events'] as const,
  lists:  () => [...eventKeys.all(), 'list'] as const,
  list:   (params: object) => [...eventKeys.lists(), params] as const,
  detail: (id: number) => [...eventKeys.all(), 'detail', id] as const,
} as const;
```

Always use the key factory — never inline string arrays in `useQuery` calls.

### Hook pattern — query

```ts
// modules/events/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { listEvents } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useEvents(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: eventKeys.list(params ?? {}),
    queryFn: () => listEvents(params),
  });
}
```

### Hook pattern — mutation (optimistic update)

```ts
// modules/events/hooks/useCreateEvent.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, type EventCreate } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useCreateEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: EventCreate) => createEvent(body),

    onMutate: async (newEvent) => {
      await qc.cancelQueries({ queryKey: eventKeys.lists() });
      const previous = qc.getQueryData(eventKeys.list({}));
      // optimistic insert — omit if list shape is complex
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(eventKeys.list({}), context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
```

**Rules:**
- Every mutation: `onMutate` (optimistic) + `onError` (rollback) + `onSettled` (invalidate).
- `onSettled` always invalidates the relevant list key.
- Idempotency-Key is injected automatically by `client.ts` — do not add it manually in hooks.

### RBAC scoping in queries (Red Line #6)

```ts
// WRONG — leaks all orgs' data to federation user
const { data } = useEvents();

// CORRECT — scoped to user's organization
const { user } = useAuth();
const { data } = useQuery({
  queryKey: eventKeys.list({ organization_id: user.organization_id }),
  queryFn: () => listRegistrations({ role: 'athlete', organization_id: user.organization_id }),
  enabled: !!user.organization_id,
});
```

For Admin (`role = 'admin'`): no scoping params needed.  
For Federation (`role = 'user1'`) and Organization (`role = 'user2'`): always pass `organization_id` from `useAuth()`.

---

## 3. Form Rules

### Stack
- **React Hook Form** + **zodResolver** for all forms
- Zod schema lives in `modules/<domain>/services/schema.ts` — never inline in components
- All form fields use `shared/form/*` components — never bare `<input>`, `<select>`, `<textarea>`

### Schema pattern

```ts
// modules/events/services/schema.ts
import { z } from 'zod';

export const eventCreateSchema = z.object({
  name_kh: z.string().min(1, { message: 'events.form.nameRequired' }),
  type: z.enum(['កីឡាជាតិ', 'កីឡាឧត្តមសិក្សា...', ...] as const),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  open_register_date: z.string().optional(),
  close_register_date: z.string().optional(),
}).refine(
  (d) => !d.start_date || !d.end_date || d.start_date <= d.end_date,
  { message: 'events.form.dateRangeInvalid', path: ['end_date'] }
);

export type EventCreateFormValues = z.infer<typeof eventCreateSchema>;
```

Error message values in Zod schemas are **i18n keys**, not literal strings. The `shared/form/FormField` component calls `t(error.message)` to resolve them.

### Form component pattern

```tsx
// modules/events/components/EventForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInputField, SelectField, DateField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { eventCreateSchema, type EventCreateFormValues } from '../services/schema';
import { useCreateEvent } from '../hooks';

export function EventForm() {
  const { mutate, isPending } = useCreateEvent();

  const form = useForm<EventCreateFormValues>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: { name_kh: '', type: undefined },
  });

  const onSubmit = (values: EventCreateFormValues) => mutate(values);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextInputField control={form.control} name="name_kh" labelKey="events.form.namekh" />
      <SelectField control={form.control} name="type" labelKey="events.form.type" options={...} />
      <Button type="submit" disabled={isPending} loading={isPending}>
        {t('common.save')}
      </Button>
    </form>
  );
}
```

**Rules:**
- Submit button: `disabled={isPending}`, shows spinner while `isPending`.
- Errors shown inline under each field via `shared/form/FormField` — never a summary box.
- Server-side RFC7807 errors mapped to fields in `onError`:

```ts
onError: (err) => {
  // RFC7807: { detail: [{ loc: ['body', 'name_kh'], msg: '...' }] }
  if (err?.detail && Array.isArray(err.detail)) {
    err.detail.forEach(({ loc, msg }) => {
      const field = loc[loc.length - 1] as keyof EventCreateFormValues;
      form.setError(field, { message: msg });
    });
  }
}
```

---

## 4. List / Table Rules

### Component pattern

```tsx
// modules/events/components/EventList.tsx
'use client';
import { DataTable } from '@/shared/ui/DataTable';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { PageEmptyState } from '@/shared/ui/page/PageEmptyState';
import { useEvents } from '../hooks';
import { columns } from './columns'; // ColumnDef[] with Khmer headers

export function EventList() {
  const query = useEvents({ skip: 0, limit: 20 });

  return (
    <QueryBoundary query={query} empty={<PageEmptyState messageKey="events.empty" ctaKey="events.create" />}>
      {(data) => <DataTable columns={columns} data={data.data ?? []} />}
    </QueryBoundary>
  );
}
```

### Pagination

- Server-side pagination: pass `skip`/`limit` (or `page`/`limit`) from **URL search params**.
- Use `useSearchParams()` + `useRouter()` from Next.js to read/update pagination state.
- Never store pagination in component state — it lives in the URL.

```ts
// Reading pagination from URL
const searchParams = useSearchParams();
const skip = Number(searchParams.get('skip') ?? 0);
const limit = Number(searchParams.get('limit') ?? 20);
```

### Column definition

```ts
// Khmer headers always come from i18n
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import type { EventPublic } from '../services/events.service';

export function useEventColumns(): ColumnDef<EventPublic>[] {
  const t = useTranslations();
  return [
    { accessorKey: 'name_kh', header: t('events.columns.name') },
    { accessorKey: 'type', header: t('events.columns.type') },
    { accessorKey: 'start_date', header: t('events.columns.startDate'),
      cell: ({ getValue }) => formatKhmerDate(getValue<string>()) },
  ];
}
```

**Rules:**
- Column headers always from `messages/kh.json` (via `t('key')`). Never hardcoded strings.
- `QueryBoundary` wraps every list — handles loading skeleton + error state + empty state.
- Empty state always has a CTA (e.g., "Create first event").

---

## 5. Page Shell Rules

### Page file structure

```tsx
// app/(portal)/events/page.tsx
import { PageShell } from '@/shared/layout/PageShell';
import { PageHeader } from '@/shared/ui/page/PageHeader';
import { EventList } from '@/modules/events';

export default function EventsPage() {
  return (
    <PageShell>
      <PageHeader titleKey="events.title" />
      <EventList />
    </PageShell>
  );
}
```

```tsx
// app/(portal)/events/loading.tsx
import { PageLoadingState } from '@/shared/ui/page/PageLoadingState';
export default function Loading() { return <PageLoadingState />; }
```

```tsx
// app/(portal)/events/error.tsx
'use client';
import { PageErrorState } from '@/shared/ui/page/PageErrorState';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorState error={error} onRetry={reset} />;
}
```

**Rules:**
- Every `app/(portal)/<route>/` must have `page.tsx` + `loading.tsx` + `error.tsx`.
- `loading.tsx` shows skeleton — no spinner-only state at page level.
- `error.tsx` must have a **retry** button that calls `reset()`.
- Page titles always via `PageHeader` with a `titleKey` prop — never hardcoded.

---

## 6. Auth and RBAC Rules

### Route protection

```tsx
// app/(portal)/events/page.tsx
import { ProtectedRoute } from '@/core/auth';

export default function EventsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <PageShell>...</PageShell>
    </ProtectedRoute>
  );
}
```

`ProtectedRoute` reads the current user from `AuthContext`. If `user.role` is not in `requiredRoles`, it redirects to `/unauthorized`.

### Component-level gating

```tsx
import { useRequireRole } from '@/core/auth';

function DeleteButton({ eventId }: { eventId: number }) {
  const canDelete = useRequireRole(['admin']);
  if (!canDelete) return null;
  return <Button variant="destructive">...</Button>;
}
```

### Auth context shape

```ts
interface AuthUser {
  id: string;
  role: 'admin' | 'user1' | 'user2' | 'guest';
  organization_id: number | null;
  kh_family_name: string;
  kh_given_name: string;
  en_family_name: string;
  en_given_name: string;
  is_active: boolean;
}
```

Source: `GET /api/auth/session/{user_id}` → `components['schemas']['UserPublic']`

### Token storage

- Tokens live in **HttpOnly cookies** only.
- `app/api/auth/login/route.ts` calls the backend, receives `TokenPair`, sets cookies.
- `app/api/auth/refresh/route.ts` rotates the token.
- `app/api/auth/logout/route.ts` clears cookies.
- The frontend JS layer **never reads tokens** — cookies are attached automatically by the browser.

### RBAC role mapping (from `UserRole` enum in backend)

| Backend value | Platform role | Sees |
|---------------|--------------|------|
| `admin` | Admin / Super Admin | Everything |
| `user1` | Federation | Own surveys + own registrations (scoped by `organization_id`) |
| `user2` | Organization | Own organizers (scoped by `organization_id`) |
| `guest` | Organizer | Read-only own profile |

---

## 7. i18n Rules

### Key format

```
<module>.<area>.<label>
```

Examples:
- `events.form.nameKh`
- `events.columns.startDate`
- `common.save`
- `common.cancel`
- `registration.steps.personal`

### Rule

Every string visible to the user must come from `t('key')`. Zero exceptions.

```tsx
// WRONG
<h1>Event List</h1>
<button>Submit</button>

// CORRECT
<h1>{t('events.title')}</h1>
<button>{t('common.submit')}</button>
```

### Adding keys

Add to **both** `messages/en.json` AND `messages/kh.json` in the same commit. Khmer is canonical — the Khmer text must be correct. English may be approximate.

```json
// messages/kh.json (canonical)
{
  "events": {
    "title": "ព្រឹត្តិការណ៍",
    "form": {
      "nameKh": "ឈ្មោះព្រឹត្តិការណ៍ (ខ្មែរ)",
      "nameRequired": "ត្រូវការឈ្មោះ"
    }
  }
}

// messages/en.json (secondary)
{
  "events": {
    "title": "Events",
    "form": {
      "nameKh": "Event Name (Khmer)",
      "nameRequired": "Name is required"
    }
  }
}
```

Zod error messages are i18n keys (e.g., `'events.form.nameRequired'`), resolved by the form field component.

---

## 8. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React component | PascalCase | `EventList`, `EventForm` |
| Hook | `use` + PascalCase | `useEvents`, `useCreateEvent` |
| Service function | camelCase | `listEvents`, `createEvent` |
| Service file | `<domain>.service.ts` | `events.service.ts` |
| Type (local) | PascalCase, no `I` prefix | `EventStatusBadge`, `RegistrationStep` |
| Zod schema | `<entity><action>Schema` | `eventCreateSchema`, `loginSchema` |
| React Query keys file | `keys.ts` | always `keys.ts` |
| File name | Matches default export name | `EventList.tsx` exports `EventList` |
| Test file | `<name>.test.ts(x)` | `EventList.test.tsx` |

---

## 9. State Machine Rules

### Problem context

The master plan defines an FSM: `DRAFT → SUBMITTED → APPROVED / REJECTED / FLAGGED → REVISION_REQUESTED`. However, as of the contract freeze, the backend has **no status fields or transition endpoints** for surveys or events. The frontend follows this pattern:

**While backend FSM is missing:** Show read-only status derived from data (e.g., date-based event status). Disable transition action buttons with tooltip noting backend gap.

**When backend adds FSM:** Wire to dedicated endpoints. Never PATCH a `status` field.

### Status definition

```ts
// modules/submissions/types/index.ts
export type SurveyStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED'; // derived client-side from dates
```

### Status badge color map

```ts
// shared/ui/Badge.tsx variant map
const surveyStatusVariants: Record<SurveyStatus, BadgeVariant> = {
  PENDING: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  FLAGGED: 'warning',
};
```

### Transition mutations (for when backend adds FSM)

```ts
// WRONG — patches status field directly (Red Line #5)
await client.PATCH('/api/participation-per-sport/{id}', { body: { status: 'APPROVED' } });

// CORRECT — dedicated endpoint (once backend adds it)
await client.POST('/api/participation-per-sport/{id}/approve');
```

---

## 10. Definition of Done for a Module Rebuild

See `SECURITY_CHECKLIST.md` for the full self-audit. Summary:

| Check | Requirement |
|-------|------------|
| TypeScript | `pnpm tsc --noEmit` clean across entire repo |
| Lint | `pnpm lint` clean across entire repo |
| Build | `pnpm build` succeeds |
| Scenarios | All relevant SCENARIOS.md scenarios: PASS / NEEDS-BACKEND-FIX / FAIL documented |
| i18n | Every string in both `en.json` and `kh.json` |
| Loading | Every list has skeleton loading state |
| Empty | Every list has `PageEmptyState` with CTA |
| Error | Every list/page has recoverable error + retry |
| RBAC | `ProtectedRoute` on every page; scoping params on every federation/org list query |
| Forms | Inline validation, spinner on submit, server error mapping |
| Mutations | Optimistic update + onError rollback + onSettled invalidation |
| Contract | No hand-written backend types — all from `_contract/api.types.ts` |
| Tokens | No localStorage — HttpOnly cookies only |
| Status | No `status` in PATCH body — FSM via dedicated endpoints |
| Idempotency | All mutations through `client.ts` (auto-injects key) |
| Console | No `console.log` / `console.debug` / `debugger` in committed code |

---

## Quick Reference — Anti-Patterns

| Anti-pattern | Correct pattern |
|-------------|----------------|
| `import { createEvent } from '../services/events.service'` inside a component | Use `useCreateEvent()` hook |
| `interface EventResponse { id: number; name: string; }` in `types/` | Import from `components['schemas']['EventPublic']` |
| `const age = differenceInYears(new Date(), dob)` | `computeAgeAtEvent(dob, event.start_date)` |
| `localStorage.setItem('token', data.access_token)` | Route handler sets HttpOnly cookie |
| `body: { status: 'APPROVED' }` in a PATCH mutation | `POST /api/.../approve` endpoint |
| `t` calls without adding key to both JSON files | Add to en.json AND kh.json |
| `<ColumnDef header="ព្រឹត្តិការណ៍" />` | `header: t('events.columns.name')` |
| `useQuery(['events'], listEvents)` without scoping | `useQuery(eventKeys.list({org_id}), () => listEvents({org_id}))` |
| `fetch('/api/...')` directly | `client.GET('/api/...')` |
