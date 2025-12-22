// middleware.ts
import './lib/localStorageShim';
import { NextResponse, NextRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * =====================================================
 * ✅ NEXT.JS 15 SAFE MIDDLEWARE
 * - No request.url usage in redirects
 * - No header mutation
 * - No Server Action crashes
 * - Production & PM2 safe
 * =====================================================
 */

/* ===================== ROUTES ===================== */

const PUBLIC_ROUTES = ['/login', '/signup', '/registration'];

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
  '/lead-management/import',
];

const STAFF_ROUTES = [
  '/staff/dashboard',
  '/staff/report',
];

interface DecodedToken {
  role: string;
  exp?: number;
  [key: string]: any;
}

/* ===================== HELPERS ===================== */

/**
 * 🚨 CRITICAL
 * Never use request.url for redirects
 * This avoids x-action-redirect crashes
 */
const redirectTo = (path: string) => {
  return NextResponse.redirect(
    new URL(path, process.env.NEXT_PUBLIC_APP_URL),
    { status: 307 }
  );
};

/* ===================== MIDDLEWARE ===================== */

export function middleware(
  request: NextRequest,
  _event: NextFetchEvent
) {
  try {
    /**
     * ✅ Skip Server Actions completely
     * Prevents Next.js internal redirect crashes
     */
    if (request.headers.get('x-action')) {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;
    const token = request.cookies.get('accessToken')?.value;

    /* ===== Allow public routes ===== */
    if (
      pathname === '/' ||
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      )
    ) {
      return NextResponse.next();
    }

    /* ===== No token ===== */
    if (!token) {
      return redirectTo('/login');
    }

    /* ===== Decode token (NO verify in middleware) ===== */
    let decoded: DecodedToken | null = null;

    try {
      decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded) throw new Error('Invalid token');
    } catch {
      const res = redirectTo('/login');
      res.cookies.delete('accessToken');
      return res;
    }

    const { role, exp } = decoded;

    /* ===== Token expired ===== */
    if (exp && exp < Date.now() / 1000) {
      const res = redirectTo('/login');
      res.cookies.delete('accessToken');
      return res;
    }

    /* ===== Admin route protection ===== */
    if (
      ADMIN_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      ) &&
      role?.toLowerCase() !== 'admin'
    ) {
      return redirectTo('/unauthorized');
    }

    /* ===== Staff route protection ===== */
    if (
      STAFF_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      ) &&
      role?.toLowerCase() !== 'staff'
    ) {
      return redirectTo('/unauthorized');
    }

    return NextResponse.next();
  } catch (error) {
    /**
     * 🛡 LAST-RESORT SAFETY NET
     * Middleware must NEVER crash
     */
    console.error('[Middleware] Unexpected error:', error);
    return NextResponse.next();
  }
}

/* ===================== CONFIG ===================== */

export const config = {
  matcher: [
    /**
     * Match everything EXCEPT:
     * - _next static files
     * - images
     * - favicon
     * - api routes
     * - webhooks
     * - files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|webhook/|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
