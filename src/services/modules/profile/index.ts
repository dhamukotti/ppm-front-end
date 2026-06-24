import { callApi } from 'src/utils/api-utils'
import { userEndpoint } from './endpoint'
import type { ProfileData } from './types'

export const fetchProfileData = async (): Promise<ProfileData> => {
  return callApi({ uriEndPoint: userEndpoint.profile })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const userChangePassword = async (body: any) => {
  return callApi({ uriEndPoint: userEndpoint.changePassword, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const updateProfile = async (body: any) => {
  return callApi({ uriEndPoint: userEndpoint.profileUpdate, body })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}

export const fetchAllRecentActivities = async () => {
  return callApi({ uriEndPoint: userEndpoint.recentActivityPage })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}
