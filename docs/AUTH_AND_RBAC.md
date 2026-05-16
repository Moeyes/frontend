# Authentication and RBAC

## How auth works end-to-end

```
Login → HttpOnly cookies → Middleware injects Bearer token → Backend validates
```

### Token storage

Tokens are **never** stored in `localStorage` or `sessionStorage`. They live in **HttpOnly cookies** — not readable by JavaScript, not vulnerable to XSS.

| Cookie | HttpOnly | SameSite | MaxAge | Purpose |
|---|---|---|---|---|
| `access_token` | ✅ Yes | Strict | 15 min | Authorizes API calls |
| `refresh_token` | ✅ Yes | Strict | 7 days | Issues new access tokens |

### Login flow

```
Browser → POST /api/auth/login
       ← sets access_token + refresh_token cookies (HttpOnly)
Browser → GET /api/auth/me
       ← { userId: '42' }  (server decodes the HttpOnly access_token)
Browser → GET /api/auth/session/42
       ← { id, username, role, kh_family_name, ... }
AuthContext → user object stored in React state
```

### Token refresh (automatic)

When any API call returns 401, `authMiddleware` in `core/api/client.ts` automatically:
1. Calls `POST /api/auth/refresh`
2. Backend rotates both tokens (old refresh token is invalidated)
3. Retries the original request with the new access token
4. If refresh fails → redirects to `/login`

### Logout

```
Browser → POST /api/auth/logout
Next.js route handler → calls backend /api/auth/logout to revoke refresh token
                      → deletes both HttpOnly cookies
Browser → cleared; AuthContext sets user = null
```

### Server-side route protection

`middleware.ts` intercepts every page request. If `access_token` cookie is missing on a protected path (`/`, `/events`, `/sports`, etc.) → redirect to `/login` **before any HTML is served**. This prevents flash-of-protected-content even if `ProtectedRoute` hasn't mounted yet.

---

## The 5 roles

| Role | Code | Khmer | Who |
|---|---|---|---|
| Admin | `admin` | អ្នកគ្រប់គ្រង | Ministry staff |
| Federation | `user1` | សហព័ន្ធ | Sport federation representatives |
| Organization | `user2` | អង្គការ | Province/ministry org representatives |
| Guest | `guest` | ភ្ញៀវ | Read-only observers |
| (Super Admin) | `admin` | — | System owner (same role as Admin) |

### Role permission matrix

| Feature | Admin | Federation | Organization | Guest |
|---|---|---|---|---|
| Create / edit events | ✅ | ❌ | ❌ | ❌ |
| Manage sports + categories | ✅ | ❌ | ❌ | ❌ |
| Manage organizations | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Submit surveys | ❌ | ✅ | ❌ | ❌ |
| Review / approve surveys | ✅ | ❌ | ❌ | ❌ |
| Register participants (athletes) | ❌ | ✅ | ❌ | ❌ |
| Register organizers (leaders) | ❌ | ❌ | ✅ | ❌ |
| Generate reports | ✅ | ❌ | ❌ | ❌ |
| View participant cards | ✅ | ✅ | ❌ | ❌ |
| View dashboard | ✅ | ✅ | ✅ | ✅ |

---

## How to protect a new page

### Route-level (page file)

```tsx
// app/(portal)/mypage/page.tsx
import { ProtectedRoute } from '@/core/auth';
import { MyPageComponent } from '@/modules/mymodule';

export default function MyPageRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <MyPageComponent />
    </ProtectedRoute>
  );
}
```

`ProtectedRoute`:
- Renders `null` while checking auth (no flash)
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if authenticated but wrong role

### Component-level (hiding a button)

```tsx
const { user } = useAuth();

{user?.role === 'admin' && (
  <Button onClick={handleApprove}>Approve</Button>
)}
```

Or use the hook:

```ts
import { useRequireRole } from '@/core/auth';

const isAdmin = useRequireRole(['admin']);
```

---

## How to scope queries by organization

Federation (`user1`) and Organization (`user2`) users must only see their own data. Always pass `organization_id` from the auth context:

```ts
import { useEffectiveOrgId } from '@/core/auth';

export function useMyResources(params: { search?: string }) {
  const orgId = useEffectiveOrgId();  // null for admin, orgId for user1/user2

  return useQuery({
    queryKey: myKeys.lists({ ...params, organization_id: orgId }),
    queryFn: () => listMyResources({
      ...params,
      organization_id: orgId ?? undefined,
    }),
  });
}
```

`useEffectiveOrgId()` returns:
- `null` for `admin` (sees all data)
- `organization_id` for `user1` and `user2` (scoped to their org)

**Never rely on the backend to filter automatically** — always pass the `organization_id` query param explicitly. The backend may or may not enforce it, but the frontend must always send it.

---

## Common RBAC mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Not wrapping a page in `ProtectedRoute` | Any logged-in user can access the page | Always wrap, even if logic seems harmless |
| Relying on sidebar visibility for security | User guesses the URL and gets through | Middleware + ProtectedRoute both guard |
| Not passing `organization_id` to list queries | Federation sees all federations' data | Always use `useEffectiveOrgId()` |
| Checking `user.role === 'federation'` instead of `'user1'` | Role string mismatch; check always fails | Use the `UserRole` enum: `'admin' \| 'user1' \| 'user2' \| 'guest'` |
| Hiding admin UI only — not guarding the mutation | User calls API directly without UI | Backend enforces roles; frontend is defence in depth |
