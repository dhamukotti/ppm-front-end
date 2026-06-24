import { useEffect } from 'react'

import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  TextField,
  Zoom
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'

import { fetchCountryList } from '@/services/modules/country'
import { updateProfile } from '@/services/modules/profile'
import type { Country, ProfileData } from '@/services/modules/profile/types'
import { getInitials } from '@/utils/getInitials'
import CustomButton from '@components/button'

interface UpdateProfileDialogProps {
  open: boolean
  close: () => void
  data: ProfileData
  refetch: () => void
}

type FormFields = {
  ProfilePicture: string | null | File
  Name: string
  CountryID: Country | null
  Address: string
}

const UpdateProfileDialog = ({ open, close, data, refetch }: UpdateProfileDialogProps) => {
  const { data: countryData, isLoading } = useQuery({ queryKey: ['countries'], queryFn: () => fetchCountryList() })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, isSubmitting }
  } = useForm<FormFields>({
    defaultValues: {
      ProfilePicture: data?.ProfilePicture || null,
      Name: data?.Name || '',
      CountryID: data?.country || null,
      Address: data?.Address || ''
    }
  })

  const onSubmit = async (formData: FormFields) => {
    try {
      const body = new FormData()

      body.append('Name', formData?.Name)
      formData?.CountryID?.ID && body.append('CountryID', formData?.CountryID?.ID?.toString())
      body.append('Address', formData?.Address)

      if (formData?.ProfilePicture instanceof File) {
        body?.append('ProfilePicture', formData?.ProfilePicture)
      }

      await updateProfile(body)

      close()
      refetch()
    } catch (error) {
      refetch()
    }
  }

  useEffect(() => {
    if (open) {
      reset({
        ProfilePicture: data?.ProfilePicture || null,
        Name: data?.Name || '',
        CountryID: data?.country || null,
        Address: data?.Address || ''
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset, refetch])

  return (
    <>
      <Dialog open={open} onClose={close} TransitionComponent={Zoom} fullWidth maxWidth='sm'>
        <form autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Profile Update</DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={5}>
              {/* Image */}
              <Grid item xs={12}>
                {/* Profile Picture */}
                <Controller
                  control={control}
                  name='ProfilePicture'
                  render={({ field }) => (
                    <>
                      <input
                        type='file'
                        accept='.jpg'
                        id='profile-picture'
                        onChange={e => {
                          if (e.target.files) {
                            const file = e.target.files[0]

                            field.onChange(file)
                          }
                        }}
                        hidden
                      />

                      {/* Avatar Box */}
                      <Box
                        component='label'
                        htmlFor='profile-picture'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        py={3}
                      >
                        <Box
                          display={'flex'}
                          position='relative'
                          overflow={'hidden'}
                          borderRadius={2}
                          sx={{
                            '&:hover #hover-box-input': {
                              cursor: 'pointer',
                              opacity: '1'
                            }
                          }}
                        >
                          <Avatar
                            variant='rounded'
                            sx={{ width: 120, height: 120, boxShadow: theme => theme.shadows[4], position: 'relative' }}
                            src={
                              field?.value instanceof File ? URL.createObjectURL(field.value) : field.value || undefined
                            }
                          >
                            {getInitials(data?.Name || 'User')}
                          </Avatar>
                          <Box
                            position={'absolute'}
                            width={'100%'}
                            height={'100%'}
                            display='flex'
                            alignItems='center'
                            justifyContent='center'
                            bgcolor={theme =>
                              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                            }
                            id='hover-box-input'
                            sx={{ opacity: 0 }}
                          >
                            <i className='ri-pencil-line text-white h-7 w-7' />
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                />
              </Grid>

              {/* Name */}
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name='Name'
                  rules={{
                    required: 'Please enter a name',
                    maxLength: { value: 100, message: 'You cannot enter more than 100 characters' }
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <TextField {...field} label='Name' inputProps={{ maxLength: 100 }} />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name='CountryID'
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Autocomplete
                        value={field?.value || undefined}
                        onChange={(e, value) => {
                          field?.onChange(value)
                        }}
                        loading={isLoading}
                        options={countryData ?? []}
                        renderOption={(props, option) => (
                          <li {...props} key={option.ID}>
                            {option.Name}
                          </li>
                        )}
                        disableClearable
                        size='small'
                        renderInput={params => <TextField {...params} label={'Country'} />}
                        getOptionLabel={option => {
                          return option.Name || ''
                        }}
                      />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name='Address'
                  rules={{ maxLength: { value: 200, message: 'You cannot enter more than 200 characters' } }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <TextField
                        multiline
                        maxRows={4}
                        minRows={3}
                        {...field}
                        label='Address'
                        inputProps={{ maxLength: 200 }}
                      />
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between' }}>
            <CustomButton variant='contained' color='secondary' onClick={close}>
              Close
            </CustomButton>
            <Button variant='contained' type='submit' disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Updating....' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default UpdateProfileDialog
