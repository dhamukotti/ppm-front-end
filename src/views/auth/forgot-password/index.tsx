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

// ** Icons Imports

// ** Configs

// ** Layout Import

// ** Demo Imports

import type { Theme } from '@mui/material'
import { CircularProgress, Grid, useMediaQuery, useTheme } from '@mui/material'

// Hook Imports
import { debounce } from 'lodash'
import { Controller, useForm } from 'react-hook-form'

import { sign } from 'jsonwebtoken'

import CustomButton from '@components/button'

import { pattern } from '@/constants/patterns'
import { routes } from '@/constants/routes'

import { verifyEmail } from '@/services/auth'
import logoMainDark from '@public/images/logos/logo-pp-dark.png'
import logoMain from '@public/images/logos/logo-pp.png'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { maxWidth: '35rem' }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const defaultValues = {
  email: process?.env?.NODE_ENV === 'development' ? 'samad.saiyed.ss@gmail.com' : ''
}

type FormValidate = {
  email: string
}

const ForgotPassword = () => {
  // ** State
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // ** Hooks
  const theme = useTheme()
  const router = useRouter()
  const mdEndpoint = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormValidate>({  })

  const onSubmit = async (data: FormValidate) => {
    setIsLoggingIn(true)
    await verifyEmail(data)
      .then(res => {
      

        if (res?.status) {
          const encString = sign(
            { email: data?.email },
            process?.env?.NEXT_PUBLIC_API_SECRET_KEY ?? 'THIS_IS_A_SECRET',
            { expiresIn: '7m' }
          )

          router.replace(`${routes.verifyEmail}?k=${encString}`)
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
                  {/* Email */}
                  <FormControl fullWidth>
                    <Controller
                      name='email'
                      control={control}
                      rules={{
                        required: 'Please enter a email',
                        pattern: { value: pattern.email, message: 'Please enter a valid email' }
                      }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextField
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors?.email)}
                          helperText={Boolean(errors?.email) && errors?.email?.message}
                          id='email'
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
                    {isLoggingIn ? <CircularProgress size={22} /> : 'Send Reset Email'}
                  </CustomButton>
                </Grid>
                <Grid item xs={12}>
                  <Typography textAlign={'center'} color={'primary'} display={'flex'} justifyContent={'center'}>
                    <LinkStyled href={routes.login} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={'ri-arrow-left-s-line'} />
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

export default ForgotPassword
