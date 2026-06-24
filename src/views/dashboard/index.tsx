'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'

import { Box, Typography, CircularProgress } from '@mui/material'

import CustomButton from '@/components/button'
import { useWorkspace } from '@/context/workspace-context'
import CreateWorkspaceDialog from '../sidebar/create-workspace-dialog'
import { Icon } from '@iconify/react'
import WorkspaceMen from '@public/images/cards/workspace-men.svg'
import { useAuth } from '@/hooks/useAuth'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../paymentpopup/useRazorpayPayment'

const DashboardPage = () => {
  // ** State
  const [open, setOpen] = useState(false)
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)

  const { profile, user } = useAuth()
  const { refetchWorkspaces } = useWorkspace()

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

  const handleOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
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

  // Run payment status check on mount (no logic changes)
  useEffect(() => {
    const canOpen = checkPaymentStatus()
    setShouldOpenDialog(canOpen)
  }, [])

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

  return (
    <>
      <SubscriptionExpiredDialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        onRenew={generateRazorPayOrder}
        isLoading={isLoading}
        razorpayLoaded={razorpayLoaded}
      />

      <Box>
        <Typography className='text-lg lg:text-3xl font-bold text-textPrimary'>Create your workspace</Typography>
        <div className='flex items-center justify-between rounded-4xl flex-wrap border border-bgDivider px-6 mt-4'>
          <Box py={6}>
            <Typography className='font-normal text-base lg:text-lg'>Welcome To</Typography>
            <Typography className='font-bold text-lg lg:text-xl' my={1}>
              Your Workspace Area
            </Typography>
            <Typography className='font-normal text-base lg:text-lg'>Create your perfect workspace here</Typography>
            <CustomButton circular size='small' className='mt-10 px-6' variant='contained' onClick={handleOpen}>
              Create
            </CustomButton>
          </Box>

          <Image
            alt='man doing work'
            src={WorkspaceMen}
            style={{
              objectFit: 'cover',
              maxWidth: '100%',
              maxHeight: '100%',
              height: 'auto',
              width: 'auto',
              marginTop: 10,
              marginBottom: 10
            }}
          />
        </div>
      </Box>
      <CreateWorkspaceDialog open={open} onCloseModal={handleClose} refetchWorkspaces={refetchWorkspaces} />
    </>
  )
}

export default DashboardPage
