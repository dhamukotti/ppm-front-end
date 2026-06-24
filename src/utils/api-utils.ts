import axios from 'axios'
import moment from 'moment'

import { routes } from '@/constants/routes'
import type { ApiResponse } from '@/types/api-response'
import type { ApiUtils, MakeUrl } from '@/types/api-utils'
import { authConfig } from '@/configs/authConfig'
import { refreshToken } from '@/services/auth'

// ** Moment

const showLogs = false

const checkTokenExpired = async () => {
  const userData = localStorage.getItem(authConfig.loginUserData)

  if (!userData) return null

  const loginData = JSON.parse(userData)

  const date = moment().toDate()

  if (loginData.tokenTime > date.getTime() / 1000) {
    return loginData?.token
  } else if (loginData.refreshTokenTime > date.getTime() / 1000) {
    const newRefreshToken = await refreshToken({ refresh_token: loginData.refreshToken })

    localStorage.setItem(authConfig.loginUserData, JSON.stringify(newRefreshToken.data))
    localStorage.setItem(authConfig.storageUID, newRefreshToken.data.u_id)

    return newRefreshToken.data.token
  } else {
    localStorage.removeItem(authConfig.loginUserData)
    localStorage.removeItem(authConfig.storageUID)
    window.location.href = routes.login

    return null
  }
}

export const getDefaultHeaders = async ({ auth }: { auth: boolean }) => {
  const userData = localStorage.getItem(authConfig.loginUserData)

  if (!userData || !auth) return { 'Content-Type': 'application/json', 'Origin-api': window.location.origin }

  const loginData = JSON?.parse(userData)

  if (loginData) {
    return {
      Authorization: 'Bearer ' + (await checkTokenExpired()),
      'Content-Type': 'application/json',
      'Origin-api': window.location.origin
    }
  }

  return { 'Content-Type': 'application/json', 'Origin-api': window.location.origin }
}

export const makeUrl = ({ uri = '', pathParams, query }: MakeUrl, host: string) => {
  return `${host || `${process.env.NEXT_PUBLIC_API_URL}`}${uri
    .split('/')
    .map(param => (param.charAt(0) === ':' && pathParams ? encodeURI(pathParams[param.slice(1)]) : param))
    .join('/')}${query ? `?${new URLSearchParams(query)}` : ''}`
}

const callAxios = async ({
  uriEndPoint,
  pathParams,
  query,
  body,
  apiHostUrl = '',
  auth = true,
  nextUrl = false,
  useSecondApi = false // Add this optional parameter
}: ApiUtils & { useSecondApi?: boolean }) => {
  showLogs &&
    console.log('Call AXIOS ==>', {
      uriEndPoint,
      pathParams,
      query,
      body,
      apiHostUrl,
      auth,
      useSecondApi
    })

  if (nextUrl)
    return axios({
      method: uriEndPoint.method,
      url: makeUrl({ ...uriEndPoint, pathParams, query }, window.location.origin),
      headers: {
        ...uriEndPoint.headerProps
      },
      data: body || {}
    })

  // Determine the base URL - use second API if specified
  let baseUrl = apiHostUrl
  if (!baseUrl && useSecondApi) {
    baseUrl = process.env.NEXT_PUBLIC_API_URL1 || process.env.NEXT_PUBLIC_API_URL || ''
  }

  return axios({
    method: uriEndPoint.method,
    url: makeUrl({ ...uriEndPoint, pathParams, query }, baseUrl),
    headers: {
      ...(await getDefaultHeaders({ auth })),
      ...uriEndPoint.headerProps
    },
    data: body || {}
  })
}

export const callApi = (props: ApiUtils & { useSecondApi?: boolean }): Promise<ApiResponse> => {
  const {
    uriEndPoint = { uri: '', method: 'GET', headerProps: {} },
    pathParams,
    query,
    body,
    apiHostUrl,
    nextUrl,
    auth,
    useSecondApi = false
  } = props

  return new Promise((resolve, reject) => {
    callAxios({
      uriEndPoint,
      pathParams,
      query,
      body,
      apiHostUrl,
      nextUrl,
      auth,
      useSecondApi
    })
      .then(response => {
        showLogs && console.log('callApi RES ==>', response.data)
        resolve(response?.data)
      })
      .catch(async err => {
        if (
          err?.response?.data?.message === 'Invalid Token' ||
          err?.response?.data?.message === 'Session Timed Out' ||
          err?.response?.data?.message === 'Internal Server Error' ||
          err?.response?.data?.message === 'Invalid Token'
        ) {
          await axios.get('/api/logout')
          window.location.href = routes.login + '?redirect=' + window.location.href
        }

        showLogs && console.log('callApi ERR ==>', err)
        reject(err.response?.data ?? err)
      })
  })
}
