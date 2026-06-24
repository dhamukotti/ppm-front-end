import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  add: ApiEndpoint
  update: ApiEndpoint
  deleteItem: ApiEndpoint,
  Create:ApiEndpoint,
}

export const sprintGroup: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/sprint-group'
  },
  add: {
    method: 'POST',
    uri: '/api/sprint-group'
  },
  update: {
    method: 'PUT',
    uri: '/api/sprint-group/:id'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/sprint-workspace/:id'
  },
   Create: {
    method: 'POST',
    uri: '/CreateSprintGroup'
  },
}
