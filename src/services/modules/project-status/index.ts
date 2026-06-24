import { status } from './endpoint'
import { callApi } from 'src/utils/api-utils'
import type { ProjectStatusList } from './types'

export const fetchProjectStatusList = async ({
  taskGroupID
}: {
  taskGroupID?: string
}): Promise<ProjectStatusList[]> => {
  return callApi({ uriEndPoint: status.list, query: { taskGroupID: taskGroupID ?? '' } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addProjectStatus = async (body: any) => {
  return callApi({ uriEndPoint: status.add, body })
    .then(res => res)
    .catch(err => err)
}

export const updateProjectStatus = async ({ body, id }: { body: any; id: string }) => {
  return callApi({ uriEndPoint: status.update, pathParams: { id }, body })
    .then(res => res)
    .catch(err => err)
}
