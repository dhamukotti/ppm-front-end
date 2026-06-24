// ** React Imports
import type { FC, ReactNode } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/navigation'

import axios from 'axios'

import toast from 'react-hot-toast'

import { Button, Dialog, DialogContent, Radio, Typography } from '@mui/material'

import type { ApiResponse } from '@/types/api-response'

// ** Config
import { routes } from '@/constants/routes'

import { clearCookies, userLogin, userRegister } from '@/services/auth'
import type { User } from '@/types/auth'

export interface LoginParams {
  email: string
  password: string
  latitude: number
  longitude: number
}

export type Profiles = 'projects' | 'sprints'

interface AuthContextProps {
  user: User | null
  loading: boolean
  profile: Profiles
  // eslint-disable-next-line no-unused-vars
  setUser: (user: User | null) => void
  verifyToken: () => void
  // eslint-disable-next-line no-unused-vars
  setLoading: (loading: boolean) => void
  changeProfiles: () => void
  handleOpenSelection: () => void
  // eslint-disable-next-line no-unused-vars
  login: (params: LoginParams, errorCallback?: (err: any) => ApiResponse) => Promise<void>
  register: (params: any, errorCallback?: (err: any) => ApiResponse) => Promise<void>
  logout: () => Promise<void>
}

// ** Defaults
const defaultProvider: AuthContextProps = {
  user: null,
  loading: true,
  profile: 'projects',
  setUser: () => null,
  setLoading: () => null,
  changeProfiles: () => null,
  handleOpenSelection: () => null,
  verifyToken: () => Promise.resolve(),
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext<AuthContextProps>(defaultProvider)

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  // ** States
  const [user, setUser] = useState<User | null>(defaultProvider.user)
  const [profile, setProfile] = useState<Profiles>(defaultProvider?.profile)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  const [openProfileSelect, setOpenProfileSelect] = useState(false)

  // ** Hooks
  const router = useRouter()

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await fetch('/api/logout')
      await clearCookies()
      window.location.href = routes.login
    } catch (error) {
      console.error(error)
    } finally {
      setUser(null)
      window.location.href = routes.login
    }
  }, [])

  const checkVerifyToken = useCallback(async () => {
    setLoading(true)
    const storedProfile = window.localStorage.getItem('profile') as Profiles

    try {
      const hasCookies = await axios.get('/api/check-cookies')

      if (hasCookies?.data?.status) {
        try {
          const response = await axios.get('/api/verify-token')

          if (response?.data?.status) {
            setUser(response?.data?.data)

            if (!storedProfile) {
              setOpenProfileSelect(true)
            } else {
              setProfile(storedProfile)
            }
          }
        } catch (error) {
          handleLogout()
        }
      }
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    checkVerifyToken()
  }, [checkVerifyToken])

  // eslint-disable-next-line no-unused-vars
  const handleLogin = async (params: LoginParams, errorCallback?: (err: any) => void): Promise<void> => {
    try {
      const response = await userLogin(params)

      setLoading(true)

      const responseData = response.data

      setUser({ ...responseData })

      response?.status && router.replace(routes.dashboard)

      const storedProfile = window.localStorage.getItem('profile') as Profiles

      if (!storedProfile) {
        setOpenProfileSelect(true)
      } else {
        setProfile(storedProfile)
      }
    } catch (err) {
      setLoading(false)

      if (errorCallback) errorCallback(err)
    }
  }

  // ** USER REGISTER
  const handleRegister = async (params: any, errorCallback?: (err: any) => void): Promise<void> => {
    try {
      const res = await userRegister(params)
      const responseData = res?.data

      setUser(responseData?.userData)

      res?.status && router.replace(routes.dashboard)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Registeration Failed')
      if (errorCallback) errorCallback(err)
    }
  }

  const handleProfileChange = (val: Profiles) => {
    window.localStorage.setItem('profile', val)
    setProfile(val)
  }

  // ** Change Profiles
  const changeProfiles = (val?: Profiles) => {
    const currentProfile = val || window.localStorage.getItem('profile') || 'projects'

    if (currentProfile === 'projects') {
      handleProfileChange('sprints')
    } else {
      handleProfileChange('projects')
    }

    window.location.replace(routes.dashboard)
  }

  const handleOpenSelection = () => {
    setOpenProfileSelect(true)
  }

  const values: AuthContextProps = {
    user,
    loading,
    setUser,
    setLoading,
    handleOpenSelection,
    login: handleLogin,
    register: handleRegister,
    verifyToken: checkVerifyToken,
    profile,
    changeProfiles,
    logout: handleLogout
  }

  return (
    <AuthContext.Provider value={values}>
      {children}

      <Dialog open={openProfileSelect} fullScreen>
        <DialogContent>
          <div className='flex items-center justify-center w-full h-full'>
            <div className='flex flex-col w-full max-w-lg p-5 bg-backgroundDefault space-y-3 shadow-lg rounded-lg'>
              <Typography className=' font-semibold'>Please select a profile :</Typography>

              <div
                onClick={() => setProfile('projects')}
                className='p-2 border rounded-lg border-textPrimary flex items-center justify-between gap-5'
              >
                <Typography>Project Management</Typography>

                <Radio
                  value='projects'
                  onChange={() => setProfile('projects')}
                  name='radio-button-demo'
                  checked={profile === 'projects'}
                  inputProps={{ 'aria-label': 'Projects' }}
                />
              </div>
              <div
                onClick={() => setProfile('sprints')}
                className='p-2 border rounded-lg border-textPrimary flex items-center justify-between gap-5'
              >
                <Typography>Sprint Management</Typography>

                <Radio
                  value='sprints'
                  onChange={() => setProfile('sprints')}
                  name='radio-button-demo'
                  checked={profile === 'sprints'}
                  inputProps={{ 'aria-label': 'Projects' }}
                />
              </div>

              <div className='w-full flex justify-end mt-4'>
                <Button
                  variant='contained'
                  className='capitalize rounded-xl'
                  onClick={() => {
                    handleProfileChange(profile)
                    window.location.reload()
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
