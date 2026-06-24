// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Components
import { CircularProgress, Dialog, Divider, FormControl, IconButton, Switch, Typography, Zoom } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CustomButton from '@/components/button'
import toast from 'react-hot-toast'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../../paymentpopup/useRazorpayPayment'

// ** Icons Imports
import { Controller, useForm } from 'react-hook-form'

import IconifyIcon from '@components/icon'
import { Icon } from '@iconify/react'

// ** Local Imports
import { useProject } from 'src/context/project-context'

// ** API Imports
import { addTaskGroup, updateTaskGroup } from '@/services/modules/task-group'
import { useAuth } from '@/hooks/useAuth'

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

type FormFields = {
  groupName: string
  projectID?: number
  TaskGroupID?: string
}

interface NewTaskDialogProps {
  open: boolean
  onCloseModal: () => void
  initialGroupName?: string
  isEdit?: boolean
  TaskGroupID?: string
}

const NewTaskDialog = ({ open, onCloseModal, initialGroupName = '', isEdit = false, TaskGroupID }: NewTaskDialogProps) => {
  const { project, refetchTaskGroup } = useProject()
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)

  const [paymentStatus, setPaymentStatus] = useState("")
  const { profile,user } = useAuth()
  const logoImage = "https://appsuresolutions.netlify.app/assets/header_logo-Bj3Dgdu3.svg" // Replace with your actual logo
  // ** Use Payment Hook
  const { isLoading, razorpayLoaded, generateRazorPayOrder } = useRazorpayPayment({
    userId: Number(user?.id),
    onPaymentSuccess: () => {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
      setShowPaymentExpiredDialog(false)
    },
    onPaymentFailure: () => {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
      setShowPaymentExpiredDialog(true)
    }
  })
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<FormFields>({ 
    defaultValues: {
      groupName: ''
    }
  })

  // Helper: Call UpdatePaymentconfirmation API
  const updatePaymentConfirmation = async (userId: number, paymentId?: string | null, status: string = '') => {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL1}/UpdatePaymentconfirmation`
      const params = new URLSearchParams()
      params.append('UserID', String(userId))
      // If paymentId is present, append it, otherwise append empty string to match example format
      params.append('PaymentID', paymentId ?? '')

      const url = `${baseUrl}?${params.toString()}`

      const resp = await fetch(url, {
        method: 'POST'
      })

      const text = await resp.text()

      // Persist a local client-side status for UI decisions.
      // Only treat subscription as active (isExpired: false) when status === 'Success'.
      // For all other statuses (Cancelled, Failed, Timeout, or empty), treat as expired (isExpired: true).
      const isExpired = status !== 'Success'
      const paymentData = {
        isExpired,
        // paymentId: paymentId ?? '',
        // status
      }
      localStorage.setItem('paymentStatus', JSON.stringify(paymentData))

      return { ok: resp.ok, status: resp.status, body: text }
    } catch (err) {
      console.error('Error calling UpdatePaymentconfirmation:', err)
      // On error, be conservative: treat as expired so user is prompted to renew.
      const paymentData = {
        isExpired: true,
        // paymentId: paymentId ?? '',
        // status
      }
      try {
        localStorage.setItem('paymentStatus', JSON.stringify(paymentData))
      } catch (e) {
        console.error('Error saving paymentStatus to localStorage on failure:', e)
      }
      return { ok: false, error: err }
    }
  }

 
  // Check payment status
  const checkPaymentStatus = () => {
    const paymentStatus = localStorage.getItem('paymentStatus')

    try {
      if (paymentStatus) {
        const parsed = JSON.parse(paymentStatus)
        // If parsed explicitly says expired, show payment dialog and disallow opening the Task Group dialog
        if (parsed.isExpired === true) {
          setShowPaymentExpiredDialog(true)
          return false
        }
        // If parsed explicitly says not expired, ensure payment dialog is hidden and allow opening Task Group dialog
        if (parsed.isExpired === false) {
          setShowPaymentExpiredDialog(false)
          return true
        }
        // In case parsed.isExpired is missing or unexpected, be conservative: treat as expired
        setShowPaymentExpiredDialog(true)
        return false
      }
      // No stored status → treat as expired by default (user must renew)
      setShowPaymentExpiredDialog(true)
      return false
    } catch (error) {
      console.error('Error parsing payment status:', error)
      // On parse error, treat as expired to be safe
      setShowPaymentExpiredDialog(true)
      return false
    }
  }

  // Check payment status when dialog opens
  useEffect(() => {
    if (open) {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
    } else {
      setShouldOpenDialog(false)
      setShowPaymentExpiredDialog(false)
    }
  }, [open])

  // Set initial form values
  useEffect(() => {
    if (open && initialGroupName) {
      setValue('groupName', initialGroupName)
    }
  }, [open, initialGroupName, setValue])

  const onSubmit = async (values: FormFields) => {
    values.projectID = project?.ID
    
    const body = {
      groupName: values.groupName,
    }

    try {
      if (TaskGroupID) {
        await updateTaskGroup({ id: TaskGroupID.toString(), body })
        refetchTaskGroup()
        reset()
        onCloseModal()
      } else {
        await addTaskGroup(values)
        refetchTaskGroup()
        onCloseModal()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
    onCloseModal()
  }

  return (
    <>

      {/* Task Group Dialog */}
      <Dialog
        open={shouldOpenDialog}
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
          <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
            {isEdit ? 'Edit Task Board' : 'Create Task  Board'}
          </Typography>
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
              <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 3 }}>Task Board name *</Typography>

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
                    placeholder='Task Board Name'
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
              {/* <Box sx={{}}>
                <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>Privacy *</Typography>
                <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>
                  Open
                  <Switch defaultChecked />
                  Closed
                </Typography>
              </Box> */}
              {/* <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: '14px'
                }}
              >
                <span
                  style={{
                    fontWeight: 'bold'
                  }}
                >
                  Info:
                </span>{' '}
                Project will be visible to everyone in your account
              </Typography> */}
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
                {isSubmitting ? <CircularProgress size={15} color='inherit' /> : isEdit ? 'Update' : 'Create'}
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
    </>
  )
}

export default NewTaskDialog
