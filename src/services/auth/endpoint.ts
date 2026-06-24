import type { ApiEndpoint } from '@/types/api-utils'

type AuthEndpoints = {
  login: ApiEndpoint
  googleLogin: ApiEndpoint
  register: ApiEndpoint
  clearCookies: ApiEndpoint
  refreshToken: ApiEndpoint
  emailVerification: ApiEndpoint
  logout: ApiEndpoint
  verifyToken: ApiEndpoint
  resetPassword: ApiEndpoint
  otpVerification: ApiEndpoint
}

export const authentication: AuthEndpoints = {
  login: {
    method: 'POST',
    uri: '/api/login'
  },

  googleLogin: {
    method: 'GET',
    uri: '/auth/google/callback'
  },

  register: {
    method: 'POST',
    uri: '/api/signup'
  },

  refreshToken: {
    method: 'POST',
    uri: '/api/get-refresh-token'
  },
  clearCookies: {
    method: 'GET',
    uri: '/api/clear-cookies'
  },
  emailVerification: {
    method: 'POST',
    uri: '/api/forgot-password'
  },
  verifyToken: {
    method: 'GET',
    uri: '/api/verify-token'
  },
  otpVerification: {
    method: 'POST',
    uri: '/api/verify-otp'
  },
  resetPassword: {
    method: 'PATCH',
    uri: '/api/update-password'
  },
  logout: {
    method: 'GET',
    uri: '/api/logout'
  }
}
