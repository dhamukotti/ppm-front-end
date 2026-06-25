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
  const { users, role } = useProject()
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(rowData?.Owner ?? null)
  const [searchText, setSearchText] = useState('')
  const { profile, user } = useAuth()
  
  // New state for user list popover
  const [userListAnchor, setUserListAnchor] = useState<HTMLElement | null>(null)

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
    (user: ProjectUsers) => {
      return user?.User?.Name?.toLowerCase()?.includes(searchText?.toLowerCase())
    },
    [searchText]
  )

  // const handleClear =async() => {
  //       const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

  //   const response = await axios  .post(`${BASE_URL}/RemoveTaskOwner?TaskID=${rowData?.TaskID?.toString()}`) .then(res => {
  //  refetch()
  //           handleClose()
  //         })
  //   setSelectedOwner(null)
  // }

  const handleClear = async () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

  try {
    if (isSubTask) {
      // For SubTask - use SubTaskID
      const subRowData = rowData as AdditionalSubTaskListItem
      const response = await axios.post(
        `${BASE_URL}/RemoveSubTaskOwner?TaskID=${rowData?.TaskID?.toString()}&SubTaskID=${subRowData?.SubTaskID}`
      )
      
      if (response) {
        refetch()
        handleClose()
        setSelectedOwner(null)
      }
    } else {
      // For Task - use TaskID
      const response = await axios.post(
        `${BASE_URL}/RemoveTaskOwner?TaskID=${rowData?.TaskID?.toString()}`
      )
      
      if (response) {
        refetch()
        handleClose()
        setSelectedOwner(null)
      }
    }
  } catch (error) {
    console.error('Error removing owner:', error)
  }
}
  const handleSelectUser = async (selected: User) => {
    let body: any = {}

    try {
      body = {
        DynamicID: dynamicValue?.DynamicID ?? null,
        AdditionalColumnID: columnData?.AdditionalColumnID,
        value: selected?.UserID,
        Title: `Column '${columnData?.ColumnName}' was updated`,
        PreviousState: `${dynamicValue?.length} users`,
        NewState: `${dynamicValue?.length + 1} users`
      }

      if (isSubTask) {
      
        const subRowData = rowData as AdditionalSubTaskListItem

        body.TaskID = subRowData?.TaskMasterID
        const response = await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })

        if (response) {
          refetch()
          handleClose()
        }
      } else {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

        const response = await axios
          .post(
            `${BASE_URL}/AssignDyamicUserTask?TaskID=${rowData?.TaskID?.toString()}&LoginuserID=${
              user?.id
            }&UserID=${selected?.UserID}&IsRemove=0&AdditionalColumnID=${columnData?.AdditionalColumnID}`
          )
          .then(res => {

            refetch()
            handleClose()
          })
      }
    } catch (error) {
      console.error('error :', error)
    }
  }

  const handleSelectOwner = async (selected: User) => {
    let body: any = {}

    try {
      if (isSubTask) {
        const subRowData = rowData as AdditionalSubTaskListItem

        body = {
          SubtaskOwner: selected?.UserID,
          Title: subRowData ? 'Task Owner Updated' : 'Task Owner Added!',
          PreviousState: subRowData?.Owner?.Name,
          NewState: selected?.Name
        }

        body.TaskID = subRowData?.TaskMasterID

        const response = await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })

        if (response) {
          refetch()
          handleClose()
        }
      } else {
        const taskRowData = rowData as TaskListItemType

        body = {
          Taskowner: selected?.UserID,
          Title: taskRowData ? 'Task Owner Updated' : 'Task Owner Added!',
          PreviousState: taskRowData?.Owner?.Name,
          NewState: selected?.Name
        }

        const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

        if (response) {
          refetch()
          handleClose()
        }
      }
    } catch (error) {
      console.log('error :', error)
    }
  }

  const debouncedClick = debounce(handleSelectUser, 500)
  const debouncedOwnerClick = debounce(handleSelectOwner, 500)

  useEffect(() => {
    setSelectedOwner(rowData?.Owner)
  }, [rowData])

  // people remove
  const handleremove = async (item: any) => {

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1

    const response = await axios
      .post(
        `${BASE_URL}/AssignDyamicUserTask?TaskID=${rowData?.TaskID?.toString()}&LoginuserID=${
          user?.id
        }&UserID=${item?.User?.UserID}&IsRemove=true&AdditionalColumnID=${columnData?.AdditionalColumnID}`
      )
      .then(res => {
        refetch()
        handleClose()
      })
  }

  return (
    <Box display={'flex'} height={'100%'} width={'max-content'} alignItems={'center'}>
      {!!columnData?.AdditionalColumnID ? (
        <>
          <Box onClick={handleUserListOpen} sx={{ cursor: 'pointer' }}>
            <AvatarGroup max={2}>
              {dynamicValue?.map((item: any) => (
                <div key={item?.DynamicID} style={{ position: 'relative', display: 'inline-block' }}>
                  <IconButton size='small' onClick={() => {}} sx={{ p: 0 }}>
                    <Tooltip title={item?.User?.Email?.toLowerCase()}>
                      <Avatar alt={item?.User?.Name} src={item?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                    </Tooltip>
                  </IconButton>

                  {/* Small close button */}
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
                </div>
              ))}
            </AvatarGroup>
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
                  Assigned Users ({dynamicValue?.length})
                </Typography>
                <IconButton size='small' onClick={handleUserListClose} sx={{ color: 'white' }}>
                  <Icon icon='mdi:close' />
                </IconButton>
              </Box>
              <List sx={{ pt: 0 }}>
                {dynamicValue?.map((item: any, index: number) => (
                  <React.Fragment key={item?.DynamicID}>
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
                    {index < dynamicValue.length - 1 && <Divider variant='inset' component='li' />}
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
            <Tooltip key={selectedOwner?.UserID} title={selectedOwner?.Email?.toLowerCase()}>
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
              {users?.length !== 0
                ? users
                    ?.filter(userFilter)
                    ?.filter(user => !dynamicValue?.some((val: any) => val?.User?.UserID === user?.User?.UserID))
                    ?.map(user => (
                      <MenuItem
                        onClick={() => {
                          if (!!dynamicValue || !!columnData) {
                            canEdit && debouncedClick(user?.User)
                          } else {
                            selectedOwner?.UserID !== user?.User?.UserID &&
                              role?.RoleName === 'Admin' &&
                              debouncedOwnerClick(user?.User)
                          }
                        }}
                        key={user?.UserProjectID}
                      >
                        <Box display={'flex'} alignItems={'center'} gap={3} py={1} overflow={'hidden'}>
                          <Avatar alt={user?.User?.Name} src={user?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                          <Typography overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                            {user?.User?.Name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                : 'No Users Added to Group'}
            </Grid>
          </Grid>
        </Box>
      </Menu>
    </Box>
  )
}

export default TaskPeople
