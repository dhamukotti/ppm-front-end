'use client'

import { useState } from 'react'

import Image from 'next/image'

import { useRouter } from 'next/navigation'

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme
} from '@mui/material'

// ** IMAGES
import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'

import toast from 'react-hot-toast'

import { pattern } from '@/constants/patterns'

import logoMainDark from '@public/images/logos/logo-pp-dark.png'
import logoMain from '@public/images/logos/logo-pp.png'

import { routes } from '@/constants/routes'

import IconifyIcon from '@components/icon'

import { authConfig } from '@/configs/authConfig'
import { registerWithInvitationApi } from '@/services/modules/invite'
import { sleep } from '@/utils'
import { useAuth } from 'src/hooks/useAuth'

const defaultValues = {
  fullName: '',
  password: ''
}

const RegisterOnInvite = ({ invitationID }: { invitationID: string }) => {
  // ** Hooks
  const theme = useTheme()
  const router = useRouter()

  const auth = useAuth()

  // ** States
  const [showPassword, setShowPassword] = useState(false)

  //  ** Form Hooks
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid }
  } = useForm({ defaultValues })

  // ** Functions
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const onSubmit = async (formData: any) => {
    if (!invitationID) {
      toast.error('Invalid URL! Please Check your invitation URL Again', { position: 'top-center' })

      return
    }

    const submitBody = {
      invitationID,
      ...formData
    }

    const register = await registerWithInvitationApi(submitBody)

    if (register?.status) {
      localStorage.setItem(authConfig.storageUID, register?.data?.userData?.UserID)
      localStorage.setItem(authConfig.loginUserData, JSON.stringify(register.data))

      auth.setUser(register?.data?.userData)

      await sleep(500)

      router.replace(routes.project + '/' + register?.data?.projectID)
    } else {
      toast.error('FAILED TO REGISTER !')
    }
  }

  return (
    <Box display={'flex'} height={'100vh'}>
      <Box flex={2} height={'100%'} display={'flex'} flexDirection={'column'} py={10} px={{ xs: 10, md: 30 }} gap={3}>
        <Box display={'flex'}>
          <Image
            src={theme.palette.mode === 'dark' ? logoMainDark : logoMain}
            alt='PPM-Logo'
            width={180}
            height={60}
            priority
            style={{ width: '100%', maxWidth: '180px', height: 'auto' }}
          />
        </Box>
        <Box height={'100%'} display={'flex'} flexDirection={'column'} gap={3} py={10} justifyContent={'center'}>
          <form autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography variant='h5' fontWeight={700}>
                  Join Project Plus 360 Account
                </Typography>
                <Typography variant='body1' fontWeight={500} mt={2}>
                  Complete your details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='fullName'
                  control={control}
                  rules={{
                    required: 'Please enter your name',
                    pattern: { value: pattern.alphaAllowed, message: 'Please enter a valid name' }
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ maxWidth: { xs: '100%', md: '550px' } }}>
                      <TextField
                        type='text'
                        autoComplete='do-not-autofill'
                        label='Full name'
                        fullWidth
                        {...field}
                        inputProps={{ maxLength: 50 }}
                        error={!!errors?.fullName?.message}
                        helperText={errors?.fullName?.message}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='password'
                  control={control}
                  rules={{
                    required: 'Please enter a password to your account',
                    pattern: {
                      value: pattern.passwordPattern,
                      message:
                        'Please enter a strong password with at least 1 Uppercase, 1 Lowercase, 1 Symbol and 1 Number'
                    }
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ maxWidth: { xs: '100%', md: '550px' } }}>
                      <TextField
                        label='Password'
                        fullWidth
                        {...field}
                        error={!!errors?.password?.message}
                        helperText={errors?.password?.message}
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                aria-label='toggle password visibility'
                              >
                                {showPassword ? (
                                  <IconifyIcon icon={'mdi:eye-outline'} color={Boolean(errors?.password) && 'red'} />
                                ) : (
                                  <IconifyIcon
                                    icon={'mdi:eye-off-outline'}
                                    color={Boolean(errors?.password) && 'red'}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} mt={4}>
                <Box
                  display={'flex'}
                  flexDirection={'row'}
                  gap={3}
                  justifyContent={'end'}
                  sx={{ maxWidth: { xs: '100%', md: '750px' } }}
                >
                  <Button
                    variant='contained'
                    endIcon={!isSubmitting && <Icon icon={'mdi:chevron-right'} />}
                    type='submit'
                  //  disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? <CircularProgress color='secondary' size={22} /> : 'Continue'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
      <Box display={{ xs: 'none', md: 'block' }} flex={1} height={'100%'} bgcolor={'primary.main'}></Box>
    </Box>
  )
}

export default RegisterOnInvite
