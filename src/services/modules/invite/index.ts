import toast from 'react-hot-toast'

import { callApi } from '@/utils/api-utils'
import { invite } from './endpoint'
import type { ProjectUsers } from './types'

export const projectMembers = async (projectID: string): Promise<ProjectUsers[]> => {
  return callApi({ uriEndPoint: invite.projectMembers, query: { projectID } })
    .then(res => res?.data)
    .catch(err => err)
}

export const inviteMember = async (body: any) => {
  return callApi({ uriEndPoint: invite.add,
     body,
      useSecondApi: true  // Add this parameter
 })
    .then(res => {
      toast.success(res?.message ?? 'Invitation sent successfully')

      return res
    })
    .catch(err => err)
}

export const getInvitationAPI = async (id: string) => {
  return callApi({ uriEndPoint: invite.getInvite, pathParams: { id } })
    .then(res => res?.data)
    .catch(err => err)
}

export const acceptInvitationApi = async (id: string) => {
  return callApi({ uriEndPoint: invite.acceptInvite, pathParams: { id } })
    .then(res => res)
    .catch(err => err)
}

export const registerWithInvitationApi = async (body: any) => {
  return callApi({ uriEndPoint: invite.registerWithInvite, body })
    .then(res => res)
    .catch(err => err)
}
