'use client'

// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Image from 'next/image'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// ** Demo Imports
import { Icon } from '@iconify/react'

import { CircularProgress, Grid, IconButton, useMediaQuery, useTheme } from '@mui/material'

import { debounce } from 'lodash'

import { Controller, useForm } from 'react-hook-form'

import { routes } from '@/constants/routes'

import { pattern } from '@/constants/patterns'

import logoMain from '@public/images/logos/logo-pp.png'

import logoMainDark from '@public/images/logos/logo-pp-dark.png'

import { resetPassword } from '@/services/auth'
import CustomButton from '@components/button'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { maxWidth: '35rem' }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

type FormType = {
  password: string
  confirm_password: string
}

const defaultValues: FormType = {
  password: '',
  confirm_password: ''
}

const ResetPasswordPage = ({ email }: { email: string }) => {
  // ** State
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ** Hooks
  const theme = useTheme()
  const router = useRouter()
  const mdEndpoint = useMediaQuery(theme => theme.breakpoints.up('lg'))

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors }
  } = useForm<FormType>({ defaultValues })

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const onSubmit = async (data: FormType) => {
    setIsLoggingIn(true)
    await resetPassword({ ...data, email })
      .then(res => {
        if (res?.status) {
          router.replace(routes.login)
        }
      })
      .catch(err => {
        console.error('ERROR', err)
      })
    setIsLoggingIn(false)
  }

  const debounceSubmit = debounce(onSubmit, 400)

  return (
    <Box
      bgcolor={'background.default'}
      height={'100%'}
      sx={{
        backgroundImage: 'url(/images/pages/login-bg.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: mdEndpoint ? window?.innerWidth * 0.7 : window?.innerWidth
      }}
    >
      <Box height={'100dvh'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <Card sx={{ zIndex: 1 }}>
          <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
            <Box sx={{ mb: 6 }}>
              <Box display={'flex'} width={'100%'} justifyContent={'center'} mb={3}>
                <Box display={'flex'}>
                  <Image
                    src={theme.palette.mode === 'dark' ? logoMainDark : logoMain}
                    alt='PPM-Logo'
                    width={550}
                    height={140}
                    priority
                    style={{ width: '100%', maxWidth: '550px', height: 'auto' }}
                  />
                </Box>
              </Box>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(debounceSubmit)}>
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Typography gutterBottom variant='body1' fontSize={22} fontWeight={600}>
                    Forgot Password? 🔒
                  </Typography>
                  <Typography variant='body1'>
                    {`Enter your email and we'll send you instructions to reset your password`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {/* Password */}
                  <FormControl fullWidth>
                    <Controller
                      name='password'
                      control={control}
                      rules={{
                        required: 'Please enter a password',
                        pattern: {
                          value: pattern.passwordPattern,
                          message:
                            'Please enter a strong password with at least 1 Uppercase, 1 Lowercase, 1 Number and 1 Symbol'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          type={showPassword ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={handleClickShowPassword}>
                                <Icon
                                  color={errors?.password && 'red'}
                                  icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                  fontSize={'1.25rem'}
                                />
                              </IconButton>
                            )
                          }}
                          {...field}
                          helperText={errors?.password?.message}
                          error={Boolean(errors?.password)}
                          label='Password'
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  {/* Confirm Password */}
                  <FormControl fullWidth>
                    <Controller
                      name='confirm_password'
                      control={control}
                      rules={{
                        required: 'Please enter a password',
                        validate: value => value === getValues('password') || 'Passwords did not match'
                      }}
                      render={({ field }) => (
                        <TextField
                          type={showConfirmPassword ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={handleClickShowConfirmPassword}>
                                <Icon
                                  color={errors?.confirm_password && 'red'}
                                  icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                  fontSize={'1.25rem'}
                                />
                              </IconButton>
                            )
                          }}
                          {...field}
                          helperText={errors?.confirm_password?.message}
                          error={Boolean(errors?.confirm_password)}
                          label='Confirm Password'
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <CustomButton
                    circular
                    fullWidth
                    size='large'
                    variant='contained'
                    type='submit'
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? <CircularProgress size={22} /> : 'Set New Password'}
                  </CustomButton>
                </Grid>
                <Grid item xs={12}>
                  <Typography textAlign={'center'} color={'primary'} display={'flex'} justifyContent={'center'}>
                    <LinkStyled
                      replace
                      href={routes.login}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <Icon icon={'mdi:chevron-left'} fontSize={22} />
                      <span>Back to Login</span>
                    </LinkStyled>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ResetPasswordPage
