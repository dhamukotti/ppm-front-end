// ** Next Imports
import { cookies } from 'next/headers'
import { NextResponse as res } from 'next/server'

import axios from 'axios'

import { sign, verify } from 'jsonwebtoken'

import moment from 'moment'

import { refreshToken } from '@/services/auth'
import { authentication } from '@/services/auth/endpoint'

import type { CookieEncData } from '@/types/api-response'

const checkTokenExpiration = async (verifiedToken: CookieEncData, secret: string, res: any) => {
  const date = moment().toDate()

  try {
    if (verifiedToken?.tokenTime > date.getTime() / 1000) {
      return verifiedToken?.token
    } else if (verifiedToken?.refreshTokenTime > date.getTime() / 1000) {

      const newRefreshToken = await refreshToken({
        refreshToken: verifiedToken.refreshToken
      })

      if (newRefreshToken) {
        const encJwt = sign(
          {
            token: newRefreshToken?.data?.token,
            tokenTime: newRefreshToken?.data?.tokenTime,
            refreshTokenTime: newRefreshToken?.data?.refreshTokenTime,
            refreshToken: newRefreshToken?.data?.refreshToken
          },
          secret
        )

        ;(await cookies()).set('jwt', encJwt, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 365
        })

        return newRefreshToken?.data?.token
      }
    } else {
      ;(await cookies()).delete('jwt')
    }

    return res.json({ status: false, message: 'Invalid Token' }, { status: 403 })
  } catch (error) {
    console.error('error :', error)

    return verifiedToken?.token
  }
}

export async function GET() {
  const privateKey = process.env.NEXT_PUBLIC_API_SECRET_KEY ?? `THISISSECRET`
  const jwt = (await cookies()).get('jwt')

  try {
    if (jwt?.value) {
      const verifiedToken = verify(jwt?.value, privateKey) as CookieEncData

      if (!verifiedToken) {
        return res.json({ status: false, message: 'Invalid Token' }, { status: 403 })
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + authentication.verifyToken.uri, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + (await checkTokenExpiration(verifiedToken, privateKey, res))
        }
      })

      return res.json(response?.data ?? { status: true, message: 'Token Verified' }, { status: 200 })
    } else {
      ;(await cookies()).delete('jwt')

      return res.json({ status: false, message: 'Session Timed Out' }, { status: 422 })
    }
  } catch (error: any) {
    ;(await cookies()).delete('jwt')

    return res.json(error?.response?.data ?? { status: false, message: 'Internal Server Error' }, { status: 422 })
  }
}
