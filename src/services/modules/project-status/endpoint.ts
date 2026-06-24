import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  update: ApiEndpoint
  add: ApiEndpoint
}

export const status: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/project-status'
  },
  update: {
    method: 'PUT',
    uri: '/api/project-status/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/project-status'
  }
}
