import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { nextUrl, cookies } = request;
  
  // Try to get token from multiple possible cookie names
  const token = cookies.get('token')?.value || 
                cookies.get('auth-token')?.value || 
                cookies.get('access_token')?.value;

  const isPortalRoute = [
    '/dashboard',
    '/events',
    '/sports',
    '/organizations',
    '/users',
    '/cards',
    '/reports',
    '/participation',
    '/register',
    '/bynumber',
    '/bycategory',
    '/bysport',
  ].some(path => nextUrl.pathname.startsWith(path));

  const isAuthRoute = nextUrl.pathname.startsWith('/login');

  if (isPortalRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
