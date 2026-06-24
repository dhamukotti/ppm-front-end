import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  view: ApiEndpoint
  update: ApiEndpoint
  add: ApiEndpoint
  deleteItem: ApiEndpoint
  createColumn: ApiEndpoint
  updateColumn: ApiEndpoint
  deleteColumn: ApiEndpoint
  dropdownList: ApiEndpoint
  dropdownAdd: ApiEndpoint
  Deleteprojectgroup: ApiEndpoint
}

export const taskGroup: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/task-group'
  },
  view: {
    method: 'GET',
    uri: '/api/task-group/:id'
  },
  update: {
    method: 'PUT',
    uri: '/api/task-group/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/task-group'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/task-group/:id'
  },
   Deleteprojectgroup: {
    method: 'DELETE',
    uri: '/ProjectTaskGroupDelete'
  },
  createColumn: {
    method: 'POST',
    uri: '/api/create-column'
  },
  updateColumn: {
    method: 'PUT',
    uri: '/api/update-column/:id'
  },
  deleteColumn: {
    method: 'DELETE',
    uri: '/api/delete-column/:id'
  },
  dropdownList: {
    method: 'GET',
    uri: '/api/dropdown-items'
  },
  dropdownAdd: {
    method: 'POST',
    uri: '/api/dropdown-items'
  }
}
