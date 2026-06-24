import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  view: ApiEndpoint
  update: ApiEndpoint
  getColumn: ApiEndpoint
  add: ApiEndpoint
  deleteItem: ApiEndpoint
  createSubTaskColumn: ApiEndpoint
}

export const subTasks: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/sub-task'
  },
  view: {
    method: 'GET',
    uri: '/api/sub-task/:id'
  },
  update: {
    method: 'PUT',
    uri: '/api/sub-task/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/sub-task'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/sub-task/:id'
  },
  getColumn: {
    method: 'GET',
    uri: '/api/sub-task-column'
  },
  createSubTaskColumn: {
    method: 'POST',
    uri: '/api/sub-task-column'
  }
}
