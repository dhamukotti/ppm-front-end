import { callApi } from '@/utils/api-utils'
import { sprint } from './endpoint'
import type { SprintTaskItem } from './types'
import type { ApiResponse } from '@/types/api-response'
import toast from 'react-hot-toast'

export const fetchSprintTaskList = async (params: any): Promise<ApiResponse<SprintTaskItem[]>> => {
  return callApi({ uriEndPoint: sprint.list, query: params })
}

export const createSprintTasks = async (body: any) => {
  return callApi({ uriEndPoint: sprint.add, body })
}

export const updateSprintTask = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: sprint.update, pathParams: { id }, body })
}

// new api

export const CREATESPRINTTASKS = async (body: any) => {
  return callApi({ uriEndPoint: sprint.Createsprinttask,
    useSecondApi:true,
         query: body,
  
  
  }).then((res)=>{
          toast.success('Sprint Task Added Successfully')

  })
}
