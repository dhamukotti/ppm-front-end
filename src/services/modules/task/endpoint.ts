import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  view: ApiEndpoint
  update: ApiEndpoint
  add: ApiEndpoint
  deleteItem: ApiEndpoint
  deleteMulitpleTask: ApiEndpoint
  columnTypeList: ApiEndpoint
  dlDynamicValue: ApiEndpoint
  fileUpload: ApiEndpoint
  recentActivityList: ApiEndpoint
}

export const tasks: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/task'
  },
  view: {
    method: 'GET',
    uri: '/api/task/:id'
  },
  update: {
    method: 'PUT',
    uri: '/api/task/:id'
  },
  add: {
    method: 'POST',
    uri: '/api/task'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/task/:id'
  },
  deleteMulitpleTask: {
    method: 'DELETE',
    uri: '/api/task-delete-mulitple'
  },
  columnTypeList: {
    method: 'GET',
    uri: '/api/column-type'
  },
  dlDynamicValue: {
    method: 'DELETE',
    uri: '/api/dynamic-task/:dynamicId'
  },
  recentActivityList: {
    method: 'GET',
    uri: '/api/recent-activity'
  },
  fileUpload: {
    method: 'POST',
    uri: '/api/task/fileupload/:id',
    headerProps: {
      'Content-Type': 'multipart-formdata'
    }
  }
}
