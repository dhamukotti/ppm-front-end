import React, { useMemo, useState } from 'react'

import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, Zoom, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'

import { useQuery } from '@tanstack/react-query'

import {
  getContrastingTextColor,
  getHexColor,
  getLuminance
} from 'src/utils/functions'

import { pattern } from '@/constants/patterns'
import type { TaskListItemType } from '@/services/modules/task/types'
import type { AdditionalColumn } from '@/services/modules/project/types'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
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

interface CreatePriorityPayload {
  Priorityname: string;
  Colorcode: string;
}

interface CreatePriorityResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Update UpdatePriorityPayload interface to include IsDelete
interface UpdatePriorityPayload {
  PriorityID: number;
  GroupID: number;
  Priorityname: string;
  LoginuserID: number | undefined;
  IsDelete: boolean;
  Colorcode: string;
}

interface UpdatePriorityResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add Create Task Priority interface
interface CreateTaskPriorityPayload {
  Priorityname: string;
  TaskID: number;
  LoginuserID: number | undefined;
  GroupID: number;
  Colorcode: string;
}

interface CreateTaskPriorityResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Add SprintTaskUpdate interface
interface SprintTaskUpdatePayload {
  TaskID: number;
  Taskname?: string;
  Description?: string;
  OwnerID?: number;
  EstimatedSP?: number;
  ActualSP?: number;
  isunplan?: boolean;
  StatusID?: number;
  PriorityID?: number | null;
}

interface SprintTaskUpdateResponse {
  status: boolean;
  message?: string;
  data?: any;
}

// Update interface for priority lookup response
interface PriorityLookupItem {
  priorityID: number;
  priorityname: string;
  colorcode: string;
}

// Helper function to extract task ID from row
const getTaskIdFromRow = (row: any): number => {
  return row?.taskID || row?.TaskID || row?.ID || 0;
}

// Helper function to extract group ID from row
const getGroupIdFromRow = (row: any): number => {
  return row?.taskGroupID || row?.TaskGroupID || row?.GroupID || 0;
}

// Add function to fetch priority lookup list with taskID and groupID
const fetchPriorityLookupList = async (taskID: number, groupID: number, loginuserID: number): Promise<PriorityLookupItem[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskGetPriorityList?TaskID=${taskID}&GroupID=${groupID}&LoginuserID=${loginuserID}`,
    )

    return response.data;
  } catch (error) {
    console.error('Error fetching priority lookup list:', error);
    throw error;
  }
}

// Insert dynamic value function
const insertDynamicValue = async (payload: InsertDynamicValuePayload): Promise<InsertDynamicValueResponse> => {
  try {
    const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL1}`;
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

// SprintTaskUpdate function
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
    toast.success('Priority updated successfully');
      
    return { status: true, data: response.data };
  } catch (error) {
    console.error('API call failed:', error);
    toast.error('Failed to update priority');
    throw error;
  }
}

// Create priority function
const createPriority = async (payload: CreatePriorityPayload): Promise<CreatePriorityResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskCreatePriority`,
      null,
      {
        params: {
          Priorityname: payload.Priorityname,
          Colorcode: payload.Colorcode
        }
      }
    );   
    toast.success("Priority Created Successfully")
    return response.data;
  } catch (error) {
    console.error('Error creating priority:', error);
    throw error;
  }
}

// Create task priority function
const createTaskPriority = async (payload: CreateTaskPriorityPayload): Promise<CreateTaskPriorityResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskCreatePriority`,
      null,
      {
        params: {
          GroupID: payload.GroupID,
          Priorityname: payload.Priorityname,
          LoginuserID: payload.LoginuserID,
          Colorcode: payload.Colorcode
        }
      }
    );
    
    toast.success("Task Priority Created Successfully");
    return response.data;
  } catch (error) {
    console.error('Error creating task priority:', error);
    toast.error('Failed to create task priority');
    throw error;
  }
}

// Update priority function - using the correct API endpoint
const updatePriority = async (payload: UpdatePriorityPayload): Promise<UpdatePriorityResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskUpdatePriority`,
      null,
      {
        params: {
          PriorityID: payload.PriorityID,
          GroupID: payload.GroupID,
          Priorityname: payload.Priorityname,
          LoginuserID: payload.LoginuserID,
          IsDelete: payload.IsDelete,
          Colorcode: payload.Colorcode
        }
      }
    );   
    
    if (payload.IsDelete) {
      toast.success("Priority Deleted Successfully");
    } else {
      toast.success("Priority Updated Successfully");
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating priority:', error);
    if (payload.IsDelete) {
      toast.error('Failed to delete priority');
    } else {
      toast.error('Failed to update priority');
    }
    throw error;
  }
}

interface PriorityMenuItemProps {
  item: ProjectPriorityList
  row: SprintItem | AdditionalSubTaskListItem | TaskListItemType
  handleClose: () => void
  handleEdit?: (item?: ProjectPriorityList) => void
  handleDelete?: (item?: ProjectPriorityList, row?: any) => void
  refetch: () => void
  columnData?: AdditionalColumn
  dynamicValue?: any
  isSubTask: boolean
}

// Add ProjectPriorityList interface
interface ProjectPriorityList {
  PriorityID: number;
  PriorityName: string;
  Colorcode: string;
  IsDefault?: boolean;
  TaskgroupID?: number | null;
}

const PriorityMenuItem = ({
  item,
  row,
  handleClose,
  handleEdit,
  handleDelete,
  refetch,
  columnData,
  dynamicValue,
  isSubTask
}: PriorityMenuItemProps) => {
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

  const handlePriorityChange = async () => {
    // Check if we're dealing with a dynamic column
    if (!!dynamicValue || !!columnData) {
      try {
        const dynamicColumnID = columnData?.additionalColumnID;
        const loginuserID = user?.id;

        const taskID = getTaskIdFromRow(row);
        const groupID = getGroupIdFromRow(row);

        let dynamicValueToSend;

        if (item?.PriorityID === 0 || item?.PriorityID === null || item?.PriorityID === undefined) {
          dynamicValueToSend = '';
        } else {
          dynamicValueToSend = item?.PriorityID?.toString();
        }

        if (dynamicColumnID && loginuserID && taskID && groupID) {
          const response = await insertDynamicValue({
            DynamicColumnID: dynamicColumnID,
            LoginuserID: loginuserID,
            SprintID: taskID,
            SprintGroupID: groupID,
            DynamicValue: dynamicValueToSend
          });
          handleClose()

          // if (response?.status) {
        //  }
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
      // For non-dynamic columns, update task priority using SprintTaskUpdate API
      try {
        const taskID = getTaskIdFromRow(row);
        const loginuserID = user?.id;

        // Get current task data from row to preserve existing values
        const currentTaskName = (row as any)?.Taskname || (row as any)?.taskname || (row as any)?.Name || '';
        const currentDescription = (row as any)?.Description || (row as any)?.description || '';
        const currentOwnerID = (row as any)?.OwnerID || (row as any)?.ownerID || (row as any)?.OwnerId || loginuserID;
        const currentEstimatedSP = (row as any)?.EstimatedSP || (row as any)?.estimatedSP || (row as any)?.EstimateSP || 0;
        const currentActualSP = (row as any)?.ActualSP || (row as any)?.actualSP || (row as any)?.ActualSpent || 0;
        const currentIsUnplan = (row as any)?.isunplan || (row as any)?.IsUnplan || false;
        const currentStatusID = (row as any)?.StatusID || (row as any)?.statusID || (row as any)?.StatusId || 1;

        // Determine priority ID to send
        let priorityIDToSend;
        if (item?.PriorityID === 0 || item?.PriorityID === null || item?.PriorityID === undefined) {
          priorityIDToSend = null; // Clear priority
        } else {
          priorityIDToSend = item?.PriorityID;
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
            StatusID: currentStatusID,
            PriorityID: priorityIDToSend
          });
          
          if (response?.status) {
            // Refetch the priority list to update the UI
            // if (refetch) {
            //   await refetch();
            // }
          }
        } else {
          console.error('Missing required values for SprintTaskUpdate:', {
            taskID
          });
        }

      } catch (error) {
        console.error('Failed to update task priority:', error);
      }
    }
  }

  
  return (
    <Grid size={12}>
      <Box display={'flex'} alignItems={'stretch'} gap={2}>
        <Box
          component={MenuItem}
          key={item?.PriorityID}
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
            
            const currentPriorityId = (row as any)?.PriorityID || 
                                     dynamicValue?.Priority?.PriorityID || 
                                     dynamicValue?.priorityID
            
            if (currentPriorityId != item?.PriorityID) {
              await handlePriorityChange();
            }

            handleClose();
          }}
        >
          {/* FIXED: Color box with proper styling - no icon, just color */}
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              backgroundColor: item?.Colorcode || '#E0E0E0',
              flexShrink: 0,
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          />
          <Tooltip title={item?.PriorityName || 'None'}>
            <Typography flex={1} textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>
              {item?.PriorityName || 'None'}
            </Typography>
          </Tooltip>
        </Box>
        <Box display={'flex'} gap={0.5}>
          {item?.PriorityID !== 0 && (
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
          {!item?.IsDefault && item?.PriorityID && item?.PriorityID !== 0 && (
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

interface TaskPriorityProps {
  row: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  canEdit: boolean
  columnData?: AdditionalColumn
  dynamicValue?: any
  isSubTask?: boolean
  sprintTaskInfoApi?: any
  setColvalueList?: any
  updateSprintTask?: any
}

type FormValidateType = { PriorityName: string; Colorcode: string }

// Delete Confirmation Dialog Props
interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  priorityName: string;
}

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, priorityName }: DeleteConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Delete Priority
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete the priority "{priorityName}"? This action cannot be undone.
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

const TaskPriority = ({ row, refetch, canEdit, dynamicValue, columnData, isSubTask = false, sprintTaskInfoApi, setColvalueList, updateSprintTask }: TaskPriorityProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [formAnchor, setFormAnchor] = useState<any>(null)
  const [isEdit, setIsEdit] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [priorityToDelete, setPriorityToDelete] = useState<ProjectPriorityList | null>(null)
  const { priorityList = [] } = useWorkspace()
  const { user } = useAuth()

  // Fetch priority lookup list with taskID and groupID from row
  const { data: dynamicPriority, refetch: refetchPriorityList } = useQuery({
    queryKey: ['priority-lookup-list', getTaskIdFromRow(row), getGroupIdFromRow(row), user?.id],
    queryFn: () => {
      const taskID = getTaskIdFromRow(row);
      const groupID = getGroupIdFromRow(row);
      const loginuserID = user?.id;
      
      if (taskID && groupID && loginuserID) {
        return fetchPriorityLookupList(taskID, groupID, loginuserID);
      }
      return Promise.resolve([]);
    },
    enabled: !!(getTaskIdFromRow(row)) && canEdit,
    select: (data) => {
      // Transform the API response to match ProjectPriorityList format
      return data.map((item: PriorityLookupItem) => ({
        PriorityID: item.priorityID,
        PriorityName: item.priorityname,
        Colorcode: item.colorcode,
        IsDefault: false,
        TaskgroupID: null
      }));
    }
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({ defaultValues: { PriorityName: '', Colorcode: '' } })

  // FIXED: priorityName now also reads flat priorityname field from row (API returns priorityname lowercase)
  const priorityName = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      if (dynamicValue?.Priority?.PriorityName) {
        return dynamicValue.Priority.PriorityName
      }
      if (dynamicValue?.priorityID && dynamicValue?.dynamicPriorityValueList) {
        const foundPriority = dynamicValue.dynamicPriorityValueList.find(
          (s: any) => s.priorityID === dynamicValue.priorityID
        )
        return foundPriority?.prioritytext
      }
      return null
    }

    // Check nested Priority object first, then fall back to flat priorityname field
    return (row as any)?.Priority?.PriorityName || (row as any)?.priorityname || null
  }, [columnData, dynamicValue, (row as any)?.Priority?.PriorityName, (row as any)?.priorityname])

  // FIXED: colorCode now also reads flat colorcode field and looks up by PriorityID from row
  const colorCode = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      if (dynamicValue?.Priority?.Colorcode) {
        return dynamicValue.Priority.Colorcode
      }
      
      if (dynamicValue?.priorityID) {
        if (priorityList.length > 0) {
          const foundPriority = priorityList.find(
            (s: any) => s.PriorityID === dynamicValue.priorityID
          );
          if (foundPriority?.Colorcode) {
            return foundPriority.Colorcode;
          }
        }
        
        if (dynamicPriority && dynamicPriority.length > 0) {
          const foundDynamicPriority = dynamicPriority.find(
            (s: any) => s.PriorityID === dynamicValue.priorityID
          );
          if (foundDynamicPriority?.Colorcode) {
            return foundDynamicPriority.Colorcode;
          }
        }
      }
      
      if (dynamicValue?.priorityID && dynamicValue?.dynamicPriorityValueList && priorityList.length > 0) {
        const priorityId = dynamicValue.priorityID;
        const foundPriority = priorityList.find(
          (s: any) => s.PriorityID === priorityId
        );
        return foundPriority?.Colorcode;
      }
      
      return null;
    }

    // Check nested Priority object first, then flat colorcode field
    const directColorcode = (row as any)?.Priority?.Colorcode || (row as any)?.colorcode
    if (directColorcode) return directColorcode

    // Fall back to looking up by PriorityID in priorityList
    const rowPriorityID = (row as any)?.PriorityID || (row as any)?.priorityID
    if (rowPriorityID && priorityList.length > 0) {
      const found = priorityList.find((s: any) => s.PriorityID === rowPriorityID)
      if (found?.Colorcode) return found.Colorcode
    }

    // Fall back to looking up by PriorityID in dynamicPriority list
    if (rowPriorityID && dynamicPriority && dynamicPriority.length > 0) {
      const found = dynamicPriority.find((s: any) => s.PriorityID === rowPriorityID)
      if (found?.Colorcode) return found.Colorcode
    }

    return null
  }, [columnData, dynamicValue, (row as any)?.Priority?.Colorcode, (row as any)?.colorcode, (row as any)?.PriorityID, (row as any)?.priorityID, priorityList, dynamicPriority])

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canEdit) {
      setAnchorEl(e.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsEdit(null)
  }

  const handleFormClose = () => {
    setFormAnchor(null)
    reset({ PriorityName: '', Colorcode: '' })
    setIsEdit(null)
  }

  const checkChangeInHexValue = (value: string) => {
    if (value === '' || (value?.startsWith('#') && (pattern.hexAllowed?.test(value?.slice(1)) || value?.length <= 1))) {
      return true
    }

    return false
  }

  const handleEdit = (item: ProjectPriorityList) => {
    setIsEdit(item?.PriorityID?.toString())
    reset({ PriorityName: item?.PriorityName, Colorcode: item?.Colorcode })
    setFormAnchor(anchorEl)
    setAnchorEl(null)
  }

  const handleDeleteClick = (item?: ProjectPriorityList, row?: any) => {
    if (!item?.PriorityID || item.PriorityID === 0) return;
    setPriorityToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!priorityToDelete?.PriorityID) return;
    
    try {
      // Get GroupID from row data using helper function
      const groupID = getGroupIdFromRow(row);
      const loginuserID = user?.id;
      
      // Use updatePriority with IsDelete=true for deletion
      const response = await updatePriority({
        PriorityID: priorityToDelete.PriorityID,
        GroupID: groupID,
        Priorityname: priorityToDelete.PriorityName,
        LoginuserID: loginuserID,
        IsDelete: true, // Set to true for deletion
        Colorcode: priorityToDelete.Colorcode
      });

      if (response) {
        await refetchPriorityList();
        
        // Update colvalueList if provided
        if (setColvalueList && sprintTaskInfoApi?.data) {
          const data = sprintTaskInfoApi.data;
          if (Array.isArray(data) && data.length > 0 && data[0]?.colvalueList) {
            setColvalueList(data[0].colvalueList);
          } else if (data?.colvalueList) {
            setColvalueList(data.colvalueList);
          }
        }
        
        handleFormClose();
      }
    } catch (error) {
      console.error('Failed to delete priority:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPriorityToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPriorityToDelete(null);
  };

  const onSubmit = async (data: FormValidateType) => {
    try {
      if (isEdit) {
        // Get GroupID from row data using helper function
        const groupID = getGroupIdFromRow(row);
        const loginuserID = user?.id;
        
        const response = await updatePriority({
          PriorityID: parseInt(isEdit),
          GroupID: groupID,
          Priorityname: data.PriorityName,
          LoginuserID: loginuserID,
          IsDelete: false, // Set to false for update
          Colorcode: data.Colorcode
        });

        if (response) {
          await refetchPriorityList();
          
          // Update colvalueList if provided
          if (setColvalueList && sprintTaskInfoApi?.data) {
            const apiData = sprintTaskInfoApi.data;
            if (Array.isArray(apiData) && apiData.length > 0 && apiData[0]?.colvalueList) {
              setColvalueList(apiData[0].colvalueList);
            } else if (apiData?.colvalueList) {
              setColvalueList(apiData.colvalueList);
            }
          }
          
          reset({ PriorityName: '', Colorcode: '' });
          handleFormClose();
        }
      } else {
        // Create task priority with taskID and groupID from row data using helper functions
        const taskID = getTaskIdFromRow(row);
        const groupID = getGroupIdFromRow(row);
        const loginuserID = user?.id;

        const response = await createTaskPriority({
          Priorityname: data.PriorityName,
          TaskID: taskID,
          LoginuserID: loginuserID,
          GroupID: groupID,
          Colorcode: data.Colorcode
        });

        if (response) {
          await refetchPriorityList();
          
          // Update colvalueList if provided
          if (setColvalueList && sprintTaskInfoApi?.data) {
            const apiData = sprintTaskInfoApi.data;
            if (Array.isArray(apiData) && apiData.length > 0 && apiData[0]?.colvalueList) {
              setColvalueList(apiData[0].colvalueList);
            } else if (apiData?.colvalueList) {
              setColvalueList(apiData.colvalueList);
            }
          }
          
          reset({ PriorityName: '', Colorcode: '' });
          handleFormClose();
          setFormAnchor(null);
          setAnchorEl(null);
        }
      }
    } catch (error) {
      console.error('Error in priority submission:', error);
    }
  }

  const allPriorityOptions = useMemo(() => {
    const noneOption: ProjectPriorityList = {
      PriorityID: 0,
      PriorityName: 'None',
      Colorcode: '#E0E0E0',
      IsDefault: false,
      TaskgroupID: null
    }
    
    return [noneOption, ...(priorityList || [])]
  }, [priorityList])

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
        <Tooltip title={priorityName || 'None'}>
          <Typography
            fontSize={'0.85rem'}
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow={'hidden'}
            color={'inherit'}
            className='text-inherit'
          >
            {priorityName ?? 'None'}
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
                {/* {allPriorityOptions?.map(item => (
                  <PriorityMenuItem
                    item={item}
                    row={row}
                    key={item?.PriorityID}
                    handleClose={handleClose}
                    refetch={refetch}
                    dynamicValue={dynamicValue}
                    columnData={columnData}
                    isSubTask={isSubTask}
                    handleEdit={handleEdit}
                    handleDelete={handleDeleteClick}
                  />
                ))} */}
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
                {dynamicPriority?.map(item => (
                  <PriorityMenuItem
                    item={item}
                    row={row}
                    key={item?.PriorityID}
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
                  name='PriorityName'
                  rules={{
                    required: 'Please enter a name for the label'
                  }}
                  control={control}
                  render={({ field, formState: { errors } }) => (
                    <TextField
                      {...field}
                      variant={'outlined'}
                      error={!!errors?.PriorityName}
                      helperText={!!errors?.PriorityName && errors?.PriorityName?.message}
                      placeholder='eg. Priority name'
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
        priorityName={priorityToDelete?.PriorityName || ''}
      />
    </Box>
  )
}

export default TaskPriority
