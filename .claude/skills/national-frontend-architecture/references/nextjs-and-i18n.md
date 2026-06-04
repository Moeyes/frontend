# Next.js App Router & i18n Reference

## Part 1 — Next.js App Router rules

### Page files (`app/.../page.tsx`)

Server Components by default; the entry point for a route.

**MUST:** be Server Components (no `"use client"` unless strongly justified); import and render
the module's Page component; extract route params and pass as props; contain no business logic,
hooks, or state.

**MUST NOT:** contain `useState`/`useEffect`/any hook; import TanStack Query hooks directly;
contain JSX beyond the module page component.

```tsx
// app/(portal)/events/page.tsx — Server Component
import { EventsPage } from '@/modules/events';
export default function EventsRoute() {
  return <EventsPage />;
}
```

```tsx
// app/(portal)/events/[event_id]/page.tsx — Server Component
import { EventDetailPage } from '@/modules/events';
export default function EventDetailRoute({ params }: { params: { event_id: string } }) {
  return <EventDetailPage eventId={params.event_id} />;
}
```

> **Security/data note:** route params are untrusted. Validate IDs (Zod `uuid`) before use, and
> never carry PII in a route param that lands in browser history (see data-governance ref §3).
> Server-side middleware/RSC gating is the real access control; the page redirect is convenience.

### Module page components (`modules/<module>/components/page-sections/XxxPage.tsx`)

Client Components (`"use client"`) that own data-fetching and composition. They follow all
component limits in `architecture.md`.

### `loading.tsx`

```tsx
// app/(portal)/events/loading.tsx
import { EventsPageSkeleton } from '@/modules/events';
export default EventsPageSkeleton;
```

### `error.tsx`

Render a **generic, translated** message only — never the raw error (see security ref §9).

```tsx
// app/(portal)/events/[event_id]/error.tsx
'use client';
import { PageErrorState } from '@/shared/ui';
import { useTranslations } from 'next-intl';
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('common.errors');
  return <PageErrorState message={t('unknown')} onRetry={reset} />;
}
```

### Server vs Client decision

| Scenario                                      | Component type     |
| --------------------------------------------- | ------------------ |
| Static layout, no interactivity               | Server Component   |
| Needs `useState`/`useEffect`/event handlers   | `"use client"`     |
| Needs TanStack Query hooks                    | `"use client"`     |
| Wraps a client component with layout only     | Server Component   |
| Uses `useTranslations()`                       | Either — prefer Server |

---

## Part 2 — i18n rules (next-intl)

This project ships at least `en` and `kh` (Khmer). Every user-facing string is translated.

### Never hardcode user-facing strings

```tsx
// ❌
<h1>Events</h1>
toast.success('Event created successfully')
// ✅
const t = useTranslations('events');
<h1>{t('title')}</h1>
toast.success(t('messages.createSuccess'))
```

### Message file structure mirrors the module

```json
// messages/en.json (and messages/kh.json with the same keys)
{
  "events": {
    "title": "Events",
    "actions": { "create": "Create Event", "edit": "Edit Event", "delete": "Delete Event" },
    "messages": {
      "createSuccess": "Event created successfully",
      "updateSuccess": "Event updated successfully",
      "deleteSuccess": "Event deleted successfully",
      "createError": "Failed to create event"
    },
    "fields": { "name": "Event Name", "phase": "Phase", "sport": "Sport" }
  },
  "common": {
    "actions": { "save": "Save", "cancel": "Cancel" },
    "errors": { "unknown": "Something went wrong", "forbidden": "You don't have access" }
  }
}
```

> **Data note:** translation messages are static UI text — **never** interpolate PII into a
> message key or a stored translation. Pass dynamic values as runtime `t('x', { name })`
> parameters and keep PII out of analytics that might capture rendered strings.

### Key naming

```
<module>.<section>.<key>
events.title · events.actions.create · events.fields.name · common.errors.unknown
```

### Server vs client translations

```tsx
// Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('events');
// Client Component
'use client';
import { useTranslations } from 'next-intl';
const t = useTranslations('events');
```

### Rules

- Both `en.json` and `kh.json` must contain every key — no missing translations shipped.
- Never rename an existing key in `messages/` without explicit instruction (other code depends on it).
- Map backend error codes to `common.errors.*` keys in one place so error UIs stay generic.
