// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Third Party Imports
import moment from 'moment'

// ** Custom Functions
import { Chip, Grid2, Menu, Zoom } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import CustomButton from '@/components/button'
import { dateFormatMomentTask } from '@/constants/formats'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { updateTasks } from '@/services/modules/task'
import type { TaskListItemType } from '@/services/modules/task/types'

interface TaskTimelineProps {
  row: TaskListItemType
  canEdit: boolean
  refetch: () => void
}

type FormValidateType = {
  TimelineStartDate: Date | null
  TimelineEndDate: Date | null
}

const TaskTimeline = ({ row, refetch, canEdit }: TaskTimelineProps) => {
  const [open, setOpen] = useState<any>(false)

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({
    defaultValues: {
      TimelineStartDate: row?.TimelineStartDate ? moment(row?.TimelineStartDate)?.toDate() : null,
      TimelineEndDate: row?.TimelineEndDate ? moment(row?.TimelineEndDate)?.toDate() : null
    }
  })

  const endDateValue = watch('TimelineEndDate')

  const handleClose = () => {
    setOpen(false)
    refetch()
  }

  const onSubmit = async (formData: FormValidateType) => {
    try {
      if (canEdit) {
        await updateTasks({
          id: row?.TaskID?.toString(),
          body: {
            ...formData,
            Title: row?.TimelineStartDate ? 'Timeline Changed' : 'Timeline Added',
            Description: 'Default Status for task was updated',
            PreviousState: `${row?.TimelineStartDate ? moment(row?.TimelineStartDate).format('DD/MM/YY') : ''} - ${row?.TimelineEndDate ? moment(row?.TimelineEndDate).format('DD/MM/YY') : ''}`,
            NewState: `${moment(formData?.TimelineStartDate).format('DD/MM/YY')} - ${moment(formData?.TimelineEndDate).format('DD/MM/YY')}`,
            IsCritical: 1
          }
        })
      }

      handleClose()
    } catch {}
  }

  useEffect(() => {
    if (open) {
      reset({
        TimelineStartDate: row?.TimelineStartDate ? moment(row?.TimelineStartDate)?.toDate() : null,
        TimelineEndDate: row?.TimelineEndDate ? moment(row?.TimelineEndDate)?.toDate() : null
      })
    }
  }, [open, reset, row?.TimelineEndDate, row?.TimelineStartDate])

  return (
    <Box display={'flex'} alignItems={'center'} justifyContent={'start'} height={'100%'}>
      {row?.TimelineStartDate || row?.TimelineEndDate ? (
        <Typography
          whiteSpace={'nowrap'}
          onClick={e => canEdit && setOpen(e?.currentTarget)}
        >{`${row?.TimelineStartDate ? moment(row?.TimelineStartDate).format(dateFormatMomentTask) : ''} - ${row?.TimelineEndDate ? moment(row?.TimelineEndDate).format(dateFormatMomentTask) : ''}`}</Typography>
      ) : canEdit ? (
        <Chip
          size='small'
          label='Pick a timeline'
          color='secondary'
          variant='tonal'
          clickable
          onClick={e => setOpen(e?.currentTarget)}
          sx={{ '&:hover': { backgroundColor: 'inherit' } }}
        />
      ) : (
        '-'
      )}
      <Menu
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        TransitionComponent={Zoom}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        sx={{ '& .MuiList-root': { p: 0 } }}
      >
        <div className='p-2 max-w-[300px]'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid2 container spacing={6}>
              <Grid2 size={12}>
                <div className='flex w-full justify-center'>
                  <Controller
                    control={control}
                    name='TimelineStartDate'
                    render={({ field }) => (
                      <AppReactDatepicker
                        selectsRange
                        inline
                        endDate={endDateValue as Date}
                        selected={field?.value}
                        startDate={field?.value as Date}
                        id='date-range-picker'
                        onChange={(dates: any) => {
                          const [start, end] = dates

                          field?.onChange(start)
                          setValue('TimelineEndDate', end)
                        }}
                      />
                    )}
                  />
                </div>
              </Grid2>
              <Grid2 size={12}>
                <div className='flex justify-between gap-2 items-center'>
                  <CustomButton circular variant='outlined' color='secondary' onClick={handleClose}>
                    Close
                  </CustomButton>
                  <CustomButton variant='contained' circular disabled={!isDirty || isSubmitting} type='submit'>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </CustomButton>
                </div>
              </Grid2>
            </Grid2>
          </form>
        </div>
      </Menu>
    </Box>
  )
}

export default TaskTimeline
