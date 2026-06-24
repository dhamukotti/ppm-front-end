import { cookies } from 'next/headers'
import { NextResponse as res } from 'next/server'

import axios from 'axios'

import { sign } from 'jsonwebtoken'

import type { LoginParams } from '@/context/auth-context'
import { authentication } from '@/services/auth/endpoint'
import type { CookieEncData } from '@/types/api-response'

export async function POST(req: Request) {
  try {
    const body: LoginParams = await req.json()

    const privateKey = process.env.NEXT_PUBLIC_API_SECRET_KEY ?? `THISISSECRET`

    const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + authentication.login?.uri, body)

    const jwt = response?.data?.data?.token

    const userData = response?.data?.data

    const encData: CookieEncData = {
      token: jwt,
      tokenTime: userData?.tokenTime,
      refreshTokenTime: userData?.refreshTokenTime,
      refreshToken: userData?.refreshToken
    }

    const encJwt = sign(encData, privateKey)

    ;(await cookies()).set('jwt', encJwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365
    })

    return res.json(response?.data, { status: 200 })
  } catch (error: any) {
    return res.json(error?.response?.data, { status: 422 })
  }
}
