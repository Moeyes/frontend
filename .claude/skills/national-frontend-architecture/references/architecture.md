# Architecture Reference

Ports & Adapters · folder structure · component/hook/form/state rules · performance · naming.
Read this for any structural frontend work. The [SKILL.md](../SKILL.md) golden rules override anything here on conflict.

## Table of contents

1. [Ports & Adapters pattern](#1-ports--adapters-pattern)
2. [Folder structure — current vs target](#2-folder-structure--current-vs-target)
3. [Module & component limits](#3-module--component-limits)
4. [Hook consolidation](#4-hook-consolidation)
5. [Form rules](#5-form-rules)
6. [State rules](#6-state-rules)
7. [Performance rules](#7-performance-rules)
8. [Naming conventions](#8-naming-conventions)

---

## 1. Ports & Adapters pattern

Every module's data layer uses Ports & Adapters (Hexagonal Architecture). This is also the
**security boundary** — see `security.md`. Keeping all I/O behind a port means validation,
auth headers, audit hooks, and PII handling have exactly one place to live per module.

| Term              | Meaning                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Port**          | A TS `interface` declaring *what* the module needs — not how it is fetched         |
| **Adapter**       | A concrete object implementing the port (HTTP, mock, etc.)                         |
| **Application core** | Hooks/stores that depend only on ports, never on adapters or `fetch` directly   |

### Layer flow

```
Next.js Page (Server)
  → Module Component ("use client")
    → Hook (TanStack Query, depends on ports only)
      → Port (interface)  e.g. IEventsRepository
        → Adapter (concrete)  eventsHttpAdapter (prod) / eventsMockAdapter (tests)
```

> **Rule:** Hooks import from `adapters/index.ts`. Components import from `hooks/`.
> No layer skips a level and imports from a lower one directly.

### Port example

```typescript
// modules/events/ports/IEventsRepository.ts
export interface IEventsRepository {
  getAll(params?: EventListParams): Promise<Event[]>;
  getById(id: string): Promise<EventDetail>;
  create(dto: CreateEventDTO): Promise<Event>;
  update(id: string, dto: UpdateEventDTO): Promise<Event>;
  delete(id: string): Promise<void>;
  addSport(eventId: string, sportId: string): Promise<void>;
  removeSport(eventId: string, sportId: string): Promise<void>;
  updatePhase(eventId: string, phase: EventPhase): Promise<void>;
}
```

### HTTP adapter example

The adapter is where every response is **parsed with Zod** before it leaves the data layer
(see `security.md` §"Validate at the boundary"). Never return raw `apiClient` output untyped.

```typescript
// modules/events/adapters/eventsHttpAdapter.ts
import type { IEventsRepository } from '../ports/IEventsRepository';
import { apiClient } from '@/core/api/client';
import { eventSchema, eventDetailSchema } from '../schema/events.schema';

export const eventsHttpAdapter: IEventsRepository = {
  getAll: async (params) =>
    eventSchema.array().parse(await apiClient.get('/events', { params })),
  getById: async (id) =>
    eventDetailSchema.parse(await apiClient.get(`/events/${id}`)),
  create: async (dto) => eventSchema.parse(await apiClient.post('/events', dto)),
  update: async (id, dto) => eventSchema.parse(await apiClient.put(`/events/${id}`, dto)),
  delete: (id) => apiClient.delete(`/events/${id}`),
  addSport: (eventId, sportId) => apiClient.post(`/events/${eventId}/sports/${sportId}`),
  removeSport: (eventId, sportId) => apiClient.delete(`/events/${eventId}/sports/${sportId}`),
  updatePhase: (eventId, phase) => apiClient.patch(`/events/${eventId}/phase`, { phase }),
};
```

### Single wiring file

```typescript
// modules/events/adapters/index.ts — change one line to switch all data behaviour.
import { eventsHttpAdapter } from './eventsHttpAdapter';
// import { eventsMockAdapter } from './eventsMockAdapter'  ← swap for tests
export const eventsRepository = eventsHttpAdapter;
```

### Hook uses the port — never a concrete adapter

```typescript
// modules/events/hooks/useEvents.ts ("use client")
import { eventsRepository } from '../adapters';
import { QueryKeys } from '@/core/api/queryKeys';

export function useEvents(params?: EventListParams) {
  return useQuery({
    queryKey: QueryKeys.EVENTS.list(params),
    queryFn: () => eventsRepository.getAll(params),
  });
}
```

### Mock adapter for tests

```typescript
// modules/events/adapters/eventsMockAdapter.ts
import type { IEventsRepository } from '../ports/IEventsRepository';
const mockEvents: Event[] = [
  { id: '1', name: 'National Games 2025', phase: 'registration' },
  { id: '2', name: 'Regional Tournament', phase: 'active' },
];
export const eventsMockAdapter: IEventsRepository = {
  getAll: async () => mockEvents,
  getById: async (id) => mockEvents.find((e) => e.id === id)!,
  create: async (dto) => ({ id: crypto.randomUUID(), ...dto }),
  update: async (id, dto) => ({ id, ...dto }),
  delete: async () => undefined,
  addSport: async () => undefined,
  removeSport: async () => undefined,
  updatePhase: async () => undefined,
};
```

Activate it by changing the one line in `adapters/index.ts`. Hooks, components, and pages
do not change — only the registered adapter does. Mock adapters must use **synthetic data
only**; never seed them with real citizen/athlete records.

---

## 2. Folder structure — current vs target

### Current (being phased out)

```
modules/<module>/
  components/   ← page + section + UI mixed flat
  hooks/        ← one file per hook (too many)
  services/     ← API calls + Zod schemas mixed
  types/
  index.ts
```

### Target (apply when touching any module)

```
modules/<module>/
  ports/                ← IXxxRepository.ts (interface / contract)
  adapters/             ← xxxHttpAdapter.ts, xxxMockAdapter.ts, index.ts
  api/                  ← RENAMED from services/: raw fetch fns (only adapters call these)
  schema/               ← MOVED from services/schema.ts: Zod schemas + enum option arrays
  mappers/              ← formData → DTO, API response → domain model
  utils/                ← getDefaultValues(), formatters, calculators
  hooks/
    useXxx.ts           ← CONSOLIDATED queries
    useMutateXxx.ts     ← CONSOLIDATED mutations
  store/                ← Zustand store for filter/sort/pagination UI state
  components/
    page-sections/      ← XxxHeader, XxxToolbar, XxxContent, XxxModals
    form/               ← XxxForm.tsx shell + sections/ subfolder
    ui/                 ← RHF wrappers local to this module
  types/
  index.ts
```

### Shared & core (complete, don't reorganize without discussion)

```
shared/
  form/    ← RHF wrappers (TextInputField, SelectField, …) — use and expand
  hooks/   ← cross-module hooks
  ui/      ← design system primitives + page scaffold
  layout/  ← PageShell, TopBar
  utils/   ← cn(), apiError, helpers
core/
  api/     ← apiClient, queryKeys
  auth/    ← AuthContext, auth hooks, auth service  (do not touch without instruction)
  config/  ← constants, routes
  lib/     ← cloudinary, reference-data, dashboard service
```

---

## 3. Module & component limits

| Component file metric     | Limit |
| ------------------------- | ----- |
| Lines per component       | 200   |
| Props accepted            | 10    |
| `useState` calls          | 4     |
| `useQuery` calls          | 1     |

| Page component metric | Limit |
| --------------------- | ----- |
| Lines                 | 150   |
| `useState` calls      | 6 (one modal-state object, not one per modal) |
| Handler functions     | 5     |
| `useEffect` calls     | 2     |

**Page components MUST NOT contain:** `fetch`/`apiClient`, DTO mapping, toast calls,
`localStorage`, complex conditional rendering, or filter/sort/pagination state.

**Page components MUST contain only:** composition of page-sections, one modal-state object,
navigation via `useRouter`.

### Reference page pattern

```tsx
// modules/events/components/page-sections/EventsPage.tsx
'use client';
import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useEventsFiltersStore } from '../../store/eventsFilters.store';
import { EventsHeader } from './EventsHeader';
import { EventsToolbar } from './EventsToolbar';
import { EventsContent } from './EventsContent';
import { EventsModals } from './EventsModals';

interface EventsModalState {
  isFormOpen: boolean;
  isDeleteOpen: boolean;
  selected: Event | undefined;
}
const initialModal: EventsModalState = { isFormOpen: false, isDeleteOpen: false, selected: undefined };

export function EventsPage() {
  const filters = useEventsFiltersStore();
  const { data, isLoading } = useEvents(filters.getQueryParams());
  const [modal, setModal] = useState<EventsModalState>(initialModal);
  return (
    <main className="space-y-6">
      <EventsHeader total={data?.length ?? 0} onAdd={() => setModal({ ...initialModal, isFormOpen: true })} />
      <EventsToolbar />
      <EventsContent events={data ?? []} isLoading={isLoading} onEdit={(e) => setModal({ ...initialModal, isFormOpen: true, selected: e })} />
      <EventsModals state={modal} onStateChange={setModal} />
    </main>
  );
}
```

---

## 4. Hook consolidation

Consolidate into two files per module: `useXxx.ts` (all reads) and `useMutateXxx.ts` (all writes).

### staleTime defaults

| Data type                    | `staleTime`                 |
| ---------------------------- | --------------------------- |
| Dropdown / reference lists   | 5 minutes                   |
| List pages                   | 0 — refetch on mount        |
| Detail / single-record pages | 30 seconds                  |
| Config / enums / static data | 10 minutes                  |
| **Restricted-PII records**   | **0 + `gcTime: 0`** — never cache sensitive data (see data-governance ref) |

### Mutation pattern (toast + invalidate + audit)

```typescript
// modules/events/hooks/useMutateEvents.ts
'use client';
import { eventsRepository } from '../adapters';
import { QueryKeys } from '@/core/api/queryKeys';

export function useCreateEvent() {
  const qc = useQueryClient();
  const t = useTranslations('events');
  return useMutation({
    mutationFn: (dto: CreateEventDTO) => eventsRepository.create(dto),
    onSuccess: () => {
      toast.success(t('messages.createSuccess'));
      qc.invalidateQueries({ queryKey: QueryKeys.EVENTS.list() });
    },
    onError: () => toast.error(t('messages.createError')),
  });
}
```

### Central query key registry — no hardcoded arrays

```typescript
// core/api/queryKeys.ts
export const QueryKeys = {
  EVENTS: {
    all: () => ['events'] as const,
    list: (p?: unknown) => ['events', 'list', p] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    sports: (eventId: string) => ['events', 'sports', eventId] as const,
  },
  // ... one entry per module
};
```

---

## 5. Form rules

### Required file layout per form

```
modules/<module>/
  schema/<module>.schema.ts     ← Zod schema + typed enum option arrays
  mappers/<module>.mapper.ts    ← formData → DTO, API response → form defaults
  utils/<module>.defaults.ts    ← getDefaultValues(existingEntity?)
  hooks/use<Module>Form.ts      ← RHF setup, mutation call, onSubmit
  components/form/
    <Module>Form.tsx             ← FormProvider shell only, ≤80 lines
    sections/BasicSection.tsx    ← ≤60 lines each
```

| File                   | Limit     |
| ---------------------- | --------- |
| Form shell             | 80 lines  |
| Each section component | 60 lines  |
| `use<Module>Form` hook | 80 lines  |
| Schema / mapper file   | unlimited |

**Forms MUST NOT contain:** `useQuery`/`useMutation`, inline Zod schema, inline DTO mapping,
inline default values, or imports from `adapters/`/`api/`.

Always wrap in `<FormProvider>` and use the shared RHF wrappers — never repeat raw `<Controller>`:

```tsx
// ❌ Wrong
<Controller name="name" render={({ field }) => <input {...field} />} />
// ✅ Correct
<TextInputField name="name" label={t('fields.name')} required />
<SelectField name="sport" label={t('fields.sport')} options={sportOptions} required />
```

> Zod schemas here are also the **first line of input validation** (`security.md`). Validate
> length, type, and format strictly; reject rather than coerce unexpected input.

---

## 6. State rules

| State type                                | Location                                       |
| ----------------------------------------- | ---------------------------------------------- |
| Server / async data                       | TanStack Query                                 |
| List filters, sort, pagination, view mode | Zustand store in `modules/<module>/store/`     |
| Auth / session / current user             | `core/auth/` (cookie-backed — see security ref)|
| Modal open/close + selected record        | One `useState` object in the page component    |
| Local UI state (hover, accordion, toggle) | `useState` in the component                    |

> **Security note:** filters/sort/pagination in Zustand is fine. **Never** store auth tokens,
> PII, or restricted records in Zustand — that state is JS-readable and survives in memory.

### Zustand filter store

```typescript
// modules/events/store/eventsFilters.store.ts
import { create } from 'zustand';
interface EventsFiltersState {
  search: string; phase: string | undefined; page: number;
  setSearch: (v: string) => void; setPhase: (v: string | undefined) => void;
  setPage: (v: number) => void; reset: () => void;
  getQueryParams: () => EventListParams;
}
const initial = { search: '', phase: undefined, page: 1 };
export const useEventsFiltersStore = create<EventsFiltersState>((set, get) => ({
  ...initial,
  setSearch: (search) => set({ search, page: 1 }),
  setPhase: (phase) => set({ phase, page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set(initial),
  getQueryParams: () => { const { search, phase, page } = get(); return { search, phase, page }; },
}));
```

> Do not put PII-bearing search values (national ID, full name fragments) into URLs. Keep
> them in the store and POST them in the request body where feasible.

---

## 7. Performance rules

**Use `useCallback` for:** handlers passed as props; functions in `useEffect` deps.
**Use `useMemo` for:** expensive derived values; references passed to `React.memo` children.
**Do NOT use them for:** primitives, functions not passed down, premature optimization.

> Profile before optimizing. Both hooks have overhead.

---

## 8. Naming conventions

| Type                    | Convention                           | Example                         |
| ----------------------- | ------------------------------------ | ------------------------------- |
| Next.js routes          | lowercase, hyphens                   | `events/[event_id]/page.tsx`    |
| Module page components  | PascalCase + `Page`                  | `EventsPage`, `EventDetailPage` |
| Page section components | PascalCase, module-prefixed          | `EventsHeader`, `EventsToolbar` |
| Form components         | PascalCase + `Form`                  | `EventForm`                     |
| Form section components | PascalCase + `Section`               | `BasicInfoSection`              |
| Hooks                   | `use` + camelCase                    | `useEvents`, `useEventDetail`   |
| Mutation hooks file     | `useMutate` prefix                   | `useMutateEvents.ts`            |
| Zustand stores          | `use` + `FiltersStore`               | `useEventsFiltersStore`         |
| Port interfaces         | `I` + PascalCase                     | `IEventsRepository`             |
| HTTP adapters           | camelCase + `HttpAdapter`            | `eventsHttpAdapter`             |
| Mock adapters           | camelCase + `MockAdapter`            | `eventsMockAdapter`             |
| Zod schemas             | camelCase + `Schema`                 | `eventSchema`                   |
| Mapper functions        | camelCase, descriptive               | `formDataToCreateDto`           |
| Translation keys        | dot-notation, lowercase              | `events.actions.create`         |
