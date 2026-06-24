import type { ApiEndpoint } from '@/types/api-utils'

type SprintEndpoints = {
  list: ApiEndpoint
  listBasic: ApiEndpoint
  add: ApiEndpoint
  update: ApiEndpoint
  deleteItem: ApiEndpoint
  CreateSprintItem:ApiEndpoint,
  UpdateSrpintItem:ApiEndpoint,
  UpdateSprinttimeline: ApiEndpoint,
  Createdynamicolumn:ApiEndpoint,
  Dynamiccolumns:ApiEndpoint
}

export const sprint: SprintEndpoints = {
  list: {
    method: 'GET',
    uri: '/api/sprints'
  },
  listBasic: {
    method: 'GET',
    uri: '/api/sprints-basic'
  },
  add: {
    method: 'POST',
    uri: '/api/sprints'
  },
  update: {
    method: 'PUT',
    uri: '/api/sprints/:id'
  },
  deleteItem: {
    method: 'DELETE',
    uri: '/api/sprints/:id'
  },
  //New apis
  CreateSprintItem: {
    method: 'POST',
    uri: '/SprintCreate'
  },

   Dynamiccolumns: {
    method: 'POST',
    uri: '/GetSprintDynamiccolumnLlist'
  },
  UpdateSrpintItem:{
      method: 'POST',
    uri: '/SprintUpdate'

  },
  UpdateSprinttimeline:{
      method: 'POST',
    uri: '/SprintTimelineUpdate'

  },
  Createdynamicolumn:{
      method: 'POST',
    uri: '/SprintDynamicColumnCreate'
  }
}
