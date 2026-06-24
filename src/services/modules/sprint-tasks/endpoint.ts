import type { ApiEndpoint } from '@/types/api-utils'

type SprintEndpoints = {
  list: ApiEndpoint
  add: ApiEndpoint
  update: ApiEndpoint
  deleteItem: ApiEndpoint,
  Createsprinttask:ApiEndpoint
}

export const sprint: SprintEndpoints = {
  list: {
    method: 'GET',
    uri: '/api/sprint-tasks'
  },

  add: {
    method: 'POST',
    uri: '/api/sprint-tasks'
  },
  update: {
    method: 'PUT',
    uri: '/api/sprint-tasks/:id'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/sprint-tasks/:id'
  },
  Createsprinttask:{
    method: 'POST',
    uri: '/SprintTaskcreate'
  }
}
