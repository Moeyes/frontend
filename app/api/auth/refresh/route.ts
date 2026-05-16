import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 });
  }

  const backendRes = await fetch(`${BACKEND}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refresh_token=${refreshToken}`,
    },
  });

  if (!backendRes.ok) {
    const response = NextResponse.json({ error: 'refresh_failed' }, { status: 401 });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('user_id');
    return response;
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
    maxAge: 60 * 15,
  });
  response.cookies.set('refresh_token', refresh_token, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 7,
  });
  // SEC-H5: user_id no longer set as a non-HttpOnly cookie.
  // Client reads user identity via GET /api/auth/me.

  return response;
}
