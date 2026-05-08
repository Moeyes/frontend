import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/_contract/api.types';

// RFC7807 error shape from FastAPI
export interface ApiError {
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
  status?: number;
}

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH']);

const idempotencyMiddleware: Middleware = {
  async onRequest({ request }) {
    if (MUTATION_METHODS.has(request.method)) {
      request.headers.set('Idempotency-Key', crypto.randomUUID());
    }
    return request;
  },
};

const loggerMiddleware: Middleware = {
  async onRequest({ request }) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] → ${request.method} ${request.url}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ← ${response.status} ${response.url}`);
    }
    return response;
  },
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

const authMiddleware: Middleware = {
  async onResponse({ response, request }) {
    if (response.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        // Retry original request — new token will be injected by middleware.ts
        return fetch(request.clone());
      }
      // Refresh failed — redirect to login (client-side only)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    if (response.status === 403 && typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return response;
  },
};

// Client-side client — calls go through the Next.js proxy rewrite
// middleware.ts injects Authorization header from the HttpOnly cookie
export const api = createClient<paths>({ baseUrl: '' });
api.use(idempotencyMiddleware);
api.use(authMiddleware);
if (process.env.NODE_ENV === 'development') {
  api.use(loggerMiddleware);
}

// Parse a FastAPI 422 / RFC7807 error response into field errors.
// Returns a map of fieldName → error message, or { _root: message } for non-field errors.
export async function parseApiError(response: Response): Promise<Record<string, string>> {
  try {
    const body = (await response.clone().json()) as ApiError;
    if (Array.isArray(body.detail)) {
      return Object.fromEntries(
        body.detail.map(({ loc, msg }) => [loc[loc.length - 1], msg])
      );
    }
    if (typeof body.detail === 'string') {
      return { _root: body.detail };
    }
  } catch {
    // empty
  }
  return { _root: `HTTP ${response.status}` };
}
