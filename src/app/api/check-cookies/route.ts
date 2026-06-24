import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface CookieData {
  value?: string
}

export const dynamic = 'force-dynamic'

async function getCookieData(): Promise<CookieData | undefined> {
  const cookieData = (await cookies()).get('jwt')

  return new Promise(resolve => resolve(cookieData ? { value: cookieData.value } : undefined))
}

export async function GET(): Promise<NextResponse> {
  try {
    const cookieData = await getCookieData()

    if (cookieData?.value) {
      return NextResponse.json({ status: true, message: 'Cookies Found' }, { status: 200 })
    } else {
      return NextResponse.json({ status: false, message: 'No Cookies Found' }, { status: 202 })
    }
  } catch (error) {
    return NextResponse.json({ status: false, message: 'No Cookies Found' }, { status: 202 })
  }
}
