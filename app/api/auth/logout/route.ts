import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  // SEC-H6: tell the backend to revoke the refresh token so it cannot be
  // replayed even if an attacker captured it before logout.
  if (refreshToken) {
    await fetch(`${BACKEND}/api/auth/logout`, {
      method:  'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
    }).catch(() => {
      // Best-effort — don't block logout if backend is unreachable
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}
