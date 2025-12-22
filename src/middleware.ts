// middleware.ts
import './lib/localStorageShim'
import { NextResponse, NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import jwt from 'jsonwebtoken'

// Helper function to create safe redirect response
const createSafeRedirect = (url: string, request: NextRequest): NextResponse => {
  try {
    const redirectUrl = new URL(url, request.url)
    // Remove any problematic search parameters
    redirectUrl.searchParams.delete('x-action-redirect')
    redirectUrl.searchParams.delete('x-action')
    redirectUrl.searchParams.delete('redirect')
    
    const response = NextResponse.redirect(redirectUrl, { status: 307 })
    
    // Ensure no problematic headers are set
    response.headers.delete('x-action-redirect')
    response.headers.delete('x-action')
    
    return response
  } catch (error) {
    console.error('[Middleware] Error creating redirect:', error)
    // Fallback to origin-based URL
    const fallbackUrl = new URL(url, request.nextUrl.origin)
    return NextResponse.redirect(fallbackUrl, { status: 307 })
  }
}

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
      return createSafeRedirect('/login', request)
    }

    let decoded: DecodedToken | null;
    try {
      decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded) throw new Error('Invalid token');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token decode error:', error);
      }
      const response = createSafeRedirect('/login', request)
      response.cookies.delete('accessToken');
      return response
    }

    const { role, exp } = decoded;

    // Check if token is expired
    if (exp && exp < Date.now() / 1000) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Middleware] Token expired');
      }
      const response = createSafeRedirect('/login', request)
      response.cookies.delete('accessToken');
      return response
    }

    if (ADMIN_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'admin') {
      return createSafeRedirect('/unauthorized', request)
    }

    if (STAFF_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'staff') {
      return createSafeRedirect('/unauthorized', request)
    }

    return NextResponse.next();
  } catch (error) {
    // Catch-all error handler for production
    console.error('[Middleware] Critical error:', error);
    // Return next instead of crashing
    return NextResponse.next();
  }
}

// ✅ Match all routes except static files, API routes, and other excluded paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     * - webhook routes
     * - any file with extension
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|webhook/|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
