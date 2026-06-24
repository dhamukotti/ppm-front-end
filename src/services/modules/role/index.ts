import { callApi } from '@/utils/api-utils'
import { role } from './endpoint'

export interface Roles {
  RoleID: number
  RoleName: string
}

export const fetchRolesList = async (): Promise<Roles[]> => {
  return callApi({ uriEndPoint: role.list })
    .then(res => res?.data)
    .catch(err => err)
}
