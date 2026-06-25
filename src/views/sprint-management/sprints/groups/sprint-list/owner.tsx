import React, { useCallback, useEffect, useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Avatar,
  AvatarGroup,
  Box,
  Grid2 as Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material'
import { debounce } from 'lodash'
import axios from 'axios'
import { useProject } from '@/context/project-context'
import type { ProjectUsers, User } from '@/services/modules/invite/types'
import type { AdditionalColumn } from '@/services/modules/project/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { updateTasks } from '@/services/modules/task'
import type { Owner, TaskListItemType } from '@/services/modules/task/types'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface TaskPeopleProps {
  rowData: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: any
  columnData?: AdditionalColumn
  canEdit?: boolean
}

const TaskPeople = ({
  rowData,
  isSubTask = false,
  refetch,
  dynamicValue,
  columnData,
  canEdit = false
}: TaskPeopleProps) => {
  // ** Hooks
  const { users: contextUsers, role } = useProject()
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(rowData?.Owner ?? null)
  const [searchText, setSearchText] = useState('')
  const { profile, user } = useAuth()
  
  // ** State for API users
  const [apiUsers, setApiUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // New state for user list popover
  const [userListAnchor, setUserListAnchor] = useState<HTMLElement | null>(null)

  // ** Fetch users from API
  const fetchUsers = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1
      const response = await axios.get(`${BASE_URL}/GetUserList?LoginuserID=${user.id}`)
      
      // ** Map the API response to match your User type structure with unique keys
      const mappedUsers = response.data.map((apiUser: any, index: number) => ({
        UserProjectID: apiUser.userID || `temp-${index}-${Date.now()}`,
        uniqueKey: `api-user-${apiUser.userID || `temp-${index}`}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        User: {
          UserID: apiUser.userID,
          Name: apiUser.name,
          Email: apiUser.email?.toLowerCase() || '',
          ProfilePicture: apiUser.profilepicture || ''
        }
      }))
      
      setApiUsers(mappedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // ** Fetch users when component mounts
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // New handlers for user list popover
  const handleUserListOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserListAnchor(event.currentTarget)
  }

  const handleUserListClose = () => {
    setUserListAnchor(null)
  }

  const userFilter = useCallback(
    (user: any) => {
      return user?.User?.Name?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
             user?.User?.Email?.toLowerCase()?.includes(searchText?.toLowerCase())
    },
    [searchText]
  )

  const handleClear = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

    try {
      if (columnData?.additionalColumnID) {
        // Handle dynamic column clear
        await axios.post(
          `${BASE_URL}/AssignDyamicUserTask`,
          null,
          {
            params: {
              TaskID: rowData?.TaskID?.toString(),
              LoginuserID: user?.id,
              UserID: selectedOwner?.UserID,
              IsRemove: true,
              AdditionalColumnID: columnData?.additionalColumnID
            }
          }
        )
        toast.success('Owner removed successfully')
        setSelectedOwner(null)
        refetch()
      } else {
        // Handle regular task clear
        const payload = {
          TaskID: rowData?.TaskID,
          Owner: null
        }
        const response = await updateTasks(payload as any)
        if (response) {
          toast.success('Owner removed successfully')
          setSelectedOwner(null)
          refetch()
        }
      }
    } catch (error) {
      console.error('Error removing owner:', error)
      toast.error('Failed to remove owner')
    }
  }
  
  const handleSelectUser = async (selected: any) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1
      
      if (columnData?.additionalColumnID) {
        // Handle dynamic column user assignment
        const response = await axios.post(
          `${BASE_URL}/InsertDynamicValues`,
          null,
          {
            params: {
              DynamicColumnID: columnData?.additionalColumnID,
              LoginuserID: user?.id,
              SprintID: (rowData as any)?.SprintID || '',
              SprintGroupID: (rowData as any)?.SprintGroupID || '',
              DynamicValue: selected?.UserID
            }
          }
        )
        
        if (response) {
          toast.success('User assigned successfully')
          refetch()
          handleClose()
        }
      } else {
        // Handle regular task owner assignment
        const payload = {
          TaskID: rowData?.TaskID,
          Owner: selected
        }
        const response = await updateTasks(payload as any)
        if (response) {
          setSelectedOwner(selected)
          toast.success('Owner assigned successfully')
          refetch()
          handleClose()
        }
      }
    } catch (error) {
      console.error('Error in handleSelectUser:', error)
      toast.error('Failed to assign user')
    }
  }

  const debouncedClick = debounce(handleSelectUser, 500)

  useEffect(() => {
    setSelectedOwner(rowData?.Owner)
  }, [rowData])

  // people remove
  const handleremove = async (item: any, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

    try {
      const response = await axios.post(
        `${BASE_URL}/AssignDyamicUserTask`,
        null,
        {
          params: {
            TaskID: rowData?.TaskID?.toString(),
            LoginuserID: user?.id,
            UserID: item?.User?.UserID || item?.UserID,
            IsRemove: true,
            AdditionalColumnID: columnData?.AdditionalColumnID
          }
        }
      )
      
      if (response.data) {
        toast.success('User removed successfully')
        refetch()
        if (userListAnchor) {
          handleUserListClose()
        }
      }
    } catch (error) {
      console.error('Error removing user:', error)
      toast.error('Failed to remove user')
    }
  }

  // Get the users to display - for dynamic columns use dynamicValue, for regular tasks use AssignedUsers
  const displayUsers = columnData?.additionalColumnID ? dynamicValue : (rowData as any)?.AssignedUsers || []

  // Helper function to generate unique keys for display users
  const getDisplayUserKey = (user: any, index: number, prefix: string = 'display') => {
    const userData = user?.User || user;
    const userId = userData?.UserID || userData?.id;
    // Create a truly unique key combining multiple identifiers
    return `${prefix}-${userId || `no-id-${index}`}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return (
    <Box display={'flex'} height={'100%'} width={'max-content'} alignItems={'center'}>
      {/* Display assigned users */}
      <Box onClick={handleUserListOpen} sx={{ cursor: 'pointer' }}>
        {displayUsers && displayUsers.length > 0 ? (
          <AvatarGroup max={2}>
            {displayUsers?.map((user: any, index: number) => {
              // Handle both data structures (with User nested or direct)
              const userData = user?.User || user;
              const userId = userData?.UserID || userData?.id;
              const userName = userData?.Name || userData?.name || 'Unknown';
              const userEmail = userData?.Email || userData?.email || '';
              const userProfilePic = userData?.ProfilePicture || userData?.profilePicture || '';
              
              return (
                <div 
                  key={getDisplayUserKey(user, index, 'avatar')}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  <Tooltip title={userEmail || userName}>
                    <Avatar 
                      alt={userName} 
                      src={userProfilePic} 
                      sx={{ width: 32, height: 32 }} 
                    />
                  </Tooltip>

                  {/* Small close button */}
                  {canEdit && (
                    <Box
                      component="span"
                      onClick={(e) => handleremove(user, e)}
                      sx={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        zIndex: 1,
                        '&:hover': {
                          backgroundColor: '#b71c1c'
                        }
                      }}
                    >
                      ✕
                    </Box>
                  )}
                </div>
              );
            })}
          </AvatarGroup>
        ) : (
          <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton onClick={handleOpen}>
              <Icon icon={'bi:plus-circle-dotted'} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Popover to show full user list */}
      <Popover
        open={Boolean(userListAnchor)}
        anchorEl={userListAnchor}
        onClose={handleUserListClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        TransitionComponent={Zoom}
      >
        <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}
          >
            <Typography variant='body1' fontWeight={500} color="white">
              Assigned Users ({displayUsers?.length || 0})
            </Typography>
            <IconButton 
              size='small' 
              onClick={handleUserListClose} 
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
          </Box>
          
          <List sx={{ pt: 0 }}>
            {displayUsers?.map((user: any, index: number) => {
              // Handle both data structures (with User nested or direct)
              const userData = user?.User || user;
              const userId = userData?.UserID || userData?.id;
              const userName = userData?.Name || userData?.name || 'Unknown User';
              const userEmail = userData?.Email || userData?.email || 'No email';
              const userProfilePic = userData?.ProfilePicture || userData?.profilePicture || '';
              
              return (
                <React.Fragment key={getDisplayUserKey(user, index, 'list')}>
                  <ListItem
                    sx={{
                      py: 2,
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar 
                          alt={userName} 
                          src={userProfilePic} 
                          sx={{ width: 40, height: 40 }} 
                        />
                        {/* Small close button on avatar */}
                        {canEdit && (
                          <Box
                            component="span"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleremove(user, e);
                            }}
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              zIndex: 1,
                              '&:hover': {
                                backgroundColor: '#b71c1c'
                              }
                            }}
                          >
                            ✕
                          </Box>
                        )}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='body1' fontWeight={500}>
                          {userName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                          {userEmail}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < displayUsers.length - 1 && <Divider variant='inset' component='li' />}
                </React.Fragment>
              );
            })}
            
            {(!displayUsers || displayUsers.length === 0) && (
              <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  No users assigned
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>

      {/* Add user button - Only show when canEdit is true and displayUsers has items? Actually let's check the logic */}
      {canEdit && displayUsers && displayUsers.length > 0 && (
        <IconButton 
          onClick={handleOpen}
          sx={{
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Icon icon={'bi:plus-circle-dotted'} fontSize={24} />
        </IconButton>
      )}
      
      {/* User selection menu */}
      <Menu 
        open={!!anchorEl} 
        anchorEl={anchorEl} 
        onClose={handleClose} 
        TransitionComponent={Zoom}
      >
        <Box width={280}>
          <Grid container spacing={4}>
            <Grid size={12}>
              <Box px={3}>
                <TextField
                  fullWidth
                  color='secondary'
                  value={searchText}
                  size='small'
                  autoComplete='off'
                  placeholder='Search User...'
                  onChange={e => setSearchText(e?.target?.value)}
                  InputProps={{ startAdornment: <Icon icon={'ion:search'} style={{ marginRight: 6 }} /> }}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              {loading ? (
                <Box px={3} py={2}>
                  <Typography>Loading users...</Typography>
                </Box>
              ) : apiUsers?.length !== 0 ? (
                apiUsers
                  ?.filter(userFilter)
                  ?.filter(user => {
                    // Filter out already assigned users
                    if (displayUsers && displayUsers.length > 0) {
                      return !displayUsers?.some((val: any) => {
                        const valUserId = val?.User?.UserID || val?.UserID;
                        const apiUserId = user?.User?.UserID;
                        return valUserId === apiUserId;
                      })
                    }
                    return true
                  })
                  ?.map((user, index) => {
                    // Generate a truly unique key using multiple fallbacks
                    const uniqueKey = `menu-${user.uniqueKey || user.User?.UserID || user.UserProjectID || `temp-${index}`}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    
                    return (
                      <MenuItem
                        onClick={() => {
                          if (canEdit) {
                            debouncedClick(user?.User)
                          }
                        }}
                        key={uniqueKey}
                      >
                        <Box display={'flex'} alignItems={'center'} gap={3} py={1} overflow={'hidden'}>
                          <Avatar 
                            alt={user?.User?.Name} 
                            src={user?.User?.ProfilePicture} 
                            sx={{ width: 32, height: 32 }} 
                          />
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                              {user?.User?.Name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                              {user?.User?.Email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    )
                  })
              ) : (
                <Box px={3} py={2}>
                  <Typography>No Users Found</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Menu>
    </Box>
  )
}

export default TaskPeople
