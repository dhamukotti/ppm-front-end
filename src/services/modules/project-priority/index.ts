import { priority } from './endpoint'
import { callApi } from 'src/utils/api-utils'
import type { ProjectPriorityList } from './types'

export const fetchProjectPriorityList = async ({
  taskGroupID
}: {
  taskGroupID?: string
}): Promise<ProjectPriorityList[]> => {
  return callApi({ uriEndPoint: priority.list, query: { taskGroupID: taskGroupID ?? '' } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addProjectPriority = async (body: any) => {
  return callApi({ uriEndPoint: priority.add, body })
    .then(res => res)
    .catch(err => err)
}

export const updateProjectPriority = async ({ body, id }: { body: any; id: string }) => {
  return callApi({ uriEndPoint: priority.update, pathParams: { id }, body })
    .then(res => res)
    .catch(err => err)
}
