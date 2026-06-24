import { useState } from 'react'

import { Icon } from '@iconify/react'
import { Box, Chip, Dialog, DialogContent, Grid2 as Grid, IconButton, Typography } from '@mui/material'
import { debounce } from 'lodash'
import moment from 'moment'
import axios from 'axios'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { AdditionalColumn } from '@/services/modules/project/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { updateTasks } from '@/services/modules/task'
import type { TaskListItemType } from '@/services/modules/task/types'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'

interface DynamicDateProps {
  rowData: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: any
  columnData?: AdditionalColumn
  canEdit?: boolean
}

const DynamicDate = ({ columnData, rowData, dynamicValue, refetch, isSubTask=false, canEdit }: DynamicDateProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dynamicValue?.DynamicColumnValues ?? null)
const { profile,user } = useAuth()
  const handleOpenDialog = () => {
    if (canEdit) {
      setSelectedDate(dynamicValue?.DynamicColumnValues ?? null)
      setOpenDialog(true)
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
  }

//   const handleSave = async () => {
//     try {
//       setIsSubmitting(true)

//       const body: any = {
//         DynamicID: dynamicValue?.DynamicID ?? null,
//         AdditionalColumnID: columnData?.AdditionalColumnID,
//         value: moment(selectedDate).format('LLL'),
//         Title: `Column '${columnData?.ColumnName}' was updated`,
//         PreviousState: dynamicValue?.DynamicColumnValues,
//         NewState: moment(selectedDate).format('LLL')
//       }

//       if (isSubTask) {
//     
//         const subRowData = rowData as AdditionalSubTaskListItem
//      const taskRowData = rowData as TaskListItemType
//         body.TaskID = subRowData?.TaskMasterID
//         // const response = await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })
//    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;

// const response = await axios.post(`${BASE_URL}/UpdateDyanmicDateSubtask?TaskID=${taskRowData?.TaskID?.toString()}&LoginuserID=${user?.id}&Subtaskid=${subRowData?.SubTaskID?.toString()}&IsRemove=0&AdditionalColumnID=${columnData?.AdditionalColumnID}&DateValue=${moment(selectedDate).format('LLL')}`).then((res)=>{

//    refetch()
//        handleClose()
// })
//         // if (response) {
//         //   refetch()
//         //   handleClose()
//         // }
//       } else {
//         const taskRowData = rowData as TaskListItemType

//         const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

//         if (response) {
//           refetch()
//           setOpenDialog(false)
//         }
//       }
//     } catch (error) {
//       console.error('error :', error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }
const handleSave = async () => {
  try {
    setIsSubmitting(true)

    const body: any = {
      DynamicID: dynamicValue?.DynamicID ?? null,
      AdditionalColumnID: columnData?.AdditionalColumnID,
      value: moment(selectedDate).format('LLL'),
      Title: `Column '${columnData?.ColumnName}' was updated`,
      PreviousState: dynamicValue?.DynamicColumnValues,
      NewState: moment(selectedDate).format('LLL')
    }

    if (isSubTask) {
    
      const subRowData = rowData as AdditionalSubTaskListItem
      const taskRowData = rowData as TaskListItemType
      body.TaskID = subRowData?.TaskMasterID
      
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
      
      // Fixed: Properly await the axios call
      const response = await axios.post(`${BASE_URL}/UpdateDyanmicDateSubtask?TaskID=${taskRowData?.TaskID?.toString()}&LoginuserID=${user?.id}&Subtaskid=${subRowData?.SubTaskID?.toString()}&IsRemove=0&AdditionalColumnID=${columnData?.AdditionalColumnID}&DateValue=${moment(selectedDate).format('LLL')}`)
      
      
      if (response.data) { // Check if response has data
        refetch()
        handleClose()
      }
    } else {
      const taskRowData = rowData as TaskListItemType
      const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

      if (response) {
        refetch()
        setOpenDialog(false)
      }
    }
  } catch (error) {
    console.error('error :', error)
    // Optionally add error handling UI here
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
