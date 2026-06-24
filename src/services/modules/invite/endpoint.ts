import type { ApiEndpoint } from '@/types/api-utils'

type Endpoints = {
  projectMembers: ApiEndpoint
  add: ApiEndpoint
  getInvite: ApiEndpoint
  acceptInvite: ApiEndpoint
  registerWithInvite: ApiEndpoint
}

export const invite: Endpoints = {
  projectMembers: {
    method: 'GET',
    uri: '/api/project-members'
  },
  add: {
    method: 'POST',
    uri: '/SendInvite'
  },
  getInvite: {
    method: 'GET',
    uri: '/api/invite/:id'
  },
  acceptInvite: {
    method: 'POST',
    uri: '/api/accept-invite/:id'
  },
  registerWithInvite: {
    method: 'POST',
    uri: '/api/register-invite'
  }
}
