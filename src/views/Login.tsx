'use client'

// React Imports
import { useContext, useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { Theme } from '@mui/material'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

// Images
import logoMainDark from '@public/images/logos/logo-pp-dark.png'
import logoMain from '@public/images/logos/logo-pp.png'

// Hook Imports
import { pattern } from '@/constants/patterns'
import { routes } from '@/constants/routes'
import { AuthContext } from '@/context/auth-context'
import { authentication } from '@/services/auth/endpoint'
import { authConfig } from '@/configs/authConfig'

const defaultValues = {
  email: process?.env?.NODE_ENV === 'development' ? 'dhamukotti123@gmail.com' : '',
  password: process?.env?.NODE_ENV === 'development' ? 'Abc@223133' : ''
}

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

type FormFields = {
  email: string
  password: string
  latitude: number
  longitude: number
}

const LoginV2 = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [bgSize, setBgSize] = useState<number | string>('100vw')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Form
  const {
    handleSubmit,
    control,
    formState: { isSubmitting }
  } = useForm<FormFields>({
    defaultValues: {
      email: defaultValues.email,
      password: defaultValues.password,
      latitude: 0,
      longitude: 0
    }
  })

  // Hooks
  const auth = useContext(AuthContext)
  const theme = useTheme()
  const mdEndpoint = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: FormFields) => {
    const body = {
      ...data,
      ...location
    }

    await auth.login(body)
  }

  const handleGoogleSignin = async () => {
    try {
      setIsGoogleLoading(true)
      
      // Validate environment variables
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      if (!baseUrl) {
        console.error('NEXT_PUBLIC_API_URL is not defined')
        throw new Error('Google login configuration error. Please contact support.')
      }

      // Validate authentication config
      const googleLoginUri = authentication?.googleLogin?.uri
      if (!googleLoginUri) {
        console.error('Google login URI is not defined in authentication config')
        throw new Error('Google login configuration error. Please contact support.')
      }

      // Set localStorage flag if available
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(authConfig.loginWithGoogle, '1')
        } catch (storageError) {
          console.warn('Failed to set localStorage item:', storageError)
          // Continue with login even if localStorage fails
        }
      }

      // Build the redirect URI
      const redirectUri = `${baseUrl.replace(/\/$/, '')}${googleLoginUri.startsWith('/') ? googleLoginUri : '/' + googleLoginUri}`
      
      // Add location parameters if available
      const urlParams = new URLSearchParams()
      if (location?.latitude && location?.longitude) {
        urlParams.append('latitude', location.latitude.toString())
        urlParams.append('longitude', location.longitude.toString())
      }
      
      // Add current page as return URL
      urlParams.append('returnUrl', window.location.origin + window.location.pathname)
      
      const finalRedirectUri = urlParams.toString() 
        ? `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}${urlParams.toString()}`
        : redirectUri


      // Small delay to ensure state is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))

      // Perform redirect
      window.location.href = finalRedirectUri
      
    } catch (error) {
      console.error('Error during Google signin:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Google login. Please try again.'
      
      // You can replace alert with your preferred notification system
      if (typeof window !== 'undefined') {
        alert(errorMessage)
      }
      
      setIsGoogleLoading(false)
    }
  }

  // Get user location
  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser')
      return
    }

    const locationOptions = {
      enableHighAccuracy: false, // Set to false for faster response
      timeout: 15000, // Increased timeout to 15 seconds
      maximumAge: 600000 // Accept cached position up to 10 minutes old
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setLocation({ latitude, longitude })
      },
      (error) => {
        console.warn('Error getting location:', error.message)
        // Don't block the app if location fails - just continue without location
        setLocation(null)
      },
      locationOptions
    )
  }, [])

  // Handle background sizing
  useEffect(() => {
    const calculateBgSize = () => {
      const width = window.innerWidth || document.documentElement.clientWidth
      setBgSize(mdEndpoint ? width * 0.7 : width)
    }

    // Initial calculation
    calculateBgSize()

    // Recalculate on resize with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateBgSize, 100)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [mdEndpoint])

  // Handle Google login callback
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      const urlParams = new URLSearchParams(window.location.search)
      const googleLoginSuccess = urlParams.get('google_login')
      const error = urlParams.get('error')
      
      if (googleLoginSuccess === 'success') {
        
        // Clear the URL parameters to clean up the URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        // Call auth context method if needed
        // auth.handleGoogleLoginSuccess?.()
        
      } else if (googleLoginSuccess === 'error' || error) {
        console.error('Google login failed:', error || 'Unknown error')
        
        // Clear the URL parameters
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        // Show error message
        const errorMsg = error || 'Google login failed. Please try again.'
        alert(`Google Login Error: ${errorMsg}`)
      }
    } catch (callbackError) {
      console.error('Error handling Google login callback:', callbackError)
    }
  }, [])

  return (
    <Box
      bgcolor={'background.default'}
      height={'100%'}
      sx={{
        backgroundImage: 'url(/images/pages/login-bg.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: bgSize
      }}
    >
      <Grid container spacing={5} minHeight={'100dvh'}>
        <Grid item xs={12} lg={6} justifySelf={'end'} display={{ xs: 'none', lg: 'flex' }} mt={'45vh'}>
          <Box display={'flex'} justifyContent={'start'} px={20}>
            <Box>
              <Typography className='text-5xl text-textPrimary leading-tight font-bold'>LogIn to</Typography>
              <Typography className='text-5xl leading-tight font-bold text-primary'>Manage</Typography>
              <Typography className='text-5xl text-textPrimary leading-tight font-bold'>fantastic thing</Typography>
              <Typography className='text-2xl text-textPrimary font-bold' mt={6}>
                {`If you don't have an account`}
              </Typography>
              <Typography className='text-2xl text-textPrimary font-bold'>
                {` you can `}
                <Typography component={Link} href={routes.register} className='text-2xl font-bold text-primary'>
                  {`register here`}
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={6} alignSelf={'center'} justifySelf={{ xs: 'center', lg: 'end' }}>
          <Box display={'flex'} justifyContent={{ xs: 'center', lg: 'end' }} px={{ xs: 0, lg: 20 }}>
            <Card className='max-w-xl w-full z-10'>
              <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
                <Box sx={{ mb: 6 }}>
                  <Box display={'flex'} width={'100%'} justifyContent={'center'} mb={3}>
                    <Box display={'flex'}>
                      <Image
                        src={theme.palette.mode === 'dark' ? logoMainDark : logoMain}
                        alt='PPM-Logo'
                        width={550}
                        height={100}
                        priority
                        style={{ width: '100%', maxWidth: '550px', height: 'auto' }}
                      />
                    </Box>
                  </Box>
                  <Typography variant='body2' textAlign={'center'}>
                    A Warm welcome <br /> to the new era of the project management application{' '}
                  </Typography>
                </Box>
                <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                  <Controller
                    name='email'
                    control={control}
                    rules={{
                      required: 'Please enter a email',
                      pattern: { value: pattern.email, message: 'Please enter a valid email' }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth>
                        <TextField
                          {...field}
                          type='email'
                          autoFocus
                          fullWidth
                          label='Email'
                          error={!!error}
                          helperText={error?.message}
                        />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: 'Please enter a password' }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth>
                        <TextField
                          fullWidth
                          {...field}
                          label='Password'
                          error={!!error}
                          helperText={error?.message}
                          type={isPasswordShown ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  size='small'
                                  edge='end'
                                  onClick={handleClickShowPassword}
                                  onMouseDown={e => e.preventDefault()}
                                >
                                  <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />{' '}
                      </FormControl>
                    )}
                  />
                  <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                    <FormControlLabel control={<Checkbox />} label='Remember me' />
                    <Typography href={routes.forgotPassword} className='text-end' color='primary' component={Link}>
                      Forgot password?
                    </Typography>
                  </div>
                  <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={22} color='secondary' /> : 'LOGIN'}
                  </Button>
                  <Divider className='gap-3 text-textPrimary'>or</Divider>
                  <div className='flex justify-center items-center gap-2'>
                    <Button
                      onClick={handleGoogleSignin}
                      disabled={isGoogleLoading || isSubmitting}
                      className='text-textPrimary shadow-md'
                      variant='outlined'
                      fullWidth
                      startIcon={
                        isGoogleLoading ? 
                        <CircularProgress size={16} color='inherit' /> : 
                        <i className='ri-google-fill text-googlePlus' />
                      }
                    >
                      {isGoogleLoading ? 'Redirecting to Google...' : 'Sign in with Google'}
                    </Button>
                  </div>
                </form>
                {!mdEndpoint && (
                  <Box
                    mt={4}
                    sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
                  >
                    <Typography variant='body2' sx={{ marginRight: 2 }}>
                      {`Don't have an account?`}
                    </Typography>
                    <Typography variant='body2'>
                      <LinkStyled href={routes.register}> Sign up</LinkStyled>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default LoginV2
