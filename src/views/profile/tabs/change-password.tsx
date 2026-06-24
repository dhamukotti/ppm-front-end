// ** React Imports
import { useEffect, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'

// ** MUI Imports
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Functions

// ** Icon Imports
import { TextField } from '@mui/material'
import toast from 'react-hot-toast'

import { userChangePassword } from '@/services/modules/profile'
import { pattern } from '@/constants/patterns'

type FormType = {
  password: string
  confirm_password: string
}

const resetPasswordRules = {
  defaultValues: {
    password: '',
    confirm_password: ''
  },
  password: {
    required: { value: true, message: 'Please enter password' },
    pattern: {
      value: pattern.passwordPattern,
      message:
        'Password must contain 6 characters, 1 uppercase, 1 lowercase, 1 number and 1 special case character, whitespace not allowed'
    }
  },
  confirm_password: {
    required: { value: true, message: 'Please enter confirm password' }
  }
}

const ChangePasswordProfile = () => {
  // ** States
  const [values, setValues] = useState({
    showNewPassword: false,
    showConfirmNewPassword: false
  })

  const {
    control,
    getValues,
    reset,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormType>({
    defaultValues: resetPasswordRules.defaultValues
  })

  useEffect(() => {
    reset()
  }, [reset])

  // Handle Password
  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }

  // Handle Confirm Password
  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }

  const onSubmit = async (data: FormType) => {
    try {
      const body = {
        password: data?.password
      }

      await userChangePassword(body)
      reset()
      toast.success('Changed Password Successfully!!')
    } catch {}
  }

  return (
    <Card sx={{ mt: 5 }}>
      <CardHeader title={'Change Password'} />
      <CardContent>
        <Alert
          icon={false}
          severity='warning'
          sx={{
            mb: 6
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: theme => `${theme.spacing(1)} !important` }}>
            {'Ensure that these requirements are met'}
          </AlertTitle>
          {'Minimum 8 characters long, uppercase & symbol'}
        </Alert>

        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            {/* New Password */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='password'
                  control={control}
                  rules={resetPasswordRules.password}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      autoComplete='off'
                      label={'New Password'}
                      value={value}
                      id='profile-view-security-new-password'
                      onChange={e => {
                        onChange(e)
                        trigger('password')
                      }}
                      type={values.showNewPassword ? 'text' : 'password'}
                      inputProps={{ 'data-testid': 'new-password' }}
                      error={Boolean(errors.password)}
                      helperText={errors?.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              id={'profile-show-new-password'}
                              onClick={handleClickShowNewPassword}
                              data-testid='show-new-password'
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={values.showNewPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='confirm_password'
                  control={control}
                  rules={{
                    ...resetPasswordRules.confirm_password,
                    validate: value => value === getValues('password') || 'Password did not match'
                  }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoComplete='off'
                      value={value}
                      onBlur={onBlur}
                      label={'Confirm New Password'}
                      id='user-view-security-confirm-new-password'
                      inputProps={{ 'data-testid': 'confirm-password' }}
                      type={values.showConfirmNewPassword ? 'text' : 'password'}
                      onChange={e => {
                        onChange(e)
                        trigger('confirm_password')
                      }}
                      helperText={errors?.confirm_password?.message}
                      error={Boolean(errors.confirm_password)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              id={'profile-show-new-confirm-password'}
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                              onClick={handleClickShowConfirmNewPassword}
                              data-testid='show-new-confirm-password'
                            >
                              <i className={values.showConfirmNewPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />{' '}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                id='change-password'
                data-testid='set-new-password'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing Password....' : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordProfile
