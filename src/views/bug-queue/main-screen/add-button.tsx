import React, { useState } from 'react'

import { Icon } from '@iconify/react'

import CustomButton from '@components/button'
import NewTaskDialog from './bug-add-dialog'

const NewBugQueue = ({ onBugGroupCreated }: { onBugGroupCreated?: () => void }) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <>
      <CustomButton
        variant='contained'
        startIcon={<Icon icon={'simple-line-icons:plus'} style={{ marginInline: 2 }} />}
        endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
        sx={{ px: 3.5 }}
        onClick={handleOpen}
      >
        New Bug
      </CustomButton>
      <NewTaskDialog open={open} onCloseModal={handleClose} 
      onBugGroupCreated={onBugGroupCreated}
      />
    </>
  )
}

export default NewBugQueue
