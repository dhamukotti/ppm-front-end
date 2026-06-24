import { useMemo, useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  Grid,
  IconButton,
  Menu,
  TextField,
  Typography,
  Zoom
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'

import type { AdditionalColumn } from '@/services/modules/project/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { deleteDynamicValue, updateTasks } from '@/services/modules/task'
import { addDropdownItem, fetchDropDownList } from '@/services/modules/task-group'
import type { DynamicDropdownList } from '@/services/modules/task-group/types'
import type { AdditionalValue, TaskListItemType } from '@/services/modules/task/types'
import CustomButton from '@components/button'

interface DynamicDropdownProps {
  rowData: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: AdditionalValue[]
  columnData?: AdditionalColumn
  canEdit?: boolean
}

type FormValidateType = { dropdown: any }

const DynamicDropdown = ({ columnData, rowData, dynamicValue, refetch, isSubTask, canEdit }: DynamicDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const [createMenu, setCreateMenu] = useState(false)

  const { data: dropdownItems, refetch: refetchDDL } = useQuery({
    queryKey: ['dropdown-items', rowData?.TaskGroupID],
    queryFn: () => fetchDropDownList({ taskGroupID: rowData?.TaskGroupID?.toString() })
  })

  const listItems = useMemo(() => {
    const finalArr = dropdownItems?.filter(i =>
      dynamicValue?.every(val => val?.Dropdown?.Dynamic_ddl_ID !== i?.Dynamic_ddl_ID)
    )

    return finalArr ?? []
  }, [dynamicValue, dropdownItems])

  const handleOpen = (e: any) => {
    canEdit && setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValidateType>({ defaultValues: { dropdown: [] } })

  const onSubmit = async (data: FormValidateType) => {
    try {
      if (createMenu) {
        const dropdownAddBody = {
          Valuetxt: data?.dropdown,
          WorkspaceID: columnData?.WorkspaceID,
          ProjectID: columnData?.ProjectID,
          TaskGroupID: rowData?.TaskGroupID,
          TaskID: rowData?.TaskID
        }

        const responseData = await addDropdownItem(dropdownAddBody)

        if (responseData?.status) {
          refetchDDL()
          reset()
          setCreateMenu(false)
        }
      }
    } catch (error) {
      console.error('error :', error)
    }
  }

  const handleDropdownSelect = async (item: DynamicDropdownList | null) => {
    try {
      const body: any = {
        DynamicID: null,
        AdditionalColumnID: columnData?.AdditionalColumnID,
        value: item?.Dynamic_ddl_ID,
        Title: `Column '${columnData?.ColumnName}' was updated`,
        PreviousState: `${dynamicValue?.length} items selected`,
        NewState: `${dynamicValue?.length ? dynamicValue?.length + 1 : 1} items selected`
      }

      if (isSubTask) {
        const subRowData = rowData as AdditionalSubTaskListItem

        body.TaskID = subRowData?.TaskMasterID
        const response = await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })

        if (response) {
          refetch()
          handleClose()
        }
      } else {
        const taskRowData = rowData as TaskListItemType

        const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

        if (response) {
          refetch()
        }
      }
    } catch (error) {
      console.error('error select ddl :', error)
    }
  }

  const handleDeleteLabel = async (id: string) => {
    await deleteDynamicValue(id)
    refetch()
  }

  return (
    <Box display={'flex'} alignItems={'center'} height={'100%'}>
      <Box onClick={handleOpen} sx={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}>
        {dynamicValue?.length ? (
          <Box display={'flex'} alignItems={'center'} gap={2}>
            <Chip variant='tonal' size='small' label={dynamicValue?.[0]?.Dropdown?.Valuetxt} />
            {dynamicValue?.length >= 2 && `+${dynamicValue?.length - 1}`}
          </Box>
        ) : canEdit ? (
          <IconButton>
            <Icon icon={'bi:plus-circle-dotted'} />
          </IconButton>
        ) : (
          '-'
        )}
      </Box>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        TransitionComponent={Zoom}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'center' }}
        sx={{ '& .MuiList-root': { p: 0 } }}
      >
        {createMenu ? (
          <Box component={'form'} onSubmit={handleSubmit(onSubmit)} width='300px' p={2} ml={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} p={2}>
                <Box display={'flex'} alignItems={'center'} mt={2} gap={2}>
                  <FormControl fullWidth>
                    <Controller
                      name='dropdown'
                      rules={{ required: true }}
                      control={control}
                      render={({ field: { value, onChange }, formState: { errors } }) => (
                        <TextField
                          value={value}
                          onChange={onChange}
                          error={!!errors?.dropdown}
                          size='small'
                          placeholder='Dropdown name'
                        />
                      )}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box minHeight={'50px'}></Box>
              </Grid>
              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} p={2}>
                  <CustomButton circular onClick={() => setCreateMenu(false)} size='small' variant='contained'>
                    {'Back'}
                  </CustomButton>
                  <CustomButton disabled={isSubmitting} circular type='submit' size='small' variant='contained'>
                    {isSubmitting ? 'Saving..' : 'Save'}
                  </CustomButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box width='300px' p={2} ml={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} p={2}>
                <Box display={'flex'} alignItems={'center'} mt={2} gap={2}>
                  <FormControl fullWidth>
                    <Autocomplete
                      clearOnBlur
                      value={null}
                      options={listItems ?? []}
                      id='autocomplete-free-solo-with-text'
                      renderOption={(props, option) => (
                        <li {...props} key={option.Valuetxt}>
                          {option.Valuetxt}
                        </li>
                      )}
                      size='small'
                      renderInput={params => <TextField {...params} placeholder='Select a value' />}
                      getOptionLabel={option => {
                        return option.Valuetxt || ''
                      }}
                      onChange={(event, newValue) => {
                        handleDropdownSelect(newValue)
                      }}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box minHeight={'50px'}>
                  {dynamicValue?.length ? (
                    <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} rowGap={3} columnGap={3}>
                      {dynamicValue?.map(i => (
                        <Box
                          key={i?.Dropdown?.Dynamic_ddl_ID}
                          borderRadius={10}
                          py={1}
                          px={3}
                          bgcolor={'#DCE3F6'}
                          border={1.2}
                          borderColor={'#004AAA'}
                          display={'flex'}
                          alignItems={'center'}
                          gap={2.5}
                        >
                          <Typography lineHeight={1} fontSize={14}>
                            {i?.Dropdown?.Valuetxt}
                          </Typography>
                          <IconButton
                            size='small'
                            sx={{ p: 0 }}
                            onClick={() => handleDeleteLabel(i?.DynamicID?.toString())}
                          >
                            <Icon icon={'ep:close-bold'} color='red' />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      display={'flex'}
                      bgcolor={'background.default'}
                      p={3}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      None Selected
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'end'} p={2}>
                  <CustomButton onClick={() => setCreateMenu(true)} size='small' variant='contained'>
                    {'Create new value'}
                  </CustomButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Menu>
    </Box>
  )
}

export default DynamicDropdown
