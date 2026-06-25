'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid2'
import { Divider,Typography, TextField, Autocomplete, Chip, Box } from '@mui/material'
import { Icon } from '@iconify/react'
import CustomButton from '@/components/button'
import FallbackSpinner from '@/components/spinner'
import { ProjectProvider } from '@/context/project-context'
import { useWorkspace } from '@/context/workspace-context'
import { viewProject } from '@/services/modules/project'
import { fetchTaskGroupList, } from '@/services/modules/task-group'
import ProjectInvitePeople from './main-screen/invite-people'
import NewTask from './main-screen/new-task-group-button'
import ProjectTitle from './main-screen/project-title'
import { projectMembers } from '@/services/modules/invite'
import TaskGroupList from './task-group'
import ProjectFilterButton from './main-screen/filters'
import TaskTable from './task-group/task/task-table'
import { fetchTaskList } from '@/services/modules/task'
import CustomizedAccordions from './task-group'
import { useProject } from '@/context/project-context'
import TaskGroupActions from '././task-group/actions'
import DeleteTasksComponent from './task-group/task/delete-tasks'
import NewBoard from './main-screen/newBoard'

const ProjectManagementPage = ({ projectID }: { projectID: string }) => {
  // ** Hooks
  const router = useRouter()
  const { selected, setSelected, workspace } = useWorkspace()
  // ** Search state
  const [selectedOption, setSelectedOption] = useState<any>(null)
  const [inputValue, setInputValue] = useState('')
    const [showCard, setShowCard] = useState(false)

  // ** New task search state
  const [taskSearchValue, setTaskSearchValue] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any>({})
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['project-view', projectID],
    queryFn: () =>
      viewProject(projectID).then(res => {
        if (res?.statusCode === 403) {
          router.replace('/401')
          return undefined
        } else {
          return res?.data
        }
      })
  })
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

  
  const { data: users } = useQuery({
    queryKey: ['members-list', projectID],
    queryFn: () => projectMembers(projectID),
    enabled: !!projectID
  })

  const role = useMemo(() => data?.userProjects?.Role, [data?.userProjects?.Role])

  const {
    data: taskGroups,
    isLoading: taskLoading,
    refetch: refetchTaskGroup
  } = useQuery({
    queryKey: ['task-group', projectID],
    queryFn: () => fetchTaskGroupList(projectID),
    retry: false
  })

  // ✅ Task list API call based on selected group
  const {
    data: taskList,
    isLoading: taskListLoading,
    refetch: refetchTaskList
  } = useQuery({
    queryKey: ['task-list', selectedOption?.value],
    queryFn: () => fetchTaskList(selectedOption?.value?.toString()),
    retry: false,
    enabled: !!selectedOption?.value
  })

  // ** Create options from task groups
  const searchOptions = useMemo(() => {
    if (!taskGroups) return []
    
    let groups: any[] = []
    
    if (Array.isArray(taskGroups)) {
      groups = taskGroups
    } else if (taskGroups.data && Array.isArray(taskGroups.data)) {
      groups = taskGroups.data
    } else if (taskGroups.result && Array.isArray(taskGroups.result)) {
      groups = taskGroups.result
    }
    
    const options = groups.map((group, index) => {
      const name = group?.TaskGroupName || 
                   group?.taskGroupName || 
                   group?.name || 
                   group?.title || 
                   group?.GroupName || 
                   group?.groupName ||
                   `Task Group ${index + 1}`
      
      return {
        label: name,
        value: group?.TaskGroupID || group?.id || group?.taskGroupId || index,
        data: group
      }
    })
    
    return options
  }, [taskGroups])

  // ** Create task options from selected group
  const taskOptions = useMemo(() => {
    if (!selectedOption) return []
    
    let tasks: any[] = []

    if (taskList && Array.isArray(taskList)) {
      tasks = taskList
    } else if (selectedOption?.data?.tasks && Array.isArray(selectedOption?.data?.tasks)) {
      tasks = selectedOption?.data?.tasks
    } else if (selectedOption?.data?.Tasks && Array.isArray(selectedOption?.data?.Tasks)) {
      tasks = selectedOption?.data?.Tasks
    }

    return tasks.map((task, index) => {
      const name = task?.Taskname || 
                   task?.taskName || 
                   task?.name || 
                   task?.title || 
                   task?.TaskTitle || 
                   task?.taskTitle ||
                   task?.Task?.Taskname || 
                   task?.task?.Taskname || 
                   `Task ${index + 1}`
      
      return {
        label: name,
        value: task?.TaskID || task?.id || task?.taskId || task?.Task?.TaskID || index,
        data: task
      }
    })
  }, [selectedOption, taskList])

  // ** Filter task groups
  const filteredTaskGroups = useMemo(() => {
    if (!taskGroups || !selectedOption) return taskGroups
    
    let groups: any[] = []
    
    if (Array.isArray(taskGroups)) {
      groups = taskGroups
    } else if (taskGroups.data && Array.isArray(taskGroups.data)) {
      groups = taskGroups.data
    } else if (taskGroups.result && Array.isArray(taskGroups.result)) {
      groups = taskGroups.result
    }
    
    let selectedGroup = groups.find(group => {
      const groupId = group?.TaskGroupID || group?.id || group?.taskGroupId
      return groupId === selectedOption.value
    })
    
    if (!selectedGroup) return taskGroups

    selectedGroup = { ...selectedGroup }

    if (taskList && Array.isArray(taskList)) {
      selectedGroup.tasks = taskList
      selectedGroup.Tasks = taskList
    }

    if (selectedTasks.length > 0) {
      const selectedTaskIds = selectedTasks.map(task =>
        typeof task === 'string' ? task : task.value
      )

      const currentTasks = selectedGroup.tasks || selectedGroup.Tasks || []

const filteredTasks = currentTasks.filter((task: any) => {
  const taskId =
    task?.TaskID ??
    task?.id ??
    task?.taskId ??
    task?.Task?.TaskID;

  return selectedTaskIds.includes(taskId);
});


      selectedGroup.tasks = filteredTasks
      selectedGroup.Tasks = filteredTasks
    }
    
    if (Array.isArray(taskGroups)) {
      return selectedGroup ? [selectedGroup] : []
    } else if (taskGroups.data && Array.isArray(taskGroups.data)) {
      return { ...taskGroups, data: selectedGroup ? [selectedGroup] : [] }
    } else if (taskGroups.result && Array.isArray(taskGroups.result)) {
      return { ...taskGroups, result: selectedGroup ? [selectedGroup] : [] }
    }
    
    return taskGroups
  }, [taskGroups, selectedOption, selectedTasks, taskList])


   useEffect(() => {
    if (showSelected) {
      setShowCard(true)
    } else {
      const timeout = setTimeout(() => setShowCard(false), 200) // Duration of the unmounting animation

      return () => clearTimeout(timeout)
    }
  }, [showSelected])
  useEffect(() => {
    if (data && projectID && !selected) {
      const activeData = workspace?.find(value => value?.WorkspaceID === data?.WorkSpaceID)
      if (activeData) setSelected(activeData)
    }
  }, [data, projectID, selected, setSelected, workspace])

  if (isLoading) return <FallbackSpinner height={'80vh'} />

  if (data)
    return (
      <ProjectProvider
        project={data ?? null}
        refetchProject={refetch}
        taskGroups={filteredTaskGroups}
        users={users ?? []}
        role={role ?? null}
        refetchTaskGroup={refetchTaskGroup}
      >
        <Grid container spacing={6}>
          <Grid size={12}>
            <div className='flex items-center justify-between'>
              <ProjectTitle data={data} refetch={refetch} role={role} />
            </div>
          </Grid>
          <Grid size={12}>
            <div className='flex flex-col gap-3'>
              {selectedOption && (
                <div className='flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md border border-gray-200'>
                  <Chip
                    variant="outlined"
                    label={`Group: ${typeof selectedOption === 'string' ? selectedOption : selectedOption?.label}`}
                    size="small"
                    color="primary"
                    onDelete={() => {
                      setSelectedOption(null)
                      setInputValue('')
                      setSelectedTasks([])
                      setTaskSearchValue('')
                    }}
                  />
                  {selectedTasks.map((task, index) => (
                    <Chip
                      key={`selected-task-${index}-${task.value}`}
                      variant="outlined"
                      label={`Task: ${task.label}`}
                      size="small"
                      color="primary"
                      onDelete={() => {
                        setSelectedTasks(prev => prev.filter((_, i) => i !== index))
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div className='flex items-center justify-between gap-5 flex-wrap-reverse'>
                <div className='flex-1 min-w-[300px]'>
                  {!selectedOption ? (
                    <Autocomplete
                      freeSolo
                      options={searchOptions}
                      value={selectedOption}
                      inputValue={inputValue}
                      onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue)
                      }}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          setSelectedOption(newValue)
                          setInputValue('')
                          setSelectedTasks([])
                          setTaskSearchValue('')
                        }
                      }}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option?.label || 'Unknown'}
                      isOptionEqualToValue={(option, value) =>
                        typeof option === 'object' && typeof value === 'object'
                          ? option?.value === value?.value
                          : option === value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          placeholder="Search Task Groups..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <Icon icon={'ion:search'} style={{ marginRight: 10 }} fontSize={24} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option, { index }) => {
                        const { key, ...optionProps } = props
                        return (
                          <Box component="li" key={`group-option-${index}-${option?.value || index}`} {...optionProps}>
                            <Icon icon={'mdi:folder-outline'} style={{ marginRight: 8 }} fontSize={16} />
                            {typeof option === 'string' ? option : option?.label}
                          </Box>
                        )
                      }}
                      noOptionsText="No task groups found"
                      loading={taskLoading}
                      loadingText="Loading task groups..."
                    />
                  ) : (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={taskOptions}
                      value={selectedTasks}
                      inputValue={taskSearchValue}
                      onInputChange={(event, newInputValue) => {
                        setTaskSearchValue(newInputValue)
                      }}
                      onChange={(event, newValue) => {
                        setSelectedTasks(newValue)
                        setTaskSearchValue('')
                      }}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option?.label || 'Unknown'}
                      isOptionEqualToValue={(option, value) =>
                        typeof option === 'object' && typeof value === 'object'
                          ? option?.value === value?.value
                          : option === value
                      }
                      renderTags={() => null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          placeholder="Search tasks within selected group..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <Icon icon={'ion:search'} style={{ marginRight: 10 }} fontSize={24} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option, { index }) => {
                        const { key, ...optionProps } = props
                        return (
                          <Box component="li" key={`task-option-${index}-${option?.value || index}`} {...optionProps}>
                            <Icon icon={'mdi:clipboard-text-outline'} style={{ marginRight: 8 }} fontSize={16} />
                            {typeof option === 'string' ? option : option?.label}
                          </Box>
                        )
                      }}
                      noOptionsText="No tasks found in this group"
                      loading={taskListLoading}
                      loadingText="Loading tasks..."
                    />
                  )}
                </div>

                <div className='flex items-center gap-5 flex-wrap justify-center'>
                                    {role?.RoleName === 'Admin' && <NewBoard projectlength={filteredTaskGroups} />}

                  {role?.RoleName === 'Admin' && <NewTask projectlength={filteredTaskGroups} />}
                  <ProjectInvitePeople IsOpen={data?.IsOpen} users={users} />
                  <Divider orientation='vertical' sx={{ borderColor: 'primary.main', height: 25, borderRightWidth: 1.5 }} />
                  <ProjectFilterButton />
                  <CustomButton
                    variant='outlined'
                    startIcon={<Icon icon={'solar:calendar-date-outline'} style={{ marginInline: 2 }} />}
                    endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
                    sx={{ px: 3.5 }}
                  >
                    Today
                  </CustomButton>
                </div>
              </div>
            </div>

          </Grid>

          {/* ✅ TaskTable - only visible when a group is selected */}
          <Grid size={12} overflow={'hidden'}>
            {selectedOption && (
              <>
             

{/* 
{filteredTaskGroups?.map((data: any, index: number) => (
  <div
    key={data?.TaskGroupID || data?.id || data?.taskGroupId || index}
    className='flex items-center justify-between gap-1 w-full'
  >
    <Typography ml={3} fontWeight={700}>
      {data?.TaskGroupName ?? '-'}
    </Typography>
    <TaskGroupActions groupName= {data?.TaskGroupName}/>
  </div>
))} */}


{filteredTaskGroups?.map((data: any, index: number) => (
  <div
    key={data?.TaskGroupID || data?.id || data?.taskGroupId || index}
    className='flex items-center justify-between gap-1 w-full'
  >
    <Typography 
      ml={3} 
      fontWeight={700}
      onClick={() => {
        // Your logic here - you have access to all data properties:
        // data.TaskGroupID, data.TaskGroupName, etc.
      }}
      style={{ cursor: 'pointer' }}
    >
      {data?.TaskGroupName ?? '-'}
    </Typography>
    {/* <TaskGroupActions groupName={data?.TaskGroupName} id={data?.TaskGroupID} ProjectID={data.ProjectID} refetch={fetchTaskGroupList}  /> */}
      <TaskGroupActions groupName={data?.TaskGroupName} id={data?.TaskGroupID} ProjectID={data.ProjectID} refetch={()=>{}}  />

  </div>
))}

              <TaskTable
                taskList={
                  filteredTaskGroups &&
                  (Array.isArray(filteredTaskGroups)
                    ? filteredTaskGroups[0]?.tasks || filteredTaskGroups[0]?.Tasks || []
                    : filteredTaskGroups?.data?.[0]?.tasks ||
                      filteredTaskGroups?.data?.[0]?.Tasks ||
                      filteredTaskGroups?.result?.[0]?.tasks ||
                      filteredTaskGroups?.result?.[0]?.Tasks ||
                      [])
                }
                selectedRows={selectedRows}
                isLoading={taskListLoading}
                taskGroupID={selectedOption?.value}
                refetch={refetchTaskList}
                setSelectedRows={setSelectedRows}
              />
               
              </>
            )}
          </Grid>
      {showCard && role?.RoleName !== 'Viewer' && (
               <DeleteTasksComponent
                showCard={showCard}
                selectedRows={selectedRows}
                taskList={ filteredTaskGroups &&
                  (Array.isArray(filteredTaskGroups)
                    ? filteredTaskGroups[0]?.tasks || filteredTaskGroups[0]?.Tasks || []
                    : filteredTaskGroups?.data?.[0]?.tasks ||
                      filteredTaskGroups?.data?.[0]?.Tasks ||
                      filteredTaskGroups?.result?.[0]?.tasks ||
                      filteredTaskGroups?.result?.[0]?.Tasks ||
                      [])
                }
                refetch={refetchTaskList}
                setSelectedRows={setSelectedRows}
              />
                 )}
       
           {!selectedOption && selectedTasks.length === 0 && (
            <Grid size={12}>
              <TaskGroupList isLoading={taskLoading || taskListLoading} />
            </Grid>
          )}
        </Grid>
      </ProjectProvider>
    )
}

export default ProjectManagementPage
