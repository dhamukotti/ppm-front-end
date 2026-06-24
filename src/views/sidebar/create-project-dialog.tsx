// ** React Imports
import { useContext } from 'react'
import { useEffect } from 'react'

// ** MUI Components
import { CircularProgress, Dialog, Divider, FormControl, IconButton, Switch, Typography, Zoom } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import CustomButton from '@/components/button'
import toast from 'react-hot-toast'

// ** Icons Imports
import { Icon } from '@iconify/react'

// ** Local Imports
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'

// ** API Imports

import { addProject } from '@/services/modules/project'
import { WorkspaceContext } from 'src/context/workspace-context'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../paymentpopup/useRazorpayPayment'
type FormValues = {
  ProjectName: string
  IsOpen: number
  WorkspaceID?: number
}

type CreateProjectProps = {
  open: boolean
  onCloseModal: () => void
}

const CreateProject = ({ open, onCloseModal }: CreateProjectProps) => {
  const { selected, refetchProjects,projects } = useContext(WorkspaceContext)
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)
  const defaultValues = {
    ProjectName: '',
    IsOpen: 1
  }

  // const [isLoading, setIsLoading] = useState(false)
  // const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("")
  const { profile,user } = useAuth()
  const logoImage = "https://appsuresolutions.netlify.app/assets/header_logo-Bj3Dgdu3.svg" // Replace with your actual logo
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
    reset
  } = useForm<FormValues>({ defaultValues })

  const onSubmit = async (values: FormValues) => {
    values.WorkspaceID = selected?.WorkspaceID


    const res = await addProject(values)

    if (res?.status) {
      reset()
      refetchProjects()
      onCloseModal()
    }
  }

// // payment integration

//   // Helper: Call UpdatePaymentconfirmation API
//   const updatePaymentConfirmation = async (userId: number, paymentId?: string | null, status: string = '') => {
//     try {
//       const baseUrl = 'https://uat.ppmbackend.projectpulse360.com/UpdatePaymentconfirmation'
//       const params = new URLSearchParams()
//       params.append('UserID', String(userId))
//       // If paymentId is present, append it, otherwise append empty string to match example format
//       params.append('PaymentID', paymentId ?? '')

//       const url = `${baseUrl}?${params.toString()}`

//       const resp = await fetch(url, {
//         method: 'POST'
//       })

//       const text = await resp.text()

//       // Persist a local client-side status for UI decisions.
//       // Only treat subscription as active (isExpired: false) when status === 'Success'.
//       // For all other statuses (Cancelled, Failed, Timeout, or empty), treat as expired (isExpired: true).
//       const isExpired = status !== 'Success'
//       const paymentData = {
//         isExpired,
//         // paymentId: paymentId ?? '',
//         // status
//       }
//       localStorage.setItem('paymentStatus', JSON.stringify(paymentData))

//       return { ok: resp.ok, status: resp.status, body: text }
//     } catch (err) {
//       console.error('Error calling UpdatePaymentconfirmation:', err)
//       // On error, be conservative: treat as expired so user is prompted to renew.
//       const paymentData = {
//         isExpired: true,
//         // paymentId: paymentId ?? '',
//         // status
//       }
//       try {
//         localStorage.setItem('paymentStatus', JSON.stringify(paymentData))
//       } catch (e) {
//         console.error('Error saving paymentStatus to localStorage on failure:', e)
//       }
//       return { ok: false, error: err }
//     }
//   }

//   // Load Razorpay script
//   useEffect(() => {
//     const loadRazorpay = () => {
//       // Check if already loaded
//       if (window.Razorpay) {
//         setRazorpayLoaded(true)
//         return
//       }

//       // Check if script already exists
//       const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
//       if (existingScript) {
//         existingScript.addEventListener('load', () => setRazorpayLoaded(true))
//         return
//       }

//       const script = document.createElement("script")
//       script.src = "https://checkout.razorpay.com/v1/checkout.js"
//       script.async = true
//       script.onload = () => {
//         setRazorpayLoaded(true)
//       }
//       script.onerror = () => {
//         console.error('Failed to load Razorpay SDK')
//         setRazorpayLoaded(false)
//       }
//       document.body.appendChild(script)
//     }

//     loadRazorpay()
//   }, [])










  // const checkPaymentStatus = () => {
  //   const paymentStatus = localStorage.getItem('paymentStatus')

  //   try {
  //     if (paymentStatus) {
  //       const parsed = JSON.parse(paymentStatus)
  //       // If expired, show payment expired dialog
  //       if (parsed.isExpired === true) {
  //         setShowPaymentExpiredDialog(true)
  //         return false
  //       }
  //       // Only open if isExpired is false
  //       return parsed.isExpired === false
  //     }
  //     return false
  //   } catch (error) {
  //     console.error('Error parsing payment status:', error)
  //     return false
  //   }
  // }
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
      
      if (parsed?.projectCount == 1 && projects.length >= 1) {
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

  // Use useEffect to check payment status when 'open' changes
  useEffect(() => {
    if (open) {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
    } else {
      setShouldOpenDialog(false)
      setShowPaymentExpiredDialog(false)
    }
  }, [open])

  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
    onCloseModal()
  }

  const handleRenewSubscription = () => {
    // Add your navigation logic here
    // Example: router.push('/subscription') or window.location.href = '/subscription'
    setShowPaymentExpiredDialog(false)
    onCloseModal()
  }


  




  return (
    <>
       <SubscriptionExpiredDialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        onRenew={generateRazorPayOrder}
        isLoading={isLoading}
        razorpayLoaded={razorpayLoaded}
      />





    <Dialog open={shouldOpenDialog} onClose={onCloseModal} TransitionComponent={Zoom} fullWidth maxWidth='md'>
      <Box
        bgcolor={'background.default'}
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
        <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>Create project name</Typography>
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
          <Icon icon={'mdi:close'} color={`common.black`} fontSize={24} />
        </IconButton>
      </Box>
      <Divider />

      <Box py={2} bgcolor={'background.default'}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          {/* workspace name */}
          <FormControl
            fullWidth
            sx={{
              paddingX: 5
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 3 }}>Project name *</Typography>

            <Controller
              name='ProjectName'
              control={control}
              rules={{
                required: 'Please enter name of the project'
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  autoFocus
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={Boolean(errors?.ProjectName)}
                  helperText={Boolean(errors?.ProjectName) && errors?.ProjectName?.message}
                  fullWidth
                  id='ProjectName'
                  placeholder='Project Name'
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
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>Privacy *</Typography>
              <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>
                Open
                <Controller
                  name='IsOpen'
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field?.value === 1} onChange={e => field?.onChange(e?.target?.checked ? 0 : 1)} />
                  )}
                />
                Closed
              </Typography>
            </Box>
            <Typography
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
            </Typography>
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
    </>
  )
}

export default CreateProject
