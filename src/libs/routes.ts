import { routes } from '@/constants/routes'

export const ROOT = '/'
export const AUTH_ROUTES = ['/login', '/forgot-password']
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/recent-activity',
  '/bug-queue',
  routes.project,
  routes.profile,
  '/boards',
  '/view',
  '/super-admin',

  routes.workspace
]
export const PUBLIC_ROUTES = ['/invite', '/404']
export const DEFAULT_REDIRECT = '/login'
