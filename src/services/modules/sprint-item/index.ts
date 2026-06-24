import { callApi } from '@/utils/api-utils'
import { sprint } from './endpoint'
import type { SprintItem } from './types'
import type { ApiResponse } from '@/types/api-response'
import toast from 'react-hot-toast'

export const fetchSprintListBasic = async (workspaceID: string): Promise<SprintItem[]> => {
  return callApi({ uriEndPoint: sprint.listBasic, query: { workspaceID } })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const fetchSprintList = async (params: any): Promise<ApiResponse<SprintItem[]>> => {
  return callApi({ uriEndPoint: sprint.list, query: params })
}

export const fetchdynamiccolumns = async (params: any): Promise<ApiResponse<SprintItem[]>> => {
  return callApi({ uriEndPoint: sprint.Dynamiccolumns,
        useSecondApi:true,
    query: params })
}




export const createSprint = async (body: any) => {
  return callApi({ uriEndPoint: sprint.add, body })
}

export const updateSprint = async ({ id, body }: { id: string; body: any }) => {
  return callApi({ uriEndPoint: sprint.update, pathParams: { id }, body })
}
export const deleteSprint = async (id: string) => {
  return callApi({ uriEndPoint: sprint.deleteItem, pathParams: { id } }).then((res)=>{
     toast.success('Sprint Deleted Successfully')
  })
}


// NEW APIS

export const createSprintItems = async (body: any) => {
  return callApi({ uriEndPoint: sprint.CreateSprintItem,
    useSecondApi:true,
         query: body,
  
  
  }).then((res)=>{
          toast.success(res?.message ?? 'Sprint Added Successfully')

  })
}


export const UpdateSrpintItem = async (body: any) => {
  return callApi({ uriEndPoint: sprint.UpdateSrpintItem,
    useSecondApi:true,
         query: body,
  
  
  }).then((res)=>{
          toast.success(res?.message ?? 'Sprint Updated Successfully')

  })
}

export const UpdateSprinttimeline = async (body: any) => {
  return callApi({ uriEndPoint: sprint.UpdateSprinttimeline,
    useSecondApi:true,
         query: body,
  
  
  }).then((res)=>{
          toast.success(res?.message ?? 'Sprint Timeline Updated Successfully')

  })
}

export const CreateDynamicColumn = async (body: any) => {
  return callApi({ uriEndPoint: sprint.Createdynamicolumn,
    useSecondApi:true,
         query: body,
  
  
  }).then((res)=>{
          toast.success('Column Added Successfully')

  })
}
