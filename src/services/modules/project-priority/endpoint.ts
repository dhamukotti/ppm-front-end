import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  update: ApiEndpoint
  add: ApiEndpoint
}

export const priority: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/project-priority'
  },
  update: {
    method: 'PUT',
    uri: '/api/project-priority/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/project-priority'
  }
}
