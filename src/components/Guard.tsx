// ** React Imports
import type { ReactNode } from 'react'
import { useEffect } from 'react'

// ** Next Import

// ** Hooks Import
import { usePathname, useRouter } from 'next/navigation'

import { authConfig } from '@/configs/authConfig'

import { routes } from '@/constants/routes'

import { useAuth } from 'src/hooks/useAuth'

type AuthGuardProps = {
  children: ReactNode
  fallback: any
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props

  // ** Hooks
  const auth = useAuth()
  const router = useRouter()

  const pathname = usePathname()

  useEffect(
    () => {
      if (pathname === '/') {
        const homeRoute = routes.dashboard

        router.replace(homeRoute)
      }

      // Allow access to forgot password page without authentication
      const isAuthPage = pathname === routes.login || 
                        pathname === routes.register || 
                        pathname === routes.forgotPassword
                        pathname === routes.verifyEmail
                        pathname === routes.resetPassword
                        pathname === routes.boards

      if (isAuthPage && auth?.user) {
        router.replace(routes.dashboard)
      }

      if (
        auth.user === null &&
        !window.localStorage.getItem(authConfig.loginUserData) &&
        !window.localStorage.getItem(authConfig.loginWithGoogle)
      ) {
        // Allow access to forgot password page without redirecting to login
        const allowedUnauthenticatedRoutes = [
          '/',
          routes.register,
          routes.forgotPassword,
          routes.verifyEmail,
          routes.resetPassword,
        ]

        if (pathname !== '/' && !allowedUnauthenticatedRoutes.includes(pathname)) {
          router.replace(routes.login)
        } else if (pathname === '/') {
          router.replace(routes.login)
        }
        // If it's forgot password page, don't redirect - allow user to stay on the page
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  )

  if (auth.loading) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
