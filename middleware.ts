import { type NextRequest, NextResponse } from 'next/server';

// Portal paths that require an authenticated session.
// Route group `(portal)` uses the same URL paths — no prefix needed.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/events',
  '/sports',
  '/organizations',
  '/users',
  '/surveys',
  '/submissions',
  '/register',
  '/participation',
  '/reports',
  '/cards',
];

// Root path `/` is the dashboard — also protected.
function isProtected(pathname: string): boolean {
  if (pathname === '/') return true;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  // ── Server-side portal protection (SEC-M1) ──────────────────────────────
  // Redirect unauthenticated users before any HTML is rendered.
  // Role-level checks remain on the client (ProtectedRoute).
  if (isProtected(pathname) && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // ── API proxy: inject Authorization header from HttpOnly cookie ──────────
  if (pathname.startsWith('/api/') && token) {
    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
