'use client'

// React Imports
import { Fragment, useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

// MUI Imports
import { useSearchParams } from 'next/navigation'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { Theme } from '@mui/material'
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

// Images
import { useQuery } from '@tanstack/react-query'

import logoMainDark from '@public/images/logos/logo-pp-dark.png'
import logoMain from '@public/images/logos/logo-pp.png'

// Hook Imports
import { pattern } from '@/constants/patterns'
import { routes } from '@/constants/routes'
import type { CountryListAPI } from '@/services/modules/country'
import { fetchCountryList } from '@/services/modules/country'
import { useAuth } from '@/hooks/useAuth'

const defaultValues = {
  name: '',
  email: process?.env?.NODE_ENV === 'development' ? 'samad.saiyed.ss@gmail.com' : '',
  password: process?.env?.NODE_ENV === 'development' ? 'Abc@223133' : '',
  countryID: null,
  address: '',
  organizationName: '',
  organizationSize: ''
}

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

type FormFields = {
  name: string
  email: string
  password: string
  countryID: CountryListAPI | null
  address: string
  organizationName: string
  organizationSize: string
}

const RegisterComponent = () => {
  // ** API CALL
  const { data: countryList } = useQuery({ queryKey: ['countries'], queryFn: () => fetchCountryList() })

  // ** Hooks
  const params = useSearchParams()

  const urlName = params.get('name')
  const urlEmail = params.get('email')
  const auth = useAuth()

  // ** States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [bgSize, setBgSize] = useState<number | string>('100vw')

  // Form
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormFields>({ defaultValues })

  // Hooks
  const theme = useTheme()
  const mdEndpoint = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: FormFields) => {
    const body: any = {
      ...data,
      countryID: data.countryID?.ID,
      ...location
    }

    await auth.register(body)
  }

  useEffect(() => {
    reset({
      ...defaultValues,
      name: urlName || '',
      email: urlEmail || ''
    })

    // Check if geolocation is supported
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          setLocation({ latitude, longitude })
        },
        error => {
          console.error('Error getting location:', {
            code: error.code,
            message: error.message
          })
          
          // Set location to null if error occurs
          // This allows the form to still be submitted without location data
          setLocation(null)
          
          // Optional: You can show a user-friendly message based on error code
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.warn('User denied the request for Geolocation.')
              break
            case error.POSITION_UNAVAILABLE:
              console.warn('Location information is unavailable.')
              break
            case error.TIMEOUT:
              console.warn('The request to get user location timed out.')
              break
            default:
              console.warn('An unknown error occurred while getting location.')
              break
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0
        }
      )
    } else {
      console.warn('Geolocation is not supported by this browser.')
      setLocation(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEmail, urlName])

  useEffect(() => {
    const calculateBgSize = () => {
      setBgSize(mdEndpoint ? (window.innerWidth ? window.innerWidth * 0.7 : '100vw') : window.innerWidth || '100vw')
    }

    // Initial calculation
    calculateBgSize()

    // Recalculate on resize
    window.addEventListener('resize', calculateBgSize)

    return () => window.removeEventListener('resize', calculateBgSize)
  }, [mdEndpoint])

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
              <Typography className='text-5xl text-textPrimary leading-tight font-bold'>Register to</Typography>
              <Typography className='text-5xl leading-tight font-bold text-primary'>Manage</Typography>
              <Typography className='text-5xl text-textPrimary leading-tight font-bold'>the new experience</Typography>
              <Typography className='text-2xl text-textPrimary font-bold' mt={6}>
                {`If you have an account`}
              </Typography>
              <Typography className='text-2xl text-textPrimary font-bold'>
                {` you can `}
                <Typography component={Link} href={routes.login} className='text-2xl font-bold text-primary'>
                  {`login here`}
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
                        height={140}
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
                    name='name'
                    control={control}
                    rules={{
                      required: true
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth>
                        <TextField
                          {...field}
                          size='small'
                          slotProps={{ htmlInput: { maxLength: 30, readOnly: !!urlName } }}
                          autoFocus
                          fullWidth
                          label='Name'
                          error={!!error}
                        />
                      </FormControl>
                    )}
                  />
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
                          size='small'
                          type='email'
                          fullWidth
                          label='Email'
                          error={!!error}
                          slotProps={{ htmlInput: { maxLength: 50, readOnly: !!urlEmail } }}
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
                          size='small'
                          error={!!error}
                          helperText={error?.message}
                          type={isPasswordShown ? 'text' : 'password'}
                          slotProps={{
                            input: {
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
                            }
                          }}
                        />{' '}
                      </FormControl>
                    )}
                  />

                  <Controller
                    name='countryID'
                    control={control}
                    rules={{ required: 'Please enter a password' }}
                    render={({ field }) => (
                      <Autocomplete
                        size='small'
                        value={field?.value}
                        onChange={(event, newValue) => field.onChange(newValue)}
                        options={countryList || []}
                        isOptionEqualToValue={row => row.ID === field?.value?.ID}
                        getOptionLabel={row => row.Name || ''}
                        renderOption={(props, option) => (
                          <Box component='li' {...props} key={option.ID}>
                            <img
                              key={option.Code}
                              className='mie-4 flex-shrink-0'
                              alt=''
                              width='20'
                              loading='lazy'
                              src={`https://flagcdn.com/w20/${option.Code.toLowerCase()}.png`}
                              srcSet={`https://flagcdn.com/w40/${option.Code.toLowerCase()}.png 2x`}
                            />
                            {option.Name} ({option.Code})
                          </Box>
                        )}
                        renderInput={params => <TextField {...params} label='Country' />}
                      />
                    )}
                  />

                  <Controller
                    name='organizationName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        size='small'
                        {...field}
                        error={!!error}
                        label='Organization Name'
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                      />
                    )}
                  />

                  <Controller
                    name='organizationSize'
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <TextField size='small' select {...field} label={'Organization Size'} error={!!error}>
                          <MenuItem value={`1-10`}>1-10</MenuItem>
                          <MenuItem value={`11-25`}>11-25</MenuItem>
                          <MenuItem value={`25+`}>25+</MenuItem>
                        </TextField>
                      </>
                    )}
                  />

                  <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={<Fragment>I agree to privacy policy & terms</Fragment>}
                    />
                  </div>
                  <Button size='small' fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={22} color='secondary' /> : 'Sign up'}
                  </Button>

                  <div className='flex items-center flex-wrap justify-center'>
                    <Typography variant='body2' className='text-base mr-2'>
                      Already have an account?
                    </Typography>
                    <Typography variant='body2'>
                      <LinkStyled href={routes.login}>Sign in instead</LinkStyled>
                    </Typography>
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

export default RegisterComponent
