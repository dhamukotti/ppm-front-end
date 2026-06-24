import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
}

export const role: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/roles'
  }
}
