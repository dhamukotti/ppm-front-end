import { cookies } from 'next/headers'
import { NextResponse as res } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    ;(await cookies()).delete('jwt')
    ;(await cookies()).delete('permissions')

    return res.json({ status: true, message: 'Cookies Cleared' }, { status: 200 })
  } catch (error) {
    console.error('Cookie Clear Error :', error)

    return res.json({ status: true, message: 'Failed To Clear Cookies' }, { status: 422 })
  }
}
