// middleware.ts
import './lib/localStorageShim'
import { NextResponse, NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import jwt from 'jsonwebtoken'

const PUBLIC_ROUTES = ['/login', '/signup','/registration'];
const ADMIN_ROUTES = [
  '/dashboard',
  '/staff-management',
  '/staff-management/view',
  '/lead-management',
  '/settings',
  '/reports/transfer-lead',
  '/lead-management/unassigned',
  '/lead-management/deleted',
  '/lead-management/transfer',
  '/lead-management/report',
  '/lead-management/import'
];
const STAFF_ROUTES = ['/staff/dashboard','/staff/report'];

interface DecodedToken {
  role: string;
  [key: string]: any;
}

export function middleware(request: NextRequest, _next: NextFetchEvent) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    // Allow public pages
    if (pathname === '/' || PUBLIC_ROUTES.some(path => pathname === path || pathname.startsWith(path + '/'))) {
      return NextResponse.next();
    }

    if (!token) {
      try {
        const loginUrl = new URL('/login', request.url);
        // Ensure URL is properly constructed
        loginUrl.searchParams.delete('x-action-redirect');
        return NextResponse.redirect(loginUrl, { status: 307 });
      } catch (urlError) {
        console.error('[Middleware] URL construction error:', urlError);
        // Fallback to basic redirect
        return NextResponse.redirect(new URL('/login', request.nextUrl.origin), { status: 307 });
      }
    }

    let decoded: DecodedToken | null;
    try {
      decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded) throw new Error('Invalid token');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token decode error:', error);
      }
      try {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.delete('x-action-redirect');
        const response = NextResponse.redirect(loginUrl, { status: 307 });
        response.cookies.delete('accessToken');
        return response;
      } catch (redirectError) {
        console.error('[Middleware] Redirect error:', redirectError);
        const fallbackUrl = new URL('/login', request.nextUrl.origin);
        const response = NextResponse.redirect(fallbackUrl, { status: 307 });
        response.cookies.delete('accessToken');
        return response;
      }
    }

    const { role, exp } = decoded;

    // Check if token is expired
    if (exp && exp < Date.now() / 1000) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token expired');
      }
      try {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.delete('x-action-redirect');
        const response = NextResponse.redirect(loginUrl, { status: 307 });
        response.cookies.delete('accessToken');
        return response;
      } catch (redirectError) {
        console.error('[Middleware] Redirect error (expired):', redirectError);
        const fallbackUrl = new URL('/login', request.nextUrl.origin);
        const response = NextResponse.redirect(fallbackUrl, { status: 307 });
        response.cookies.delete('accessToken');
        return response;
      }
    }

    if (ADMIN_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'admin') {
      try {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.delete('x-action-redirect');
        return NextResponse.redirect(unauthorizedUrl, { status: 307 });
      } catch (redirectError) {
        console.error('[Middleware] Admin redirect error:', redirectError);
        return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin), { status: 307 });
      }
    }

    if (STAFF_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'staff') {
      try {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.delete('x-action-redirect');
        return NextResponse.redirect(unauthorizedUrl, { status: 307 });
      } catch (redirectError) {
        console.error('[Middleware] Staff redirect error:', redirectError);
        return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin), { status: 307 });
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Catch-all error handler for production
    console.error('[Middleware] Critical error:', error);
    // Return next instead of crashing
    return NextResponse.next();
  }
}

// ✅ Match all routes except static files and API
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
