import toast from 'react-hot-toast'

import { callApi } from 'src/utils/api-utils'
import { sprintGroup } from './endpoint'
import type { SprintGroupItem } from './type'

export const fetchSprintGroups = async (workspaceID: string): Promise<SprintGroupItem[]> => {
  return callApi({ uriEndPoint: sprintGroup.list, query: { workspaceID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addSprintGroups = async (body: any) => {
  return callApi({ uriEndPoint: sprintGroup.add, body })
    .then(res => {
      toast.success(res?.message ?? 'Workspace Added Successfully')

      return res
    })
    .catch(err => {
      throw err
    })
}

export const updateSprintGroups = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: sprintGroup.update, pathParams: { id }, body })
    .then(res => {
      toast.success('Sprint Group updated Successfully')

      return res
    })
    .catch(err => {
      throw err
    })
}

export const deleteSprintWorkspace = async ({
  WorkspaceID,
  OrganizationID,
  WorkspaceName
}: {
  WorkspaceID: string
  OrganizationID: string | number
  WorkspaceName: string
}) => {
  return callApi({
    uriEndPoint: sprintGroup.deleteItem,
    pathParams: { id: WorkspaceID },
    body: { organizationID: OrganizationID, workspaceName: WorkspaceName }
  })
    .then(res => {
      toast.success(res?.message ?? 'Workspace Added Successfully')

      return res
    })
    .catch(err => {
      throw err
    })
}


export const CreateSprintGroup = async (body: any) => {
  return callApi({ uriEndPoint: sprintGroup.Create,
     body,
     query: body, // Changed from body to queryParams
    useSecondApi: true
   
     })
    .then(res => {
      toast.success(res?.message ?? 'Sprint Group Added Successfully')

      return res?.data
    })
    .catch(err => {
      throw err
    })
}

