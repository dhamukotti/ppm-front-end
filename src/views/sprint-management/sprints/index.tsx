'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Icon } from '@iconify/react'
import Grid from '@mui/material/Grid2'
import { 
  Divider, 
  TextField, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  ClickAwayListener,
  Chip,
  Box,
  InputAdornment
} from '@mui/material'

import { SprintManagementProvider } from '@/context/sprint-context'
import { useWorkspace } from '@/context/workspace-context'
import { useQuery } from '@tanstack/react-query'
import {  } from '@/services/modules/sprint-group'
import NewSprintGroup from './components/new-group'
import CustomButton from '@/components/button'
import SprintFilterButton from './components/filters'
import Searchgroplist from './groups/Serchlist'
import GroupList from './groups/list'
import { fetchSprintListBasic } from '@/services/modules/sprint-item'
import { createSprint, fetchSprintList, updateSprint } from '@/services/modules/sprint-item'
import DeleteTasksComponent from './components/Delete-sprint'
import { projectMembers } from '@/services/modules/invite'
import { fetchSprintGroups } from '@/services/modules/sprint-group'

const SprintManagementPage = ({ workspaceID }: { workspaceID: string }) => {
  const { selected, setSelected, workspace } = useWorkspace()
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<any[]>([])
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [groupid, setgroupid] = useState('')

    const [selectedRows, setSelectedRows] = useState<any>({})
   const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

  // NEW STATE FOR SECOND INPUT
  const [showSecondInput, setShowSecondInput] = useState(false)
  const [secondSearchTerm, setSecondSearchTerm] = useState('')
  const [showSecondDropdown, setShowSecondDropdown] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<any>(null) // NEW: Track selected sprint
  const secondInputRef = useRef<HTMLInputElement>(null)
    const [showCard, setShowCard] = useState(false)
  // Fetch actual groups using your existing query
  const { data: groupsData = [], refetch: refetchGroups } = useQuery({
    queryKey: ['sprint-groups', workspaceID],
    queryFn: () => fetchSprintGroups(workspaceID),
    enabled: !!workspaceID
  })
  
  const { data: sprintListData = [], refetch: refetchSprints } = useQuery({
    queryKey: ['sprint-list', groupid],
    queryFn: () => fetchSprintList({SprintGroupID: groupid}),
    enabled: !!groupid
  })
   useEffect(() => {
    if (showSelected) {
      setShowCard(true)
    } else {
      const timeout = setTimeout(() => setShowCard(false), 200) // Duration of the unmounting animation

      return () => clearTimeout(timeout)
    }
  }, [showSelected])
  useEffect(() => {
    if (workspaceID && !selected) {
      const activeData = workspace?.find(value => value?.WorkspaceID?.toString() === workspaceID)
      if (activeData) setSelected(activeData)
    }
  }, [selected, setSelected, workspace, workspaceID])
  
  // Filter groups based on search term and exclude already selected ones
  const filteredGroups = groupsData.filter(group => {
    if (searchTerm.trim() === '') {
      return !selectedGroups.some(selected => selected.id === group.SprintGroupID)
    }
    const matchesSearch = 
      group?.GroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group?.SprintGroupID?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    const notSelected = !selectedGroups.some(selected => selected.id === group.SprintGroupID)
    return matchesSearch && notSelected
  })

  // FIXED: Filter for second input - properly handle sprint data structure
  const filteredSecondSprints = ((sprintListData as any)?.data  || []).filter((sprint: any) => {
    if (secondSearchTerm.trim() === '') {
      return true // Show all sprints when no search term
    }
    const matchesSearch = 
      sprint?.Name?.toLowerCase().includes(secondSearchTerm.toLowerCase()) ||
      sprint?.SprintID?.toString().toLowerCase().includes(secondSearchTerm.toLowerCase()) ||
      sprint?.Description?.toLowerCase().includes(secondSearchTerm.toLowerCase())
    return matchesSearch
  })
 
  const handleInputFocus = () => {
    if (searchTerm.trim() === '') {
      setShowDropdown(true)
    }
  }

  const handleSecondInputFocus = () => {
    setShowSecondDropdown(true) // Always show dropdown for sprints
  }

  const handleGroupSelect = (group: any) => {
    // Store the whole group object (already includes both ID + Name)
    const groupToAdd = {
      id: group.SprintGroupID,
      GroupName: group.GroupName,
      SprintGroupID: group.SprintGroupID
    }
    setSelectedGroups(prev => [...prev, groupToAdd])

    // Example: log both ID and Name

    setgroupid(group.SprintGroupID)
    setSearchTerm('')
    setShowDropdown(false)
    setTriggerSearch(true)
    setShowSearchResults(true)
    
    // NEW: Hide first input and show second input
    setShowSecondInput(true)
    setSelectedSprint(null) // Reset selected sprint when group changes
    setSecondSearchTerm('') // Reset second search term
    
    // FIXED: Force refetch of sprints when group is selected
    setTimeout(() => {
      refetchSprints()
    }, 100)
  }

  const handleSecondSprintSelect = (sprint: any) => {
    // Handle sprint selection instead of group selection
  
    setSelectedSprint(sprint) // Set the selected sprint
    setSecondSearchTerm(sprint.Name) // Set input text to selected sprint name
    setShowSecondDropdown(false)
    setTriggerSearch(true)
    setShowSearchResults(true)
  }

  const handleRemoveGroup = (groupToRemove: any) => {
    setSelectedGroups(prev => prev.filter(group => group.id !== groupToRemove.id))
    if (selectedGroups.length <= 1) {
      setTriggerSearch(false)
      setShowSearchResults(false)
      // NEW: Show first input again if no groups selected
      setShowSecondInput(false)
      setSecondSearchTerm('')
      setSelectedSprint(null) // Clear selected sprint
      setgroupid('') // FIXED: Clear group ID when removing group
    }
  }

  const handleClickAway = () => {
    setShowDropdown(false)
    setShowSecondDropdown(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
 
    setSearchTerm(value)

    // ✅ keep same dropdown logic
    if (value.trim() !== '' || groupsData.length > 0) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }

    // ✅ trigger search based on value
    if (value.trim() !== '') {
      setTriggerSearch(true)
      setShowSearchResults(true)
    } else if (selectedGroups.length === 0) {
      setTriggerSearch(false)
      setShowSearchResults(false)
    }
  }

  const handleSecondSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSecondSearchTerm(value)
    
    // FIXED: Don't clear selected sprint if user is just typing to search
    if (!selectedSprint || selectedSprint.Name !== value) {
      setSelectedSprint(null) // Only clear if the value doesn't match current selection
    }

    // Always show dropdown for sprints when input is focused and has content or when empty to show all
    setShowSecondDropdown(true)

    // FIXED: Always trigger search for sprint filtering
    setTriggerSearch(true)
    setShowSearchResults(true)
  }

  // FIXED: Add function to handle sprint removal
  const handleRemoveSprint = () => {
    setSelectedSprint(null)
    setSecondSearchTerm('')
    // Keep the search results showing but without sprint filter
    setTriggerSearch(true)
    setShowSearchResults(true)
  }

  const getGroupInitials = (groupName: string) => {
    return groupName?.split(' ').map(word => word[0]).join('').toUpperCase() || '??'
  }

  const getGroupColor = (index: number) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f', '#0288d1', '#689f38', '#f9a825']
    return colors[index % colors.length]
  }

  return (
    <SprintManagementProvider workspaceID={workspaceID}>
      <Grid container spacing={6}>
        <Grid size={12}>
          <div className='flex items-center justify-between'>
            <Typography fontWeight={700} fontSize={'1.75rem'}>
              {`Sprints`}
            </Typography>
          </div>
        </Grid>
        <Grid size={12}>
          {selectedGroups.length > 0 && (
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              p: 2,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {selectedGroups.map((group, index) => (
                <Chip
                  key={`selected-${group.id}-${index}`}
                  label={`Group: ${group.GroupName}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={() => handleRemoveGroup(group)}
                  sx={{
                    '& .MuiChip-deleteIcon': {
                      color: 'text.red',
                      '&:hover': {
                        color: 'error.main'
                      }
                    }
                  }}
                />
              ))}
              {selectedSprint && (
                <Chip
                  label={`Sprint: ${selectedSprint.Name}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={handleRemoveSprint}
                  sx={{
                    '& .MuiChip-deleteIcon': {
                      color: 'text.red',
                      '&:hover': {
                        color: 'error.main'
                      }
                    }
                  }}
                />
              )}
            </Box>
          )}
          <div className='flex items-center justify-between gap-5 flex-wrap-reverse'>
            <div className='flex-1 min-w-[300px]'>
              <ClickAwayListener onClickAway={handleClickAway}>
                <div style={{ position: 'relative' }}>
                  {/* FIRST INPUT - Hidden when showSecondInput is true */}
                  {!showSecondInput && (
                    <>
                      <TextField
                        ref={inputRef}
                        fullWidth
                        size='small'
                        placeholder='Search ID, sprint name, or click to browse groups...'
                        value={searchTerm}
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
                          {filteredGroups.length > 0 ? (
                            <List dense sx={{ py: 0 }}>
                              {filteredGroups.map((group, index) => (
                                <ListItem
                                  key={`dropdown-${group.SprintGroupID}-${index}`}
                                  onClick={() => handleGroupSelect(group)}
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
                                  <ListItemAvatar>
                                    <Icon icon="ion:folder" style={{ fontSize: '18px' }} />
                                  </ListItemAvatar>
                                  <ListItemText 
                                    primary={group.GroupName}
                                    primaryTypographyProps={{
                                      fontSize: '0.9rem',
                                      fontWeight: 500,
                                      color: 'text.primary'
                                    }}
                                    secondaryTypographyProps={{
                                      fontSize: '0.75rem',
                                      color: 'text.secondary'
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                              <Icon icon={'tabler:search-off'} fontSize={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                No groups found
                              </Typography>
                              <Typography variant="caption">
                                {searchTerm ? 'Try adjusting your search terms' : 'No groups available'}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </>
                  )}

                  {/* SECOND INPUT - Shown when showSecondInput is true - NOW SHOWS SPRINTS */}
                  {showSecondInput && (
                    <>
                      <TextField
                        ref={secondInputRef}
                        fullWidth
                        size='small'
                        placeholder='Search sprints by ID or name...'
                        value={secondSearchTerm}
                        onChange={handleSecondSearchChange}
                        onFocus={handleSecondInputFocus}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon={'ion:search'} style={{ color: '#666' }} fontSize={20} />
                            </InputAdornment>
                          ),
                          endAdornment: showSecondDropdown && (
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
                      {showSecondDropdown && (
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
                            borderColor: 'secondary.main',
                            borderRadius: 2,
                            '& .MuiList-root': { py: 1 }
                          }}
                        >
                          {filteredSecondSprints.length > 0 ? (
                            <List dense sx={{ py: 0 }}>
                              {filteredSecondSprints.map((sprint:any, index:Number) => (
                                <ListItem
                                  key={`second-dropdown-${sprint.SprintID}-${index}`}
                                  onClick={() => handleSecondSprintSelect(sprint)}
                                  sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                      backgroundColor: 'primary.light',
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
                                    primary={sprint.Name}
                                    primaryTypographyProps={{
                                      fontSize: '0.9rem',
                                      fontWeight: 500,
                                      color: 'text.primary'
                                    }}
                                    secondaryTypographyProps={{
                                      fontSize: '0.75rem',
                                      color: 'text.secondary'
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
                                {secondSearchTerm ? 'Try adjusting your search terms' : 'No sprints available in this group'}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </>
                  )}
                </div>
              </ClickAwayListener>
            </div>
            <div className='flex items-center gap-5 flex-wrap justify-center'>
              <NewSprintGroup />
              <Divider orientation='vertical' sx={{ borderColor: 'primary.main', height: 25, borderRightWidth: 1.5 }} />
              <SprintFilterButton />
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
          {selectedGroups.length > 0 || (showSearchResults && (searchTerm.trim() !== '' || secondSearchTerm.trim() !== '')) ? (
            <Searchgroplist 
              searchTerm={searchTerm} 
              selectedGroups={selectedGroups} 
              selectedSprint={selectedSprint} // Pass selected sprint to the table
              sprintSearchTerm={secondSearchTerm} // Pass sprint search term to the table
            />
          ) : (<>
            <GroupList />
            
              </>
          )}
           {/* {showCard  && ( */}
              <DeleteTasksComponent
                showCard={showCard}
                selectedRows={selectedRows}
                sprintlist={selectedSprint}
                refetch={refetchSprints}
                setSelectedRows={setSelectedRows}
              />
            {/* )} */}
        </Grid>
      </Grid>
    </SprintManagementProvider>
  )
}

export default SprintManagementPage
