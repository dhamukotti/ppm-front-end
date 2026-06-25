'use client'

import { useMemo, memo, useContext, useEffect, useState, useRef } from 'react'
import {
  Avatar,
  Button,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Zoom,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Autocomplete
} from '@mui/material'
import CustomButton from '@/components/button'

import type { ColumnDef, TableMeta } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import IconifyIcon from '@/components/icon'
import { useBugQueue } from '@/context/bug-queue-context'
import type { BugQueueListAPI } from '@/services/modules/bug-queue/types'
import BugPriority from './columns/priority'
import TimeResolutionColumn from './columns/time-resolution'
import TaskStatus from '../list/columns/status'
import { useProject } from '@/context/project-context'
import { BugQueueContext } from 'src/context/bug-queue-context'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@iconify/react'
import { ColumnTextField } from '@/views/bug-queue/bugs/list/columns/default-column'
import CreateColumnMenu from './create-column'
import DynamicTableHeader from '../list/columns/header'
import BugDynamicCell from '../list/columns/dynamic/cell'

// ─── Reporter Selector Component (FIXED) ────────────────────────────────
const ReporterSelector = ({ 
  value, 
  onUpdate, 
  canEdit = true,
  allUsers = []
}: { 
  value: { UserID?: number; Name?: string; Email?: string; ProfilePicture?: string } | null;
  onUpdate: (reporter: { UserID: number; Name: string; Email: string; ProfilePicture?: string } | null) => Promise<void>;
  canEdit?: boolean;
  allUsers?: any[];
}) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [searchText, setSearchText] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchUsers = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL1}`
      const response = await axios.get(`${BASE_URL}/GetUserList?LoginuserID=${user.id}`)
      const uniqueUsersMap = new Map()
      response.data.forEach((apiUser: any) => {
        if (!uniqueUsersMap.has(apiUser.userID)) {
          uniqueUsersMap.set(apiUser.userID, {
            UserProjectID: apiUser.userID,
            User: {
              UserID: apiUser.userID,
              Name: apiUser.name,
              Email: apiUser.email?.toLowerCase() || '',
              ProfilePicture: apiUser.profilepicture || ''
            }
          })
        }
      })
      setUsers(Array.from(uniqueUsersMap.values()))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [user?.id])

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }
  
  const handleClose = () => { 
    setAnchorEl(null)
    setSearchText('')
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onUpdate(null)
    handleClose()
  }

  const handleSelectUser = async (selected: any) => {
    if (!selected?.User) return
    
    await onUpdate({
      UserID: selected.User.UserID,
      Name: selected.User.Name,
      Email: selected.User.Email,
      ProfilePicture: selected.User.ProfilePicture
    })
    handleClose()
  }

  // FIX 1: Removed the `isNotCurrentUser` filter — it was hiding the current
  // reporter (and all users on small teams) from the dropdown list entirely.
  // FIX 2: Moved search filter inline into useMemo to avoid a stale-closure
  // where `searchText` updates did not trigger re-filtering.
  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return users
    const lower = searchText.toLowerCase()
    return users.filter(userItem =>
      userItem?.User?.Name?.toLowerCase()?.includes(lower) ||
      userItem?.User?.Email?.toLowerCase()?.includes(lower)
    )
  }, [users, searchText])

  const resolvedValue = useMemo(() => {
    if (!value?.UserID) return null
    
    // Try to find the user in allUsers first for complete data
    const matched = allUsers.find((u: any) => {
      if (u?.User?.UserID === value.UserID) return true
      if (u?.userID === value.UserID) return true
      if (u?.UserID === value.UserID) return true
      return false
    })
    
    if (matched) {
      if (matched.User) {
        return {
          UserID: matched.User.UserID,
          Name: matched.User.Name || value.Name || '',
          Email: matched.User.Email || value.Email || '',
          ProfilePicture: matched.User.ProfilePicture || value.ProfilePicture || ''
        }
      } else {
        return {
          UserID: matched.userID || matched.UserID,
          Name: matched.name || matched.Name || value.Name || '',
          Email: matched.email || matched.Email || value.Email || '',
          ProfilePicture: matched.profilepicture || matched.ProfilePicture || value.ProfilePicture || ''
        }
      }
    }
    
    // If we have at least name or email, return the value
    if (value.Name || value.Email) {
      return {
        UserID: value.UserID,
        Name: value.Name || '',
        Email: value.Email || '',
        ProfilePicture: value.ProfilePicture || ''
      }
    }
    
    return null
  }, [value, allUsers])

  const tooltipLabel = resolvedValue
    ? [resolvedValue.Name, resolvedValue.Email ? `(${resolvedValue.Email})` : ''].filter(Boolean).join(' ') || 'No name'
    : 'No reporter assigned'

  if (!canEdit) {
    return (
      <Box display={'flex'} alignItems={'center'}>
        {resolvedValue ? (
          <Tooltip title={tooltipLabel}>
            <Avatar alt={resolvedValue.Name || ''} src={resolvedValue.ProfilePicture} sx={{ width: 32, height: 32 }} />
          </Tooltip>
        ) : (
          <Tooltip title="No reporter assigned">
            <Icon icon={'ph:question-duotone'} fontSize={24} />
          </Tooltip>
        )}
      </Box>
    )
  }

  return (
    <Box display={'flex'} alignItems={'center'}>
      {resolvedValue ? (
        <Box position={'relative'}>
          <Tooltip title={tooltipLabel}>
            <IconButton onClick={handleOpen} sx={{ p: 0 }}>
              <Avatar alt={resolvedValue.Name || ''} src={resolvedValue.ProfilePicture} sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Tooltip>
          <IconButton
            size='small'
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: -11,
              right: -12,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f5f5f5' },
              boxShadow: 1,
              width: 20,
              height: 20,
              p: 0
            }}
          >
            <Icon icon={'icon-park-twotone:close-one'} width={16} height={16} color='red' />
          </IconButton>
        </Box>
      ) : (
        <Tooltip title="Click to assign reporter">
          <IconButton onClick={handleOpen}>
            <Icon icon={'bi:plus-circle-dotted'} />
          </IconButton>
        </Tooltip>
      )}

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        TransitionComponent={Zoom}
        PaperProps={{ sx: { maxHeight: 400, width: 280 } }}
      >
        <Box>
          <Box px={2} pt={1}>
            <TextField
              fullWidth
              color='secondary'
              value={searchText}
              size='small'
              autoComplete='off'
              placeholder='Search User...'
              onChange={e => setSearchText(e?.target?.value)}
              InputProps={{
                startAdornment: <Icon icon={'ion:search'} style={{ marginRight: 6 }} />,
                sx: { fontSize: '0.875rem' }
              }}
            />
          </Box>
          <Box sx={{ maxHeight: 320, overflowY: 'auto', mt: 1 }}>
            {loading ? (
              <Box px={3} py={2} display={'flex'} justifyContent={'center'}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredUsers?.length !== 0 ? (
              filteredUsers.map((userItem, index) => {
                const uniqueKey = `reporter-${userItem?.User?.UserID || userItem?.UserProjectID}-${index}`
                // FIX 3: Highlight the currently selected reporter instead of hiding them
                const isCurrentReporter = userItem?.User?.UserID === value?.UserID
                return (
                  <MenuItem
                    onClick={() => handleSelectUser(userItem)}
                    key={uniqueKey}
                    sx={{ py: 1, backgroundColor: isCurrentReporter ? 'action.selected' : undefined }}
                  >
                    <Box display={'flex'} alignItems={'center'} gap={2} overflow={'hidden'}>
                      <Avatar alt={userItem?.User?.Name} src={userItem?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                      <Box overflow={'hidden'}>
                        <Typography variant='body2' fontWeight={500} overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                          {userItem?.User?.Name}
                          {isCurrentReporter && (
                            <Typography component='span' variant='caption' color='text.secondary' ml={1}>(current)</Typography>
                          )}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                          {userItem?.User?.Email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                )
              })
            ) : (
              <Box px={3} py={2}>
                <Typography variant='body2' color='text.secondary' textAlign={'center'}>
                  {searchText ? 'No users found' : 'No users available'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Menu>
    </Box>
  )
}

// ─── Sprint Task Selector Dialog Component ────────────────────────────────
const SprintTaskSelectorDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  workspaceID,
  bugGroupID,
  userID,
  existingSprintTasks = []
}: any) => {
  const [sprintTasks, setSprintTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSprintTask, setSelectedSprintTask] = useState<any>(null)
  const [searchText, setSearchText] = useState('')

  const fetchSprintTasks = async () => {
    if (!workspaceID) return
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskGroupInfoList`, {
        params: { WorkspaceID: workspaceID }
      })
      
      // Filter out already used sprint tasks
      const availableTasks = response.data.filter((task: any) => 
        !existingSprintTasks.some((existing: any) => existing.sprintTaskID === task.taskGroupID)
      )
      
      setSprintTasks(availableTasks)
    } catch (error) {
      console.error('Error fetching sprint tasks:', error)
      toast.error('Failed to load sprint tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && workspaceID) {
      fetchSprintTasks()
      setSelectedSprintTask(null)
      setSearchText('')
    }
  }, [open, workspaceID])

  const filteredSprintTasks = useMemo(() => {
    if (!searchText) return sprintTasks
    return sprintTasks.filter(task => 
      task.groupname?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.sprintname?.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [sprintTasks, searchText])

  const handleConfirm = async () => {
    if (!selectedSprintTask) {
      toast.error('Please select a sprint task')
      return
    }

    // selectedSprintTask comes from GetSprintTaskGroupInfoList — its PK is taskGroupID
    // This is the value that must be passed as SprintTaskID everywhere
    const sprintTaskID = selectedSprintTask.taskGroupID

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/CreateBugQueue`, null, {
        params: {
          WorkspaceID: workspaceID,
          SprintTaskID: sprintTaskID,
          bugname: 'New Bug',
          BuggroupID: bugGroupID,
          LoginuserID: userID
        }
      })
      toast.success('Bug created successfully!')
      // Pass back the full row + the resolved sprintTaskID explicitly
      onConfirm({ ...selectedSprintTask, resolvedSprintTaskID: sprintTaskID })
      onClose()
    } catch (error) {
      toast.error('Failed to create bug. Please try again.')
      console.error('Error creating bug:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Sprint Task</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            placeholder="Search sprint tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Icon icon={'ion:search'} style={{ marginRight: 8 }} />
            }}
          />
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : filteredSprintTasks.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={3}>
              {searchText ? 'No matching sprint tasks found' : 'No available sprint tasks'}
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredSprintTasks.map((task) => (
                <MenuItem
                  key={task.taskGroupID}
                  selected={selectedSprintTask?.taskGroupID === task.taskGroupID}
                  onClick={() => setSelectedSprintTask(task)}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {task.groupname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sprint: {task.sprintname}
                  </Typography>
                  {task.sprintGoals && (
                    <Typography variant="caption" color="text.secondary">
                      Goals: {task.sprintGoals}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!selectedSprintTask || loading}
        >
          Create Bug
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Define Props Interface ────────────────────────────────────────────────
interface BugGroupTableProps {
  groupData: any[];
  dynamicColumns: any[];
  colValueList: any[];
  selectedRows: any;
  setSelectedRows: any;
  workspaceID: any;
  bugGroupID: any;
  sprintColumnVisibility: any;
  user: any;
  refetch: any;
  refetchProject: any;
  users: any[];
  fetchBugList: any;
  existingSprintTasks: any[];
}

interface BugListProps {
  selectedRows: any;
  setSelectedRows: any;
  workspaceID: any;
  bugGroupID: any;
}

// ─── BugGroupTable — renders ONE group's table ────────────────────────────
const BugGroupTable = ({
  groupData,
  dynamicColumns,
  colValueList,
  selectedRows,
  setSelectedRows,
  workspaceID,
  bugGroupID,
  sprintColumnVisibility,
  user,
  refetch,
  refetchProject,
  users,
  fetchBugList,
  existingSprintTasks,
}: BugGroupTableProps) => {
  const [adding, setAdding] = useState(false)
  const [addColumnAnchor, setAddColumnAnchor] = useState<any>(null)
  const [showSprintSelector, setShowSprintSelector] = useState(false)

  // useRef stores the sprintTaskID chosen from the dialog so it is always
  // available inside handler closures without stale-closure issues.
  // It is seeded on mount/groupData change from existing bugs in this group.
  const selectedSprintTaskIDRef = useRef<number>(0)

  useEffect(() => {
    if (groupData && groupData.length > 0) {
      const firstWithSprint = groupData.find(
        (bug: any) => (bug.SprintTaskID && bug.SprintTaskID !== 0) || (bug.sprintTaskID && bug.sprintTaskID !== 0)
      )
      if (firstWithSprint) {
        const id = firstWithSprint.SprintTaskID || firstWithSprint.sprintTaskID
        if (id && id !== 0) {
          selectedSprintTaskIDRef.current = id
        }
      }
    }
  }, [groupData])

  // Resolve SprintTaskID for a bug: use the bug's own value first,
  // then fall back to whatever was last selected in the dialog for this group.
  const resolveSprintTaskID = (bug: any): number => {
    const fromBug = bug?.SprintTaskID || bug?.sprintTaskID || 0
    if (fromBug && fromBug !== 0) return fromBug
    return selectedSprintTaskIDRef.current || 0
  }

  // ── All handlers — only SprinttaskID uses resolveSprintTaskID now ─────────

  const handleUpdateBugName = async (bugId: string | number, updatedBugName: string) => {
    try {
      const currentBug = groupData.find((bug: any) => bug.BugID === bugId)
      
      if (!currentBug) return
      if (currentBug.BugName === updatedBugName) return
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/UpdateBugQueue`, null, {
        params: {
          BugID: bugId,
          bugname: updatedBugName,
          description: currentBug?.BugDescription || 'New Bug',
          reportby: currentBug?.createdBy?.UserID || currentBug?.reporterID || 0,
          timeresolution: currentBug?.timeResolution || '',
          priorityID: currentBug?.PriorityID || 0,
          istimerstart: currentBug?.isTimerStart || false,
          statusID: currentBug?.StatusID || 0,
          LoginuserID: user?.id,
          SprinttaskID: resolveSprintTaskID(currentBug)
        }
      })
      toast.success('Bug name updated successfully')
      await fetchBugList()
      if (refetch) refetch()
    } catch (error) {
      console.error('Error updating bug name:', error)
      toast.error('Failed to update bug name')
    }
  }

  const handleUpdateBugDescription = async (bugId: string | number, updatedDescription: string) => {
    try {
      const currentBug = groupData.find((bug: any) => bug.BugID === bugId)
      if (!currentBug) return
      if (currentBug.BugDescription === updatedDescription) return
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/UpdateBugQueue`, null, {
        params: {
          BugID: bugId,
          bugname: currentBug?.BugName || '',
          description: updatedDescription || 'New Bug',
          reportby: currentBug?.createdBy?.UserID || currentBug?.reporterID || 0,
          timeresolution: currentBug?.timeResolution || '',
          priorityID: currentBug?.PriorityID || 0,
          istimerstart: currentBug?.isTimerStart || false,
          statusID: currentBug?.StatusID || 0,
          LoginuserID: user?.id,
          SprinttaskID: resolveSprintTaskID(currentBug)
        }
      })
      toast.success('Bug description updated successfully')
      await fetchBugList()
      if (refetch) refetch()
    } catch (error) {
      console.error('Error updating bug description:', error)
      toast.error('Failed to update bug description')
    }
  }

  const handlePriorityUpdate = async (bugId: string | number, newPriorityId: number) => {
    try {
      const currentBug = groupData.find((bug: any) => bug.BugID === bugId)
      if (!currentBug) return
      if (currentBug.PriorityID === newPriorityId) return
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/UpdateBugQueue`, null, {
        params: {
          BugID: bugId,
          bugname: currentBug?.BugName || '',
          description: currentBug?.BugDescription || 'New Bug',
          reportby: currentBug?.createdBy?.UserID || currentBug?.reporterID || 0,
          timeresolution: currentBug?.timeResolution || '',
          priorityID: newPriorityId,
          istimerstart: currentBug?.isTimerStart || false,
          statusID: currentBug?.StatusID || 0,
          LoginuserID: user?.id,
          SprinttaskID: resolveSprintTaskID(currentBug)
        }
      })
      toast.success('Priority updated successfully')
      await fetchBugList()
      if (refetch) refetch()
    } catch (error) {
      console.error('Error updating priority:', error)
      toast.error('Failed to update priority')
    }
  }

  // FIXED: Handle reporter update - now expects reporter object or null
  const handleUpdateReporter = async (bugId: string | number, reporter: { UserID: number; Name: string; Email: string; ProfilePicture?: string } | null) => {
    try {
      const currentBug = groupData.find((bug: any) => bug.bugID == bugId)
     
      // if (!currentBug) return
      
      const reporterId = reporter ? reporter.UserID : 0
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/UpdateBugQueue`, null, {
        params: {
          BugID: bugId,
          bugname: currentBug?.BugName || '',
          description: currentBug?.BugDescription || 'New Bug',
          reportby: reporterId,
          timeresolution: currentBug?.timeResolution || '',
          priorityID: currentBug?.PriorityID || 0,
          istimerstart: currentBug?.isTimerStart || false,
          statusID: currentBug?.StatusID || 0,
          LoginuserID: user?.id,
          SprinttaskID: resolveSprintTaskID(currentBug)
        }
      })
      toast.success(reporter ? 'Reporter assigned successfully' : 'Reporter removed successfully')
      await fetchBugList()
      if (refetch) refetch()
    } catch (error) {
      console.error('Error updating reporter:', error)
      toast.error('Failed to update reporter')
    }
  }

  const handleUpdateStatus = async (bugId: string | number, newStatusId: number) => {
    try {
      const currentBug = groupData.find((bug: any) => bug.BugID === bugId)
      if (!currentBug) return
      if (currentBug.StatusID === newStatusId) return
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/UpdateBugQueue`, null, {
        params: {
          BugID: bugId,
          bugname: currentBug?.BugName || '',
          description: currentBug?.BugDescription || 'New Bug',
          reportby: currentBug?.createdBy?.UserID || currentBug?.reporterID || 0,
          timeresolution: currentBug?.timeResolution || '',
          priorityID: currentBug?.PriorityID || 0,
          istimerstart: currentBug?.isTimerStart || false,
          statusID: newStatusId || 0,
          LoginuserID: user?.id,
          SprinttaskID: resolveSprintTaskID(currentBug)
        }
      })
      toast.success('Status updated successfully')
      await fetchBugList()
      if (refetch) refetch()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getDynamicValueForBug = (bugId: number, columnId: string) => {
    if (!colValueList || colValueList.length === 0) return null
    return (
      colValueList.find(
        (item: any) =>
          item?.bugID?.toString() === bugId?.toString() &&
          item?.additionalColumnID?.toString() === columnId?.toString()
      ) || null
    )
  }

  // ── Static columns (identical to original) ───────────────────────────────
  const staticColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'select',
        accessorKey: 'select',
        size: 20,
        maxSize: 20,
        header: ({ table }) => (
          <div className='flex px-1 w-11'>
            <Checkbox
              checked={!!table?.getIsAllRowsSelected?.()}
              indeterminate={!!table?.getIsSomeRowsSelected?.()}
              onChange={table?.getToggleAllRowsSelectedHandler?.()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className='flex px-1 !w-11'>
            {row.getCanExpand() ? (
              <IconButton size='small' {...{ onClick: row.getToggleExpandedHandler(), style: { cursor: 'pointer' } }}>
                {row.getIsExpanded()
                  ? <IconifyIcon icon={'line-md:chevron-down'} />
                  : <IconifyIcon icon={'line-md:chevron-right'} />}
              </IconButton>
            ) : null}
            <Checkbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler()
              }}
            />
          </div>
        )
      },
      {
        id: 'BugName',
        accessorKey: 'BugName',
        size: 200,
        maxSize: 300,
        header: () => <Typography variant='body2' fontWeight={800}>Bug Name</Typography>,
        cell: ({ getValue, row: { original, index }, column: { id }, table }) => {
          const value = getValue() as string
          return (
            <ColumnTextField
              canEdit={true}
        getValue= {() => (value || "") as any  }          
          index={index}
              id={id}
              table={table}
            />
          )
        }
      },
      {
        id: 'BugDescription',
        accessorKey: 'BugDescription',
        size: 250,
        maxSize: 400,
        header: () => <Typography variant='body2' fontWeight={800}>Bug Details</Typography>,
        cell: ({ getValue, row: { original, index }, column: { id }, table }) => {
          const value = getValue() as string
          const bugId = original?.BugID
          const handleDescriptionUpdate = async (newValue: string) => {
            if (bugId && newValue !== original?.BugDescription) {
              await handleUpdateBugDescription(bugId, newValue)
            }
          }
          return (
            <ColumnTextField
              canEdit={true}
              // getValue={() => value || ''}
                      getValue= {() => (value || "") as any  }          

              index={index}
              id={id}
              table={table}
              onUpdate={handleDescriptionUpdate}
            />
          )
        }
      },
      {
        id: 'Reporter',
        accessorKey: 'createdBy',
        size: 120,
        maxSize: 150,
        header: () => <Typography variant='body2' fontWeight={800}>Reporter</Typography>,
        cell: ({ row: { original } }) => {
          const reporter = original?.createdBy || null
          // FIXED: Pass the correct handler that expects reporter object
          const handleReporterUpdate = async (
            newReporter: { UserID: number; Name: string; Email: string; ProfilePicture?: string } | null
          ) => {
            const bugId = original?.BugID?.toString()
            if (!bugId) return
         
            await handleUpdateReporter(bugId, newReporter)
          }
          return (
            <ReporterSelector
              value={reporter}
              onUpdate={handleReporterUpdate}
              canEdit={true}
              allUsers={users || []}
            />
          )
        }
      },
      {
        id: 'TimeResolution',
        accessorKey: 'timeResolution',
        size: 180,
        maxSize: 200,
        header: () => <Typography variant='body2' fontWeight={800}>Time until resolution</Typography>,
        cell: ({ row: { original } }) => (
          // <TimeResolutionColumn bug={original} refetch={fetchBugList} workspaceID={workspaceID} userID={user?.id} />
                    <TimeResolutionColumn bug={original} refetch={fetchBugList} />
        )
      },
      {
        id: 'Priority',
        accessorFn: row => row.PriorityID,
        size: 120,
        maxSize: 150,
        header: () => <Typography variant='body2' fontWeight={800}>Priority</Typography>,
        cell: ({ row: { original: row } }) => (
          <BugPriority
            row={row}
            refetch={fetchBugList}
            canEdit={true}
            workspaceID={workspaceID}
            onPriorityChange={handlePriorityUpdate}
          />
        )
      },
      {
        id: 'Status',
        accessorKey: 'StatusID',
        size: 120,
        maxSize: 150,
        header: () => <Typography variant='body2' fontWeight={800}>Status</Typography>,
        cell: ({ row: { original } }) => (
          <TaskStatus
            // row={original}
            // refetch={refetch}
            // canEdit={true}
            // workspaceID={workspaceID}
            // onStatusChange={handleUpdateStatus}
          />
        )
      }
    ],
    [fetchBugList, workspaceID, user?.id, refetch, groupData, handleUpdateBugDescription, handlePriorityUpdate, handleUpdateReporter, handleUpdateStatus, users]
  )

  // ── Dynamic columns (FIXED: passing row data to header) ──────────────────────────────
  const dynamicColumnDefs = useMemo((): ColumnDef<any>[] => {
    if (!dynamicColumns || dynamicColumns.length === 0) return []
    return dynamicColumns.map((column: any, index: number) => {
      const columnId = column?.additionalColumnID?.toString() || `dynamic-${index}`
      return {
        id: columnId,
        accessorKey: columnId,
        size: 200,
        maxSize: 300,
        header: () => {
          // Prepare all bugs data to pass to header
          const allBugsData = (groupData || []).map((bug: any) => ({
            bugId: bug?.BugID,
            bugName: bug?.BugName,
            currentValue: getDynamicValueForBug(bug?.BugID, columnId)
          }))
          
          return (
            <DynamicTableHeader
              column={column}
              refetch={() => {
                fetchBugList()
                if (refetchProject) refetchProject()
              }}
              groupData={groupData}
              allBugsData={allBugsData}
              colValueList={colValueList}
              columnId={columnId}
            />
          )
        },
        cell: ({ row: { original } }: any) => {
          const dynamicValue = getDynamicValueForBug(original?.BugID, columnId)
          return (
            <BugDynamicCell
              // getValue={() => null}
getValue={() => null as any}
              columnItem={column}
              index={0}
              row={original}
              id={columnId}
              table={null}
              value={dynamicValue}
              refetch={() => { fetchBugList() }}
            />
          )
        }
      }
    })
  }, [dynamicColumns, colValueList, fetchBugList, refetchProject, groupData])

  const allColumns = useMemo(() => [...staticColumns, ...dynamicColumnDefs], [staticColumns, dynamicColumnDefs])

  const visibleColumns = useMemo(() => {
    return allColumns.filter(column => {
      const columnId = column.id as string
      if (columnId === 'select') return true
      return sprintColumnVisibility[columnId] !== false
    })
  }, [allColumns, sprintColumnVisibility])

  
  // const table = useReactTable({
  //   data: groupData,
  //   columns: visibleColumns,
  //   state: { rowSelection: selectedRows },
  //   enableRowSelection: true,
  //   getCoreRowModel: getCoreRowModel(),
  //   onRowSelectionChange: setSelectedRows,
  //   getPaginationRowModel: getPaginationRowModel(),
  //   meta: {
  //     updateData: async (rowIndex: number, columnId: string, value: unknown) => {
  //       const stringValue = typeof value === 'string' ? value : String(value ?? '')

  //       if (columnId === 'BugName' && groupData[rowIndex]?.BugID) {
  //         const currentBug = groupData[rowIndex]
  //         if (currentBug?.BugName !== stringValue) await handleUpdateBugName(currentBug?.BugID, stringValue)
  //       }
  //       if (columnId === 'BugDescription' && groupData[rowIndex]?.BugID) {
  //         const currentBug = groupData[rowIndex]
  //         if (currentBug?.BugDescription !== stringValue) await handleUpdateBugDescription(currentBug?.BugID, stringValue)
  //       }
  //     }
  //   } as TableMeta<any>
  // })

  // ── Add Bug with Sprint Selection ─────────────────────────────────────────
  // ── Table instance ─────────────────────────────────────────────────────
const table = useReactTable({
  data: groupData,
  columns: visibleColumns,
  state: { rowSelection: selectedRows },
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel(),
  onRowSelectionChange: setSelectedRows,
  getPaginationRowModel: getPaginationRowModel(),
  meta: {
    updateData: async (rowIndex: number, columnId: string, value: unknown) => {
      const stringValue = typeof value === 'string' ? value : String(value ?? '')

      if (columnId === 'BugName' && groupData[rowIndex]?.BugID) {
        const currentBug = groupData[rowIndex]
        if (currentBug?.BugName !== stringValue) {
          await handleUpdateBugName(currentBug?.BugID, stringValue)
        }
      }
      if (columnId === 'BugDescription' && groupData[rowIndex]?.BugID) {
        const currentBug = groupData[rowIndex]
        if (currentBug?.BugDescription !== stringValue) {
          await handleUpdateBugDescription(currentBug?.BugID, stringValue)
        }
      }
    }
  } as TableMeta<any>
})
  const handleBugCreate = () => {
    setShowSprintSelector(true)
  }

  const handleSprintConfirm = async (selectedSprintTask: any) => {
    // Store the chosen taskGroupID in the ref immediately so every
    // UpdateBugQueue call after this point uses the correct SprintTaskID
    const resolvedID = selectedSprintTask?.resolvedSprintTaskID || selectedSprintTask?.taskGroupID || 0
    if (resolvedID && resolvedID !== 0) {
      selectedSprintTaskIDRef.current = resolvedID
    }
    setAdding(false)
    await fetchBugList()
    if (refetch) refetch()
  }

  // ── Render (identical to original) ───────────────────────────────────────
  return (
    <div>
      <TableContainer>
        <Table className='min-w-[700px]'>
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    colSpan={header.colSpan}
                    sx={{ fontWeight: 600, pb: 2, textTransform: 'uppercase' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row?.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length}>
                  <div className='flex items-center justify-center h-20 w-full'>
                    <Typography>No Tasks Added</Typography>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className='flex justify-between items-center gap-2 m-2'>
        <Button startIcon={<i className='ri-add-line' />} onClick={handleBugCreate}>
          {adding ? 'Adding...' : 'Add Bug'}
        </Button>
        <CustomButton
          variant='outlined'
          circular
          size='small'
          color='secondary'
          startIcon={<i className='ri-add-line' />}
          onClick={e => setAddColumnAnchor(e?.currentTarget)}
        >
          Add New Column
        </CustomButton>
      </div>
      <CreateColumnMenu
        anchorEl={addColumnAnchor}
        refetch={refetchProject}
        setAnchorEl={setAddColumnAnchor}
        taskGroupAllData={{
          taskGroupID: bugGroupID,
          taskID: undefined
        }}
        isSubTask={false}
      />
      <SprintTaskSelectorDialog
        open={showSprintSelector}
        onClose={() => {
          setShowSprintSelector(false)
          setAdding(false)
        }}
        onConfirm={handleSprintConfirm}
        workspaceID={workspaceID}
        bugGroupID={bugGroupID}
        userID={user?.id}
        existingSprintTasks={existingSprintTasks}
      />
    </div>
  )
}

// ─── BugList — fetches ALL groups, renders one BugGroupTable per group ───────
const BugList = ({ selectedRows, setSelectedRows, workspaceID, bugGroupID }: BugListProps) => {
  const { data, refetch } = useBugQueue()
  const { columnVisibility: sprintColumnVisibility } = useContext(BugQueueContext)
  const { user } = useAuth()
  const { project, columnVisibility, role, refetchProject, users } = useProject()

  const [allGroups, setAllGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [allSprintTasks, setAllSprintTasks] = useState<any[]>([])

  // ── Fetch: API returns an array of groups ────────────────────────────────
  const fetchBugList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetBugInfoList`, {
        params: { GroupID: bugGroupID }
      })

      // API returns [ { colList, detailList, colvalueList }, ... ]
      const groups = Array.isArray(response.data) ? response.data : [response.data]
      setAllGroups(groups)
      
      // Extract all used sprint task IDs from the bugs
      const usedSprintTaskIds = new Set()
      groups.forEach((group: any) => {
        if (group.detailList && Array.isArray(group.detailList)) {
          group.detailList.forEach((bug: any) => {
            if (bug.sprintTaskID) {
              usedSprintTaskIds.add(bug.sprintTaskID)
            }
          })
        }
      })
      
      // Fetch all available sprint tasks
      const sprintTasksResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskGroupInfoList`, {
        params: { WorkspaceID: workspaceID }
      })
      
      // Mark which tasks are already used
      const tasksWithStatus = sprintTasksResponse.data.map((task: any) => ({
        ...task,
        sprintTaskID: task.taskGroupID,
        isUsed: usedSprintTaskIds.has(task.taskGroupID)
      }))
      
      setAllSprintTasks(tasksWithStatus)
    } catch (error) {
      console.error('Error fetching bug list:', error)
      toast.error('Failed to fetch bug list')
      setAllGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBugList() }, [workspaceID, bugGroupID])

  useEffect(() => {
    const handleColumnCreated = () => { fetchBugList() }
    window.addEventListener('columnCreated', handleColumnCreated)
    return () => { window.removeEventListener('columnCreated', handleColumnCreated) }
  }, [workspaceID, bugGroupID])

  // ── Transform detailList rows ─────────────────────────────────────────────
  const transformBugList = (bugList: any[]) => {
    return bugList.map((bug: any) => {
      let reporterInfo = null
      
      // FIXED: Better handling of reporter data from API
      if (bug.reporterID && bug.reporterID !== 0) {
        if (bug.reporterinfo && typeof bug.reporterinfo === 'string') {
          const parts = bug.reporterinfo.split(';')
          if (parts.length >= 2) {
            reporterInfo = {
              UserID: parseInt(parts[0]) || bug.reporterID,
              Name: parts[1] || '',
              Email: (parts[2] || '').toLowerCase(),
              ProfilePicture: parts[3] || ''
            }
          } else {
            // Fallback: just use the ID
            reporterInfo = {
              UserID: bug.reporterID,
              Name: `User ${bug.reporterID}`,
              Email: '',
              ProfilePicture: ''
            }
          }
        } else if (bug.reporterName) {
          // Alternative data structure
          reporterInfo = {
            UserID: bug.reporterID,
            Name: bug.reporterName || '',
            Email: bug.reporterEmail || '',
            ProfilePicture: bug.reporterProfilePicture || ''
          }
        } else {
          // Minimal fallback
          reporterInfo = {
            UserID: bug.reporterID,
            Name: '',
            Email: '',
            ProfilePicture: ''
          }
        }
      }
      
      return {
        bugID: bug.bugID,
        BugID: bug.bugID,
        BugName: bug.bugName || '',
        bugName: bug.bugName || '',
        BugDescription: bug.bugDescription || '',
        bugDescription: bug.bugDescription || '',
        PriorityID: bug.priorityID || 0,
        priorityID: bug.priorityID || 0,
        PriorityName: bug.priorityname || '',
        priorityname: bug.priorityname || '',
        StatusID: bug.statusID || 0,
        statusID: bug.statusID || 0,
        StatusName: bug.statusname || '',
        statusname: bug.statusname || '',
        // Preserve both casings so resolveSprintTaskID always finds it
        SprintTaskID: bug.taskID || bug.sprintTaskID || 0,
        sprintTaskID: bug.taskID || bug.sprintTaskID || 0,
        timeResolution: bug.timeResolution || '',
        timeresolution: bug.timeResolution || '',
        isTimerStart: bug.isTimerStart || false,
        istimerstart: bug.isTimerStart || false,
        createdBy: reporterInfo,
        reporterID: bug.reporterID || 0,
        groupID: bug.groupID,
        reporterinfo: bug.reporterinfo || ''
      }
    })
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <Typography>Loading bugs...</Typography>
      </div>
    )
  }

  // ── Get used sprint tasks for each group ──────────────────────────────────
  const getUsedSprintTasksForGroup = (groupDetailList: any[]) => {
    const usedSprintTasks = groupDetailList
      .filter((bug: any) => bug.sprintTaskID)
      .map((bug: any) => ({
        sprintTaskID: bug.sprintTaskID,
        sprintName: bug.sprintname || bug.SprintName,
        groupName: bug.groupname
      }))
    return usedSprintTasks
  }

  // ── Render one BugGroupTable per group ────────────────────────────────────
  return (
    <div>
      {allGroups.map((group, groupIndex) => {
        const groupData = transformBugList(group?.detailList || [])
        const dynamicColumns = group?.colList || []
        const colValueList = group?.colvalueList || []
        const usedSprintTasks = getUsedSprintTasksForGroup(group?.detailList || [])

        // Use groupID from the group object if present, else fall back to the prop
        const currentGroupID = group?.groupID || group?.bugGroupID || bugGroupID

        return (
          <Box key={`group-${currentGroupID}-${groupIndex}`} mb={4}>
            <BugGroupTable
              groupData={groupData}
              dynamicColumns={dynamicColumns}
              colValueList={colValueList}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              workspaceID={workspaceID}
              bugGroupID={currentGroupID}
              sprintColumnVisibility={sprintColumnVisibility}
              user={user}
              refetch={refetch}
              refetchProject={refetchProject}
              users={users}
              fetchBugList={fetchBugList}
              existingSprintTasks={usedSprintTasks}
            />
          </Box>
        )
      })}
    </div>
  )
}

export default memo(BugList)
