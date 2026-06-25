// ** React Imports
import { useEffect } from 'react'

// ** MUI Components
import { CircularProgress, Dialog, Divider, FormControl, IconButton, Switch, Typography, Zoom } from '@mui/material'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ** Icons Imports
import { Icon } from '@iconify/react'

// ** Local Imports
import { Controller, useForm } from 'react-hook-form'

import CustomButton from '@/components/button'
import { useAuth } from '@/hooks/useAuth'
import { addSprintWorkspace } from '@/services/modules/sprint-workspace'
import { CreateSprintWorkspace } from '@/services/modules/sprint-workspace'
import { addWorkspace } from '@/services/modules/workspace'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../paymentpopup/useRazorpayPayment'
interface FormType {
  workspaceName: string
  organizationID: number | string
}

type CreateWorkspaceDialogProps = {
  open: boolean
  onCloseModal: () => void
  refetchWorkspaces: () => void
}

const defaultValues: FormType = {
  workspaceName: '',
  organizationID: '' // TODO:: parse dynamic value
}

const CreateWorkspaceDialog = ({ open, onCloseModal, refetchWorkspaces }: CreateWorkspaceDialogProps) => {
  // ** Hooks
  const { profile, user } = useAuth()
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)

  const [paymentStatus, setPaymentStatus] = useState("")
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
  } = useForm<FormType>({ defaultValues })

  const onSubmit = async (values: FormType) => {

    if (profile === 'projects') {
const body =
{
  workspaceName:values.workspaceName,
   organizationID: user?.userData.OrganizationID
}
console.log(body);

      await addWorkspace(body)
    } else {
      // const body = {
      //   Workspacename: values.workspaceName,
      //   OrganizationID: values.organizationID,
      //   LoginuserID: user?.id,
      // };
const body =
{
  workspaceName:values.workspaceName,
   organizationID: user?.userData.OrganizationID
}
      //await CreateSprintWorkspace(body)
      await addSprintWorkspace(body)
    }

    reset()
    onCloseModal()
    refetchWorkspaces()
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

  // Use useEffect to check payment status when 'open' changes
  
  
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

//  // Open Razorpay SDK
//   const openRazorPaySdk = async (razorPayOrderId: string, amount: number) => {
//     if (!razorpayLoaded || !window.Razorpay) {
//       alert("Razorpay SDK is not loaded yet. Please wait and try again.")
//       console.error('Razorpay SDK not loaded')
//       return
//     }

//     setIsLoading(false)
//     setPaymentStatus("")

//     const options = {
//       key: "rzp_test_S2PQXDlmtoFOad", // Replace with your key
//     //  amount: amount * 100, // Amount in paise (multiply by 100)
//       //currency: "INR",
//       name: "Your Company Name",
//       description: "Subscription Payment",
//       image: logoImage,
//       order_id: razorPayOrderId,
//       handler: function (response: any) {
//         setPaymentStatus("Payment Successful!")
//         toast.success("Payment successful! Subscription activated.")

//         // Mark success on backend and localStorage
//         updatePaymentConfirmation(Number(user?.id), response.razorpay_payment_id, 'Success')
//           .then(res => {
//             // Refresh UI state from localStorage after backend confirmation
//             const canOpen = checkPaymentStatus()
//             setShouldOpenDialog(canOpen)
//             setShowPaymentExpiredDialog(false)
//           })
//           .catch(err => {
//             console.error('Error updating payment confirmation after success:', err)
//             // Even if backend update failed, mark locally as success so UI allows access.
//             try {
//               localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: false }))
//               const canOpen = checkPaymentStatus()
//               setShouldOpenDialog(canOpen)
//               setShowPaymentExpiredDialog(false)
//             } catch (e) {
//               console.error('Failed to write local payment status after success fallback:', e)
//             }
//           })
//       },
//       modal: {
//         confirm_close: true,
//         ondismiss: async (reason: any) => {
//           const dismissReason = reason === undefined ? "cancelled" : reason
          
//           if (reason === undefined) {
//             setPaymentStatus("Payment Cancelled")
//                        toast.error("Payment cancelled. Please complete the payment to activate your subscription.")

//             // Notify backend that user cancelled (no payment id available)
//             updatePaymentConfirmation(Number(user?.id), '', 'Cancelled')
//               .then(res => {
//                 // Ensure local UI shows expired/payment prompt after cancel
//                 const canOpen = checkPaymentStatus()
//                 setShouldOpenDialog(canOpen)
//                 setShowPaymentExpiredDialog(true)
//               })
//               .catch(err => {
//                 console.error('Error updating cancellation confirmation:', err)
//                 // On failure, still set localStorage so UI behaves consistently
//                 try {
//                   localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true}))
//                   const canOpen = checkPaymentStatus()
//                   setShouldOpenDialog(canOpen)
//                   setShowPaymentExpiredDialog(true)
//                 } catch (e) {
//                   console.error('Error writing cancel fallback to localStorage:', e)
//                 }
//               })
//           } else if (reason === "timeout") {
//             setPaymentStatus("Payment Timed Out")
//             // Optionally notify backend about timeout. Payment id might not be available.
//                                     toast.error("Payment timed out. Please try again.")

//             updatePaymentConfirmation(Number(user?.id), '', 'Timeout')
//               .then(res => {
//                 const canOpen = checkPaymentStatus()
//                 setShouldOpenDialog(canOpen)
//                 setShowPaymentExpiredDialog(true)
//               })
//               .catch(err => {
//                 console.error('Error updating timeout confirmation:', err)
//                 try {
//                   localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
//                   const canOpen = checkPaymentStatus()
//                   setShouldOpenDialog(canOpen)
//                   setShowPaymentExpiredDialog(true)
//                 } catch (e) {
//                   console.error('Error writing timeout fallback to localStorage:', e)
//                 }
//               })
//           } else {
//             setPaymentStatus("Payment Failed")
//             // For other reasons, attempt to send a failed status. No payment id available here.
//                                     toast.error("Payment failed. Please check your payment details and try again.")

//             updatePaymentConfirmation(Number(user?.id), '', 'Failed')
//               .then(res => {
//                 const canOpen = checkPaymentStatus()
//                 setShouldOpenDialog(canOpen)
//                 setShowPaymentExpiredDialog(true)
//               })
//               .catch(err => {
//                 console.error('Error updating failure confirmation:', err)
//                 try {
//                   localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
//                   const canOpen = checkPaymentStatus()
//                   setShouldOpenDialog(canOpen)
//                   setShowPaymentExpiredDialog(true)
//                 } catch (e) {
//                   console.error('Error writing failure fallback to localStorage:', e)
//                 }
//               })
//           }
//         },
//       },
//       prefill: {
//         name: "Customer Name", // You can get this from user context
//         email: "customer@example.com", // You can get this from user context
//         contact: "9042531799", // You can get this from user context
//       },
//       theme: {
//         color: "#e59722",
//       },
//     }

//     try {
//       const rzp1 = new window.Razorpay(options)

//       rzp1.on("payment.failed", function (response: any) {
//         setIsLoading(false)
//         setPaymentStatus("Payment Failed")
//        // console.error("Payment failed:", response.error)
//         toast.error("Payment failed. Please check your payment details and try again.")

//         // Try to extract payment id/order id from response if present (Razorpay may include metadata)
//         const failedPaymentId = response?.error?.metadata?.payment_id ?? response?.error?.metadata?.paymentId ?? ''
//         const failedOrderId = response?.error?.metadata?.order_id ?? response?.error?.metadata?.orderId ?? ''

//         // Call backend to update payment confirmation (Failed)
//         updatePaymentConfirmation(Number(user?.id), failedPaymentId, 'Failed')
//           .then(res => {
//             // ensure UI stays blocked / shows expiry dialog
//             const canOpen = checkPaymentStatus()
//             setShouldOpenDialog(canOpen)
//             setShowPaymentExpiredDialog(true)
//           })
//           .catch(err => {
//             console.error('Error updating failed payment confirmation:', err)
//             try {
//               localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
//               const canOpen = checkPaymentStatus()
//               setShouldOpenDialog(canOpen)
//               setShowPaymentExpiredDialog(true)
//             } catch (e) {
//               console.error('Error writing failed fallback to localStorage:', e)
//             }
//           })
//       })

//       rzp1.open()
//     } catch (error) {
//       console.error('Error opening Razorpay:', error)
//      // alert('Failed to open payment gateway. Please try again.')
//     }
//   }

//   // Generate Razorpay Order ID
//   const generateRazorPayOrder = async () => {
//     if (!razorpayLoaded) {
//      // alert("Payment system is loading. Please wait a moment and try again.")
//       return
//     }

//     setIsLoading(true)
//     setPaymentStatus("")

//     try {
//       const formData = new FormData()
//       formData.append("amount", "100") // Amount in smallest currency unit (paise)
   

//       const response = await fetch(
//         `https://uat.ppmbackend.projectpulse360.com/GenerateRazorID/`,
//         {
//           method: "POST",
//           headers: {
//             // Add your authorization token if needed
//             // Authorization: `Bearer ${yourToken}`,
//           },
//           body: formData,
//         }
//       )

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()
//       setIsLoading(false)

//       if (data && data.id) {
//         openRazorPaySdk(data.id, 30) // 30 rupees (3000 paise / 100)
//       } else {
//         throw new Error("Invalid response from server")
//       }
//     } catch (error) {
//       console.error("generateRazorPayOrder Error:", error)
//       setPaymentStatus("Error generating order")
//       setIsLoading(false)
//    //   alert("Failed to generate payment order. Please try again.")
//     }
//   }








  return (
    <>
      {/* payment */}
      {/* <Dialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        TransitionComponent={Zoom}
        fullWidth
        maxWidth='sm'
      >
        <Box bgcolor={'background.default'}>
          <Box className='flex flex-col items-center justify-center px-8 py-10'>
            
            <Box
              className='mb-6 rounded-full flex items-center justify-center'
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'none',
                color: 'error.main'
              }}
            >
              <Icon icon={'mdi:alert-circle-outline'} fontSize={100} />
            </Box>

       
            <Typography className='text-2xl font-bold mb-3 text-center'>
              Subscription Expired
            </Typography>

      
            <Typography className='text-base text-center mb-6' color='text.secondary'>
              Your subscription has expired. Please renew your subscription to continue  premium features.
            </Typography>

            
            <Box className='flex gap-3 w-full'>
              <CustomButton
                circular
                variant='outlined'
                size='large'
                onClick={handleClosePaymentDialog}
                fullWidth
              >
                Cancel
              </CustomButton>
              <CustomButton
                circular
                variant='contained'
                size='large'
                onClick={generateRazorPayOrder}
                fullWidth
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                Renew Subscription
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Dialog> */}
  <SubscriptionExpiredDialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        onRenew={generateRazorPayOrder}
        isLoading={isLoading}
        razorpayLoaded={razorpayLoaded}
      />
      <Dialog open={shouldOpenDialog} onClose={onCloseModal} TransitionComponent={Zoom} fullWidth maxWidth='md'>
        <Box bgcolor={'background.default'}>
          <div className='flex flex-1 items-center justify-between px-5 py-4'>
            <Typography className='text-xl font-medium'>Add workspace</Typography>
            <IconButton aria-label='close' onClick={onCloseModal} className='h-10 w-10 rounded-md border border-black'>
              <Icon icon={'mdi:close'} fontSize={24} />
            </IconButton>
          </div>
          <Divider />

          <Box py={2}>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              {/* workspace name */}
              <FormControl
                fullWidth
                sx={{
                  paddingX: 5
                }}
              >
                <Typography className='font-semibold text-sm mb-3'>Workspace name *</Typography>

                <Controller
                  name='workspaceName'
                  control={control}
                  rules={{
                    required: 'Please enter a workspace name'
                  }}
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      {...field}
                      error={!!errors?.workspaceName}
                      helperText={errors?.workspaceName?.message}
                      fullWidth
                      id='workspaceName'
                      placeholder='Workspace Name'
                      sx={{ marginBottom: 4 }}
                    />
                  )}
                />
              </FormControl>
              <div className='flex items-center justify-between px-5'>
                <Box sx={{}}>
                  <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>Privacy *</Typography>
                  <Typography sx={{ fontWeight: 400, fontSize: '14px' }}>
                    Open
                    <Switch defaultChecked />
                    Closed
                  </Typography>
                </Box>
                <Typography className='font-medium text-sm w-1/2'>
                  <span className='font-bold'>Info:</span> Every team member in the account can join
                </Typography>
              </div>
              <Divider />
              <div className='flex items-center justify-between pt-5 pb-3 px-5 w-full'>
                <CustomButton
                  circular
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    onCloseModal()
                  }}
                >
                  Cancel
                </CustomButton>
                <CustomButton circular variant='contained' size='large' type='submit'>
                  {isSubmitting ? <CircularProgress size={22} color='secondary' /> : 'Create Workspace'}
                </CustomButton>
              </div>
            </form>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}

export default CreateWorkspaceDialog
