import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  list: ApiEndpoint
  likeUpdate: ApiEndpoint
  writeUpdate: ApiEndpoint
  replyUpdate: ApiEndpoint
}

export const taskUpdates: Endpoints = {
  list: {
    method: 'GET',
    uri: '/api/task-updates/:taskID'
  },

  writeUpdate: {
    method: 'POST',
    uri: '/api/task-updates'
  },
  likeUpdate: {
    method: 'PUT',
    uri: '/api/task-updates/like/:id'
  },
  replyUpdate: {
    method: 'POST',
    uri: '/api/task-updates/reply'
  }
}
