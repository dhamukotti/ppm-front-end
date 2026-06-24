// ** API ,Redux Imports
import axios from 'axios'

import toast from 'react-hot-toast'

import type { ApiResponse } from '@/types/api-response'

// ** API Imports
import { authentication } from './endpoint'

import { callApi } from '@api-utils'

type LoginBody = {
  email: string
  password: string
  latitude: number
  longitude: number
}

export const userLogin = async (body: LoginBody) => {
  return callApi({ uriEndPoint: authentication?.login, body, nextUrl: true })
    .then((res: ApiResponse) => {
      if (res.status) {
        localStorage.setItem('userData', JSON.stringify(res.data))
        toast.success(res.message ?? '')

        paymentcheck(res.data?.userID || res.data?.id)

        return res
      } else {
        throw res
      }
    })
    .catch(err => {
      toast.error(err?.message)
      throw err
    })
}
const paymentcheck = async (userId: number) => {
  const Baseurl = process.env.NEXT_PUBLIC_API_URL1
  try {
    const res = await axios.post(`${Baseurl}/CheckAccountExpiry/${userId}`)
    
    if (res.data && res.data.length > 0) {
      const paymentData = {
       isExpired: res.data[0].isExpired,
       projectCount:res.data[0].projectCount,
       workspaceCount:res.data[0].workspaceCount,
       taskGroupCount:res.data[0].taskGroupCount,
       boardCount:res.data[0].boardCount,
       boardsectionCount:res.data[0].boardsectionCount,
       boardTaskCount:res.data[0].boardTaskCount,
       amount:res.data[0].amount
            //  isExpired: true
      }
      // localStorage.setItem('paymentStatus', JSON.stringify(paymentData))
            localStorage.setItem('paymentStatus', JSON.stringify(paymentData))


    }
  } catch (error) {
    console.error('Payment check error:', error)
  }
}
export const userRegister = async (body: any) => {
  return callApi({ uriEndPoint: authentication.register, body, nextUrl: true })
    .then(res => {
      if (res.statusCode === 201) {
        localStorage.setItem('userData', JSON.stringify(res.data))

        return res
      } else {
        delete res.data

        return res
      }
    })
    .catch(err => {
      throw err
    })
}

export const userLogout = (id: string) => {
  return callApi({
    uriEndPoint: authentication.logout,
    pathParams: { u_id: id },
    nextUrl: true
  })
    .then((res: ApiResponse) => {
      toast.success(res?.message)

      return res
    })
    .catch(err => {
      throw err
    })
}

export const verifyEmail = async (body: { email: string }): Promise<ApiResponse> => {
  return callApi({
    uriEndPoint: authentication.emailVerification,
    body
  })
    .then(res => {
      toast.success(res.message)

      return res
    })
    .catch(err => {
      toast.error(err.message)

      return err
    })
}

export const refreshToken = async (body: any) => {
  return axios({
    method: authentication.refreshToken.method,
    url: process.env.NEXT_PUBLIC_API_URL + authentication.refreshToken.uri,
    headers: {
      'Content-Type': 'application/json'
    },
    data: body
  })
    .then(res => {
      return res.data
    })
    .catch(err => {
      throw err
    })
}

export const clearCookies = async () => {
  return callApi({ uriEndPoint: authentication.clearCookies, nextUrl: true })
    .then((res: ApiResponse) => {
      return res
    })
    .catch(err => {
      return err
    })
}

export const verifyOtp = async (body: any): Promise<ApiResponse> => {
  return callApi({
    uriEndPoint: authentication.otpVerification,
    body
  })
    .then(res => {
      toast.success(res.message)

      return res
    })
    .catch(err => {
      toast.error(err.message)

      return err as ApiResponse
    })
}

export const resetPassword = async (body: any) => {
  return callApi({
    uriEndPoint: authentication.resetPassword,
    body
  })
    .then(res => {
      toast.success(res.message)

      return res
    })
    .catch(err => {
      throw err
    })
}
