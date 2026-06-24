import toast from 'react-hot-toast'

import { callApi } from '@/utils/api-utils'
import { subTasks } from './endpoint'
import type { SubTaskListItemType } from './types'
import type { AdditionalColumn } from '../project/types'

export const fetchSubTaskList = async (taskID: string): Promise<SubTaskListItemType[]> => {
  return callApi({ uriEndPoint: subTasks.list, query: { taskID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const viewSubTask = async (id: string) => {
  return callApi({ uriEndPoint: subTasks.view, pathParams: { id } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const updateSubTask = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: subTasks.update, pathParams: { id }, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const addSubTask = async (body: any) => {
  return callApi({ uriEndPoint: subTasks.add, body })
    .then(res => {
      toast.success(res?.message ?? 'Project Added Successfully')

      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Project Added Successfully')

      return err
    })
}

export const fetchSubTaskColumns = async (query: any): Promise<AdditionalColumn[]> => {
  return callApi({ uriEndPoint: subTasks.getColumn, query })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      toast.error(err?.message ?? 'Failed to fetch column')

      return err
    })
}

export const deleteSubTask = async (id: string) => {
  return callApi({ uriEndPoint: subTasks.deleteItem, pathParams: { id } })
    .then(res => {
      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Failed to delete subtask')

      return err
    })
}

export const createSubTaskColumn = async (body: any) => {
  return callApi({ uriEndPoint: subTasks.createSubTaskColumn, body })
    .then(res => {
      toast.success(res?.message ?? 'Created Column Successfully')

      return res
    })
    .catch(err => {
      toast.error(err?.message ?? 'Failed to create column')

      return err
    })
}
