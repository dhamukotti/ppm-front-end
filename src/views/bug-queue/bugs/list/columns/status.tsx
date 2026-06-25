import React, { useMemo, useState } from 'react'

import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, Zoom, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { routes } from '@/constants/routes'

import { useQuery } from '@tanstack/react-query'

import {
  generateStatusIcons,
  getContrastingTextColor,
  getHexColor,
  getLuminance,
  getStatusIconColor,
  getStatusIconSize
} from 'src/utils/functions'

import { pattern } from '@/constants/patterns'
import { addProjectStatus, fetchProjectStatusList, updateProjectStatus } from '@/services/modules/project-status'
import type { ProjectStatusList } from '@/services/modules/project-status/types'
import type { AdditionalColumn } from '@/services/modules/project/types'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import type { TaskListItemType } from '@/services/modules/task/types'
import CustomButton from '@components/button'
import { useWorkspace } from 'src/context/workspace-context'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import axios from 'axios'
import { toast } from 'react-hot-toast'

// Add these types and service function directly in the file
// FIX #1: Added BugID and GroupID to InsertDynamicValuePayload
interface InsertDynamicValuePayload {
  DynamicColumnID: number;
  LoginuserID: number;
  SprintID: number;
  SprintGroupID: number;
  DynamicValue: string | number | null;
  BugID?: number;
  GroupID?: number;
}

interface InsertDynamicValueResponse {
  status: boolean;
  message?: string;
  data?: any;
}

interface CreateStatusPayload {
  Statusname: string;
  Colorcode: string;
}

interface CreateStatusResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add Delete Status interfaces
interface DeleteStatusPayload {
  StatusID: number;
}

interface DeleteStatusResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add Update Status interface
interface UpdateStatusPayload {
  StatusID: number;
  TaskID: number;
  LoginuserID: number;
  GroupID: number;
  Statusname: string;
  Colorcode: string;
}

interface UpdateStatusResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add Create Task Status interface
interface CreateTaskStatusPayload {
  Statusname: string;
  TaskID: number;
  LoginuserID: number;
  GroupID: number;
  Colorcode: string;
}

interface CreateTaskStatusResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add SprintTaskUpdate interface for status updates
interface SprintTaskUpdatePayload {
  TaskID: number;
  Taskname?: string;
  Description?: string;
  OwnerID?: number;
  EstimatedSP?: number;
  ActualSP?: number;
  isunplan?: boolean;
  StatusID?: number; // FIX #3: kept as number | undefined (not null)
  PriorityID?: number;
}

interface SprintTaskUpdateResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Update interface for status lookup response to match your actual API response
interface StatusLookupItem {
  statusID: number;
  statusname: string;
  colorcode: string;
} 


// ✅ FIXED: Fetch bug status list by WorkspaceID - using the workspaceID from props
const fetchBugStatusList = async (workspaceID: number): Promise<StatusLookupItem[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL1}/GetBugStatusList?WorkspaceID=${workspaceID}`
    )
   
    // Check if response.data is an array, if not, try to extract it from response.data.data
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching bug status list:', error);
    throw error;
  }
}

// SprintTaskUpdate function for updating status
const sprintTaskUpdate = async (payload: SprintTaskUpdatePayload): Promise<SprintTaskUpdateResponse> => {
  try {
    const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL1}`;
    const params = new URLSearchParams();
    
    if (payload.TaskID) params.append('TaskID', payload.TaskID.toString());
    if (payload.Taskname) params.append('Taskname', payload.Taskname);
    if (payload.Description) params.append('Description', payload.Description);
    if (payload.OwnerID) params.append('OwnerID', payload.OwnerID.toString());
    if (payload.EstimatedSP) params.append('EstimatedSP', payload.EstimatedSP.toString());
    if (payload.ActualSP) params.append('ActualSP', payload.ActualSP.toString());
    if (payload.isunplan !== undefined) params.append('isunplan', payload.isunplan.toString());
    if (payload.StatusID) params.append('StatusID', payload.StatusID.toString());
    if (payload.PriorityID) params.append('PriorityID', payload.PriorityID.toString());
    
    const apiUrl = `${BASE_URL}/SprintTaskUpdate?${params.toString()}`;
    
    const response = await axios.post(apiUrl);
    toast.success('Status updated successfully');
      
    return { status: true, data: response.data };
  } catch (error) {
    console.error('API call failed:', error);
    toast.error('Failed to update status');
    throw error;
  }
}

// Replace the insertDynamicValue function with the new implementation
const insertDynamicValue = async (payload: InsertDynamicValuePayload): Promise<InsertDynamicValueResponse> => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
    const DynamicColumnID = payload.DynamicColumnID;
    const LoginuserID = payload.LoginuserID;
    // FIX #2: Use payload.BugID and payload.GroupID (now valid via updated interface)
    const BugID = payload.BugID;
    const GroupID = payload.GroupID;
    const DynamicValue = payload.DynamicValue?.toString() || '';
    
    const apiUrl = `${BASE_URL}/InsertBugDynamicValues?DynamicColumnID=${DynamicColumnID}&LoginuserID=${LoginuserID}&BugID=${BugID}&GroupID=${GroupID}&DynamicValue=${encodeURIComponent(DynamicValue)}`;

    const response = await axios.post(apiUrl);
    toast.success('Value updated successfully');
      
    return { status: true, data: response.data };
  } catch (error) {
    console.error('API call failed:', error);
    toast.error('Failed to update value');
    throw error;
  }
}



// Add create task status function
const createTaskStatus = async (payload: CreateTaskStatusPayload,workspaceID: number): Promise<CreateTaskStatusResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/CreateBugStatus`,
      null,
      {
        params: {
          statusname: payload.Statusname,
          colorcode:  payload.Colorcode,
          workspaceid: workspaceID,
          loginuserID: payload.LoginuserID,
         
        }
      }
    );
    
    toast.success("Task Status Created Successfully");
    return response.data;
  } catch (error) {
    console.error('Error creating task status:', error);
    toast.error('Failed to create task status');
    throw error;
  }
}

// Add update status function
const updateStatus = async (payload: UpdateStatusPayload): Promise<UpdateStatusResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskStatusUpdate`,
      null,
      {
        params: {
          TaskID: payload.TaskID,
          StatusID: payload.StatusID,
          GroupID: payload.GroupID,
          Statusname: payload.Statusname,
          Colorcode: payload.Colorcode
        }
      }
    );   
    toast.success("Status Updated Successfully")
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Failed to update status');
    throw error;
  }
}

// FIXED: Updated delete status function with TaskID and GroupID
// FIX #5: Added workspaceID as third argument to match call sites
const deleteStatus = async (payload: DeleteStatusPayload, row: any, workspaceID: number): Promise<DeleteStatusResponse> => {
  try {
    // Get TaskID and GroupID from the row data
    const taskID = row?.taskID || row?.TaskID;
    const groupID = row?.taskGroupID || row?.TaskGroupID;
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/RemoveBugStatus?StatusID=${payload.StatusID}&LoginuserID=${76}&WorkspaceID=${workspaceID}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    toast.success('Status deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting status:', error);
    toast.error('Failed to delete status');
    throw error;
  }
}

interface StatusMenuItemProps {
  item: ProjectStatusList
  row: SprintItem | AdditionalSubTaskListItem | TaskListItemType
  handleClose: () => void
  // FIX #10: Made item parameter optional to match call sites using (item?: ProjectStatusList) => void
  handleEdit?: (item?: ProjectStatusList) => void
  handleDelete?: (item?: ProjectStatusList, row?: any) => void
  refetch: () => void
  columnData?: AdditionalColumn
  dynamicValue?: any
  isSubTask: boolean
  onStatusChangeFromParent?: (bugId: string | number, newStatusId: number) => Promise<void> // Add this prop
  isBugList?: boolean // Add this prop to identify if it's from BugList
  bugId?: string | number // Add bug ID prop
}

const StatusMenuItem = ({
  item,
  row,
  handleClose,
  handleEdit,
  handleDelete,
  refetch,
  columnData,
  dynamicValue,
  isSubTask,
  onStatusChangeFromParent, // Add this
  isBugList, // Add this
  bugId // Add this
}: StatusMenuItemProps) => {
  const { profile, user } = useAuth()
  const generateTextColor = (colorCode: string): string => {
    if (!colorCode) return ''

    const hexColor = getHexColor(colorCode)
    const luminance = getLuminance(hexColor)

    if (luminance < 0.5) {
      return `${hexColor}`
    }

    return getContrastingTextColor(colorCode)
  }

  const handleStatusChange = async () => {
    // If this is from BugList component and has parent handler, use that
    if (isBugList && onStatusChangeFromParent && bugId) {
      await onStatusChangeFromParent(bugId, item?.StatusID);
      return;
    }

    // Check if we're dealing with a dynamic column
    if (!!dynamicValue || !!columnData) {
      try {
        const dynamicColumnID = columnData?.additionalColumnID;
        const loginuserID = user?.id;

        // ✅ FIXED: Use taskID and taskGroupID (same as non-dynamic branch)
        const groupid = row?.groupID || row?.groupID;
        const bugid = (row as any)?.BugID || (row as any)?.BugID;

        let dynamicValueToSend;

        if (item?.StatusID === 0 || item?.StatusID === null || item?.StatusID === undefined) {
          dynamicValueToSend = '';
        } else {
          dynamicValueToSend = item?.StatusID?.toString();
        }

        if (dynamicColumnID && loginuserID && groupid && bugid) {
          const response = await insertDynamicValue({
            DynamicColumnID: dynamicColumnID,
            LoginuserID: loginuserID,
            SprintID: 0,
            SprintGroupID: 0,
            // FIX #2: Use BugID and GroupID via updated interface (camelCase locals mapped correctly)
            BugID: bugid,
            GroupID: groupid,
            DynamicValue: dynamicValueToSend
          });
          handleClose()
  

          if (response?.status) {
            refetch();
            
          }
        } else {
          console.error('Missing required values for dynamic value insertion:', {
            dynamicColumnID,
            loginuserID,
            bugid,
            groupid,
          });
        }
      } catch (error) {
        console.error('Failed to insert dynamic value:', error);
      }
    } else {
      // For non-dynamic columns, update task status using SprintTaskUpdate API
      try {
        // Get taskID from row data
        const taskID = (row as any)?.taskID || (row as any)?.TaskID || (row as any)?.ID;
        const loginuserID = user?.id;

        // Get current task data from row to preserve existing values
        const currentTaskName = (row as any)?.Taskname || (row as any)?.taskname || (row as any)?.Name || '';
        const currentDescription = (row as any)?.Description || (row as any)?.description || '';
        const currentOwnerID = (row as any)?.OwnerID || (row as any)?.ownerID || (row as any)?.OwnerId || loginuserID;
        const currentEstimatedSP = (row as any)?.EstimatedSP || (row as any)?.estimatedSP || (row as any)?.EstimateSP || 0;
        const currentActualSP = (row as any)?.ActualSP || (row as any)?.actualSP || (row as any)?.ActualSpent || 0;
        const currentIsUnplan = (row as any)?.isunplan || (row as any)?.IsUnplan || false;
        const currentPriorityID = (row as any)?.PriorityID || (row as any)?.priorityID || undefined;

        // FIX #3: StatusID must be number | undefined (not null) to match SprintTaskUpdatePayload
        let statusIDToSend: number | undefined;
        if (item?.StatusID === 0 || item?.StatusID === null || item?.StatusID === undefined) {
          statusIDToSend = undefined; // Clear status
        } else {
          statusIDToSend = item?.StatusID;
        }

        // Only call SprintTaskUpdate if we have taskID
        if (taskID) {
          const response = await sprintTaskUpdate({
            TaskID: taskID,
            Taskname: currentTaskName,
            Description: currentDescription,
            OwnerID: currentOwnerID,
            EstimatedSP: currentEstimatedSP,
            ActualSP: currentActualSP,
            isunplan: currentIsUnplan,
            StatusID: statusIDToSend,
            PriorityID: currentPriorityID
          });
          
          if (response?.status) {
            // Refetch the status list to update the UI
            if (refetch) {
              await refetch();
            }
          }
        } else {
          console.error('Missing required values for SprintTaskUpdate:', {
            taskID
          });
        }

      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  }
  return (
    <Grid size={12}>
      <Box display={'flex'} alignItems={'stretch'} gap={2}>
        <Box
          component={MenuItem}
          key={item?.StatusID}
          borderRadius={1}
          color={generateTextColor(item?.Colorcode)}
          display={'flex'}
          gap={2}
          maxWidth={'100%'}
          flex={1}
          p={0}
          alignItems={'center'}
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const currentStatusId = (row as any)?.StatusID || 
                                   dynamicValue?.Status?.StatusID || 
                                   dynamicValue?.statusID
            
            if (currentStatusId != item?.StatusID) {
              await handleStatusChange();
              refetch();
            }

            handleClose();
          }}
        >
          <Avatar variant='rounded' sx={{ bgcolor: item?.Colorcode, width: 30, height: 30, p: 0 }}>
            {item?.TaskgroupID ? (
              <Icon
                icon={'material-symbols:table-chart-view-outline'}
                color={getContrastingTextColor(item?.Colorcode)}
                fontSize={16}
              />
            ) : (
              <Icon
                icon={generateStatusIcons(item?.Statusname)}
                color={getStatusIconColor(item?.Colorcode)}
                fontSize={getStatusIconSize(item?.Statusname)}
              />
            )}
          </Avatar>
          <Tooltip title={item?.Statusname || 'None'}>
            <Typography flex={1} textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>
              {item?.Statusname || 'None'}
            </Typography>
          </Tooltip>
        </Box>
        <Box display={'flex'} gap={0.5}>
          {/* {item?.StatusID !== 0 && (
            <IconButton 
              size='small' 
              className='p-1' 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (handleEdit) {
                  handleEdit(item);
                }
              }}
            >
              <Icon icon={'mdi:pencil-outline'} fontSize={11} />
            </IconButton>
          )} */}
          {!item?.IsDefault && item?.StatusID && item?.StatusID !== 0 && (
            <IconButton 
              size='small' 
              className='p-1' 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (handleDelete) {
                  await handleDelete(item, row);
                }
              }}
              color="error"
            >
              <Icon icon={'mdi:delete-outline'} fontSize={11} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Grid>
  )
}

interface TaskStatusProps {
  row: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  canEdit: boolean
  columnData?: AdditionalColumn
  dynamicValue?: any
  isSubTask?: boolean
  workspaceID?: number // ✅ NEW: WorkspaceID from route for GetBugStatusList API
  onStatusChange?: (bugId: string | number, newStatusId: number) => Promise<void> // Add this prop for BugList
}

type FormValidateType = { Statusname: string; Colorcode: string }

// Add Delete Confirmation Dialog Props
interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  statusName: string;
}

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, statusName }: DeleteConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Delete Status
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete the status "{statusName}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TaskStatus = ({ row, refetch, canEdit, dynamicValue, columnData, isSubTask = false, workspaceID, onStatusChange }: TaskStatusProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [formAnchor, setFormAnchor] = useState<any>(null)
  const [isEdit, setIsEdit] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [statusToDelete, setStatusToDelete] = useState<ProjectStatusList | null>(null)
  const { statusList = [] } = useWorkspace()
  const { user } = useAuth()
  const { selected } = useWorkspace()

  // ✅ FIXED: Use GetBugStatusList API with WorkspaceID from props
  const { data: dynamicStatus, refetch: refetchStatusList } = useQuery({
    queryKey: ['bug-status-list', selected?.WorkspaceID],
    queryFn: () => {
      if (selected?.WorkspaceID) {
        return fetchBugStatusList(selected?.WorkspaceID);
      }
      return Promise.resolve([]);
    },
    enabled: !!selected?.WorkspaceID && !!selected?.WorkspaceID, // Only run if workspaceID exists and is truthy
    select: (data) => {
      // Transform the API response to match ProjectStatusList format
      if (Array.isArray(data)) {
        return data.map((item: StatusLookupItem) => ({
          StatusID: item.statusID,
          Statusname: item.statusname,
          Colorcode: item.colorcode,
          // FIX #8 & #9: Cast to correct types expected by ProjectStatusList
          IsDefault: 0 as unknown as number,
          TaskgroupID: 0 as unknown as number
        }));
      }
      return [];
    }
  })
  

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({ defaultValues: { Statusname: '', Colorcode: '' } })

  const statusName = useMemo(() => {
    // For dynamic columns
    if (!!dynamicValue || !!columnData) {
      // If Status object exists with StatusName
      if (dynamicValue?.Status?.StatusName) {
        return dynamicValue.Status.StatusName
      }
      
      // If we have statusID, find from status lists
      if (dynamicValue?.statusID) {
        // Check in statusList (project statuses)
        const foundInStatusList = statusList.find((s: any) => s.StatusID === dynamicValue.statusID)
        if (foundInStatusList?.Statusname) {
          return foundInStatusList.Statusname
        }
        
        // Check in dynamicStatus (bug statuses)
        const foundInDynamicStatus = dynamicStatus?.find((s: any) => s.StatusID === dynamicValue.statusID)
        if (foundInDynamicStatus?.Statusname) {
          return foundInDynamicStatus.Statusname
        }
        
        // Check in dynamicStatusValueList
        if (dynamicValue?.dynamicStatusValueList) {
          const found = dynamicValue.dynamicStatusValueList.find((s: any) => s.statusID === dynamicValue.statusID)
          return found?.statustext || found?.Statusname
        }
      }
      
      // Fallback to direct properties
      return dynamicValue?.StatusName || null
    }
    
    // FIX #4: Cast row to any to access dynamic properties statusname/colorcode
    return row?.Status?.Statusname || (row as any)?.statusname || null
  }, [dynamicValue, columnData, statusList, dynamicStatus, row?.Status?.Statusname, (row as any)?.statusname])

  const colorCode = useMemo(() => {
    // For dynamic columns
    if (!!dynamicValue || !!columnData) {
      // If Status object exists with Colorcode
      if (dynamicValue?.Status?.Colorcode) {
        return dynamicValue.Status.Colorcode
      }
      
      // If we have statusID, find from status lists
      if (dynamicValue?.statusID) {
        // Check in statusList (project statuses)
        const foundInStatusList = statusList.find((s: any) => s.StatusID === dynamicValue.statusID)
        if (foundInStatusList?.Colorcode) {
          return foundInStatusList.Colorcode
        }
        
        // Check in dynamicStatus (bug statuses)
        const foundInDynamicStatus = dynamicStatus?.find((s: any) => s.StatusID === dynamicValue.statusID)
        if (foundInDynamicStatus?.Colorcode) {
          return foundInDynamicStatus.Colorcode
        }
        
        // Check in dynamicStatusValueList
        if (dynamicValue?.dynamicStatusValueList) {
          const found = dynamicValue.dynamicStatusValueList.find((s: any) => s.statusID === dynamicValue.statusID)
          return found?.colorcode || found?.Colorcode
        }
      }
      
      // If we have colorCode directly in dynamicValue
      if (dynamicValue?.colorCode) {
        return dynamicValue.colorCode
      }
      
      // If we have Colorcode directly
      if (dynamicValue?.Colorcode) {
        return dynamicValue.Colorcode
      }
      
      return null
    }
    
    // FIX #4: Cast row to any for colorcode access
    return row?.Status?.Colorcode || (row as any)?.colorcode || null
  }, [dynamicValue, columnData, statusList, dynamicStatus, row?.Status?.Colorcode, (row as any)?.colorcode])

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    canEdit && setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsEdit(null)
  }

  const handleFormClose = () => {
    setAnchorEl(null)
    setFormAnchor(null)
    reset({ Statusname: '', Colorcode: '' })
    setIsEdit(null)
  }

  const checkChangeInHexValue = (value: string) => {
    if (value === '' || (value?.startsWith('#') && (pattern.hexAllowed?.test(value?.slice(1)) || value?.length <= 1))) {
      return true
    }

    return false
  }

  // FIX #10: Accept optional item parameter to match StatusMenuItemProps handleEdit type
  const handleEdit = (item?: ProjectStatusList) => {
    if (!item) return;
    setIsEdit(item?.StatusID?.toString())
    reset({ Statusname: item?.Statusname, Colorcode: item?.Colorcode })
    setFormAnchor(anchorEl)
    setAnchorEl(null)
  }

  // FIX #10: Accept optional item parameter to match StatusMenuItemProps handleDelete type
  const handleDeleteClick = (item?: ProjectStatusList, _row?: any) => {
    if (!item?.StatusID || item.StatusID === 0) return;
    setStatusToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!statusToDelete?.StatusID) return;
    
    try {
      // FIX #5: Pass workspaceID (third argument) to deleteStatus
      const response = await deleteStatus(
        { StatusID: statusToDelete.StatusID },
        row,
        selected?.WorkspaceID || 0
      );
      // if (response?.status) {
        // toast.success('Status Deleted Successfully');
        refetchStatusList();
        refetch();
        handleFormClose();
      // }
    } catch (error) {
      console.error('Failed to delete status:', error);
    } finally {
      setDeleteDialogOpen(false);
      setStatusToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStatusToDelete(null);
  };

  const onSubmit = async (data: FormValidateType) => {
    if (isEdit) {
      // Get TaskID and GroupID from row data
      const taskID = (row as any)?.taskID || (row as any)?.TaskID;
      const groupID = (row as any)?.taskGroupID || (row as any)?.TaskGroupID;
      
      // FIX #6: Added LoginuserID which is required by UpdateStatusPayload
      const response = await updateStatus({
        StatusID: parseInt(isEdit),
        TaskID: taskID,
        LoginuserID: user?.id || 0,
        GroupID: groupID,
        Statusname: data.Statusname,
        Colorcode: data.Colorcode
      });

      // if (response?.status) {
        refetchStatusList()
        refetch()
        reset({ Statusname: '', Colorcode: '' })
        handleFormClose()
      // }
    } else {
      // FIXED: Use createTaskStatus with taskID and groupID from row data
      const taskID = (row as any)?.taskID || (row as any)?.TaskID
      const groupID = (row as any)?.taskGroupID || (row as any)?.TaskGroupID
      // FIX #7: Provide fallback 0 so LoginuserID is number (not number | undefined)
      const loginuserID: number = user?.id || 0

      const response = await createTaskStatus({
        Statusname: data.Statusname,
        TaskID: taskID,
        LoginuserID: loginuserID,
        GroupID: groupID,
        Colorcode: data.Colorcode
      }, selected?.WorkspaceID || 0);
      
      refetchStatusList()
      refetch()
      reset({ Statusname: '', Colorcode: '' })
      handleFormClose()
      setFormAnchor(null)
      setAnchorEl(null)
    }
  }

  const allStatusOptions = useMemo(() => {
     const noneOption: ProjectStatusList = {
          StatusID: 0, // Use 0 to represent null/empty
          Statusname: 'None',
          Colorcode: '#E0E0E0', // Light gray color
          IsDefault: 0,
          CreateDate:"", CreatedBy:0, IsDelete:0,
          TaskgroupID: 0
        }
    
    return [noneOption, ...(statusList || [])]
  }, [statusList])

  // Get bug ID from row for BugList
  const bugId = (row as any)?.BugID || (row as any)?.bugID;

  return (
    <Box display={'flex'} alignItems={'center'} height={'100%'}>
      <Box
        component={'button'}
        className='flex items-center justify-center max-w-32 px-1 border border-divider h-[60%] rounded-md'
        bgcolor={colorCode || '#E0E0E0'}
        color={colorCode ? getContrastingTextColor(colorCode) : '#000000'}
        onClick={handleOpen}
        sx={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
      >
        <Tooltip title={statusName || 'None'}>
          <Typography
            fontSize={'0.85rem'}
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow={'hidden'}
            color={'inherit'}
            className='text-inherit'
          >
            {statusName ?? 'None'}
          </Typography>
        </Tooltip>
      </Box>
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        TransitionComponent={Zoom}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        sx={{ '& .MuiList-root': { p: 0 } }}
      >
        <Box maxWidth={'400px'} p={4}>
          <Grid container spacing={3}>
            <Grid size={6}>
              <Box pb={2}>
                <Typography fontWeight={700} fontSize={14}>
                  ESSENTIALS
                </Typography>
                <Typography variant='subtitle2' fontSize={12}>
                  Add or edit labels
                </Typography>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <Typography fontWeight={700} fontSize={14} textTransform={'uppercase'}>
                  Your Labels
                </Typography>
              </Box>
            </Grid>
            <Grid size={6}>
              <Grid
                container
                spacing={4}
                maxHeight={'200px'}
                pr={1}
                sx={{
                  overflowY: 'auto',
                  whiteSpace: 'nowrap',
                  paddingBottom: 1,
                  '&::-webkit-scrollbar': {
                    width: '5px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '2px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555'
                  }
                }}
              >
                {allStatusOptions?.map((item :any) => (
                  <StatusMenuItem
                    item={item}
                    row={row}
                    key={item?.StatusID}
                    handleClose={handleClose}
                    refetch={refetch}
                    dynamicValue={dynamicValue}
                    columnData={columnData}
                    isSubTask={isSubTask}
                    handleEdit={handleEdit}
                    handleDelete={handleDeleteClick}
                    onStatusChangeFromParent={onStatusChange}
                    isBugList={!!onStatusChange}
                    bugId={bugId}
                  />
                ))}
              </Grid>
            </Grid>
            <Grid size={6}>
              <Grid container spacing={4} maxHeight={'200px'} sx={{ overflowY: 'auto' }}>
                <Grid size={12}>
                  <Box
                    className='rounded-md flex gap-2 p-0 items-center'
                    component={MenuItem}
                    onClick={() => {
                      setFormAnchor(anchorEl)
                      setAnchorEl(null)
                    }}
                  >
                    <Avatar variant='rounded' sx={{ width: 30, height: 30, p: 0 }}>
                      <i className='ri-add-box-line' />
                    </Avatar>

                    <Typography textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>
                      {'New Label'}
                    </Typography>
                  </Box>
                </Grid>
                {dynamicStatus?.map((item:any) => (
                  <StatusMenuItem
                    item={item}
                    row={row}
                    key={item?.StatusID}
                    handleClose={handleClose}
                    refetch={refetch}
                    handleEdit={() => handleEdit(item)}
                    handleDelete={handleDeleteClick}
                    dynamicValue={dynamicValue}
                    columnData={columnData}
                    isSubTask={isSubTask}
                    onStatusChangeFromParent={onStatusChange}
                    isBugList={!!onStatusChange}
                    bugId={bugId}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Menu>

      <Menu
        open={!!formAnchor}
        anchorEl={formAnchor}
        onClose={handleFormClose}
        TransitionComponent={Zoom}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        sx={{ '& .MuiList-root': { p: 0 } }}
      >
        <Box maxWidth={'300px'} width={'100%'} p={4}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Controller
                  name='Statusname'
                  rules={{
                    required: 'Please enter a name for the label'
                  }}
                  control={control}
                  render={({ field, formState: { errors } }) => (
                    <TextField
                      {...field}
                      variant={'outlined'}
                      error={!!errors?.Statusname}
                      helperText={!!errors?.Statusname && errors?.Statusname?.message}
                      placeholder='eg. Status name'
                      InputProps={{
                        startAdornment: (
                          <Icon
                            icon={'material-symbols:table-chart-view-outline'}
                            fontSize={28}
                            style={{ marginRight: 12 }}
                          />
                        )
                      }}
                      inputProps={{ maxLength: 50 }}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name='Colorcode'
                  rules={{
                    required: 'Please enter a color for field',
                    pattern: { value: pattern.hexValidate, message: 'Please enter a valid hex code' }
                  }}
                  control={control}
                  render={({ field, formState: { errors } }) => (
                    <TextField
                      {...field}
                      variant={'outlined'}
                      fullWidth
                      onChange={e => {
                        const colorValue = e?.target?.value

                        if (checkChangeInHexValue(colorValue)) {
                          field?.onChange(colorValue)
                        }
                      }}
                      error={!!errors?.Colorcode}
                      helperText={!!errors?.Colorcode && errors?.Colorcode?.message}
                      inputProps={{ maxLength: 7 }}
                      placeholder='eg. #hhhhhh'
                      InputProps={{ startAdornment: <input {...field} type='color' className='color-input' /> }}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Box display={'flex'} width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                  <CustomButton size='small' variant='outlined' circular onClick={handleFormClose}>
                    Close
                  </CustomButton>
                  <CustomButton
                    size='small'
                    variant='contained'
                    circular
                    type='submit'
                    disabled={isSubmitting || !isDirty}
                  >
                    Save
                  </CustomButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        statusName={statusToDelete?.Statusname || ''}
      />
    </Box>
  )
}

export default TaskStatus