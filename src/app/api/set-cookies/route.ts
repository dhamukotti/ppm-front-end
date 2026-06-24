import { cookies } from 'next/headers'
import { NextResponse as res } from 'next/server'

import { sign } from 'jsonwebtoken'

import type { CookieEncData } from '@/types/api-response'

export async function POST(req: Request) {
  try {
    const body: any = await req.json()

    const privateKey = process.env.NEXT_PUBLIC_API_SECRET_KEY ?? `THISISSECRET`

    const jwt = body?.token

    const userData = body

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

    return res.json(body, { status: 200 })
  } catch (error: any) {
    return res.json(error?.response?.data, { status: 422 })
  }
}
