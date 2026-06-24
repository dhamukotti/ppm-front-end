import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
}

export const country: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/country'
  }
}
