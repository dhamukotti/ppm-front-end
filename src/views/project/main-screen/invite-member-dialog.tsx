import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports

// ** Custom Imports

// ** Hook Imports

// ** API Imports
import Image from 'next/image'

import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  useTheme,
  Zoom
} from '@mui/material'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { useCopyToClipboard } from 'usehooks-ts'

import { useQuery } from '@tanstack/react-query'

import IconifyIcon from '@components/icon'
import ImgInviteBg from '@public/images/cards/invite-bg.png'
import { inviteMember } from '@/services/modules/invite'
import { useWorkspace } from '@/context/workspace-context'
import { fetchRolesList } from '@/services/modules/role'

const defaultValue = {
  email: '',
  roleID: ''
}

type FormField = {
  invitations: { email: string; roleID: string }[]
}

interface InviteMemberProps {
  openInviteModal: boolean
  setOpenInviteModal: (value?: boolean) => void
  projectID?: string
  IsOpen: boolean
}

const InviteMember = ({ openInviteModal, setOpenInviteModal, projectID, IsOpen }: InviteMemberProps) => {
  // ** Hooks
  const { selected } = useWorkspace()
  const theme = useTheme()
  const { data: roleList = [] } = useQuery({ queryKey: ['roles'], queryFn: () => fetchRolesList() })
  const [userId, setUserId] = useState(null);

  const [copyOpen, setCopyOpen] = useState(false)

  useEffect(() => {
    // Get the data from localStorage
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      try {

        const parsedData = JSON.parse(userData);
        
 
        const userId = parsedData?.userData?.UserID;
        setUserId(userId);
        

      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copy] = useCopyToClipboard()

  const handleCopyClose = () => setCopyOpen(false)

  const handleClose = () => {
    reset()
    setOpenInviteModal(false)
  }

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormField>({
    defaultValues: {
      invitations: [defaultValue]
    }
  })

  const { fields, append, remove } = useFieldArray<FormField>({
    control,
    name: 'invitations'
  })

  const onSubmit = async (values: FormField) => {


const body ={
  inviteEmailAddress: values.invitations.map(inv => inv.email).join(', '), // Join all emails with comma

  inviteBy: userId, 
  workspaceid:Number(selected?.WorkspaceID),
  roleID: values.invitations[0].roleID,
  projectID:Number(projectID),
  isMultiple: false
}

    try {
      await inviteMember(body)
      handleClose()
    } catch {}
  }

  const inviteLink = useMemo(() => 'https://figma.com/users/sign_up?invitationId=2690444112...', [])

  return (
    <Dialog open={openInviteModal} onClose={handleClose} TransitionComponent={Zoom} fullWidth maxWidth='md'>
      <Grid container spacing={2} height={'100%'} alignItems={'stretch'}>
        <Grid item xs={12} md={8}>
          <Box minHeight={600} width={'100%'} display={'flex'} flexDirection={'column'} p={{ xs: 4, md: 10 }} gap={10}>
            {/* Title  */}
            <Box>
              <Typography variant='h5' color={'primary.main'} fontWeight={700} mb={3}>
                Invite your teammates
              </Typography>
              <Typography whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
                Collaborate with your team to get the most out of this WebApp.{' '}
              </Typography>
            </Box>
            {/* <Box display={'flex'} flexDirection={'column'} gap={2}>
              <Typography>{`Invite with link (anyone with @figr.design email)`}</Typography>
              <TextField
                fullWidth
                size='small'
                defaultValue={inviteLink}
                value={inviteLink}
                InputProps={{
                  endAdornment: (
                    <Box
                      display={'flex'}
                      alignItems={'center'}
                      gap={2}
                      pl={3}
                      borderLeft={2}
                      borderColor={'divider'}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        copy(inviteLink)
                        setCopyOpen(true)
                      }}
                    >
                      <Icon icon={'akar-icons:copy'} fontSize={22} color={theme.palette.primary.main} />
                      <Typography>Copy </Typography>
                    </Box>
                  )
                }}
                inputProps={{ readOnly: true }}
              />
            </Box> */}
            <Box display={'flex'} flexDirection={'column'} gap={2} flex={1}>
              <Typography fontWeight={700}>{`Invite with email`}</Typography>
              {fields?.map((field, index) => (
                <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} gap={2} key={field?.id}>
                  <FormControl fullWidth>
                    <Controller
                      name={`invitations.${index}.email`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field, formState: { errors } }) => (
                        <TextField
                          {...field}
                          size='small'
                          placeholder='eg.user@gmail.com'
                          error={Boolean(errors?.invitations?.[index]?.email)}
                          helperText={errors?.invitations?.[index]?.email?.message}
                        />
                      )}
                    />
                  </FormControl>
                  <FormControl sx={{ minWidth: 110 }}>
                    <Controller
                      name={`invitations.${index}.roleID`}
                      control={control}
                      rules={{
                        required: 'Please select a role'
                      }}
                      render={({ field, formState: { errors } }) => (
                        <Select
                          {...field}
                          error={Boolean(errors?.invitations?.[index]?.roleID)}
                          displayEmpty
                          variant='outlined'
                          size='small'
                        >
                          {roleList.map(option => (
                            <MenuItem key={option.RoleID} value={option.RoleID}>
                              {option.RoleName}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  <IconButton
                    disabled={index === 0}
                    onClick={() => {
                      remove(index)
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <IconifyIcon icon={'mdi:delete'} />
                  </IconButton>
                </Box>
              ))}
              {fields.length < 5 && (
                <Box>
                  <Button
                    sx={{
                      textTransform: 'capitalize',
                      outline: 'white',
                      mt: 3
                    }}
                    variant='text'
                    size='small'
                    onClick={() => {
                      append(defaultValue)
                    }}
                    startIcon={<Icon icon={'ph:plus'} color='primary.main' />}
                  >
                    {'Add another'}
                  </Button>
                </Box>
              )}
            </Box>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
              <Button
                sx={{
                  borderRadius: 30,
                  fontWeight: 400,
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
                variant='outlined'
                size='small'
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                sx={{
                  borderRadius: 30,
                  fontWeight: 400,
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
                variant='contained'
                disabled={isSubmitting}
                size='small'
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? <CircularProgress size={22} color='secondary' /> : 'Invite your team'}
              </Button>
            </DialogActions>
          </Box>
        </Grid>
        <Grid item xs={12} md={4} display={{ xs: 'none', md: 'flex' }}>
          <Box
            bgcolor={theme.palette.primary.light + 22}
            minHeight={600}
            width={'100%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            flexDirection={'column'}
            gap={20}
          >
            <Image src={ImgInviteBg} alt='' />
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={copyOpen}
        onClose={handleCopyClose}
        message='Link Copied'
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Dialog>
  )
}

export default InviteMember
