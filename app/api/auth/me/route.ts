import { type NextRequest, NextResponse } from 'next/server';

// Returns the user ID decoded from the HttpOnly access_token cookie.
// The client calls this on startup instead of reading document.cookie,
// so the access_token can remain HttpOnly (SEC-H5 fix).
export function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ userId: null }, { status: 200 });
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );
    const userId = payload.sub ? String(payload.sub) : null;
    return NextResponse.json({ userId });
  } catch {
    return NextResponse.json({ userId: null }, { status: 200 });
  }
}
