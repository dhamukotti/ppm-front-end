import { callApi } from '@/utils/api-utils'
import { recentActivity } from './endpoint'
import type { RecentActivityResponseData } from './types'

export const fetchAllRecentActivities = async (): Promise<RecentActivityResponseData> => {
  return callApi({ uriEndPoint: recentActivity.list })
    .then(res => {
      return res?.data
    })
    .catch(err => {
      throw err
    })
}
