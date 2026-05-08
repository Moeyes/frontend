import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
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

  // Decode user_id from JWT payload (base64) for AuthContext bootstrap
  try {
    const payload = JSON.parse(
      Buffer.from(access_token.split('.')[1], 'base64url').toString()
    );
    if (payload.sub) {
      response.cookies.set('user_id', String(payload.sub), {
        secure: IS_PROD,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15,
      });
    }
  } catch {
    // JWT decode failed — not fatal
  }

  return response;
}
