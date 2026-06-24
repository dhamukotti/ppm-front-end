import { useEffect, useState } from 'react'

import { Icon } from '@iconify/react'
import { Box, Grid2 as Grid, IconButton, Typography, useMediaQuery } from '@mui/material'

import CustomAvatar from '@/@core/components/mui/Avatar'
import HtmlEditor from '@/components/input/html-editor'
import { useProject } from '@/context/project-context'
import { updateTasks } from '@/services/modules/task'
import type { TaskListItemType } from '@/services/modules/task/types'
import { getInitials } from '@/utils/getInitials'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'
const MobileProjectDetail = () => {
  const { project: projectData } = useProject()
const { profile,user } = useAuth()

  return (
    <div className='w-full relative rounded-xl bg-primaryLighter h-full flex flex-col sm:flex-row items-center justify-between p-5 gap-4'>
      <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={4}>
        <Box position={'relative'} display={'flex'}>
          <CustomAvatar skin='light' sx={{ height: 80, width: 80 }} src={'/images/avatars/3.png'}>
            {getInitials(projectData?.CreatedBy?.Name || '')}
          </CustomAvatar>
          <Box
            display={'flex'}
            alignItems={'center'}
            gap={1}
            position={'absolute'}
            bgcolor={'white'}
            borderRadius={100}
            top={-1}
            right={-1}
            boxShadow={theme => theme.shadows[4]}
          >
            <IconButton size='small'>
              <Icon icon={'mdi:favourite-outline'} />
            </IconButton>
          </Box>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={{ xs: 'start', lg: 'center' }}
          justifyContent={'center'}
        >
          <Typography variant='body1' fontWeight={600}>
            {projectData?.CreatedBy?.Name}
          </Typography>
          <Typography variant='body2'>Product Owner</Typography>
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={4}>
        {/* <CustomButton variant='contained' size='small'>
          Sprint 1.1
        </CustomButton> */}
        <Box mt={{ lg: 5 }}>
          <CustomButton variant='outlined' circular size='small'>
            View All
          </CustomButton>
        </Box>
      </Box>
    </div>
  )
}

const DesktopProjectDetail = () => {
  const { project: projectData } = useProject()
  const auth = useAuth()
  return (
    <div className='w-full rounded-xl bg-primaryLighter h-full flex flex-col items-center justify-center p-5 gap-1'>
      <CustomAvatar skin='light' sx={{ height: 100, width: 100 }} src={auth?.user?.userData?.ProfilePicture || '/images/avatars/1.png'}>
        {getInitials(projectData?.CreatedBy?.Name || '')}
      </CustomAvatar>

      <Typography variant='body1' fontWeight={600}>
        {projectData?.CreatedBy?.Name}
      </Typography>
      <Typography variant='body2'>Product Owner</Typography>

      <Box display={'flex'} alignItems={'center '} gap={1} my={4}>
        <IconButton size='small'>
          <Icon icon={'mdi:favourite-outline'} />
        </IconButton>
        <Typography variant='subtitle2'>Add to favourites</Typography>
      </Box>
      {/* <CustomButton variant='contained'>Sprint 1.1</CustomButton> */}
      <Box mt={{ lg: 5 }}>
        <CustomButton variant='outlined' circular size='small'>
          View All
        </CustomButton>
      </Box>
    </div>
  )
}

interface ProjectDetailsTabProps {
  taskData: TaskListItemType
  refetchTasks: () => void
}

const ProjectDetailsTab = ({ taskData, refetchTasks }: ProjectDetailsTabProps) => {
  const { project: projectData } = useProject()
  const lgBreakpoint = useMediaQuery(theme => theme.breakpoints.up('lg'))

  const [value, setValue] = useState('')

  const handleChange = async (v: string) => {
    try {
      const body = { TaskDescription: v, Title: 'Task Description Changed' }
      const response = await updateTasks({ id: taskData?.TaskID?.toString(), body })

      if (response) {
        refetchTasks()
      }

      setValue(v)
    } catch (error) {
      console.error('error :', error)
    }
  }

  useEffect(() => {
    setValue(taskData?.TaskDescription)
  }, [taskData?.TaskDescription])

  return (
    <Box height={'100%'}>
      <Grid container spacing={4} alignItems={'stretch'} height={'100%'}>
        <Grid size={{ xs: 12, lg: 8 }} order={{ xs: 2, lg: 1 }}>
          <Grid container spacing={7}>
            <Grid size={12}>
              <Typography variant='body2'>{'Task :'}</Typography>
              <Typography fontWeight={600} variant='h6'>
                {taskData?.Taskname}
              </Typography>
            </Grid>
            <Grid size={12} key={value}>
              {projectData?.userProjects?.Role?.RoleName === 'Admin' ? (
                <HtmlEditor
                  placeholder={'Please enter a project description....'}
                  onChange={handleChange}
                  setContent={value}
                  defaultValue={value}
                />
              ) : (
                <p dangerouslySetInnerHTML={{ __html: value }} />
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} order={{ xs: 1, lg: 2 }}>
          {lgBreakpoint ? <DesktopProjectDetail /> : <MobileProjectDetail />}
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProjectDetailsTab
