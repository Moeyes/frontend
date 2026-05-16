# API Integration Guide

## How `_contract/api.types.ts` works

The backend exposes an OpenAPI 3.0 spec at `GET /api/openapi.json`. The frontend uses `openapi-typescript` to auto-generate TypeScript types from this spec:

```bash
pnpm contract:sync
# runs: curl .../openapi.json -o _contract/openapi.json
#       openapi-typescript _contract/openapi.json -o _contract/api.types.ts
```

The generated file contains:
- `paths` — one type per endpoint path + method with request/response shapes
- `components.schemas` — all backend model types

**Never hand-write types for API responses.** Always use `components['schemas']['MyType']`.

---

## Regenerating after backend changes

```bash
# Backend must be running locally, or set NEXT_PUBLIC_API_URL to staging
pnpm contract:sync

# Then check what changed
git diff _contract/api.types.ts

# Commit types together with any frontend changes that use them
git add _contract/api.types.ts src/...
```

If the backend added a new field, TypeScript will immediately surface anywhere that field is read or written once you regenerate. If the backend removed a field, you'll get compile errors pointing to every usage.

---

## Typed client usage

The client lives in `core/api/client.ts`. It wraps `openapi-fetch` with auth retry middleware:

```ts
import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

// GET with query params
export async function listEvents(params?: { skip?: number; limit?: number }) {
  const { data, error } = await api.GET('/api/events/', {
    params: { query: params },
  });
  if (error) throw error;  // error is typed as the API error schema
  return data;             // data is typed as EventsPublic
}

// POST with body
export async function createEvent(body: components['schemas']['EventCreate']) {
  const { data, error } = await api.POST('/api/events/', { body });
  if (error) throw error;
  return data;  // EventPublic
}

// PATCH
export async function updateEvent(
  eventId: number,
  body: components['schemas']['EventUpdate']
) {
  const { data, error } = await api.PATCH('/api/events/{event_id}', {
    params: { path: { event_id: eventId } },
    body,
  });
  if (error) throw error;
  return data;
}

// DELETE with body
export async function deleteEvent(body: components['schemas']['DeleteEventBody']) {
  const { error } = await api.DELETE('/api/events/delete', { body });
  if (error) throw error;
}
```

---

## Error handling pattern

The backend returns RFC7807 errors:

```json
{
  "detail": "Event name is required"
}
// or for validation errors:
{
  "detail": [
    { "loc": ["body", "name_kh"], "msg": "Field required", "type": "missing" }
  ]
}
```

Use `parseApiError()` from `core/api/client` to map these to form field errors:

```ts
import { parseApiError } from '@/core/api/client';

const onSubmit = async (values: FormValues) => {
  try {
    await mutation.mutateAsync(values);
    toast.success(t('createSuccess'));
    onSuccess();
  } catch (err: unknown) {
    if (err instanceof Response) {
      const fieldErrors = await parseApiError(err);
      // { name_kh: 'Field required', _root: 'Server error' }
      Object.entries(fieldErrors).forEach(([field, msg]) => {
        form.setError(field as keyof FormValues, { message: msg });
      });
    } else {
      form.setError('root', { message: tc('somethingWentWrong') });
    }
  }
};
```

`parseApiError` returns `{ _root: '...' }` for non-field errors and `{ fieldName: '...' }` for field-level errors.

---

## Mutation pattern with optimistic updates

```ts
// hooks/useCreateEvent.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onMutate: async (newEvent) => {
      // Cancel in-flight queries to avoid race conditions
      await qc.cancelQueries({ queryKey: eventKeys.lists() });
      // Snapshot current state for rollback
      const snapshot = qc.getQueriesData({ queryKey: eventKeys.lists() });
      // Optimistically add to cache
      qc.setQueriesData({ queryKey: eventKeys.lists() }, (old: EventsPublic | undefined) =>
        old ? { ...old, data: [...old.data, { ...newEvent, id: -1 }] } : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      // Always refetch to sync with server truth
      qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
```

---

## Pagination

The backend uses skip/limit pagination. All list responses have shape `{ data: T[], count: number }`.

Standard pattern:

```ts
// In a list component:
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize:  DEFAULT_PAGE_SIZE,  // 20, from core/config/constants
});

const query = useEvents({
  skip:  pagination.pageIndex * pagination.pageSize,
  limit: pagination.pageSize,
});

const pageCount = query.data ? Math.ceil(query.data.count / pagination.pageSize) : 0;

// Pass to DataTable:
<DataTable
  columns={columns}
  data={query.data?.data ?? []}
  pageCount={pageCount}
  totalCount={query.data?.count}   // shows "Showing 1–20 of 247"
  pagination={pagination}
  onPaginationChange={setPagination}
/>
```

For dropdown pickers that need all items (no pagination), use `DROPDOWN_LIMIT = 200`:

```ts
import { DROPDOWN_LIMIT } from '@/core/config';
const eventsQuery = useEvents({ limit: DROPDOWN_LIMIT });
```

---

## File uploads

Documents are uploaded directly from the browser to Cloudinary using a presigned URL from the backend. The frontend never handles the raw file bytes on the server.

Flow:
1. `GET /api/cloudinary/presign-url` → `{ cloud_name, api_key, timestamp, signature, folder, public_id }`
2. Browser `POST https://api.cloudinary.com/v1_1/{cloud}/image/upload` with file + presign data
3. Cloudinary returns `{ secure_url }` — this URL is stored in the form and submitted with the registration

Use the `FileUploadField` component — it handles the size check (≤2 MB), upload progress, and error display:

```tsx
<FileUploadField
  control={form.control}
  name="photoUrl"
  labelKey="registration.fields.profilePhoto"
  required
  accept="image/*,.pdf"
  onUpload={upload}  // from useCloudinaryUpload()
/>
```

---

## List of all endpoints

See [`_contract/ENDPOINTS.md`](../_contract/ENDPOINTS.md) for the full reference table (42 paths, 53 methods).

Summary by domain:

| Domain | Paths |
|---|---|
| Auth | 3 |
| Users | 5 |
| Events | 14 |
| Sports | 7 |
| Organizations | 5 |
| Survey (participation-per-sport) | 5 |
| Registration | 5 |
| Cloudinary | 1 |
| Dashboard | 1 |
| Excel reports | 2 (+ 6 pending backend implementation) |
| Cards | 2 |
