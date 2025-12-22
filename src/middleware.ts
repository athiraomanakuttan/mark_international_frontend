// middleware.ts
import { NextResponse, NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import jwt from 'jsonwebtoken'

const PUBLIC_ROUTES = ['/login', '/signup', '/registration']

const ADMIN_ROUTES = [
  '/dashboard',
  '/staff-management',
  '/lead-management',
  '/settings',
  '/reports',
]

const STAFF_ROUTES = [
  '/staff/dashboard',
  '/staff/report',
]

interface DecodedToken {
  role?: string
  exp?: number
}

export function middleware(request: NextRequest, _event: NextFetchEvent) {
  try {
    /** 🔥 CRITICAL: Skip ALL Server Actions completely */
    if (
      request.headers.has('x-action') ||
      request.headers.has('x-action-redirect')
    ) {
      return NextResponse.next()
    }

    const { pathname } = request.nextUrl
    const token = request.cookies.get('accessToken')?.value

    /** Allow public routes */
    if (
      pathname === '/' ||
      PUBLIC_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + '/')
      )
    ) {
      return NextResponse.next()
    }

    /** No token → login */
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    /** Decode only (NEVER verify in middleware) */
    const decoded = jwt.decode(token) as DecodedToken | null
    if (!decoded) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete('accessToken')
      return res
    }

    /** Expired token */
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete('accessToken')
      return res
    }

    /** Role protection */
    if (
      ADMIN_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + '/')
      ) &&
      decoded.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (
      STAFF_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + '/')
      ) &&
      decoded.role !== 'staff'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('[middleware] error:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|webhook/|.*\\..*).*)',
  ],
}
