import { useMemo, useState, useContext, useEffect } from 'react'

import {
  Box,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Zoom,
  Grid2 as Grid,
  Tooltip
} from '@mui/material'

import { useQuery } from '@tanstack/react-query'

import type { ColumnDef, TableMeta } from '@tanstack/react-table'

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import { debounce } from 'lodash'
import axios from 'axios'
import { Icon } from '@iconify/react'

import CustomButton from '@/components/button'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import { createSprintTasks, CREATESPRINTTASKS, updateSprintTask } from '@/services/modules/sprint-tasks'
import { ColumnTextField } from '@/views/project/task-group/task/columns/default-column'
import type { SprintTaskItem } from '@/services/modules/sprint-tasks/types'
import { SprintTaskManagement } from 'src/context/sprint-tast-context'
import { useAuth } from '@/hooks/useAuth'
import CreateColumnMenu from '../../tasks/components/create-column'
// Import dynamic column components
import DynamicTableHeader from '../columns/dynamic/header'
import SprintDynamicCell from '../columns/dynamic/cell'
import toast, { Toaster } from 'react-hot-toast'
import DeleteTasksComponent from '../components/Delete-sprinttask'
import { DescriptionTextfiled } from '../columns/DescriptionDefaultcolum'
import { ActualSpTextfiled } from '../columns/ActualSpTextfiled'
import { EstimateSpTextfiled } from '../columns/EstimateSpTextfiled'
import { IsUnplannedSelector } from '../columns/IsUnplannedSelector'
import TaskStatus from '../components/statusoriginal'
import TaskPriority from '../columns/priority'

// FIX: Extend TableMeta to include updateData
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData?: (rowIndex: number, columnId: string, value: string | { AdditionalColumnID: string }) => void
  }
}

// Define proper types for the taskgroup array
interface TaskGroup {
  id: string | number;
  name: string;
  sprintID?: string | number;
  taskGroupID?: string | number;
  [key: string]: any;
}

interface SprintTaskGroupInfo {
  sprintID: string | number;
  groupname: string;
  [key: string]: any;
}

// Updated interface for the API response
interface SprintTaskInfoResponse {
  colList?: Array<{
    additionalColumnID: number;
    colname: string;
    typeID: number;
    dynamicColumnTypeInfo: string;
    lookups: {
      id: number;
      title: string;
      key: string;
    };
  }>;
  detailList?: Array<{
    taskID: number;
    taskname: string;
    description: string;
    ownername: string;
    ownerID: number;
    statusID: number;
    statusname: string;
    statusColorCode: string;
    actualSP: number;
    estimatedSP: number;
    isUnplanned: boolean;
    sprintID: number;
    taskGroupID?: number;
    dynamicColumnList: any | null;
  }>;
  colvalueList?: Array<{
    id: number;
    taskID: number;
    sprintID: number;
    additionalColumnID: number;
    value: string;
    [key: string]: any;
  }>;
}

// FIX: Typed API response for sprintTaskInfoApi to avoid `any[]` property access issues
type SprintTaskInfoApiResult = SprintTaskInfoResponse | SprintTaskInfoResponse[]

// Helper to extract colvalueList from query result
const extractColvalueList = (data: SprintTaskInfoApiResult | undefined): any[] => {
  if (!data) return []
  if (Array.isArray(data)) {
    if (data.length > 0 && (data[0] as SprintTaskInfoResponse)?.colvalueList) {
      return (data[0] as SprintTaskInfoResponse).colvalueList || []
    }
    return []
  }
  return (data as SprintTaskInfoResponse).colvalueList || []
}

// Add the API function directly in the component file
const fetchSprintTaskGroupInfo = async (workspaceID: string | number) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskGroupInfoList?WorkspaceID=${workspaceID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sprint task group info');
  }

  return response.json();
};

// New API function to fetch sprint task info
const fetchSprintTaskInfoList = async (taskGroupID: string | number) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskInfoList?TaskGroupID=${taskGroupID}`);
  return response.data;
};

// Add the updateSprintTaskAPI function with all parameters
const updateSprintTaskAPI = async (taskId: string | number, taskData: {
  Taskname?: string;
  Description?: string;
  OwnerID?: number;
  EstimatedSP?: number;
  ActualSP?: number;
  isunplan?: boolean;
  StatusID?: number;
  PriorityID?: number;
}) => {
  const params = new URLSearchParams();
  
  // Add TaskID (required)
  params.append('TaskID', String(taskId));
  
  // Add all provided fields
  if (taskData.Taskname !== undefined && taskData.Taskname !== null) {
    params.append('Taskname', taskData.Taskname);
  }
  if (taskData.Description !== undefined && taskData.Description !== null) {
    params.append('Description', taskData.Description);
  }
  if (taskData.OwnerID !== undefined && taskData.OwnerID !== null) {
    params.append('OwnerID', String(taskData.OwnerID));
  }
  if (taskData.EstimatedSP !== undefined && taskData.EstimatedSP !== null) {
    params.append('EstimatedSP', String(taskData.EstimatedSP));
  }
  if (taskData.ActualSP !== undefined && taskData.ActualSP !== null) {
    params.append('ActualSP', String(taskData.ActualSP));
  }
  if (taskData.isunplan !== undefined && taskData.isunplan !== null) {
    params.append('isunplan', String(taskData.isunplan));
  }
  if (taskData.StatusID !== undefined && taskData.StatusID !== null) {
    params.append('StatusID', String(taskData.StatusID));
  }
  if (taskData.PriorityID !== undefined && taskData.PriorityID !== null) {
    params.append('PriorityID', String(taskData.PriorityID));
  }
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskUpdate?${params.toString()}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  
  return response.json();
};

// Add the owner removal API function
const removeSprintTaskOwner = async (taskId: string | number, groupId: string | number, sprintId: string | number, loginUserId: string | number) => {
  const params = new URLSearchParams();
  params.append('TaskID', String(taskId));
  params.append('GroupID', String(groupId));
  params.append('SprintID', String(sprintId));
  params.append('LoginuserID', String(loginUserId));
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskOwnerRemove?${params.toString()}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  
  return response.json();
};

interface TaskTableSprintProps {
  enabled: boolean;
  sp: SprintItem;
  selectedTask?: { 
    id: string; 
    name: string; 
    sprintID: string; 
    Taskname: string; 
    SprintTaskID: string 
  } | null;
  taskgroup: TaskGroup[];
}

// Owner Selector Component - Allows changing owner even when already selected
const OwnerSelector = ({ 
  value, 
  onUpdate, 
  canEdit = true 
}: { 
  value: { UserID?: number; Name?: string; Email?: string; ProfilePicture?: string } | null;
  onUpdate: (owner: { UserID: number; Name: string; Email: string; ProfilePicture?: string } | null) => Promise<void>;
  canEdit?: boolean;
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
      
      const mappedUsers = response.data.map((apiUser: any) => ({
        UserProjectID: apiUser.userID,
        User: {
          UserID: apiUser.userID,
          Name: apiUser.name,
          Email: apiUser.email?.toLowerCase() || '',
          ProfilePicture: apiUser.profilepicture || ''
        }
      }))
      
      setUsers(mappedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [user?.id])

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    await onUpdate({
      UserID: selected.User.UserID,
      Name: selected.User.Name,
      Email: selected.User.Email,
      ProfilePicture: selected.User.ProfilePicture
    })
    handleClose()
  }

  const userFilter = (userItem: any) => {
    return userItem?.User?.Name?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
           userItem?.User?.Email?.toLowerCase()?.includes(searchText?.toLowerCase())
  }

  // Filter out currently selected user from the list to avoid selecting the same user
  const filteredUsers = useMemo(() => {
    return users.filter(userItem => {
      // Filter by search text
      const matchesSearch = userFilter(userItem)
      // Exclude currently selected user
      const isNotCurrentUser = value ? userItem?.User?.UserID !== value?.UserID : true
      return matchesSearch && isNotCurrentUser
    })
  }, [users, searchText, value])

  if (!canEdit) {
    return (
      <Box display={'flex'} alignItems={'center'}>
        {value ? (
          <Tooltip title={value.Email || value.Name}>
            <Avatar alt={value.Name} src={value.ProfilePicture} sx={{ width: 32, height: 32 }} />
          </Tooltip>
        ) : (
          <Icon icon={'ph:question-duotone'} fontSize={24} />
        )}
      </Box>
    )
  }

  return (
    <Box display={'flex'} alignItems={'center'}>
      {value ? (
        <Box position={'relative'}>
          <IconButton 
            onClick={handleOpen}
            sx={{ p: 0 }}
          >
            <Tooltip title={value.Email || value.Name}>
              <Avatar alt={value.Name} src={value.ProfilePicture} sx={{ width: 32, height: 32 }} />
            </Tooltip>
          </IconButton>
          <IconButton 
            size='small' 
            onClick={handleRemove} 
            sx={{ 
              position: 'absolute', 
              top: -11, 
              right: -12,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              },
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
        <IconButton onClick={handleOpen}>
          <Icon icon={'bi:plus-circle-dotted'} />
        </IconButton>
      )}
      
      <Menu 
        open={!!anchorEl} 
        anchorEl={anchorEl} 
        onClose={handleClose} 
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            maxHeight: 400
          }
        }}
      >
        <Box width={280}>
          <Grid container spacing={2}>
            <Grid size={12}>
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
            </Grid>
            <Grid size={12}>
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {loading ? (
                  <Box px={3} py={2} display={'flex'} justifyContent={'center'}>
                    <CircularProgress size={24} />
                  </Box>
                ) : filteredUsers?.length !== 0 ? (
                  filteredUsers.map((userItem, index) => (
                    <MenuItem
                      onClick={() => handleSelectUser(userItem)}
                      key={`owner-menu-item-${userItem?.User?.UserID || userItem?.UserProjectID || index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
                      sx={{ py: 1 }}
                    >
                      <Box display={'flex'} alignItems={'center'} gap={2} overflow={'hidden'}>
                        <Avatar alt={userItem?.User?.Name} src={userItem?.User?.ProfilePicture} sx={{ width: 32, height: 32 }} />
                        <Box overflow={'hidden'}>
                          <Typography variant='body2' fontWeight={500} overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                            {userItem?.User?.Name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' overflow={'hidden'} textOverflow={'ellipsis'} whiteSpace={'nowrap'}>
                            {userItem?.User?.Email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <Box px={3} py={2}>
                    <Typography variant='body2' color='text.secondary' textAlign={'center'}>
                      {searchText ? 'No users found' : 'No users available'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Menu>
    </Box>
  )
}

const TaskTableSprint = ({ 
  enabled, 
  sp, 
  selectedTask,
  taskgroup
}: TaskTableSprintProps) => {
  // ** States
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [addColumnAnchor, setAddColumnAnchor] = useState<null | HTMLElement>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [sprintTaskInfoData, setSprintTaskInfoData] = useState<any>(null)
  const [sprintDynamicColumns, setSprintDynamicColumns] = useState<any[]>([])
  const [colvalueList, setColvalueList] = useState<any[]>([])
  const [showCard, setShowCard] = useState(false)
  
  const { profile, user } = useAuth()
  
  // Get column visibility from sprint context
  const { columnVisibility: sprintColumnVisibility } = useContext(SprintTaskManagement)

  // Add this new query for fetching group info
  const sprintTaskGroupInfoApi = useQuery<SprintTaskGroupInfo[]>({
    // FIX: Use correct casing WorkSpaceID
    queryKey: ['sprint-task-group-info', sp?.WorkSpaceID],
    queryFn: () => fetchSprintTaskGroupInfo(sp?.WorkSpaceID || 54),
    enabled: enabled && !!sp?.WorkSpaceID
  })

  // Get groupname for the current sprint
  const currentSprintGroupInfo = useMemo(() => {
    const groupInfo = sprintTaskGroupInfoApi?.data || []
    return groupInfo.find((group: SprintTaskGroupInfo) => group.sprintID === sp?.SprintID)
  }, [sprintTaskGroupInfoApi?.data, sp?.SprintID])

  // Get taskgroup IDs from the taskgroup prop - DYNAMIC, NO HARDCODED VALUES
  const taskGroupIds = useMemo(() => {
    if (taskgroup && taskgroup.length > 0) {
      const ids = taskgroup
        .map(item => {
          const idValue = item.taskGroupID || item.id;
          return idValue ? Number(idValue) : null;
        })
        .filter((id): id is number => id !== null && !isNaN(Number(id)));
      
      return ids;
    }
    
    return [];
  }, [taskgroup]);

  // Get the current taskGroupId based on the selected sprint
  const currentTaskGroupId = useMemo(() => {
    const currentGroup = taskgroup.find(group => group.sprintID === sp?.SprintID);
    if (currentGroup) {
      const idValue = currentGroup.taskGroupID || currentGroup.id;
      return idValue ? Number(idValue) : null;
    }
    return taskGroupIds.length > 0 ? taskGroupIds[0] : null;
  }, [taskgroup, sp?.SprintID, taskGroupIds]);

  // Only fetch if we have valid taskGroupIds
  // FIX: Typed query return as SprintTaskInfoApiResult to avoid `any[]` property errors
  const sprintTaskInfoApi = useQuery<SprintTaskInfoApiResult>({
    queryKey: ['sprint-task-info', taskGroupIds.sort().join(','), sp?.SprintID, currentTaskGroupId],
    queryFn: async () => {
      if (!taskGroupIds.length) {
        return [];
      }
      
      const promises = taskGroupIds.map((id: any) => fetchSprintTaskInfoList(id));
      const results = await Promise.all(promises);
      
      if (results && results.length > 0) {
        const currentIndex = taskGroupIds.findIndex(id => Number(id) === Number(currentTaskGroupId));
        
        if (currentIndex !== -1 && results[currentIndex]) {
          const currentResponse = results[currentIndex];
          if (currentResponse && currentResponse.length > 0 && currentResponse[0]?.colList) {
            setSprintTaskInfoData(currentResponse[0]);
            if (currentResponse[0].colvalueList && Array.isArray(currentResponse[0].colvalueList)) {
              setColvalueList(currentResponse[0].colvalueList);
            } else {
              setColvalueList([]);
            }
            if (currentResponse[0].colList && currentResponse[0].colList.length > 0) {
              setSprintDynamicColumns(currentResponse[0].colList);
            } else {
              setSprintDynamicColumns([]);
            }
          } else if (currentResponse && currentResponse.colList) {
            setSprintTaskInfoData(currentResponse);
            if (currentResponse.colvalueList && Array.isArray(currentResponse.colvalueList)) {
              setColvalueList(currentResponse.colvalueList);
            } else {
              setColvalueList([]);
            }
            if (currentResponse.colList && currentResponse.colList.length > 0) {
              setSprintDynamicColumns(currentResponse.colList);
            } else {
              setSprintDynamicColumns([]);
            }
          }
        } else {
          for (const response of results) {
            if (response && response.length > 0 && response[0]?.colList) {
              setSprintTaskInfoData(response[0]);
              if (response[0].colvalueList && Array.isArray(response[0].colvalueList)) {
                setColvalueList(response[0].colvalueList);
              } else {
                setColvalueList([]);
              }
              if (response[0].colList && response[0].colList.length > 0) {
                setSprintDynamicColumns(response[0].colList);
              } else {
                setSprintDynamicColumns([]);
              }
              break;
            } else if (response && response.colList) {
              setSprintTaskInfoData(response);
              if (response.colvalueList && Array.isArray(response.colvalueList)) {
                setColvalueList(response.colvalueList);
              } else {
                setColvalueList([]);
              }
              if (response.colList && response.colList.length > 0) {
                setSprintDynamicColumns(response.colList);
              } else {
                setSprintDynamicColumns([]);
              }
              break;
            }
          }
        }
      }
      
      return results;
    },
    enabled: enabled && taskGroupIds.length > 0 && currentTaskGroupId !== null,
    retry: 2
  });

  // Helper function to get dynamic values from colvalueList
  const getDynamicValueForTask = (taskId: number | string, columnId: string) => {
    if (!colvalueList || !Array.isArray(colvalueList)) {
      return null;
    }
    
    const dynamicValue = colvalueList.find(
      (item: any) => 
        item?.taskID?.toString() === taskId?.toString() && 
        item?.additionalColumnID?.toString() === columnId?.toString()
    );
    
    return dynamicValue || null;
  };

  // Get the detailList from the response
  const getTaskDetailList = useMemo(() => {
    if (sprintTaskInfoData?.detailList && Array.isArray(sprintTaskInfoData.detailList)) {
      return sprintTaskInfoData.detailList;
    }
    return [];
  }, [sprintTaskInfoData]);

  // FIXED: Transform the API response - now maps priorityID/priorityname/colorcode into nested Priority object
  const transformedData = useMemo(() => {
    const detailList = getTaskDetailList;
    
    // FIX: explicitly typed task parameter
    return detailList.map((task: SprintTaskInfoResponse['detailList'] extends Array<infer T> ? T : any) => ({
      SprintTaskID: task.taskID ? String(task.taskID) : '',
      taskID: task.taskID,
      Taskname: task.taskname || '',
      Description: task.description || '',
      Ownername: task.ownername || '',
      OwnerID: task.ownerID || 0,
      Owner: task.ownerID ? {
        UserID: task.ownerID,
        Name: task.ownername || '',
        Email: '',
        ProfilePicture: ''
      } : null,
      StatusID: task.statusID || 0,
      Statusname: task.statusname || '',
      StatusColorCode: task.statusColorCode || '',
      ActualSP: typeof task.actualSP === 'number' ? task.actualSP : 0,
      EstimatedSP: typeof task.estimatedSP === 'number' ? task.estimatedSP : 0,
      IsUnplanned: Boolean(task.isUnplanned),
      SprintID: task.sprintID || sp?.SprintID || 0,
      sprintID: task.sprintID || sp?.SprintID || 0,
      taskGroupID: currentTaskGroupId,
      // FIXED: Map flat priorityID/priorityname/colorcode fields into PriorityID and nested Priority object
      PriorityID: (task as any).priorityID || null,
      priorityID: (task as any).priorityID || null,
      priorityname: (task as any).priorityname || '',
      colorcode: (task as any).colorcode || '',
      Priority: (task as any).priorityID ? {
        PriorityID: (task as any).priorityID,
        PriorityName: (task as any).priorityname || '',
        Colorcode: (task as any).colorcode || ''
      } : null,
      DynamicColumnList: task.dynamicColumnList || null,
      colvalueList: colvalueList
    }));
  }, [getTaskDetailList, sp?.SprintID, colvalueList, currentTaskGroupId]);

  // Filter data based on selected task
  const filteredData = useMemo(() => {
    const rawData = transformedData
    
    if (selectedTask && selectedTask.SprintTaskID) {
      return rawData.filter((task: any) => task.SprintTaskID === selectedTask.SprintTaskID)
    }
    
    return rawData
  }, [transformedData, selectedTask])

  // Add showSelected state for delete button visibility
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

  // Handle showCard state when rows are selected
  useEffect(() => {
    if (showSelected) {
      setShowCard(true)
    } else {
      const timeout = setTimeout(() => setShowCard(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [showSelected])

  // Helper to sync colvalueList after refetch
  const syncColvalueList = () => {
    if (sprintTaskInfoApi.data) {
      setColvalueList(extractColvalueList(sprintTaskInfoApi.data))
    }
  }

  // Static columns definition
  const staticColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: 'select',
        accessorKey: 'select',
        size: 20,
        maxSize: 20,
        header: function SelectHeader({ table }) {
          return (
            <div className='flex justify-start ml-1 !w-20'>
              <Checkbox
                checked={table?.getIsAllRowsSelected?.() ?? false}
                indeterminate={table?.getIsSomeRowsSelected?.()}
                onChange={table?.getToggleAllRowsSelectedHandler?.()}
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <div className='flex px-1 !w-20'>
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              indeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        )
      },
      {
        id: 'Taskname',
        accessorKey: 'Taskname',
        size: 200,
        maxSize: 1000,
        header: function TasknameHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              Taskname
            </Typography>
          )
        },
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          const value = getValue() as string;
          return <ColumnTextField canEdit={true} getValue={() => (value as any)} index={index} id={id} table={table} />
        }
      },
      {
        id: 'Description',
        accessorKey: 'Description',
        size: 200,
        maxSize: 1000,
        header: function TasknameHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              TaskDescription
            </Typography>
          )
        },
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          const value = getValue() as string;
          return <DescriptionTextfiled canEdit={true} getValue={() => (value as any)} index={index} id={id} table={table} />
        }
      },
      {
        id: 'Owner',
        accessorKey: 'Owner',
        header: function OwnerHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              Owner
            </Typography>
          )
        },
        cell: ({ row: { original, index }, table }) => {
          const owner = original?.Owner || null;
          
          const handleUpdateOwner = async (newOwner: { UserID: number; Name: string; Email: string; ProfilePicture?: string } | null) => {
            try {
              const currentTask = original;
              const taskId = currentTask?.SprintTaskID?.toString();
              
              if (!taskId) return;
              
              // If removing owner (newOwner is null), use the owner removal API
              if (newOwner === null) {
                // Call the owner removal API
                await removeSprintTaskOwner(
                  taskId,
                  currentTaskGroupId || 0,
                  sp?.SprintID || 0,
                  user?.id || 0
                );
                toast.success("Owner removed successfully");
              } 
              // If assigning a new owner, use the update API
              else {
                // Prepare complete task data with all parameters
                const taskData = {
                  Taskname: currentTask?.Taskname || '',
                  Description: currentTask?.Description || '',
                  OwnerID: newOwner?.UserID || 0,
                  EstimatedSP: currentTask?.EstimatedSP || 0,
                  ActualSP: currentTask?.ActualSP || 0,
                  isunplan: currentTask?.IsUnplanned || false,
                  StatusID: currentTask?.StatusID || 0,
                  PriorityID: currentTask?.PriorityID || 0
                };
                
                // Call the update API with all parameters
                await updateSprintTaskAPI(taskId, taskData);
                toast.success("Owner assigned successfully");
              }
              
              // Refetch to get latest data
              await sprintTaskInfoApi?.refetch();
              syncColvalueList()
              
              // Update the table data
              table.options.meta?.updateData?.(index, 'Owner', newOwner ? JSON.stringify(newOwner) : '');
            } catch (error) {
              console.error('Error updating owner:', error);
              toast.error("Failed to update owner");
            }
          };
          
          return (
            <OwnerSelector
              value={owner}
              onUpdate={handleUpdateOwner}
              canEdit={true}
            />
          );
        }
      },
    
      {
        id: 'IsUnplanned',
        accessorKey: 'IsUnplanned',
        header: function IsUnplannedHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              Is Unplanned
            </Typography>
          )
        },
        cell: ({ row: { original, index }, table }) => {
          const value = original?.IsUnplanned || false;
          
          const handleUpdate = async (newValue: boolean) => {
            try {
              const currentTask = original;
              const taskId = currentTask?.SprintTaskID?.toString();
              
              if (!taskId) return;
              
              const taskData = {
                Taskname: currentTask?.Taskname || '',
                Description: currentTask?.Description || '',
                OwnerID: currentTask?.OwnerID || 0,
                EstimatedSP: currentTask?.EstimatedSP || 0,
                ActualSP: currentTask?.ActualSP || 0,
                isunplan: newValue,
                StatusID: currentTask?.StatusID || 0,
                PriorityID: currentTask?.PriorityID || 0
              };
              
              await updateSprintTaskAPI(taskId, taskData);
              
              toast.success(`Task marked as ${newValue ? 'Unplanned' : 'Planned'} successfully`);
              
              await sprintTaskInfoApi?.refetch();
              syncColvalueList()
              
              table.options.meta?.updateData?.(index, 'IsUnplanned', String(newValue));
            } catch (error) {
              console.error('Error updating IsUnplanned:', error);
              toast.error("Failed to update task status");
            }
          };
          
          return (
            <IsUnplannedSelector
              value={value}
              canEdit={true}
              onUpdate={handleUpdate}
            />
          );
        }
      },
        {
        id: 'ActualSP',
        accessorKey: 'ActualSP',
        header: function ActualSPHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              Actual SP
            </Typography>
          )
        },
         cell: ({ getValue, row: { index }, column: { id }, table }) => {
          const value = getValue() as string;
          return <ActualSpTextfiled canEdit={true} getValue={() => (value as any)} index={index} id={id} table={table} />
        }
      },
      {
        id: 'EstimatedSP',
        accessorKey: 'EstimatedSP',
        header: function EstimatedSPHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
              Estimated SP
            </Typography>
          )
        },
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          const value = getValue() as string;
          return <EstimateSpTextfiled canEdit={true} getValue={() => (value as any)} index={index} id={id} table={table} />
        }
      },
       {
        id: 'Priority',
        accessorKey: 'Priority',
        header: function EstimatedSPHeader() {
          return (
            <Typography variant='body2' fontWeight={800}>
        Priority
            </Typography>
          )
        },
         cell: ({ row: { original: row } }) => {
          return <TaskPriority row={row} refetch={row} canEdit={true} />
        }
      },
{
  id: 'Status',
  accessorKey: 'Status',
  header: function StatusHeader() {
    return (
      <Typography variant='body2' fontWeight={800}>
        Status
      </Typography>
    )
  },
  cell: ({ row: { original, index }, table }) => {
    return (
      <TaskStatus
        row={original}
        // FIX: removed sprintTaskInfoApi, setColvalueList, updateSprintTask props that don't exist on TaskStatusProps
        refetch={() => {
          sprintTaskInfoApi.refetch().then(() => {
            syncColvalueList()
          });
        }}
        canEdit={true}
      />
    );
  }
}
    ],
    [currentSprintGroupInfo, sprintTaskInfoApi, currentTaskGroupId, sp?.SprintID, user?.id]
  );

  // Dynamic columns from colList with custom headers and dynamic cells
  const dynamicColumns = useMemo((): ColumnDef<any>[] => {
    if (!sprintDynamicColumns || sprintDynamicColumns.length === 0) return [];

    return sprintDynamicColumns.map((column, index) => {
      const columnId = column?.additionalColumnID?.toString() || 
                      column?.ColumnID?.toString() || 
                      `dynamic-${index}`;
      
      return {
        id: columnId,
        accessorKey: columnId,
        accessorFn: (row) => {
          return getDynamicValueForTask(row?.SprintTaskID || row?.taskID, columnId);
        },
        minSize: 250,
        size: 250,
        sortable: false,
        header: () => {
          return <DynamicTableHeader column={column} refetch={() => sprintTaskInfoApi.refetch()} />
        },
        cell: ({ getValue, row: { original, index }, column: { id }, table }) => {
          const dynamicValue = getDynamicValueForTask(original?.SprintTaskID || original?.taskID, columnId);

          return (
            <SprintDynamicCell
              getValue={getValue}
              columnItem={column}
              index={index}
              row={original}
              id={id}
              table={table}
              value={dynamicValue}
              refetch={() => {
                sprintTaskInfoApi.refetch().then(() => {
                  syncColvalueList()
                });
              }}
            />
          );
        }
      }
    });
  }, [sprintDynamicColumns, colvalueList, sprintTaskInfoApi.refetch, sprintTaskInfoApi.data]);

  // Combine static and dynamic columns
  const allColumns: ColumnDef<any>[] = useMemo(() => {
    return [...staticColumns, ...dynamicColumns]
  }, [staticColumns, dynamicColumns])

  // Filter columns based on visibility from sprint context
  const visibleColumns = useMemo(() => {
    return allColumns.filter(column => {
      const columnId = column.id as string;
      
      if (columnId === 'select') {
        return true;
      }
      
      const isVisible = sprintColumnVisibility[columnId];
      
      if (isVisible === undefined) {
        return true;
      }
      
      return isVisible;
    });
  }, [allColumns, sprintColumnVisibility]);

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    initialState: { columnPinning: { left: ['select', 'Taskname'], right: ['add-column'] } },
    state: {
      rowSelection: selectedRows
    },
    getRowCanExpand: () => true,
    enableRowSelection: true,
    onRowSelectionChange: setSelectedRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: string, value: string | { AdditionalColumnID: string }) => {
        if (columnId === 'Taskname' && filteredData[rowIndex]?.SprintTaskID) {
          try {
            const currentTask = filteredData[rowIndex];
            const taskId = currentTask?.SprintTaskID?.toString();
            
            const taskData = {
              Taskname: value as string,
              Description: currentTask?.Description || '',
              OwnerID: currentTask?.OwnerID || 0,
              EstimatedSP: currentTask?.EstimatedSP || 0,
              ActualSP: currentTask?.ActualSP || 0,
              isunplan: currentTask?.IsUnplanned || false,
              StatusID: currentTask?.StatusID || 0,
              PriorityID: currentTask?.PriorityID || 0
            };
            
            await updateSprintTaskAPI(taskId, taskData);
            
            toast.success("Task name updated successfully");
            
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('Error updating task name:', error);
            toast.error("Failed to update task name");
          }
        }
        
        else if (columnId === 'Description' && filteredData[rowIndex]?.SprintTaskID) {
          try {
            const currentTask = filteredData[rowIndex];
            const taskId = currentTask?.SprintTaskID?.toString();
            
            const taskData = {
              Taskname: currentTask?.Taskname || '',
              Description: value as string,
              OwnerID: currentTask?.OwnerID || 0,
              EstimatedSP: currentTask?.EstimatedSP || 0,
              ActualSP: currentTask?.ActualSP || 0,
              isunplan: currentTask?.IsUnplanned || false,
              StatusID: currentTask?.StatusID || 0,
              PriorityID: currentTask?.PriorityID || 0
            };
            
            await updateSprintTaskAPI(taskId, taskData);
            
            toast.success("Task description updated successfully");
            
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('Error updating task description:', error);
            toast.error("Failed to update task description");
          }
        }
        
        else if (columnId === 'ActualSP' && filteredData[rowIndex]?.SprintTaskID) {
          try {
            const currentTask = filteredData[rowIndex];
            const taskId = currentTask?.SprintTaskID?.toString();
            
            const actualSPValue = value ? Number(value) : 0;
            
            const taskData = {
              Taskname: currentTask?.Taskname || '',
              Description: currentTask?.Description || '',
              OwnerID: currentTask?.OwnerID || 0,
              EstimatedSP: currentTask?.EstimatedSP || 0,
              ActualSP: actualSPValue,
              isunplan: currentTask?.IsUnplanned || false,
              StatusID: currentTask?.StatusID || 0,
              PriorityID: currentTask?.PriorityID || 0
            };
            
            await updateSprintTaskAPI(taskId, taskData);
            
            toast.success("Actual SP updated successfully");
            
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('Error updating actual SP:', error);
            toast.error("Failed to update actual SP");
          }
        }
        
        else if (columnId === 'EstimatedSP' && filteredData[rowIndex]?.SprintTaskID) {
          try {
            const currentTask = filteredData[rowIndex];
            const taskId = currentTask?.SprintTaskID?.toString();
            
            const estimatedSPValue = value ? Number(value) : 0;
            
            const taskData = {
              Taskname: currentTask?.Taskname || '',
              Description: currentTask?.Description || '',
              OwnerID: currentTask?.OwnerID || 0,
              EstimatedSP: estimatedSPValue,
              ActualSP: currentTask?.ActualSP || 0,
              isunplan: currentTask?.IsUnplanned || false,
              StatusID: currentTask?.StatusID || 0,
              PriorityID: currentTask?.PriorityID || 0
            };
            
            await updateSprintTaskAPI(taskId, taskData);
            
            toast.success("Estimated SP updated successfully");
            
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('Error updating estimated SP:', error);
            toast.error("Failed to update estimated SP");
          }
        }
        
        else if (columnId === 'IsUnplanned' && filteredData[rowIndex]?.SprintTaskID) {
          try {
            const currentTask = filteredData[rowIndex];
            const taskId = currentTask?.SprintTaskID?.toString();
            // FIX: value is string | object, so compare with string only
            const isUnplannedValue = value === 'true';
            
            const taskData = {
              Taskname: currentTask?.Taskname || '',
              Description: currentTask?.Description || '',
              OwnerID: currentTask?.OwnerID || 0,
              EstimatedSP: currentTask?.EstimatedSP || 0,
              ActualSP: currentTask?.ActualSP || 0,
              isunplan: isUnplannedValue,
              StatusID: currentTask?.StatusID || 0,
              PriorityID: currentTask?.PriorityID || 0
            };
            
            await updateSprintTaskAPI(taskId, taskData);
            
            toast.success(`Task marked as ${isUnplannedValue ? 'Unplanned' : 'Planned'} successfully`);
            
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('Error updating IsUnplanned:', error);
            toast.error("Failed to update task status");
          }
        }
        
        else if (typeof value === 'object' && value !== null && 'AdditionalColumnID' in value && filteredData[rowIndex]?.SprintTaskID) {
          try {
            await sprintTaskInfoApi?.refetch();
            syncColvalueList()
          } catch (error) {
            console.error('error updating dynamic column:', error);
          }
        }
      }
    }
  })
  
  const handleAddSprint = async () => {
    setAdding(true)

    try {
      if (!currentTaskGroupId) {
        console.error('No current task group ID available to create task');
        setAdding(false);
        return;
      }

      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskcreate`
      const params = new URLSearchParams({
        taskname: 'New Task',
        TaskGroupID: String(currentTaskGroupId),
        LoginuserID: String(user?.id)
      })
      const apiUrl = `${baseUrl}?${params.toString()}`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      toast.success("Task Added Successfully")
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`)
      }

      const result = await response.json()
      
      await sprintTaskInfoApi.refetch()
      syncColvalueList()
      
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setAdding(false)
    }
  }

  const debouncedHandleAddSprint = debounce(handleAddSprint, 500)

  useEffect(() => {
    if (enabled && taskGroupIds.length > 0 && currentTaskGroupId) {
      sprintTaskInfoApi.refetch().then(() => {
        syncColvalueList()
      });
    }
  }, [enabled, taskGroupIds.join(','), currentTaskGroupId]);

  if (sprintTaskInfoApi?.isLoading || sprintTaskGroupInfoApi?.isLoading) {
    return (
      <div className='w-full flex justify-center'>
        <CircularProgress />
      </div>
    )
  }

  if (sprintTaskInfoApi?.isError) {
    return <div>Error: {(sprintTaskInfoApi.error as Error)?.message || 'Failed to load data'}</div>
  }

  // FIX: Convert Record<string, boolean> to string[] for DeleteTasksComponent
  const selectedRowIds = Object.keys(selectedRows).filter(key => selectedRows[key])

  return (
    <div className='px-3'>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          sx={{
            minWidth: 'max-content'
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    colSpan={header.colSpan}
                    sx={{ fontWeight: 600, pb: 1, height: 67.5, textTransform: 'uppercase' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => {
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      return (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns?.length}>
                  <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={70} width={'100%'}>
                    <Typography>No Data Found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex justify-between items-center gap-2 m-2'>
        <CustomButton
          variant='text'
          size='small'
          startIcon={<i className='ri-add-line' />}
          onClick={debouncedHandleAddSprint}
        >
          {adding ? 'Adding...' : 'Add Task'}
        </CustomButton>
             
        <CustomButton
          variant='outlined'
          circular
          size='small'
          color='secondary'
          startIcon={<i className='ri-add-line' />}
          onClick={e => {
            setAnchorEl(e?.currentTarget)
          }}
        >
          Add New Column
        </CustomButton>
      </div>
      {showCard &&
        <DeleteTasksComponent
          showCard={showCard}
          // FIX: pass selectedRowIds (string[]) instead of selectedRows (Record<string,boolean>)
          selectedRows={selectedRowIds}
          sprintlist={transformedData}
          refetch={() => {
            sprintTaskInfoApi.refetch().then(() => {
              syncColvalueList()
            });
          }}
          setSelectedRows={setSelectedRows}
        />}
      <CreateColumnMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        onSubmit={(data) => {
          sprintTaskInfoApi.refetch().then(() => {
            syncColvalueList()
          });
        }}
        // FIX: Use WorkSpaceID (correct casing)
        spintid={(sp as any)?.WorkSpaceID}
        // FIX: null-coalesce to avoid passing null where number is required
        groupid={currentTaskGroupId ?? 0}
      />
    </div>
  )
}

export default TaskTableSprint
