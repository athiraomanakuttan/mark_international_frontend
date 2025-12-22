// middleware.ts
import './lib/localStorageShim';
import { NextResponse, NextRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * IMPORTANT:
 * - Never modify or delete Next.js internal headers
 * - Always skip Server Actions
 * - Use NextResponse.redirect only
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

const redirectTo = (path: string, request: NextRequest) => {
  return NextResponse.redirect(
    new URL(path, request.url),
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
     * 🚨 CRITICAL FIX
     * Skip Server Actions completely
     * This prevents x-action-redirect crashes
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
      return redirectTo('/login', request);
    }

    /* ===== Decode token (NO verify in middleware) ===== */
    let decoded: DecodedToken | null = null;

    try {
      decoded = jwt.decode(token) as DecodedToken | null;
      if (!decoded) throw new Error('Invalid token');
    } catch {
      const res = redirectTo('/login', request);
      res.cookies.delete('accessToken');
      return res;
    }

    const { role, exp } = decoded;

    /* ===== Token expired ===== */
    if (exp && exp < Date.now() / 1000) {
      const res = redirectTo('/login', request);
      res.cookies.delete('accessToken');
      return res;
    }

    /* ===== Role protection ===== */
    if (
      ADMIN_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      ) &&
      role?.toLowerCase() !== 'admin'
    ) {
      return redirectTo('/unauthorized', request);
    }

    if (
      STAFF_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      ) &&
      role?.toLowerCase() !== 'staff'
    ) {
      return redirectTo('/unauthorized', request);
    }

    return NextResponse.next();
  } catch (error) {
    /**
     * LAST-RESORT SAFETY NET
     * Never crash the process
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
