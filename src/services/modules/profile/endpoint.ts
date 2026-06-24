import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  profile: ApiEndpoint
  changePassword: ApiEndpoint
  profileUpdate: ApiEndpoint
  recentActivityPage: ApiEndpoint
}

export const userEndpoint: Endpoints = {
  profile: {
    method: 'GET',
    uri: '/api/profile'
  },
  changePassword: {
    method: 'PUT',
    uri: '/api/change-password'
  },
  profileUpdate: {
    method: 'PUT',
    uri: '/api/profile-update',
    headerProps: {
      'Content-Type': 'multipart-formdata'
    }
  },
  recentActivityPage: {
    method: 'GET',
    uri: '/api/user/recent-activity'
  }
}
