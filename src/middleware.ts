import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (/^\/uploads\/(candidate-documents|applicant-copies)\//.test(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = '/api' + pathname;
    return NextResponse.rewrite(target);
  }

  // 1. Candidate Dashboard Gate - Delegated to /dashboard/layout.tsx for rich in-app lock screen & session retention
  // (Layout renders dedicated Unauthorized Guard with Lock barrier and login redirection)

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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next|_not-found|favicon.ico|fonts|images|icons).*)']
};
