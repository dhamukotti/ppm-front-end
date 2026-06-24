import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  add: ApiEndpoint
  update: ApiEndpoint
  priorityList: ApiEndpoint
  addPriority: ApiEndpoint
  updatePriority: ApiEndpoint
  deleteBug: ApiEndpoint
}

export const bugQueue: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/bug-queue'
  },
  add: {
    method: 'POST',
    uri: '/api/bug-queue'
  },
  update: {
    method: 'PUT',
    uri: '/api/bug-queue/:id'
  },
  priorityList: {
    method: 'GET',
    uri: '/api/bug-queue-priority'
  },
  addPriority: {
    method: 'POST',
    uri: '/api/bug-queue-priority'
  },
  updatePriority: {
    method: 'PUT',
    uri: '/api/bug-queue-priority/:id'
  },
  deleteBug: {
    method: 'DELETE',
    uri: '/api/bug-delete'
  }
}
