import { useState,useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSprintTaskManagement } from '@/context/sprint-tast-context'
import { useWorkspace } from '@/context/workspace-context'
import { routes } from '@/constants/routes'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import TaskTableSprint from './table'
import SprintTimelineManagement from '../../sprints/groups/sprint-list/timeline'
import CustomButton from '@/components/button'
import CreateColumnMenu from '@/views/sprint-management/tasks/components/create-column'
import axios from 'axios';
import DynamicTableHeader from '../columns/dynamic/header'
// ✅ Accept selectedSprint, searchValue, and selectedTask as props
const SprintTasksList = ({
  selectedSprint,
  searchValue,
  selectedTask
}: {
  selectedSprint?: SprintItem | null
  searchValue?: string
  selectedTask?: { id: string; name: string; sprintID: string; Taskname: string; SprintTaskID: string } | null
}) => {
  const { data } = useSprintTaskManagement()
  const { selected } = useWorkspace()
  // ✅ Apply filtering
  let filteredData = data || []

  if (selectedSprint) {
    filteredData = filteredData.filter(sp => sp.SprintID === selectedSprint.SprintID)
  } else if (searchValue && searchValue.trim() !== '') {
    filteredData = filteredData.filter(sp =>
      sp.Name?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  if (!filteredData.length)
    return (
      <Card>
        <CardContent>
          <div className='w-full flex flex-col items-center gap-4'>
            <Typography variant='h6'>No Sprints are added to this workspace!</Typography>
            <Button
              size='small'
              variant='outlined'
              LinkComponent={Link}
              href={routes.workspace + selected?.WorkspaceID + '/sprints'}
            >
              Create Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )

  return <div className='space-y-3'>{filteredData.map(k => <CollapsibleSprintList key={k?.SprintID} sp={k} selectedTask={selectedTask} />)}</div>
}

export default SprintTasksList

function CollapsibleSprintList({ sp, selectedTask }: { sp: SprintItem; selectedTask?: { id: string; name: string; sprintID: string; Taskname: string; SprintTaskID: string } | null }) {
  const { refetch } = useSprintTaskManagement()
  const [taskOpen, setTaskOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [taskGroupData, setTaskGroupData] = useState<any[]>([]) // State to store API response data
  
  useEffect(() => {
    fetchlistoftaskgroup()
  }, [sp.WorkSpaceID]) // Added dependency to refetch when WorkspaceID changes

  const fetchlistoftaskgroup = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskGroupInfoList?WorkspaceID=${sp.WorkSpaceID}`)
      setTaskGroupData(response.data) // Store the data in state
    } catch (error) {
      console.error('Error fetching task groups:', error)
      setTaskGroupData([]) // Set empty array on error
    }
  }

  return (
    <div className='space-y-3'>
      <div className='w-full flex items-center gap-2'>
        {/* Collapse ON/OFF */}
        <div className='shrink-0'>
          <IconButton size='small' className='rounded' onClick={() => setTaskOpen(!taskOpen)}>
            <i className={classNames('ri-arrow-right-s-line', taskOpen && 'rotate-90')} />
          </IconButton>
        </div>

        <Typography className='font-semibold text-primary'>{sp?.Name}</Typography>

        <div
          id={`sprint-edit-items-${sp?.SprintID}`}
          className='flex-1  flex justify-end items-center gap-4 justify-self-end'
        >
          <SprintTimelineManagement original={sp} refetch={refetch} />

          <div>
            <Typography>Performance</Typography>
          </div>

          <div>
            <CustomButton
              size='small'
              variant='outlined'
              className='py-1 leading-4'
              startIcon={<i className='ri-arrow-left-right-line' />}
            >
              Complete
            </CustomButton>
          </div>
        </div>
      </div>

      <CreateColumnMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        taskGroupData={taskGroupData} // Pass the API response data as prop
    onSubmit={(groupId) => {
    // This will receive the group ID from the CreateColumnMenu component
    
   fetchlistoftaskgroup();
  }}
          groupid={12}
          spintid={1}
      />
      
      <Collapse in={taskOpen}>
        <TaskTableSprint enabled={taskOpen} sp={sp} selectedTask={selectedTask} taskgroup={taskGroupData} />
      </Collapse>
    </div>
  )
}
