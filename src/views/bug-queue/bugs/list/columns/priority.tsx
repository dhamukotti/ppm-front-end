import React, { useState } from 'react'

import { Avatar, Box, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { Icon } from '@iconify/react'
import { Controller, useForm } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { getContrastingTextColor, getHexColor } from 'src/utils/functions'

import { pattern } from '@/constants/patterns'
import { addBugPriority, fetchBugPriorityList, updateBug, updateBugPriority } from '@/services/modules/bug-queue'
import type { BugPriorityList, BugQueueListAPI } from '@/services/modules/bug-queue/types'
import CustomButton from '@components/button'
import { useWorkspace } from 'src/context/workspace-context'

interface PriorityMenuItemProps {
  item: BugPriorityList
  row: BugQueueListAPI
  handleClose: () => void
  handleEdit?: (item?: BugPriorityList) => void
  refetch: () => void
  onPriorityChange?: (bugId: string | number, newPriorityId: number) => Promise<void>
}

const PriorityMenuItem = ({ item, row, handleClose, handleEdit, refetch, onPriorityChange }: PriorityMenuItemProps) => {
  const handlePriorityChange = async () => {
    // Use onPriorityChange callback if provided, otherwise use the old method
    if (onPriorityChange) {
      await onPriorityChange(row?.BugID, item?.PriorityID)
    } else {
      const body = {
        PriorityID: item?.PriorityID,
        Title: row?.PriorityID ? 'Priority Changed' : 'Priority Added',
        Description: 'Bug Priority has been updated',
        PreviousState: row?.Priority?.PriorityName,
        NewState: item?.PriorityName
      }

      await updateBug({ id: row?.BugID?.toString(), body })
      refetch()
    }
  }

  return (
    <Grid size={12}>
      <Box display={'flex'} alignItems={'stretch'} gap={2}>
        <Box
          component={MenuItem}
          className='flex-1 rounded-md text-center p-0.5 justify-center'
          bgcolor={item?.Colorcode}
          color={getContrastingTextColor(item?.Colorcode)}
          disableRipple
          disableTouchRipple
          sx={{ '&:hover': { bgcolor: getHexColor(item?.Colorcode) + '99' } }}
          onClick={() => {
            if (row?.PriorityID != item?.PriorityID) {
              handlePriorityChange()
            }

            handleClose()
          }}
        >
          <Typography
            textOverflow={'ellipsis'}
            color={'inherit'}
            textAlign={'center'}
            overflow={'hidden'}
            whiteSpace={'nowrap'}
            className='text-sm'
          >
            {item?.PriorityName}
          </Typography>
        </Box>
        {/* {!item?.IsDefault && item?.PriorityID && (
                 <IconButton size='small' className='p-1' onClick={() => handleEdit && handleEdit(item)}>
                   <Icon icon={'mdi:pencil-outline'} fontSize={11} />
                 </IconButton>
        )} */}
      </Box>
    </Grid>
  )
}

interface TaskPriorityProps {
  row: BugQueueListAPI
  refetch: () => void
  canEdit: boolean
  workspaceID: number
  onPriorityChange?: (bugId: string | number, newPriorityId: number) => Promise<void>
}

type FormValidateType = { PriorityName: string; Colorcode: string }

const BugPriority = ({ row, refetch, canEdit, workspaceID, onPriorityChange }: TaskPriorityProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [formAnchor, setFormAnchor] = useState<any>(null)
  const [isEdit, setIsEdit] = useState<string | null>(null)
  const { priorityList = [] } = useWorkspace()

  const { data: dynamicPriority, refetch: refetchPriorityList } = useQuery({
    queryKey: ['project-priority', workspaceID],
    queryFn: () => fetchBugPriorityList({ workspaceID })
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty }
  } = useForm<FormValidateType>({ defaultValues: { PriorityName: '', Colorcode: '' } })

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
    reset({ PriorityName: '', Colorcode: '' })
    setIsEdit(null)
  }

  const checkChangeInHexValue = (value: string) => {
    if (value === '' || (value?.startsWith('#') && (pattern.hexAllowed?.test(value?.slice(1)) || value?.length <= 1))) {
      return true
    }

    return false
  }

  const handleEdit = (item: BugPriorityList) => {
    setIsEdit(item?.PriorityID?.toString())
    reset({ PriorityName: item?.PriorityName, Colorcode: item?.Colorcode })
    setFormAnchor(anchorEl)
    setAnchorEl(null)
  }

  const onSubmit = async (data: FormValidateType) => {
    const body = {
      ...data
    }

    if (isEdit) {
      const response = await updateBugPriority({ body, id: isEdit })

      if (response?.status) {
        refetchPriorityList()
        refetch()
        reset({ PriorityName: '', Colorcode: '' })
        handleFormClose()
      }
    } else {
   
      const response = await addBugPriority({ ...body, WorkspaceID: workspaceID })

      // if (response?.status) {
        refetchPriorityList()
        refetch()
        reset({ PriorityName: '', Colorcode: '' })
        handleFormClose()
      // }
    }
  }

  // Get the current priority name and color code with proper fallbacks
  const currentPriorityName = row?.Priority?.PriorityName || (row as any)?.priorityname || 'None'
  const currentColorCode = row?.Priority?.Colorcode || (row as any)?.colorcode || '#E0E0E0'

  return (
    <Box display={'flex'} alignItems={'center'} height={'100%'}>
      <Box
        component={'button'}
        className='flex items-center justify-center max-w-52 px-1 border border-divider h-[60%] rounded-md'
        bgcolor={currentColorCode}
        color={currentColorCode && getContrastingTextColor(currentColorCode)}
        onClick={handleOpen}
        sx={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
      >
        <Tooltip title={currentPriorityName}>
          <Typography
            fontSize={'0.85rem'}
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow={'hidden'}
            color={'inherit'}
            className='text-inherit'
          >
            {currentPriorityName}
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
              <Grid container spacing={4} maxHeight={'200px'} sx={{ overflowY: 'auto' }}>
                {priorityList?.map(item => (
                  <PriorityMenuItem
                    item={item}
                    row={row}
                    key={item?.PriorityID}
                    handleClose={handleClose}
                    refetch={refetch}
                    handleEdit={() => handleEdit(item)}
                    onPriorityChange={onPriorityChange}
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
                      <Icon icon={'mdi:plus-box-outline'} fontSize={18} />
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
                    onPriorityChange={onPriorityChange}
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
    </Box>
  )
}

export default BugPriority
