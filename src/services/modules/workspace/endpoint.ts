import type { ApiEndpoint } from '@/types/api-utils'

type WorkspaceEndpoints = {
  list: ApiEndpoint
  add: ApiEndpoint
  deleteItem: ApiEndpoint
}

export const workspace: WorkspaceEndpoints = {
  list: {
    method: 'GET',
    uri: '/api/workspace'
  },
  add: {
    method: 'POST',

    uri: '/api/workspace'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/workspace/:id'
  }
}
