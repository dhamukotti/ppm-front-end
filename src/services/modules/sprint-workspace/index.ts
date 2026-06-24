import toast from 'react-hot-toast'

import { callApi } from 'src/utils/api-utils'
import { workspace } from './endpoint'
import type { WorkspaceListItem } from './type'

export const fetchSprintWorkspaceList = async (): Promise<WorkspaceListItem[]> => {
  return callApi({ uriEndPoint: workspace.list })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addSprintWorkspace = async (body: any) => {
  return callApi({ uriEndPoint: workspace.add, body })
    .then(res => {
      toast.success(res?.message ?? 'Workspace Added Successfully')

      return res?.data
    })
    .catch(err => {
      throw err
    })
}


export const CreateSprintWorkspace = async (body: any) => {
  return callApi({ uriEndPoint: workspace.addworkspace,
     body,
     query: body, // Changed from body to queryParams
    useSecondApi: true
   
     })
    .then(res => {
      toast.success(res?.message ?? 'Workspace Added Successfully')

      return res?.data
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
    uriEndPoint: workspace.deleteItem,
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
