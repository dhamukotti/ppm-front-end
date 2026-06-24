import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
}

export const recentActivity: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/user/recent-activity'
  }
}
