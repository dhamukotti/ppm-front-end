'use client'

import { useEffect, useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import { Divider, Chip, TextField, Typography, Paper, List, ListItem, ListItemText, ClickAwayListener, Box, InputAdornment } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useSprintTaskManagement } from '@/context/sprint-tast-context'

import CustomButton from '@/components/button'
import { SprintTaskManagementProvider } from '@/context/sprint-tast-context'
import { useWorkspace } from '@/context/workspace-context'
import SprintFilterButton from './components/filters'
import SprintTasksList from './list'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import { createSprintTasks, fetchSprintTaskList, updateSprintTask } from '@/services/modules/sprint-tasks'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
const SprintTaskManagementContent = ({ workspaceID }: { workspaceID: string }) => {
  const { selected, setSelected, workspace } = useWorkspace()
  const { data } = useSprintTaskManagement()
  const [searchValue, setSearchValue] = useState<string>('')
  const [taskSearchValue, setTaskSearchValue] = useState<string>('') // New state for task search
  const [selectedSprint, setSelectedSprint] = useState<SprintItem | null>(null)
  const [selectedTask, setSelectedTask] = useState<{ id: string; name: string; sprintID: string; Taskname: string; SprintTaskID: string } | null>(null) // Add selected task state
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [showTaskDropdown, setShowTaskDropdown] = useState<boolean>(false) // New state for task dropdown
  const inputRef = useRef<HTMLInputElement>(null)
  const taskInputRef = useRef<HTMLInputElement>(null)

  const [groupid, setgroupid] = useState('')

  const { data: sprintListData = [], refetch: refetchSprints, isLoading: isLoadingSprints } = useQuery({
    queryKey: ['sprint-list', groupid],
    queryFn: () => fetchSprintTaskList({sprintID: groupid}),
    enabled: !!groupid
  })

  const sprintDataArray = sprintListData && (sprintListData as any).data ? (sprintListData as any).data : []






  // Extract task names and IDs from the sprint data
  const tasks = selectedSprint && sprintDataArray.length > 0 
    ? sprintDataArray
        .filter((task: any) => task.SprintID === selectedSprint.SprintID)
        .map((task: any) => ({
          id: task.SprintTaskID,
          name: task.Taskname || 'Unnamed Task',
          sprintID: task.SprintID,
          Taskname: task.Taskname || 'Unnamed Task', // Add this line to fix the error
          SprintTaskID: task.SprintTaskID // Add this line to fix the error
        }))
    : []

  // Filter tasks based on task search value - FIXED THE ERROR HERE
  // const filteredTasks = tasks.filter(task => 
  //   taskSearchValue.trim() === '' || 
  //   (task.Taskname && task.Taskname.toLowerCase().includes(taskSearchValue.toLowerCase())) ||
  //   (task.SprintTaskID && task.SprintTaskID)
  // )
// Replace the filteredTasks logic with this corrected version:

// Filter tasks based on task search value - FIXED VERSION
const filteredTasks = tasks.filter((task:any) => {
  // If a task is selected and search value matches the selected task name, show all tasks
  if (selectedTask && taskSearchValue === selectedTask.name) {
    return true;
  }
  
  if (taskSearchValue.trim() === '') {
    return true; // Show all tasks when no search term
  }
  
  // Search in task name (Taskname) and task ID (SprintTaskID)
  const searchTerm = taskSearchValue.toLowerCase();
  const taskName = task.Taskname ? task.Taskname.toLowerCase() : '';
  const taskId = task.SprintTaskID ? String(task.SprintTaskID).toLowerCase() : '';
  
  return taskName.includes(searchTerm) || taskId.includes(searchTerm);
});




  useEffect(() => {
    if (workspaceID && !selected) {
      const activeData = workspace?.find(value => value?.WorkspaceID?.toString() === workspaceID)
      if (activeData) setSelected(activeData)
    }
  }, [selected, setSelected, workspace, workspaceID])

  const handleInputFocus = () => {
    if (!selectedSprint && data && data.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleTaskInputFocus = () => {
    if (selectedSprint && tasks.length > 0) {
      setShowTaskDropdown(true)
    }
  }

  const handleSprintSelect = (sprint: SprintItem) => {
    setSelectedSprint(sprint)         
    setgroupid((sprint as any).SprintID)              
    setSearchValue('') // Clear the search input when a group is selected
    setShowDropdown(false)
    setTaskSearchValue('') // Clear task search when sprint is selected
    setSelectedTask(null) // Clear selected task when sprint changes
  }

  const handleTaskSelect = (task: { id: string; name: string; sprintID: string; Taskname: string; SprintTaskID: string }) => {
    setSelectedTask(task) // Set the selected task
    setTaskSearchValue(task.name) // Set the selected task name in the input
    setShowTaskDropdown(false)
    // You can add additional logic here if you need to do something with the selected task
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)

    // If we have a selected sprint and user starts typing, clear the selection
    if (selectedSprint && value.trim() !== '') {
      setSelectedSprint(null)
      setgroupid('')
      setTaskSearchValue('') // Clear task search when sprint is cleared
      setSelectedTask(null) // Clear selected task when sprint is cleared
    }
    
    // Show dropdown when there's input and we have data
    if (value.trim() !== '' && data && data.length > 0) {
      setShowDropdown(true)
    } else if (value.trim() === '' && data && data.length > 0) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleTaskSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTaskSearchValue(value)

    // If user starts typing and has a selected task, clear the selection
    if (selectedTask && value.trim() !== selectedTask.name) {
      setSelectedTask(null)
    }

    // Show task dropdown when there's input and we have tasks
    if (value.trim() !== '' && tasks.length > 0) {
      setShowTaskDropdown(true)
    } else if (value.trim() === '' && tasks.length > 0) {
      setShowTaskDropdown(true)
    } else {
      setShowTaskDropdown(false)
    }
  }

  const handleClickAway = () => {
    setShowDropdown(false)
  }

  const handleTaskClickAway = () => {
    setShowTaskDropdown(false)
  }

  const handleClearSelection = () => {
    setSelectedSprint(null)
    setgroupid('')
    setSearchValue('')
    setTaskSearchValue('') // Clear task search as well
    setSelectedTask(null) // Clear selected task as well
    setShowDropdown(false)
    setShowTaskDropdown(false)
  }

  const handleClearTaskSelection = () => {
    setSelectedTask(null)
    setTaskSearchValue('')
    setShowTaskDropdown(false)
  }

  // Filter sprints based on searchValue
  const filteredSprints = data?.filter(sprint => {
    if (searchValue.trim() === '') {
      return true // Show all sprints when no search term
    }
    return sprint.Name?.toLowerCase().includes(searchValue.toLowerCase())
  })

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <div className='flex items-center justify-between'>
          <Typography fontWeight={700} fontSize={'1.75rem'}>
            Tasks
          </Typography>
        </div>
      </Grid>

      <Grid size={12}>
        {(selectedSprint || selectedTask) && (
          <Box
            sx={{
              mb: 3, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              p: 2,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {selectedSprint && (
              <Chip
                key={`selected-sprint-${selectedSprint.SprintID}`}
                label={`Sprint: ${selectedSprint.Name}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={handleClearSelection}
              />
            )}
            {selectedTask && (
              <Chip
                key={`selected-task-${selectedTask.id}`}
                label={`Task: ${selectedTask.name}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={handleClearTaskSelection}
              />
            )}
          </Box>
        )}

        <div className='flex items-center justify-between gap-5 flex-wrap-reverse'>
          <div className='flex-1 min-w-[300px]'>
            {/* First Input - Show when no sprint is selected */}
            {!selectedSprint && (
              <ClickAwayListener onClickAway={handleClickAway}>
                <div style={{ position: 'relative' }}>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    size='small'
                    placeholder='Search ID, sprint name, or click to browse groups...'
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon={'ion:search'} style={{ color: '#666' }} fontSize={20} />
                        </InputAdornment>
                      ),
                      endAdornment: showDropdown && (
                        <InputAdornment position="end">
                          <Icon icon={'akar-icons:chevron-up'} style={{ color: '#666' }} fontSize={16} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2,
                        }
                      }
                    }}
                  />

                  {showDropdown && (
                    <Paper
                      elevation={8}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        maxHeight: 320,
                        overflow: 'auto',
                        mt: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '& .MuiList-root': { py: 1 }
                      }}
                    >
                      {filteredSprints && filteredSprints.length > 0 ? (
                        <List dense sx={{ py: 0 }}>
                          {filteredSprints.map((sprint: SprintItem, index) => (
                            <ListItem
                              key={`dropdown-${sprint.SprintID}-${index}`}
                              onClick={() => handleSprintSelect(sprint)}
                              sx={{
                                py: 1.5,
                                px: 2,
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  transform: 'translateX(4px)',
                                  transition: 'all 0.2s ease-in-out'
                                },
                                cursor: 'pointer',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' }
                              }}
                            >
                              <Icon icon="ion:folder" style={{ marginRight: 8, fontSize: '18px' }} />
                              <ListItemText 
                                primary={sprint.Name}
                                primaryTypographyProps={{
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                  color: 'text.primary'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                          <Icon icon={'tabler:search-off'} fontSize={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            No sprints found
                          </Typography>
                          <Typography variant="caption">
                            {searchValue ? 'Try adjusting your search terms' : 'No sprints available'}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </div>
              </ClickAwayListener>
            )}

            {/* Second Input - Show when sprint is selected */}
            {selectedSprint && (
              <ClickAwayListener onClickAway={handleTaskClickAway}>
                <div style={{ position: 'relative' }}>
                  <TextField
                    ref={taskInputRef}
                    fullWidth
                    size='small'
                    placeholder='Search task names or IDs...'
                    value={taskSearchValue}
                    onChange={handleTaskSearchChange}
                    onFocus={handleTaskInputFocus}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon={'ion:search'} style={{ color: '#666' }} fontSize={20} />
                        </InputAdornment>
                      ),
                      endAdornment: showTaskDropdown && (
                        <InputAdornment position="end">
                          <Icon icon={'akar-icons:chevron-up'} style={{ color: '#666' }} fontSize={16} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2,
                        }
                      }
                    }}
                  />

                  {showTaskDropdown && (
                    <Paper
                      elevation={8}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        maxHeight: 320,
                        overflow: 'auto',
                        mt: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '& .MuiList-root': { py: 1 }
                      }}
                    >
                      {filteredTasks.length > 0 ? (
                        <List dense sx={{ py: 0 }}>
                          {filteredTasks.map((task:any, index:any) => (
                            <ListItem
                              key={`task-dropdown-${task.id}-${index}`}
                              onClick={() => handleTaskSelect(task)}
                              sx={{
                                py: 1.5,
                                px: 2,
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  transform: 'translateX(4px)',
                                  transition: 'all 0.2s ease-in-out'
                                },
                                cursor: 'pointer',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' }
                              }}
                            >
                                  <Icon icon={'mdi:clipboard-text-outline'} style={{ marginRight: 8 }} fontSize={16} />
                              <ListItemText 
                                primary={
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {task.name}
                                    </Typography>
                                 
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                          <Icon icon={'tabler:search-off'} fontSize={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            No tasks found
                          </Typography>
                          <Typography variant="caption">
                            {taskSearchValue ? 'Try adjusting your search terms' : 'No tasks available for this sprint'}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </div>
              </ClickAwayListener>
            )}
          </div>

          {/* Buttons */}
          <div className='flex items-center gap-5 flex-wrap justify-center'>
            <Divider orientation='vertical' sx={{ borderColor: 'primary.main', height: 25, borderRightWidth: 1.5 }} />
            <SprintFilterButton workspaceID={workspaceID} />
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
      </Grid>

      <Grid size={12}>
        <SprintTasksList selectedSprint={selectedSprint} selectedTask={selectedTask} />
      </Grid>
    </Grid>
  )
}

const SprintTaskManagementPage = ({ workspaceID }: { workspaceID: string }) => {
  return (
    <SprintTaskManagementProvider workspaceID={workspaceID} groupID=''>
      <SprintTaskManagementContent workspaceID={workspaceID} />
    </SprintTaskManagementProvider>
  )
}

// Make sure to export the component properly
export default SprintTaskManagementPage
