import { useState } from 'react'

import Image from 'next/image'

import { Card, Typography } from '@mui/material'

import FallbackSpinner from '@/components/spinner'
import { useProject } from '@/context/project-context'
import noDataImage from '@public/images/cards/no-data.svg'

import CustomButton from '@/components/button'
import NewTaskDialog from '../main-screen/task-group-add-dialog'
import CustomizedAccordions from './task-group'

interface TaskGroupListProps {
  isLoading: boolean
}

const TaskGroupList = ({ isLoading }: TaskGroupListProps) => {
  const { taskGroups, role } = useProject()

  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  if (isLoading) return <FallbackSpinner height={'60vh'} />

  return (
    <Card sx={{ borderRadius: '15px', overflow: 'hidden' }}>
      {taskGroups?.length ? (
        <div className='px-2 py-2'>
          {taskGroups?.map((item, index) => <CustomizedAccordions key={item?.TaskGroupID} index={index} data={item} />)}
        </div>
      ) : (
        <div className='px-3 py-10  flex gap-10 items-center justify-center flex-col'>
          <Image src={noDataImage} alt='NoDataFound' width={300} />
          <Typography fontWeight={600}>No Task Groups Added</Typography>
          {role?.RoleName === 'Admin' && (
            <CustomButton variant='contained' circular onClick={handleOpen}>
              Add Now
            </CustomButton>
          )}
          <NewTaskDialog open={open} onCloseModal={handleClose} />
        </div>
      )}
    </Card>
  )
}

export default TaskGroupList
