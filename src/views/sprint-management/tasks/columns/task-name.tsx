// ** React Imports
import type { ReactNode } from 'react'
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** API Imports
import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'

import type { TaskListItemType } from '@/services/modules/task/types'
// import TaskDetailsDialog from '../index'

interface TaskNameCellProps {
  renderTextField: ReactNode
  rowData: TaskListItemType
  refetch: () => void
}

const TaskNameCell = ({ renderTextField, rowData, refetch }: TaskNameCellProps) => {
  const [openTaskView, setOpenTaskView] = useState(false)

  const handleTaskViewClick = () => {
    setOpenTaskView(true)
  }

  const handleClose = () => setOpenTaskView(false)

  return (
    <>
      <Box display={'flex'} gap={3} alignItems={'center'}>
        {renderTextField}
        <IconButton size='small' onClick={handleTaskViewClick}>
          <Icon icon={'lucide:message-circle-more'} fontSize={22} />
        </IconButton>
      </Box>
      {/* <TaskDetailsDialog open={openTaskView} close={handleClose} taskData={rowData} refetchTasks={refetch} /> */}
    </>
  )
}

export default TaskNameCell
