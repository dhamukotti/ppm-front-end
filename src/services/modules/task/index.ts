import toast from 'react-hot-toast'

import { callApi } from '@/utils/api-utils'
import { tasks } from './endpoint'
import type { RecentActivityListType, TaskListItemType, TColumnType } from './types'

export const fetchTaskList = async (taskGroupID: string): Promise<TaskListItemType[]> => {
  return callApi({ uriEndPoint: tasks.list, query: { taskGroupID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const viewTasks = async (id: string) => {
  return callApi({ uriEndPoint: tasks.view, pathParams: { id } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const updateTasks = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: tasks.update, pathParams: { id }, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addTasks = async (body: any) => {

  return callApi({ uriEndPoint: tasks.add, body })
    .then(res => {
      toast.success(res?.message ?? 'Project Added Successfully')

      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Project Added Successfully')

      return err
    })
}

export const deleteMultipleTask = async (body: any) => {
  return callApi({ uriEndPoint: tasks.deleteMulitpleTask, body: { taskIds: body } })
    .then(res => {
      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Failed to delete tasks')

      return err
    })
}

export const fetchColumnType = async (): Promise<TColumnType[]> => {
  return callApi({ uriEndPoint: tasks.columnTypeList })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const deleteDynamicValue = async (dynamicId: string) => {
  return callApi({ uriEndPoint: tasks.dlDynamicValue, pathParams: { dynamicId } })
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    })
}

export const taskFileUpload = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: tasks.fileUpload, pathParams: { id }, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const fetchRecentActivityList = async ({ taskID }: { taskID: string }): Promise<RecentActivityListType> => {
  return callApi({ uriEndPoint: tasks.recentActivityList, query: { taskID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      return err
    })
}
