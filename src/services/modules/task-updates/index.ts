import { callApi } from 'src/utils/api-utils'
import { taskUpdates } from './endpoint'
import type { TaskUpdatesListItemType } from './types'

export const fetchTaskUpdatesList = async (taskID: string): Promise<TaskUpdatesListItemType[]> => {
  return callApi({ uriEndPoint: taskUpdates.list, pathParams: { taskID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const writeTaskUpdate = async (body: any) => {
  return callApi({ uriEndPoint: taskUpdates.writeUpdate, body })
    .then(res => res)
    .catch(err => {
      throw err
    })
}

export const likeTaskUpdate = async (id: string) => {
  return callApi({ uriEndPoint: taskUpdates.likeUpdate, pathParams: { id } })
    .then(res => res)
    .catch(err => {
      throw err
    })
}

export const giveReplyToUpdate = async (body: any) => {
  return callApi({ uriEndPoint: taskUpdates.replyUpdate, body })
    .then(res => res)
    .catch(err => {
      throw err
    })
}
