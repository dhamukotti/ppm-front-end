import toast from 'react-hot-toast'

import type { ApiResponse } from '@/types/api-response'
import { callApi } from '@/utils/api-utils'
import { project } from './endpoint'
import type { ProjectListItem, ProjectViewData } from './types'

export const fetchProjectList = async (workspaceID: string): Promise<ProjectListItem[]> => {
  return callApi({ uriEndPoint: project.list, query: { workspaceID } })
    .then(res => {
      return res?.data
    })
    .catch(() => {
      return []
    })
}

export interface ProjectViewResponse extends ApiResponse {
  data: ProjectViewData
}

export const viewProject = async (id: string): Promise<ProjectViewResponse> => {
  return callApi({ uriEndPoint: project.view, pathParams: { id } })
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    })
}

export const addProject = async (body: any) => {
  return callApi({ uriEndPoint: project.add, body })
    .then(res => {
      toast.success(res?.message ?? 'Project Added Successfully')

      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Project Added Successfully')

      return err
    })
}

export const updateProject = async ({ id, body }: { id: string; body: any }): Promise<ProjectViewResponse> => {
  return callApi({ uriEndPoint: project.update, pathParams: { id }, body })
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    })
}
export const Deleproject = async (id: string) => {
  return callApi({ uriEndPoint: project.deleteItem, pathParams: { id } })
}
