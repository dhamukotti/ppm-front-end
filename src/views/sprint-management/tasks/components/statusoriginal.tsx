import React, { useMemo, useState } from 'react'

import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, Zoom, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'

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
interface InsertDynamicValuePayload {
  DynamicColumnID: number;
  LoginuserID: number;
  SprintID: number;
  SprintGroupID: number;
  DynamicValue: string | number | null;
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
// FIX (TS2345 @ ~line 732): LoginuserID widened to `number | undefined`
// because `user?.id` can be undefined and is now passed into this payload.
interface UpdateStatusPayload {
  StatusID: number;
  TaskID: number;
  LoginuserID: number | undefined;
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
// FIX (TS2322 @ ~line 755): LoginuserID widened to `number | undefined`
// because `loginuserID = user?.id` can be undefined.
interface CreateTaskStatusPayload {
  Statusname: string;
  TaskID: number;
  LoginuserID: number | undefined;
  GroupID: number;
  Colorcode: string;
}

interface CreateTaskStatusResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add SprintTaskUpdate interface for status updates
// FIX (TS2322 @ ~line 408): StatusID widened to `number | null | undefined`
// because the code explicitly sends `null` to clear the status.
interface SprintTaskUpdatePayload {
  TaskID: number;
  Taskname?: string;
  Description?: string;
  OwnerID?: number;
  EstimatedSP?: number;
  ActualSP?: number;
  isunplan?: boolean;
  StatusID?: number | null;
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

// Add function to fetch status lookup list with taskID and groupID
const fetchStatusLookupList = async (taskID: number, groupID: number, loginuserID: number): Promise<StatusLookupItem[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskGetStatusList?TaskID=${taskID}&GroupID=${groupID}&LoginuserID=${loginuserID}`,
    )

    return response.data;
  } catch (error) {
    console.error('Error fetching status lookup list:', error);
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
    const taskid = payload.SprintID;
    const SprintGroupID = payload.SprintGroupID;
    const DynamicValue = payload.DynamicValue?.toString() || '';
    
    const apiUrl = `${BASE_URL}/InsertDynamicSprintTaskValues?DynamicColumnID=${DynamicColumnID}&LoginuserID=${LoginuserID}&TaskID=${taskid}&GroupID=${SprintGroupID}&DynamicValue=${encodeURIComponent(DynamicValue)}`;

    const response = await axios.post(apiUrl);
    toast.success('Value updated successfully');
      
    return { status: true, data: response.data };
  } catch (error) {
    console.error('API call failed:', error);
    toast.error('Failed to update value');
    throw error;
  }
}

// FIXED: Simplified the createStatus function to avoid double encoding
const createStatus = async (payload: CreateStatusPayload): Promise<CreateStatusResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintCreateStatusLookup`,
      null,
      {
        params: {
          Statusname: payload.Statusname,
          Colorcode: payload.Colorcode
        }
      }
    );   
    toast.success("Status Created Successfully")
    return response.data;
  } catch (error) {
    console.error('Error creating status:', error);
    throw error;
  }
}

// Add create task status function
const createTaskStatus = async (payload: CreateTaskStatusPayload): Promise<CreateTaskStatusResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskStatusCreate`,
      null,
      {
        params: {
          Statusname: payload.Statusname,
          TaskID: payload.TaskID,
          LoginuserID: payload.LoginuserID,
          GroupID: payload.GroupID,
          Colorcode: payload.Colorcode
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
const deleteStatus = async (payload: DeleteStatusPayload, row: any): Promise<DeleteStatusResponse> => {
  try {
    // Get TaskID and GroupID from the row data
    const taskID = row?.taskID || row?.TaskID;
    const groupID = row?.taskGroupID || row?.TaskGroupID;
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskStatusRemove?TaskID=${taskID}&StatusID=${payload.StatusID}&GroupID=${groupID}`,
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
  handleEdit?: (item?: ProjectStatusList) => void
  handleDelete?: (item?: ProjectStatusList, row?: any) => void
  refetch: () => void
  columnData?: AdditionalColumn
  dynamicValue?: any
  isSubTask: boolean
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
  isSubTask
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
    // Check if we're dealing with a dynamic column
    if (!!dynamicValue || !!columnData) {
      try {
        const dynamicColumnID = columnData?.additionalColumnID;
        const loginuserID = user?.id;

        // ✅ FIXED: Use taskID and taskGroupID (same as non-dynamic branch)
        const taskID = (row as any)?.taskID || (row as any)?.TaskID;
        const groupID = (row as any)?.taskGroupID || (row as any)?.TaskGroupID;

        let dynamicValueToSend;

        if (item?.StatusID === 0 || item?.StatusID === null || item?.StatusID === undefined) {
          dynamicValueToSend = '';
        } else {
          dynamicValueToSend = item?.StatusID?.toString();
        }

        if (dynamicColumnID && loginuserID && taskID && groupID) {
          const response = await insertDynamicValue({
            DynamicColumnID: dynamicColumnID,
            LoginuserID: loginuserID,
            SprintID: taskID,        // ✅ FIXED: was row.SprintID
            SprintGroupID: groupID,  // ✅ FIXED: was row.SprintGroupID
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
            taskID,
            groupID
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
        const currentPriorityID = (row as any)?.PriorityID || (row as any)?.priorityID || null;

        // Determine status ID to send
        let statusIDToSend;
        if (item?.StatusID === 0 || item?.StatusID === null || item?.StatusID === undefined) {
          statusIDToSend = null; // Clear status
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
            
            const currentStatusId = row?.StatusID || 
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
          {item?.StatusID !== 0 && (
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
          )}
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

const TaskStatus = ({ row, refetch, canEdit, dynamicValue, columnData, isSubTask = false }: TaskStatusProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [formAnchor, setFormAnchor] = useState<any>(null)
  const [isEdit, setIsEdit] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [statusToDelete, setStatusToDelete] = useState<ProjectStatusList | null>(null)
  const { statusList = [] } = useWorkspace()
  const { user } = useAuth()

  // Update the useQuery to use the new API with taskID and groupID from row
  // FIX (TS2551 @ ~577, 579, 580, 588): `row` is typed as
  // `TaskListItemType | AdditionalSubTaskListItem`, neither of which declares
  // lowercase `taskID` / `taskGroupID` (only `TaskID` / `TaskGroupID`).
  // Cast to `any` before reading the lowercase variants, same pattern already
  // used elsewhere in this file (e.g. inside StatusMenuItem).
  const { data: dynamicStatus, refetch: refetchStatusList } = useQuery({
    queryKey: ['status-lookup-list', (row as any)?.taskID, (row as any)?.taskGroupID, user?.id],
    queryFn: () => {
      const taskID = (row as any)?.taskID || (row as any)?.TaskID;
      const groupID = (row as any)?.taskGroupID || (row as any)?.TaskGroupID;
      const loginuserID = user?.id;
      
      if (taskID && groupID && loginuserID) {
        return fetchStatusLookupList(taskID, groupID, loginuserID);
      }
      return Promise.resolve([]);
    },
    enabled: !!(row as any)?.taskID || !!(row as any)?.TaskID,
    select: (data) => {
      // Transform the API response to match ProjectStatusList format
      // FIX (TS2739/TS2345 @ ~895, 900): ProjectStatusList also requires
      // CreateDate, CreatedBy, IsDelete — added below with safe defaults so
      // the mapped shape satisfies the type used by StatusMenuItem / state.
      return data.map((item: StatusLookupItem) => ({
        StatusID: item.statusID,
        Statusname: item.statusname,
        Colorcode: item.colorcode,
        IsDefault: false,
        TaskgroupID: null,
        CreateDate: new Date().toISOString(),
        CreatedBy: 0,
        IsDelete: 0
      }));
    }
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({ defaultValues: { Statusname: '', Colorcode: '' } })

  const statusName = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      if (dynamicValue?.Status?.Statusname) {
        return dynamicValue.Status.Statusname
      }
      if (dynamicValue?.statusID && dynamicValue?.dynamicStatusValueList) {
        const foundStatus = dynamicValue.dynamicStatusValueList.find(
          (s: any) => s.statusID === dynamicValue.statusID
        )
        return foundStatus?.statustext
      }
      return null
    }

    return row?.Status?.Statusname
  }, [columnData, dynamicValue, row?.Status?.Statusname])

  const colorCode = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      if (dynamicValue?.Status?.Colorcode) {
        return dynamicValue.Status.Colorcode
      }
      
      if (dynamicValue?.statusID) {
        if (statusList.length > 0) {
          const foundStatus = statusList.find(
            (s: any) => s.StatusID === dynamicValue.statusID
          );
          if (foundStatus?.Colorcode) {
            return foundStatus.Colorcode;
          }
        }
        
        if (dynamicStatus && dynamicStatus.length > 0) {
          const foundDynamicStatus = dynamicStatus.find(
            (s: any) => s.StatusID === dynamicValue.statusID
          );
          if (foundDynamicStatus?.Colorcode) {
            return foundDynamicStatus.Colorcode;
          }
        }
      }
      
      if (dynamicValue?.statusID && dynamicValue?.dynamicStatusValueList && statusList.length > 0) {
        const statusId = dynamicValue.statusID;
        const foundStatus = statusList.find(
          (s: any) => s.StatusID === statusId
        );
        return foundStatus?.Colorcode;
      }
      
      return null;
    }

    return row?.Status?.Colorcode
  }, [columnData, dynamicValue, row?.Status?.Colorcode, statusList, dynamicStatus])

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

  // FIX (TS2322 @ ~867): `item` made optional (`item?: ProjectStatusList`) so
  // this matches `StatusMenuItemProps.handleEdit`'s signature exactly.
  // Guard added so behavior is unchanged when item is actually provided.
  const handleEdit = (item?: ProjectStatusList) => {
    if (!item) return;
    setIsEdit(item?.StatusID?.toString())
    reset({ Statusname: item?.Statusname, Colorcode: item?.Colorcode })
    setFormAnchor(anchorEl)
    setAnchorEl(null)
  }

  // FIX (TS2322 @ ~868, 901): `item` made optional (`item?: ProjectStatusList`)
  // so this matches `StatusMenuItemProps.handleDelete`'s signature exactly.
  const handleDeleteClick = (item?: ProjectStatusList) => {
    if (!item?.StatusID || item.StatusID === 0) return;
    setStatusToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!statusToDelete?.StatusID) return;
    
    try {
      const response = await deleteStatus({ StatusID: statusToDelete.StatusID }, row);
     // if (response?.status) {
       // toast.success('Status Deleted Successfully');
        refetchStatusList();
        refetch();
        handleFormClose();
   //   }
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
    // FIX (TS2551 @ ~729, 730): cast to `any` before reading lowercase
    // `taskID` / `taskGroupID`, same as elsewhere in this file.
    const taskID = (row as any)?.taskID || (row as any)?.TaskID;
    const groupID = (row as any)?.taskGroupID || (row as any)?.TaskGroupID;
    // FIX (TS2345 @ ~732-738): UpdateStatusPayload requires LoginuserID —
    // it was missing from this call. Added below.
    const loginuserID = user?.id;
    
    const response = await updateStatus({
      StatusID: parseInt(isEdit),
      TaskID: taskID,      // Add this
      LoginuserID: loginuserID,
      GroupID: groupID,    // Add this
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
    const loginuserID = user?.id

    const response = await createTaskStatus({
      Statusname: data.Statusname,
      TaskID: taskID,
      LoginuserID: loginuserID,
      GroupID: groupID,
      Colorcode: data.Colorcode
    });
    
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
         StatusID: 0,
         Statusname: 'None',
         Colorcode: '#E0E0E0',
         IsDefault: 0,
         TaskgroupID: 0,
         CreateDate: new Date().toISOString(),
         CreatedBy: 0,
         IsDelete: 0
       }
    
    return [noneOption, ...(statusList || [])]
  }, [statusList])

  return (
    <Box display={'flex'} alignItems={'center'} height={'100%'}>
      <Box
        component={'button'}
        className='flex items-center justify-center max-w-32 px-1 border border-divider h-[60%] rounded-md'
        bgcolor={colorCode}
        color={colorCode && getContrastingTextColor(colorCode)}
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
                {allStatusOptions?.map(item => (
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
                {dynamicStatus?.map((item: any) => (
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
