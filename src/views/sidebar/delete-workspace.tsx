import { Icon } from '@iconify/react'
import { Box, Dialog, DialogActions, DialogContent, IconButton, Typography, Zoom } from '@mui/material'

import CustomButton from '@/components/button'
import {useEffect,useState} from 'react'
type DeleteWorkspaceDialogProps = {
  open: boolean
  setOpen: (value: boolean) => void
  onConfirm: () => void
}

function DeleteWorkspaceDialog({ open, setOpen, onConfirm }: DeleteWorkspaceDialogProps) {


    const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
    const [shouldOpenDialog, setShouldOpenDialog] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }








  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
    handleClose()
  }
  const handleRenewSubscription = () => {
    // Add your navigation logic here
    // Example: router.push('/subscription') or window.location.href = '/subscription'

    setShowPaymentExpiredDialog(false)
    handleClose()
  }
   const checkPaymentStatus = () => {
    const paymentStatus = localStorage.getItem('paymentStatus')
 

    try {
      if (paymentStatus) {
        const parsed = JSON.parse(paymentStatus)
        // If expired, show payment expired dialog
        if (parsed.isExpired === true) {
          setShowPaymentExpiredDialog(true)
          return false
        }
        // Only open if isExpired is false
        return parsed.isExpired === false
      }
      return false
    } catch (error) {
      console.error('Error parsing payment status:', error)
      return false
    }
  }

  return (
    <>    <Dialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        TransitionComponent={Zoom}
        fullWidth
        maxWidth='sm'
      >
        <Box bgcolor={'background.default'}>
          <Box className='flex flex-col items-center justify-center px-8 py-10'>
            {/* Icon */}
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

            {/* Title */}
            <Typography className='text-2xl font-bold mb-3 text-center'>
              Subscription Expired
            </Typography>

            {/* Message */}
            <Typography className='text-base text-center mb-6' color='text.secondary'>
              Your subscription has expired. Please renew your subscription to continue creating Projects and accessing premium features.
            </Typography>

            {/* Buttons */}
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
                onClick={handleRenewSubscription}
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
      </Dialog>





    <Dialog open={open} onClose={handleClose} TransitionComponent={Zoom} fullWidth maxWidth='sm'>
      <div className='flex flex-1 items-center justify-between px-5 py-4 bg-backgroundDefault'>
        <Typography className='text-xl font-medium'>Delete Workspace ?</Typography>
        <IconButton aria-label='close' onClick={handleClose} className='h-10 w-10 rounded-md border border-black'>
          <Icon icon={'mdi:close'} color={`common.black`} fontSize={24} />
        </IconButton>
      </div>
      <DialogContent className='bg-backgroundDefault py-7'>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={2}>
          <Typography variant='caption' className='text-sm font-normal text-center'>
            Are you sure you want to delete this workspace?
          </Typography>
          <Typography variant='caption' className='text-sm font-normal text-center'>
            ** You wont be able to revert the changes
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions className='justify-between px-4 py-4 bg-backgroundDefault'>
        <CustomButton circular variant='outlined' size='large' onClick={handleClose}>
          Cancel
        </CustomButton>
        <CustomButton circular variant='contained' size='large' onClick={onConfirm}>
          {'Confirm Delete'}
        </CustomButton>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default DeleteWorkspaceDialog
