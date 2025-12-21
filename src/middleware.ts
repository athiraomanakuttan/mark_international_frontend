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
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;


  // Allow public pages
  if (pathname === '/' || PUBLIC_ROUTES.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let decoded: DecodedToken | null;
  try {
    decoded = jwt.decode(token) as DecodedToken | null;
    if (!decoded) throw new Error('Invalid token');
  } catch (error) {
    console.log('Token decode error in middleware:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  const { role, exp } = decoded;

  // Check if token is expired
  if (exp && exp < Date.now() / 1000) {
    console.log('Token expired in middleware');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  if (ADMIN_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}

if (STAFF_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`)) && role.toLowerCase() !== 'staff') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}


  return NextResponse.next();
}

// ✅ Match all routes except static files and API
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
};
