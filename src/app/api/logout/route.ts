// ** Next Imports
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse as res } from 'next/server'

import axios from 'axios'

import { verify } from 'jsonwebtoken'

import { authentication } from '@/services/auth/endpoint'
import type { CookieEncData } from '@/types/api-response'

// ** Third Party Imports

export async function GET() {
  const secret = process.env.NEXT_PUBLIC_API_SECRET_KEY ?? `THISISSECRET`

  const jwt = (await cookies()).get('jwt')

  try {
    if (jwt?.value) {
      const verifiedToken = verify(jwt.value, secret) as CookieEncData

      const url = process?.env?.NEXT_PUBLIC_API_URL ?? '/api'

      const response = await axios.get(url + authentication.logout.uri + '/', {
        headers: { Authorization: 'Bearer ' + verifiedToken?.token }
      })

      ;(await cookies()).delete('jwt')
      revalidatePath('/', 'layout')

      return res.json(response?.data, { status: 200 })
    } else {
      ;(await cookies()).delete('jwt')

      return res.json({ status: false, message: 'Session Timed Out' }, { status: 202 })
    }
  } catch (error: any) {
    console.error('error :', error)
    ;(await cookies()).delete('jwt')

    return res.json(error?.response?.data ?? { status: false, message: 'Session Timed Out' }, { status: 422 })
  }
}
