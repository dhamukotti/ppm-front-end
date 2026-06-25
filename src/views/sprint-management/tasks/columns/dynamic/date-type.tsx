import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Box, Chip, Dialog, DialogContent, Grid2 as Grid, IconButton, Typography } from '@mui/material'
import { debounce } from 'lodash'
import moment from 'moment'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { AdditionalColumn } from '@/services/modules/sprint-item/types'
import { updateSubTask } from '@/services/modules/sub-task'
import { updateTasks } from '@/services/modules/task'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'

interface DynamicDateProps {
  rowData: SprintItem 
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: any
  columnData?: AdditionalColumn
  canEdit?: boolean
  loginUserId?: number
  sprintId?: number
  sprintGroupId?: number
  allColValues?: any[] // Add this to pass the colvalueList from parent
}

const DynamicDate = ({ 
  columnData, 
  rowData, 
  dynamicValue, 
  refetch, 
  isSubTask, 
  canEdit, 
  loginUserId, 
  sprintId, 
  sprintGroupId,
  allColValues = [] // Accept colvalueList from parent
}: DynamicDateProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { user } = useAuth()

  // Helper function to get column ID regardless of casing
  const getColumnId = (column: any): string | number | undefined => {
    if (!column) return undefined;
    
    return column?.additionalColumnID || 
           column?.AdditionalColumnID || 
           column?.id || 
           column?.ID ||
           column?.columnId ||
           column?.ColumnId ||
           undefined;
  }

  // Helper function to get sprint ID from rowData (handles both camelCase and PascalCase)
  const getSprintId = (data: any): string | number | undefined => {
    if (!data) return undefined;
    
    return data?.sprintID || 
           data?.SprintID || 
           data?.sprintId || 
           data?.SprintId || 
           data?.id || 
           data?.ID ||
           undefined;
  }

  // Helper function to get taskGroupID from rowData (handles both camelCase and PascalCase)
  const getTaskGroupId = (data: any): string | number | undefined => {
    if (!data) return undefined;

    return data?.taskGroupID ||
           data?.TaskGroupID ||
           data?.taskgroupID ||
           data?.taskgroupid ||
           data?.TaskGroupId ||
           data?.taskGroupId ||
           undefined;
  }

  // Helper function to get taskID from rowData (handles both camelCase and PascalCase)
  const getTaskId = (data: any): string | number | undefined => {
    if (!data) return undefined;

    return data?.taskID ||
           data?.TaskID ||
           data?.taskId ||
           data?.TaskId ||
           data?.taskid ||
           undefined;
  }

  // Get column ID
  const columnId = getColumnId(columnData);
  
  // Get current sprint ID from rowData
  const currentSprintId = getSprintId(rowData);

  // Get current taskGroupID from rowData — used to scope date values per row
  const currentTaskGroupId = getTaskGroupId(rowData);

  // Get current taskID from rowData — used as secondary scope identifier
  const currentTaskId = getTaskId(rowData);

  // Helper to match an item against the current row by taskGroupID and taskID
  const matchesCurrentRow = (item: any): boolean => {
    const itemTaskGroupId = getTaskGroupId(item);
    const itemTaskId = getTaskId(item);

    // Match by taskGroupID — primary row identifier
    if (currentTaskGroupId !== undefined && itemTaskGroupId !== undefined) {
      if (String(itemTaskGroupId) !== String(currentTaskGroupId)) return false;
    }

    // Additionally match by taskID if available on the item
    if (currentTaskId !== undefined && itemTaskId !== undefined) {
      if (String(itemTaskId) !== String(currentTaskId)) return false;
    }

    return true;
  }

  useEffect(() => {
    // Reset selected date first
    setSelectedDate(null)
    
    // Find and set the initial date value when component mounts or rowData changes
    if (rowData && columnData) {
    
      
      // First try to find in allColValues (passed from parent with colvalueList)
      if (allColValues && Array.isArray(allColValues) && allColValues.length > 0) {
        // Filter by sprint ID and row-level identifiers (taskGroupID / taskID)
        const valuesForThisRow = allColValues.filter((item: any) => {
          const itemSprintId = item?.sprintID || item?.SprintID;
          const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
          return sprintMatches && matchesCurrentRow(item);
        });
        
        // Then find the one with matching column ID
        const colValue = valuesForThisRow.find(
          (item: any) => {
            const itemColumnId = getColumnId(item);
            return String(itemColumnId) === String(columnId);
          }
        );
        
        if (colValue?.dynamicColumnValues) {
          setSelectedDate(colValue.dynamicColumnValues);
          return;
        }
      }
      
      // Try to find in rowData.colvalueList if it exists (for backward compatibility)
      if ('colvalueList' in rowData && Array.isArray((rowData as any).colvalueList)) {
        
        // Filter by sprint ID and row-level identifiers
        const valuesFromRowData = (rowData as any).colvalueList.filter((item: any) => {
          const itemSprintId = item?.sprintID || item?.SprintID;
          const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
          return sprintMatches && matchesCurrentRow(item);
        });
        
        const colValue = valuesFromRowData.find(
          (item: any) => {
            const itemColumnId = getColumnId(item);
            return itemColumnId == columnData.additionalColumnID;
          }
        );
        
        
        if (colValue?.dynamicColumnValues) {
          setSelectedDate(colValue.dynamicColumnValues);
          return;
        }
      }
      
      // Check dynamicValue prop as fallback
      if (dynamicValue?.DynamicColumnValues) {
        setSelectedDate(dynamicValue.DynamicColumnValues);
      } else if (dynamicValue?.dynamicColumnValues) {
        setSelectedDate(dynamicValue.dynamicColumnValues);
      }
    }
  }, [rowData, columnData, dynamicValue, allColValues, currentSprintId, columnId]);



  const handleOpenDialog = () => {
    if (canEdit) {
      setOpenDialog(true)
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      const formattedDateValue = moment(selectedDate).format('LLL');
      
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL1}/InsertDynamicSprintTaskValues`;
      
      const url = new URL(baseUrl);
      url.searchParams.append('DynamicColumnID', (columnData as any)?.additionalColumnID );
      url.searchParams.append('LoginuserID', String(user?.id));
      url.searchParams.append('TaskID', (rowData as any)?.taskID || (rowData as any)?.taskID || '');
      url.searchParams.append('GroupID', (rowData as any)?.taskGroupID || (rowData as any)?.taskGroupID || '');
      url.searchParams.append('DynamicValue', selectedDate || '');

      const response = await axios.post(url.toString(), null, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data) {
        refetch();
        handleClose();
        toast.success('Value updated successfully');
      }
    } catch (error) {
      console.error('error :', error)
      toast.error('Failed to update value');
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    setIsSubmitting(false)
    setSelectedDate(moment(date).format('LLL'))
  }

  const debouncedClick = debounce(handleSave, 600)

  return (
    <div>
      {selectedDate ? (
        <Box display={'flex'} alignItems={'center'} gap={3} justifyContent={'space-between'} pr={2}>
          <Typography className='truncate'> {selectedDate}</Typography>
          {canEdit && (
            <IconButton size='small' onClick={handleOpenDialog}>
              <Icon icon={'mdi:pencil-outline'} />
            </IconButton>
          )}
        </Box>
      ) : canEdit ? (
        <Chip label={'Pick a date'} size='small' variant='tonal' onClick={handleOpenDialog} />
      ) : (
        '-'
      )}

      <Dialog open={openDialog} onClose={handleClose} maxWidth='xs'>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid size={12}></Grid>
            <Grid size={12}>
              <Box display={'flex'} justifyContent={'center'}>
                <AppReactDatepicker
                  showTimeSelect
                  selected={selectedDate ? moment(selectedDate).toDate() : null}
                  inline
                  autoComplete='off'
                  placeholderText='Pick a date'
                  onChange={handleDateChange}
                  className='shadow-none'
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box display={'flex'} justifyContent={'center'}>
                <CustomButton variant='contained' circular onClick={debouncedClick} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </CustomButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DynamicDate
