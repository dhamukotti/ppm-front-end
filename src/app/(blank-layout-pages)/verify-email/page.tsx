import { redirect } from 'next/navigation'

import { verify } from 'jsonwebtoken'

import { routes } from '@/constants/routes'
import VerifyEmailPage from '@/views/auth/verify-email'

const Page = async ({ searchParams }: { searchParams: Promise<{ k?: string }> }) => {
  const getParams = await searchParams


  // ** show email de******@gmail.com
  function obfuscateEmail(email: string) {
    try {
      const [localPart, domainPart] = email.split('@')

      const obfuscatedLocalPart =
        localPart.charAt(0).toUpperCase() + '*'.repeat(localPart.length - 1) + localPart.charAt(localPart.length - 0)

      return `${obfuscatedLocalPart}@${domainPart}`?.toLocaleLowerCase()
    } catch (error) {
      return 'Invalid Email'
    }
  }

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

          const obfuscate = obfuscateEmail(decodedValue?.email)


          return <VerifyEmailPage obfuscate={obfuscate} email={decodedValue?.email} />
        }
      }
    )
  } else {
    redirect(routes.login)
  }

  return null
}

export default Page
