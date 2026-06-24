import type { NextRequest } from 'next/server'

import { AUTH_ROUTES, DEFAULT_REDIRECT, PROTECTED_ROUTES, PUBLIC_ROUTES, ROOT } from './libs/routes'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const jwtCookie = req.cookies.get('jwt')
  const jwt = jwtCookie ? jwtCookie.value : null

  const isAuthenticated = !!jwt

  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname)

  const isProtectedRoute =
    PROTECTED_ROUTES.includes(nextUrl.pathname) || PROTECTED_ROUTES?.some(r => nextUrl.pathname?.startsWith(r))

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

  if (isPublicRoute) return

  if (isAuthRoute && isAuthenticated) return Response.redirect(new URL(ROOT, nextUrl))

  if (isProtectedRoute && !isAuthenticated) return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl))

  if (!isProtectedRoute && isAuthenticated) return Response.redirect(new URL(ROOT, nextUrl))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
