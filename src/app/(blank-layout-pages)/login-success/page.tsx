'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { CircularProgress } from '@mui/material'
import axios from 'axios'

import { authConfig } from '@/configs/authConfig'
import { routes } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

const LoginSuccessRedirect = () => {
  // ** States
  const [loading, setLoading] = useState(true)

  // ** Hooks
  const router = useRouter()
  const { setUser } = useAuth()

  const handleSuccessRedirect = async () => {
    try {
      setLoading(true)

      axios
        .get(process.env.NEXT_PUBLIC_API_URL + '/auth/login/success', {
          withCredentials: true
        })
        .then(async res => {
          const responseValue = res?.data

          if (responseValue?.status && responseValue.data?.isVerified) {
            localStorage.setItem(authConfig.loginUserData, JSON.stringify(responseValue?.data))
  
            setLoading(false)

            await axios.post('/api/set-cookies', responseValue?.data)
            setUser(responseValue?.data?.userData)

            router.replace(routes.dashboard)
          } else {
            router.replace(
              routes.register +
                `?name=${responseValue?.data?.userData?.Name}&email=${responseValue?.data?.userData?.Email}`
            )
            setLoading(false)
          }
        })
        .catch(err => {
          console.error('err :', err)
          localStorage.removeItem(authConfig.loginWithGoogle)
        })
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSuccessRedirect()
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])





  if (loading)
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <CircularProgress />
      </div>
    )

  return <></>
}

export default LoginSuccessRedirect
