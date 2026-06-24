import React, { useMemo, useState } from 'react'

import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'

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
import { updateTasks } from '@/services/modules/task'
import type { TaskListItemType } from '@/services/modules/task/types'
import CustomButton from '@components/button'
import { useWorkspace } from 'src/context/workspace-context'
import { updateSubTask } from '@/services/modules/sub-task'

interface StatusMenuItemProps {
  item: ProjectStatusList
  row: TaskListItemType | AdditionalSubTaskListItem
  handleClose: () => void
  handleEdit?: (item?: ProjectStatusList) => void
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
  refetch,
  columnData,
  dynamicValue,
  isSubTask
}: StatusMenuItemProps) => {
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
    let body: any = {}

    if (!!dynamicValue || !!columnData) {
      body = {
        DynamicID: dynamicValue?.DynamicID ?? null,
        AdditionalColumnID: columnData?.AdditionalColumnID,
        value: item?.StatusID,
        Title: `Column '${columnData?.ColumnName}' was updated`,
        Description: 'Status for task was updated',
        PreviousState: dynamicValue?.Status?.Statusname,
        NewState: item?.Statusname
      }

      if (isSubTask) {
        const subRowData = row as AdditionalSubTaskListItem

        body.TaskID = subRowData?.TaskMasterID
        await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })
      } else {
        const taskRowData = row as TaskListItemType

        await updateTasks({ id: taskRowData?.TaskID?.toString(), body })
      }
    } else {
      if (isSubTask) {
        const subRowData = row as AdditionalSubTaskListItem

        body = {
          StatusID: item?.StatusID,
          TaskID: subRowData?.TaskMasterID,
          Title: subRowData?.StatusID ? 'Sub Task Status Changed' : 'Sub Task Status Added',
          Description: 'Status for sub-task was updated',
          PreviousState: subRowData?.Status?.Statusname,
          NewState: item?.Statusname
        }
        await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })
      } else {
        const taskRowData = row as TaskListItemType

        body = {
          StatusID: item?.StatusID,
          Title: taskRowData?.StatusID ? 'Status Changed' : 'Status Added',
          Description: 'Task Status has been updated',
          PreviousState: taskRowData?.Status?.Statusname,
          NewState: item?.Statusname
        }
        await updateTasks({ id: taskRowData?.TaskID?.toString(), body })
      }
    }

    refetch()
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
          onClick={() => {
            if (row?.StatusID != item?.StatusID) {
              handleStatusChange()
            }

            handleClose()
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
          <Tooltip title={item?.Statusname}>
            <Typography flex={1} textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>
              {item?.Statusname}
            </Typography>
          </Tooltip>
        </Box>
        {!item?.IsDefault && item?.TaskgroupID && (
          <IconButton size='small' className='p-1' onClick={() => handleEdit && handleEdit(item)}>
            <Icon icon={'mdi:pencil-outline'} fontSize={11} />
          </IconButton>
        )}
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

const TaskStatus = ({ row, refetch, canEdit, dynamicValue, columnData, isSubTask = false }: TaskStatusProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [formAnchor, setFormAnchor] = useState<any>(null)
  const [isEdit, setIsEdit] = useState<string | null>(null)
  const { statusList = [] } = useWorkspace()

  const { data: dynamicStatus, refetch: refetchStatusList } = useQuery({
    queryKey: ['project-status', row?.TaskGroupID],
    queryFn: () => fetchProjectStatusList({ taskGroupID: row?.TaskGroupID?.toString() })
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({ defaultValues: { Statusname: '', Colorcode: '' } })

  const statusName = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      return dynamicValue?.Status?.Statusname
    }

    return row?.Status?.Statusname
  }, [columnData, dynamicValue, row?.Status?.Statusname])

  const colorCode = useMemo(() => {
    if (!!dynamicValue || !!columnData) {
      return dynamicValue?.Status?.Colorcode
    }

    return row?.Status?.Colorcode
  }, [columnData, dynamicValue, row?.Status?.Colorcode])

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    canEdit && setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsEdit(null)
  }

  const handleFormClose = () => {
    setAnchorEl(formAnchor)
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

  const handleEdit = (item: ProjectStatusList) => {
    setIsEdit(item?.StatusID?.toString())
    reset({ Statusname: item?.Statusname, Colorcode: item?.Colorcode })
    setFormAnchor(anchorEl)
    setAnchorEl(null)
  }

  const onSubmit = async (data: FormValidateType) => {
    const body = {
      ...data,
      TaskgroupID: row?.TaskGroupID
    }

    if (isEdit) {
      const response = await updateProjectStatus({ body, id: isEdit })

      if (response?.status) {
        refetchStatusList()
        refetch()
        reset({ Statusname: '', Colorcode: '' })
        handleFormClose()
      }
    } else {
      const response = await addProjectStatus(body)

      if (response?.status) {
        refetchStatusList()
        reset({ Statusname: '', Colorcode: '' })
        handleFormClose()
      }
    }
  }

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
        <Tooltip title={statusName}>
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
                  whiteSpace: 'nowrap', // Prevent child elements from wrapping to a new line
                  paddingBottom: 1, // Optional: Adds padding for scroll visibility
                  '&::-webkit-scrollbar': {
                    width: '5px' // Customize scrollbar height
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888', // Customize scrollbar color
                    borderRadius: '2px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555' // Scrollbar on hover
                  }
                }}
              >
                {statusList?.map(item => (
                  <StatusMenuItem
                    item={item}
                    row={row}
                    key={item?.StatusID}
                    handleClose={handleClose}
                    refetch={refetch}
                    dynamicValue={dynamicValue}
                    columnData={columnData}
                    isSubTask={isSubTask}
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
                {dynamicStatus?.map(item => (
                  <StatusMenuItem
                    item={item}
                    row={row}
                    key={item?.StatusID}
                    handleClose={handleClose}
                    refetch={refetch}
                    handleEdit={() => handleEdit(item)}
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
    </Box>
  )
}

export default TaskStatus
