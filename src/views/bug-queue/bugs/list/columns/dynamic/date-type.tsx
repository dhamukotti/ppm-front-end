import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '@iconify/react'
import { Box, Chip, Dialog, DialogContent, Grid2 as Grid, IconButton, Typography } from '@mui/material'
import { debounce } from 'lodash'
import moment from 'moment'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { AdditionalColumn } from '@/services/modules/bug-queue/types'
import { updateSubTask } from '@/services/modules/sub-task'
import { updateTasks } from '@/services/modules/task'
import type { BugQueueListAPI } from '@/services/modules/bug-queue/types'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'

interface DynamicDateProps {
  rowData: BugQueueListAPI 
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: any
  columnData?: AdditionalColumn
  canEdit?: boolean
  loginUserId?: number
  sprintId?: number
  sprintGroupId?: number
  allColValues?: any[]
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
  allColValues = []
}: DynamicDateProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { user } = useAuth()
  
  // Add a ref to track if initial load is done
  const isInitialMount = useRef(true)
  const previousValuesRef = useRef<string>('')

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

  const columnId = getColumnId(columnData);
  const currentSprintId = getSprintId(rowData);

  // Create a stable key to compare changes
  const getStableValueKey = useCallback(() => {
    if (rowData && columnData) {
      if (allColValues && Array.isArray(allColValues) && allColValues.length > 0) {
        const valuesForThisSprint = allColValues.filter((item: any) => {
          const itemSprintId = item?.sprintID || item?.SprintID;
          return itemSprintId == currentSprintId;
        });
        
        const colValue = valuesForThisSprint.find(
          (item: any) => {
            const itemColumnId = getColumnId(item);
            return itemColumnId == columnId;
          }
        );
        
        if (colValue?.dynamicColumnValues) {
          return colValue.dynamicColumnValues;
        }
      }
      
      if ('colvalueList' in rowData && Array.isArray((rowData as any).colvalueList)) {
        const valuesFromRowData = (rowData as any).colvalueList.filter((item: any) => {
          const itemSprintId = item?.sprintID || item?.SprintID;
          return !itemSprintId || itemSprintId == currentSprintId;
        });
        
        const colValue = valuesFromRowData.find(
          (item: any) => {
            const itemColumnId = getColumnId(item);
            return itemColumnId == columnData?.additionalColumnID;
          }
        );
        
        if (colValue?.dynamicColumnValues) {
          return colValue.dynamicColumnValues;
        }
      }
      
      if (dynamicValue?.DynamicColumnValues) {
        return dynamicValue.DynamicColumnValues;
      } else if (dynamicValue?.dynamicColumnValues) {
        return dynamicValue.dynamicColumnValues;
      }
    }
    return null;
  }, [rowData, columnData, dynamicValue, allColValues, currentSprintId, columnId]);

  useEffect(() => {
    const valueKey = getStableValueKey();
    
    // Only update if the value actually changed
    if (valueKey !== previousValuesRef.current) {
      previousValuesRef.current = valueKey;
      
      if (valueKey) {
        const parsed = moment(valueKey, 'LLL', true).isValid()
          ? moment(valueKey, 'LLL').toDate()
          : new Date(valueKey);
        
        // Only update state if the parsed date is different
        setSelectedDate(prevDate => {
          if (!prevDate && !parsed) return prevDate;
          if (!prevDate && parsed) return parsed;
          if (prevDate && !parsed) return null;
          if (prevDate && parsed && prevDate.getTime() === parsed.getTime()) return prevDate;
          return parsed;
        });
      } else {
        setSelectedDate(null);
      }
    }
  }, [getStableValueKey]); // Only depend on the stable key getter

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
      
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL1}/InsertBugDynamicValues`;
      
      const url = new URL(baseUrl);
      url.searchParams.append('DynamicColumnID', columnData?.additionalColumnID ? columnData?.additionalColumnID : "0");
      url.searchParams.append('LoginuserID', String(user?.id));
      url.searchParams.append('BugID', rowData?.BugID || rowData?.BugID || '');
      url.searchParams.append('GroupID', rowData?.groupID || rowData?.groupID || '');
      url.searchParams.append('DynamicValue', moment(selectedDate).format('LLL'));

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
    setSelectedDate(date)
  }

  // ✅ Memoize the debounced click handler properly
  const debouncedClick = useCallback(debounce(handleSave, 600), [selectedDate, columnData, user, rowData])

  return (
    <div>
      {selectedDate ? (
        <Box display={'flex'} alignItems={'center'} gap={3} justifyContent={'space-between'} pr={2}>
          <Typography className='truncate'>{moment(selectedDate).format('LLL')}</Typography>
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
                  selected={selectedDate}
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
