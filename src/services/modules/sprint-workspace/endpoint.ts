import type { ApiEndpoint } from '@/types/api-utils'

type WorkspaceEndpoints = {
  list: ApiEndpoint
  add: ApiEndpoint
  deleteItem: ApiEndpoint
  addworkspace:ApiEndpoint,
}

export const workspace: WorkspaceEndpoints = {
  list: {
    method: 'GET',
    uri: '/api/sprint-workspace'
  },

  add: {
    method: 'POST',

    uri: '/api/sprint-workspace'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/sprint-workspace/:id'
  },
  addworkspace:{
   method: 'POST',
    uri: '/CreateSprintworkspace'
  },

  
}
