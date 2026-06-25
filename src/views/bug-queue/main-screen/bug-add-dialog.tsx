// ** React Imports
import { useEffect, forwardRef, useImperativeHandle } from 'react'

// ** MUI Components
import { CircularProgress, Dialog, Divider, FormControl, IconButton, Switch, Typography, Zoom } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icons Imports
import { Controller, useForm } from 'react-hook-form'

import IconifyIcon from '@components/icon'
import { useAuth } from '@/hooks/useAuth'

// ** Local Imports
import { useProject } from 'src/context/project-context'

// ** Next Navigation
import { useParams } from 'next/navigation'

// ** Axios Import
import axios from 'axios'

// ** Toast Import (assuming you're using react-hot-toast or similar)
// If you're using different toast library, adjust accordingly
import toast from 'react-hot-toast'

// ** Ref type (shared with BugQueueGroup)
import { BugQueueGroupRef } from '../bugs/groups' // adjust path if needed

type FormFields = {
  groupName: string
  projectID?: number
}

const NewTaskDialog = forwardRef<BugQueueGroupRef, { 
  open: boolean; 
  onCloseModal: () => void;
  onBugGroupCreated?: () => void;
}>(({ open, onCloseModal, onBugGroupCreated }, ref) => {
  const { project, refetchTaskGroup } = useProject()
  const params = useParams()
  const WorkspaceID = params?.WorkspaceID ?? params?.workspaceID ?? params?.id
  const { user } = useAuth()
  const defaultValues = {
    groupName: ''
  }

  useImperativeHandle(ref, () => ({
    refetchGroups: refetchTaskGroup
  }))

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormFields>({ defaultValues })

  const onSubmit = async (values: FormFields) => {
    values.projectID = project?.ID

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL1}/CreateBuggroup`,
        null,
        {
          params: {
            WorkspaceID: WorkspaceID,
            LoginuserID: user?.id,
            buggroupname: values.groupName
          }
        }
      )

      const res = response.data

      toast.success('Bug group created successfully!')
      reset()
      refetchTaskGroup()
      
      if (onBugGroupCreated) {
        onBugGroupCreated()
      }
      
      onCloseModal()
    } catch (error) {
      console.error('Failed to create bug group:', error)
      toast.error('An error occurred while creating the bug group')
    }
  }

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  return (
    <Dialog
      open={open}
      style={{
        padding: 0
      }}
      onClose={onCloseModal}
      TransitionComponent={Zoom}
      fullWidth
      maxWidth='md'
    >
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingX: 5,
          paddingY: 2
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>Create Bug Group</Typography>
        <IconButton
          aria-label='close'
          onClick={onCloseModal}
          style={{
            height: 35,
            width: 35,
            border: '1px solid ',
            borderRadius: 4
          }}
        >
          <IconifyIcon icon={'mdi:close'} color={`common.black`} fontSize={24} />
        </IconButton>
      </Box>
      <Divider />

      <Box py={2}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          {/* Task Group Name */}
          <FormControl
            fullWidth
            sx={{
              paddingX: 5
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 3 }}>Bug Group name *</Typography>

            <Controller
              name='groupName'
              control={control}
              rules={{
                required: 'Please enter a name for task group'
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  autoFocus
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors?.groupName)}
                  helperText={Boolean(errors?.groupName) && errors?.groupName?.message}
                  fullWidth
                  id='TaskGroupName'
                  placeholder='Bug Group Name'
                  sx={{ marginBottom: 4 }}
                />
              )}
            />
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: 5
            }}
          >
            <Box sx={{}}>
              <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>
                Open
                <Switch defaultChecked />
                Closed
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 2,
              px: 5
            }}
          >
            <Button
              sx={{
                borderRadius: 30,
                fontWeight: 400,
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
              variant='outlined'
              size='small'
              onClick={() => {
                onCloseModal()
              }}
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
              size='large'
              type='submit'
            >
              {isSubmitting ? <CircularProgress size={15} color='inherit' /> : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </Dialog>
  )
})

NewTaskDialog.displayName = 'NewTaskDialog'

export default NewTaskDialog
