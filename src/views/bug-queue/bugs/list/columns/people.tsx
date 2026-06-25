import React, { useCallback, useEffect, useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Avatar,
  AvatarGroup,
  Box,
  Grid2 as Grid,Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
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
import type { AdditionalColumn } from '@/services/modules/bug-queue/types'
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
      
      // ** Map the API response to match your User type structure
      const mappedUsers = response.data.map((apiUser: any) => ({
        UserProjectID: apiUser.userID,
        User: {
          UserID: apiUser.userID,
          Name: apiUser.name,
          Email: apiUser.email.toLowerCase(),
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
      if (isSubTask) {
        const subRowData = rowData as AdditionalSubTaskListItem
        const response = await axios.post(
          `${BASE_URL}/RemoveSubTaskOwner?TaskID=${(rowData as any)?.taskID }&SubTaskID=${subRowData?.SubTaskID}`
        )
        
        if (response) {
          toast.success('Owner removed successfully')
          refetch()
          handleClose()
          setSelectedOwner(null)
        }
      } else {
        const response = await axios.post(
          `${BASE_URL}/RemoveTaskOwner?TaskID=${rowData?.TaskID?.toString()}`
        )
        
        if (response) {
          toast.success('Owner removed successfully')
          refetch()
          handleClose()
          setSelectedOwner(null)
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
        const response = await axios.post(
          `${BASE_URL}/InsertBugDynamicValues`,
          null,
          {
            params: {
              DynamicColumnID: columnData?.additionalColumnID,
              LoginuserID: user?.id,
              BugID: (rowData as any)?.BugID || '',
              GroupID: (rowData as any)?.groupID || '',
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
        const taskRowData = rowData as TaskListItemType
        const body = {
          Taskowner: selected?.UserID,
          Title: taskRowData?.Owner ? 'Task Owner Updated' : 'Task Owner Added!',
          PreviousState: taskRowData?.Owner?.Name || 'None',
          NewState: selected?.Name
        }

        const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

        if (response) {
          toast.success('Owner updated successfully')
          refetch()
          handleClose()
          setSelectedOwner(selected)
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
  const handleremove = async (item: any) => {

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

    try {
      const response = await axios
        .post(
          `${BASE_URL}/BugRemoveDynamicColumnUser?BugID=${(rowData as any)?.BugID || ''}&AdditionalColumnID=${
            columnData?.additionalColumnID}&LoginuserID=${user?.id
            
             }`
        )
        .then(res => {
          toast.success('User removed successfully')
          refetch()
          handleClose()
        })
    } catch (error) {
      console.error('Error removing user:', error)
      toast.error('Failed to remove user')
    }
  }

  // ** Combine context users with API users or use API users directly
  const users = apiUsers.length > 0 ? apiUsers : contextUsers || []

  // ** processedDynamicValue
  // Exact rowData shape: [{ colList, detailList, colvalueList: [...] }]
  // colvalueList has ONE entry PER USER with same additionalColumnID repeated per user
  // e.g. colvalueList[0] = { additionalColumnID:254, dynamicUserID:93, dynamicUserValueList:[{userID:93,...}] }
  //      colvalueList[1] = { additionalColumnID:254, dynamicUserID:94, dynamicUserValueList:[{userID:94,...}] }
  const processedDynamicValue = React.useMemo(() => {
    if (!dynamicValue || !columnData?.additionalColumnID) return []

    const flattenedUsers: any[] = []
    const seenUserIds = new Set()

    // Helper: add user deduped by UserID
    const addUserIfNotDuplicate = (userToAdd: any) => {
      if (!userToAdd?.User?.UserID) return
      const userId = userToAdd.User.UserID
      if (!seenUserIds.has(userId)) {
        seenUserIds.add(userId)
        flattenedUsers.push(userToAdd)
      }
    }

    // Helper: given a colvalueList array, extract all users for the target additionalColumnID
    // Each item in colvalueList = one user assignment (same additionalColumnID repeated per user)
    const processColvalueList = (colvalueList: any[]) => {
      if (!Array.isArray(colvalueList)) return

      // Filter ALL entries matching this column — one entry per assigned user
      const columnItems = colvalueList.filter(
        (item: any) => item.additionalColumnID === columnData.additionalColumnID
      )

      columnItems.forEach((item: any) => {
        // Primary path: dynamicUserValueList has full user details
        if (Array.isArray(item?.dynamicUserValueList) && item.dynamicUserValueList.length > 0) {
          // Check if displayText exists in the parent item or if we should show all users
          if (item?.displayText && item.displayText.trim() !== '') {
            item.dynamicUserValueList.forEach((userItem: any) => {
              // Check if username exists before adding
              if (userItem.username && userItem.username.trim() !== '') {
                addUserIfNotDuplicate({
                  User: {
                    UserID: userItem.userID,
                    Name: userItem.username,
                    Email: userItem.email?.toLowerCase() || '',
                    ProfilePicture: userItem.profilepicture || ''
                  }
                })
              }
            })
          } else {
            // Even if displayText doesn't exist, still show users if they have valid usernames
            item.dynamicUserValueList.forEach((userItem: any) => {
              // Only add if username exists and is not empty
              if (userItem.username && userItem.username.trim() !== '') {
                addUserIfNotDuplicate({
                  User: {
                    UserID: userItem.userID,
                    Name: userItem.username,
                    Email: userItem.email?.toLowerCase() || '',
                    ProfilePicture: userItem.profilepicture || ''
                  }
                })
              }
            })
          }
        }
        // Fallback path: use dynamicUserID to find in users list or use displayText
        else if (item?.dynamicUserID) {
          // Only add if displayText exists and is not empty
          if (item?.displayText && item.displayText.trim() !== '') {
            const foundUser = users.find((u: any) => u?.User?.UserID === item.dynamicUserID)
            if (foundUser) {
              addUserIfNotDuplicate({
                User: {
                  UserID: foundUser.User.UserID,
                  Name: foundUser.User.Name,
                  Email: foundUser.User.Email,
                  ProfilePicture: foundUser.User.ProfilePicture || ''
                }
              })
            } else {
              addUserIfNotDuplicate({
                User: {
                  UserID: item.dynamicUserID,
                  Name: item.displayText || `User ${item.dynamicUserID}`,
                  Email: '',
                  ProfilePicture: ''
                }
              })
            }
          }
        }
      })
    }

    // ── Shape A (YOUR EXACT SHAPE): Array of row wrapper objects ──────────────
    // dynamicValue = [{ colList:[...], detailList:[...], colvalueList:[...] }]
    // Check: is it an array whose first item has a colvalueList property?
    if (Array.isArray(dynamicValue)) {
      const firstItem = dynamicValue[0]

      // Shape A: items are row wrappers with colvalueList
      if (firstItem && 'colvalueList' in firstItem) {
        dynamicValue.forEach((rowItem: any) => {
          if (Array.isArray(rowItem?.colvalueList)) {
            processColvalueList(rowItem.colvalueList)
          }
        })
        return flattenedUsers
      }

      // Shape B: array items ARE colvalue entries directly
      // [{ additionalColumnID, dynamicUserValueList }, ...]
      if (firstItem && 'additionalColumnID' in firstItem) {
        processColvalueList(dynamicValue)
        return flattenedUsers
      }
    }

    // Shape C: single row wrapper object — { colList, detailList, colvalueList }
    if (dynamicValue && 'colvalueList' in dynamicValue && Array.isArray(dynamicValue.colvalueList)) {
      processColvalueList(dynamicValue.colvalueList)
      return flattenedUsers
    }

    // Shape D: single colvalue entry — { additionalColumnID, dynamicUserValueList }
    if (dynamicValue && 'additionalColumnID' in dynamicValue) {
      processColvalueList([dynamicValue])
      return flattenedUsers
    }

    return flattenedUsers
  }, [dynamicValue, users, columnData?.additionalColumnID])

  return (
    <Box display={'flex'} height={'100%'} width={'max-content'} alignItems={'center'}>
      {!!columnData?.additionalColumnID ? (
        <>
          <Box onClick={handleUserListOpen} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {processedDynamicValue?.length > 0 ? (
              <>
                {processedDynamicValue?.slice(0, 3).map((item: any, index: number) => (
                  <Box key={`avatar-${item?.User?.UserID || index}-${columnData?.additionalColumnID || ''}`} sx={{ position: 'relative', display: 'inline-block', mr: 0.5 }}>
                    <Tooltip title={item?.User?.Name?.toLowerCase() || item?.User?.Name}>
                      <Avatar alt={item?.User?.Name} src={item?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                    </Tooltip>

                    {/* Small close button */}
                    {canEdit && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleremove(item)
                        }}
                        style={{
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
                          padding: 0,
                          zIndex: 1
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </Box>
                ))}
                {processedDynamicValue?.length > 3 && (
                  <Tooltip title={`${processedDynamicValue.length - 3} more users`}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      +{processedDynamicValue.length - 3}
                    </Avatar>
                  </Tooltip>
                )}
              </>
            ) : (
              <></>
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
                  alignItems: 'center'
                }}
              >
                <Typography color='white' fontWeight={500}>
                  Assigned Users ({processedDynamicValue?.length})
                </Typography>
                <IconButton size='small' onClick={handleUserListClose} sx={{ color: 'white' }}>
                  <Icon icon='mdi:close' />
                </IconButton>
              </Box>
              <List sx={{ pt: 0 }}>
                {processedDynamicValue?.map((item: any, index: number) => (
                  <React.Fragment key={`list-item-${item?.User?.UserID || index}-${columnData?.additionalColumnID || ''}`}>
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
                          <Avatar alt={item?.User?.Name} src={item?.User?.ProfilePicture} sx={{ width: 40, height: 40 }} />
                          {/* Small close button on avatar */}
                          {canEdit && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleremove(item)
                              }}
                              style={{
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
                                padding: 0,
                                zIndex: 1
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant='body1' fontWeight={500}>
                            {item?.User?.Name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                            {item?.User?.Email?.toLowerCase()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < processedDynamicValue.length - 1 && <Divider variant='inset' component='li' />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Popover>

          {canEdit && (
            <IconButton onClick={handleOpen}>
              <Icon icon={'bi:plus-circle-dotted'} />
            </IconButton>
          )}
        </>
      ) : selectedOwner ? (
        <Box position={'relative'}>
          <AvatarGroup max={2}>
            <Tooltip key={`selected-${selectedOwner?.UserID}`} title={selectedOwner?.Email?.toLowerCase()}>
              <Avatar alt={selectedOwner?.Name} src={selectedOwner?.ProfilePicture} sx={{ width: 32, height: 32 }} />
            </Tooltip>
          </AvatarGroup>
          {role?.RoleName === 'Admin' && (
            <IconButton size='small' onClick={handleClear} sx={{ position: 'absolute', top: -11, right: -12 }}>
              <Icon icon={'icon-park-twotone:close-one'} color='red' />
            </IconButton>
          )}
        </Box>
      ) : role?.RoleName === 'Admin' ? (
        <IconButton onClick={handleOpen}>
          <Icon icon={'bi:plus-circle-dotted'} />
        </IconButton>
      ) : (
        <Icon icon={'ph:question-duotone'} fontSize={24} />
      )}
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose} TransitionComponent={Zoom}>
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
              ) : users?.length !== 0 ? (
                users
                  ?.filter(userFilter)
                  ?.filter(user => {
                    // For dynamic columns, filter out already assigned users
                    if (columnData?.additionalColumnID && processedDynamicValue) {
                      return !processedDynamicValue?.some((val: any) => val?.User?.UserID === user?.User?.UserID)
                    }
                    return true
                  })
                  ?.map((user, index) => (
                    <MenuItem
                      onClick={() => {
                        if (canEdit) {
                          debouncedClick(user?.User)
                        }
                      }}
                      key={`menu-item-${user?.UserProjectID || user?.User?.UserID || index}-${Date.now()}-${Math.random()}`}
                    >
                      <Box display={'flex'} alignItems={'center'} gap={3} py={1} overflow={'hidden'}>
                        <Avatar alt={user?.User?.Name} src={user?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                        <Typography overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                          {user?.User?.Name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
              ) : (
                <Box px={3} py={2}>
                  <Typography>No Users Added to Group</Typography>
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
