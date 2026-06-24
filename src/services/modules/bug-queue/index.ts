import { callApi } from 'src/utils/api-utils'
import { bugQueue } from './endpoint'
import type { BugPriorityList, BugQueueListAPI } from './types'
import toast from 'react-hot-toast'

export const fetchBugQueueList = async (workspaceID: string): Promise<BugQueueListAPI[]> => {
  return callApi({ uriEndPoint: bugQueue.list, query: { workspaceID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      console.log('err :', err)

      return []
    })
}

export const createBugAPI = async (body: any) => {
  return callApi({ uriEndPoint: bugQueue.add, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const updateBug = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: bugQueue.update, pathParams: { id }, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const fetchBugPriorityList = async ({ workspaceID }: { workspaceID?: number }): Promise<BugPriorityList[]> => {
  return callApi({
    uriEndPoint: bugQueue.priorityList,
    query: workspaceID ? { workspaceID: workspaceID || null } : undefined
  })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      console.log('err :', err)

      return []
    })
}

export const addBugPriority = async (body: any) => {
  return callApi({ uriEndPoint: bugQueue.addPriority, body })
    .then(res => res).then(()=>{
      toast.success("Priority Added successfully")
    })

    .catch(err => err)
}

export const updateBugPriority = async ({ body, id }: { body: any; id: string }) => {
  return callApi({ uriEndPoint: bugQueue.updatePriority, pathParams: { id }, body })
    .then(res => res)
    .catch(err => err)
}

export const deleteBugApi = async (body: any) => {
  return callApi({ uriEndPoint: bugQueue.deleteBug, body: { bugs: body } })
    .then(res => res)
    .catch(err => err)
}
