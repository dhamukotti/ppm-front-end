import { redirect } from 'next/navigation'

import { verify } from 'jsonwebtoken'

import { routes } from '@/constants/routes'
import ResetPasswordPage from '@/views/auth/reset-password'

const Page = async ({ searchParams }: { searchParams: Promise<{ k?: string }> }) => {
  const getParams = await searchParams

  if (!!getParams?.k) {
    return verify(
      getParams?.k as string,
      process?.env?.NEXT_PUBLIC_API_SECRET_KEY ?? 'THIS_IS_A_SECRET',
      (error, decoded) => {
        if (error) {
          if (error?.name === 'TokenExpiredError') {
            redirect(routes.login)
          }
        } else {
          const decodedValue = decoded as { email: string }

          return <ResetPasswordPage email={decodedValue?.email} />
        }
      }
    )
  } else {
    redirect(routes.login)
  }

  return null
}

export default Page
