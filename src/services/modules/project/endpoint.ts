import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  view: ApiEndpoint
  add: ApiEndpoint
  update: ApiEndpoint
  deleteItem: ApiEndpoint
}

export const project: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/project'
  },
  view: {
    method: 'GET',
    uri: '/api/project/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/project'
  },
  update: {
    method: 'PUT',
    uri: '/api/project/:id'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/project/:id'
  }
}
