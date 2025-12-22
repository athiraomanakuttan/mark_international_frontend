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
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl, { status: 307 });
    }

    let decoded: DecodedToken | null;
    try {
      decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded) throw new Error('Invalid token');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token decode error:', error);
      }
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl, { status: 307 });
      response.cookies.delete('accessToken');
      return response;
    }

    const { role, exp } = decoded;

    // Check if token is expired
    if (exp && exp < Date.now() / 1000) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token expired');
      }
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl, { status: 307 });
      response.cookies.delete('accessToken');
      return response;
    }

    if (ADMIN_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'admin') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl, { status: 307 });
    }

    if (STAFF_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'staff') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl, { status: 307 });
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
