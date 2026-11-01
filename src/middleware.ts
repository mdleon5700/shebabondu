import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Candidate Dashboard Gate
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('cs_session_token');
    const authHeader = request.headers.get('authorization');
    const adminSecret = request.headers.get('x-admin-secret');

    // Allow if session cookie, bearer token, or admin secret is present
    if (!sessionCookie?.value && !authHeader && !adminSecret) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Admin API Gate
  if (pathname.startsWith('/api/admin')) {
    const adminSecret = request.headers.get('x-admin-secret');
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('cs_session_token');

    if (!adminSecret && !authHeader && !sessionCookie?.value) {
      return NextResponse.json(
        { error: 'FORBIDDEN: Admin privileges required.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*'
  ]
};
