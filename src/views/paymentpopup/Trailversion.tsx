import React from 'react'
import { Box, Typography, Dialog, Zoom, CircularProgress } from '@mui/material'
import CustomButton from '@/components/button'
import { Icon } from '@iconify/react'

type Props = {
  open: boolean
  onClose: () => void
  onRenew: () => void
  isLoading: boolean
  razorpayLoaded: boolean
}

/**
 * SubscriptionExpiredDialog
 * - Pure presentational component for the "Subscription Expired" popup.
 * - Keeps the exact UI and behavior as in your original Dialog.
 * - Controlled via props: open, onClose, onRenew, isLoading, razorpayLoaded.
 */
const SubscriptionExpiredDialog: React.FC<Props> = ({ open, onClose, onRenew, isLoading, razorpayLoaded }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      fullWidth
      maxWidth="sm"
    >
      <Box bgcolor={'background.default'}>
        <Box className="flex flex-col items-center justify-center px-8 py-10">
          {/* Icon */}
          <Box
            className="mb-6 rounded-full flex items-center justify-center"
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
          <Typography className="text-2xl font-bold mb-3 text-center">
            Trial Expired
          </Typography>

          {/* Message */}
          <Typography className="text-base text-center mb-6" color="text.secondary">
            Your trial has expired. Please renew your subscription to continue   premium features.
          </Typography>

          {/* Buttons */}
          <Box className="flex gap-3 w-full">
            <CustomButton
              circular
              variant="outlined"
              size="large"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              circular
              variant="contained"
              size="large"
              onClick={onRenew}
              fullWidth
             // disabled={isLoading || !razorpayLoaded}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Renew Subscription'}
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}

export default SubscriptionExpiredDialog
