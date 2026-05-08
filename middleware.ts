import { type NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (token) {
    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

// Inject auth header into all proxied backend API calls
export const config = {
  matcher: '/api/:path*',
};
