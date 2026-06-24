'use client'

import { useState } from 'react'

import { Icon } from '@iconify/react'

import CustomButton from '@/components/button'
import CreateSprintGroupDialog from './create-group-dialog'

const NewSprintGroup = () => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)

  return (
    <>
      <CustomButton
        variant='contained'
        startIcon={<Icon icon={'simple-line-icons:plus'} style={{ marginInline: 2 }} />}
        endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
        sx={{ px: 3.5 }}
        onClick={handleOpen}
      >
        New Group
      </CustomButton>
      <CreateSprintGroupDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default NewSprintGroup
