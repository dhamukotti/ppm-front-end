'use client'

import { useEffect, useRef, useState } from 'react'

import Grid from '@mui/material/Grid2'

import {
  Avatar,
  ClickAwayListener,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Box
} from '@mui/material'

import { Icon } from '@iconify/react'

import { useQuery } from '@tanstack/react-query'

import CustomButton from '@/components/button'
import { BugQueueProvider } from '@/context/bug-queue-context'
import { useWorkspace } from '@/context/workspace-context'
import BugQueueGroup, { BugQueueGroupRef } from './bugs/groups'
import NewBugQueue from './main-screen/add-button'
import ProjectFilterButton from './main-screen/filters'

// ── fetch bug groups ────────────────────────────────────────────────────────
const fetchBugGroupList = async (workspaceID: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL1}/GetBuggroupList?WorkspaceID=${workspaceID}`
  )
  if (!res.ok) throw new Error('Failed to fetch bug groups')
  return res.json() as Promise<{ bugGroupID: number; groupname: string }[]>
}
// ───────────────────────────────────────────────────────────────────────────

const BugQueueComponent = ({ workspaceID }: { workspaceID: string }) => {
  const { selected, setSelected, workspace } = useWorkspace()
  const bugQueueGroupRef = useRef<BugQueueGroupRef>(null)

  // ── search state ──────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<{ bugGroupID: number; groupname: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // ─────────────────────────────────────────────────────────────────────────

  const handleBugGroupCreated = () => {
    bugQueueGroupRef.current?.refetchGroups()
  }

  useEffect(() => {
    if (workspaceID && !selected) {
      const activeData = workspace?.find(value => value?.WorkspaceID?.toString() === workspaceID)
      if (activeData) setSelected(activeData)
    }
  }, [selected, setSelected, workspace, workspaceID])

  // ── fetch groups ──────────────────────────────────────────────────────────
  const { data: bugGroups = [] } = useQuery({
    queryKey: ['bug-group-list', workspaceID],
    queryFn: () => fetchBugGroupList(workspaceID),
    enabled: !!workspaceID
  })
  // ─────────────────────────────────────────────────────────────────────────

  // ── filtered list (excludes already-selected group) ───────────────────────
  const filteredGroups = bugGroups.filter(group => {
    const notSelected = selectedGroup ? group.bugGroupID !== selectedGroup.bugGroupID : true
    if (searchTerm.trim() === '') return notSelected
    return (
      notSelected &&
      (group.groupname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.bugGroupID?.toString().includes(searchTerm))
    )
  })
  // ─────────────────────────────────────────────────────────────────────────

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(true)
    // Clear selection if user edits the text
    if (selectedGroup && selectedGroup.groupname !== value) {
      setSelectedGroup(null)
    }
  }

  const handleGroupSelect = (group: { bugGroupID: number; groupname: string }) => {
    setSelectedGroup(group)
    setSearchTerm(group.groupname)
    setShowDropdown(false)
  }

  const handleClickAway = () => {
    setShowDropdown(false)
  }

  // Clear selected group (optional - you can add a clear button if needed)
  const handleClearGroupFilter = () => {
    setSelectedGroup(null)
    setSearchTerm('')
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <BugQueueProvider workspaceID={workspaceID}>
      <Grid container spacing={6}>
        <Grid size={12}>
          <div className='flex items-center justify-between'>
            <Typography fontWeight={700} fontSize={'1.75rem'}>
              {'Bug Queues'}
            </Typography>
          </div>
        </Grid>

        <Grid size={12}>
          <div className='flex items-center justify-between gap-5 flex-wrap-reverse'>
            {/* Search with group dropdown */}
            <div className='flex-1 min-w-[300px]'>
              <ClickAwayListener onClickAway={handleClickAway}>
                <div style={{ position: 'relative' }}>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    size='small'
                    placeholder='Search ID, Bug, Keywords or click to browse groups...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon icon={'ion:search'} style={{ color: '#666' }} fontSize={20} />
                        </InputAdornment>
                      ),
                      endAdornment: showDropdown ? (
                        <InputAdornment position='end'>
                          <Icon icon={'akar-icons:chevron-up'} style={{ color: '#666' }} fontSize={16} />
                        </InputAdornment>
                      ) : selectedGroup ? (
                        <InputAdornment position='end'>
                          <Icon 
                            icon={'mdi:close-circle'} 
                            style={{ color: '#666', cursor: 'pointer' }} 
                            fontSize={16}
                            onClick={handleClearGroupFilter}
                          />
                        </InputAdornment>
                      ) : null
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
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
                              key={`bug-group-${group.bugGroupID}-${index}`}
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
                                <Icon icon='ion:folder' style={{ fontSize: '18px' }} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={group.groupname}
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
                          <Icon
                            icon={'tabler:search-off'}
                            fontSize={32}
                            style={{ marginBottom: 8, opacity: 0.5 }}
                          />
                          <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
                            No groups found
                          </Typography>
                          <Typography variant='caption'>
                            {searchTerm ? 'Try adjusting your search terms' : 'No groups available'}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </div>
              </ClickAwayListener>
            </div>

            {/* Buttons — untouched */}
            <div className='flex items-center gap-5 flex-wrap justify-center'>
              {true && <NewBugQueue onBugGroupCreated={handleBugGroupCreated} />}
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
        </Grid>

        <Grid size={12}>
          {/* Pass the selected group ID to filter the bug queue */}
          <BugQueueGroup 
            ref={bugQueueGroupRef} 
            selectedGroupId={selectedGroup?.bugGroupID}
          />
        </Grid>
      </Grid>
    </BugQueueProvider>
  )
}

export default BugQueueComponent
