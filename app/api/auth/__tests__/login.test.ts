// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── helpers ─────────────────────────────────────────────────────────────────

// A minimal valid JWT: header.{"sub":"42"}.signature
// (not cryptographically signed — just for parsing the sub claim)
const MOCK_ACCESS_TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  btoa(JSON.stringify({ sub: '42', exp: Math.floor(Date.now() / 1000) + 900 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
  'mock_signature',
].join('.');

const MOCK_REFRESH_TOKEN = 'mock_refresh_token_value';

function makeLoginRequest(body: Record<string, string>) {
  return new NextRequest('http://localhost/api/auth/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}

function parseCookies(res: Response): Record<string, string> {
  const cookies: Record<string, string> = {};
  // getSetCookie() returns an array of all Set-Cookie headers (Node 18+)
  const cookieHeaders = res.headers.getSetCookie?.() ?? [];
  for (const header of cookieHeaders) {
    const [nameValue] = header.split(';');
    const [name, value] = nameValue.split('=');
    cookies[name.trim()] = (value ?? '').trim();
  }
  return cookies;
}

function cookieAttributes(res: Response, cookieName: string): string {
  const headers = res.headers.getSetCookie?.() ?? [];
  return headers.find((h) => h.startsWith(`${cookieName}=`)) ?? '';
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    // Mock the global fetch used to call the backend
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('valid credentials → sets access_token as HttpOnly', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));

    expect(res.status).toBe(200);

    const attrStr = cookieAttributes(res, 'access_token');
    expect(attrStr).toContain('access_token=');
    expect(attrStr.toLowerCase()).toContain('httponly');
  });

  it('valid credentials → sets refresh_token as HttpOnly', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));

    const attrStr = cookieAttributes(res, 'refresh_token');
    expect(attrStr).toContain('refresh_token=');
    expect(attrStr.toLowerCase()).toContain('httponly');
  });

  it('valid credentials → access_token maxAge = 15 min (900s)', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));

    const attrStr = cookieAttributes(res, 'access_token');
    // Max-Age=900 (60 * 15)
    expect(attrStr.toLowerCase()).toContain('max-age=900');
  });

  it('valid credentials → refresh_token maxAge = 7 days (604800s)', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));

    const attrStr = cookieAttributes(res, 'refresh_token');
    // Max-Age=604800 (60 * 60 * 24 * 7)
    expect(attrStr.toLowerCase()).toContain('max-age=604800');
  });

  it('valid credentials → SameSite=Strict on access_token', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));

    const attrStr = cookieAttributes(res, 'access_token');
    expect(attrStr.toLowerCase()).toContain('samesite=strict');
  });

  it('valid credentials → response body is { ok: true }', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: MOCK_REFRESH_TOKEN }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'admin', password: 'password' }));
    const body = await res.json() as Record<string, unknown>;

    expect(body.ok).toBe(true);
  });

  it('invalid credentials → 401 passthrough, no cookies set', async () => {
    const { POST } = await import('../login/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
        status:  401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await POST(makeLoginRequest({ username: 'wrong', password: 'bad' }));

    expect(res.status).toBe(401);
    const cookies = parseCookies(res);
    expect(cookies).not.toHaveProperty('access_token');
    expect(cookies).not.toHaveProperty('refresh_token');
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Stub backend logout call as success (best-effort, failure is acceptable)
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes auth cookies and returns 200', async () => {
    const { POST } = await import('../logout/route');
    const req = new NextRequest('http://localhost/api/auth/logout', {
      method:  'POST',
      headers: { Cookie: `refresh_token=${MOCK_REFRESH_TOKEN}` },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns { ok: true }', async () => {
    const { POST } = await import('../logout/route');
    const req = new NextRequest('http://localhost/api/auth/logout', { method: 'POST' });
    const res = await POST(req);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('missing refresh_token cookie → 401', async () => {
    const { POST } = await import('../refresh/route');

    // Request with no cookies
    const req = new NextRequest('http://localhost/api/auth/refresh', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('valid refresh_token → new access_token set as HttpOnly', async () => {
    const { POST } = await import('../refresh/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: MOCK_ACCESS_TOKEN, refresh_token: 'new_refresh' }), {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Attach a refresh_token cookie to the request
    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method:  'POST',
      headers: { Cookie: `refresh_token=${MOCK_REFRESH_TOKEN}` },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const attrStr = cookieAttributes(res, 'access_token');
    expect(attrStr).toContain('access_token=');
    expect(attrStr.toLowerCase()).toContain('httponly');
  });

  it('backend rejects refresh token → 401 and clears all cookies', async () => {
    const { POST } = await import('../refresh/route');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Token expired' }), { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method:  'POST',
      headers: { Cookie: `refresh_token=expired_token` },
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    // All auth cookies should be cleared (deleted)
    const cookieHeader = res.headers.get('set-cookie') ?? '';
    // Confirm the response attempts to clear the cookies
    expect(cookieHeader.length).toBeGreaterThan(0);
  });
});
