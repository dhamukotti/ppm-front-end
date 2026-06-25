import React, { useState } from 'react'

import { Box, Dialog, DialogContent, DialogTitle, Typography,IconButton } from '@mui/material'
import { Icon } from '@iconify/react'

// MUI Imports
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Tab from '@mui/material/Tab'
import { styled } from '@mui/styles'

import type { TaskListItemType } from '@/services/modules/task/types'
import { useProject } from '@/context/project-context'
import ProjectActivityLogs from './activity-log'
import ProjectUpdates from './updates'
import ProjectDetailsTab from './info'

const StyledTabPanel = styled(TabPanel)(() => ({
  padding: 0,
  height: '60vh'
}))

interface TaskDetailsProps {
  open: boolean
  close: () => void
  taskData: TaskListItemType
  refetchTasks: () => void
}

const TaskDetailsDialog = ({ open, close, taskData, refetchTasks }: TaskDetailsProps) => {
  const { project: projectData } = useProject()

  // States
  const [value, setValue] = useState('details')

  const handleChange = (event: any, newValue: string) => {
    setValue(newValue)
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='lg'>
      <DialogTitle>
         <IconButton
        aria-label="close"
        onClick={close}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Icon icon="mdi:close" />
      </IconButton>
        <Box>
          <Typography variant='h5' color={'primary.main'} fontWeight={700} mb={1}>
            {projectData?.ProjectName}
          </Typography>
          <Typography>Kindly update your information</Typography>
          
        </Box>
     
      </DialogTitle>
      <DialogContent>
        <Box>
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label='project details tabs'>
              <Tab value='details' label='Details' />
              <Tab value='updates' label='Updates' />
              <Tab value='activity' label='Activity Log' />
            </TabList>
            <StyledTabPanel value='details'>
              <ProjectDetailsTab taskData={taskData} refetchTasks={refetchTasks} />
            </StyledTabPanel>
            <StyledTabPanel value='updates'>
              <ProjectUpdates taskData={taskData} />
            </StyledTabPanel>
            <StyledTabPanel value='activity'>
              <ProjectActivityLogs taskData={taskData} />
            </StyledTabPanel>
          </TabContext>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailsDialog
