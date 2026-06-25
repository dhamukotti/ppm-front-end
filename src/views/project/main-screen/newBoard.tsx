import React, { useState } from 'react'

import { Icon } from '@iconify/react'

import CustomButton from '@components/button'
import { NewTaskDialog } from './Taskboard' // ✅ Correct - named import
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../../paymentpopup/useRazorpayPayment'
import { useAuth } from '@/hooks/useAuth'
// import NewTaskDialog from './Taskboardcreation'

const NewBoard = (projectlength: any) => {
  const [open, setOpen] = useState(false)
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const handleOpen = () => setOpen(true)
  const [openDialog, setOpenDialog] = useState(false)

  const teamMembers = [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Bob Johnson', label: 'Bob Johnson' }
  ]

  const handleClose = () => setOpen(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)
  const { profile, user } = useAuth()

  const handleCreateWorkspaceClick = () => {
    try {
      const localStorageData = localStorage.getItem('paymentStatus')

      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData)

        if (parsedData?.workspaceCount === 1 && projectlength?.projectlength?.length >= 1) {
          setShowPaymentExpiredDialog(true)
        } else {
          setOpenDialog(true)
        }
      } else {
        setShowPaymentExpiredDialog(true)
      }
    } catch (error) {
      console.error('Error parsing localStorage:', error)
      setShowPaymentExpiredDialog(true)
    }
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
  }

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

  const handleSubmit = async (taskData: any) => {
    // Your API call or logic here
  }

  return (
    <>
      {/* <CustomButton
        variant='contained'
        startIcon={<Icon icon={'simple-line-icons:plus'} style={{ marginInline: 2 }} />}
        endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
        sx={{ px: 3.5 }}
        onClick={handleCreateWorkspaceClick}
      >
        New Board
      </CustomButton> */}
      {/* <NewTaskDialog open={open} onCloseModal={handleClose} /> */}

      <NewTaskDialog open={openDialog} onOpenChange={setOpenDialog} onSubmit={handleSubmit} teamMembers={teamMembers} />
    </>
  )
}

export default NewBoard
