import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Rate limiting (SEC-M2) ────────────────────────────────────────────────────
// Simple in-memory token bucket: 10 attempts per IP per 60 seconds.
// Works for single-instance deployments. For multi-instance, replace with
// a Redis-backed store (e.g., @upstash/ratelimit).
const RATE_LIMIT    = 10;
const WINDOW_MS     = 60_000;
const attempts      = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { detail: 'Too many login attempts. Please try again in 1 minute.' },
      { status: 429 }
    );
  }
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({}));
    return NextResponse.json(err, { status: backendRes.status });
  }

  const { access_token, refresh_token } = await backendRes.json();

  const cookieOpts = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict' as const,
    path: '/',
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set('access_token', access_token, {
    ...cookieOpts,
    maxAge: 60 * 15, // 15 min
  });
  response.cookies.set('refresh_token', refresh_token, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  // SEC-H5: user_id is no longer stored in a non-HttpOnly cookie.
  // The client reads it via GET /api/auth/me which decodes the HttpOnly access_token server-side.

  return response;
}
