import { useEffect, useState } from 'react'

import { Box, CircularProgress, Menu, MenuItem, TextField, Typography, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useQuery } from '@tanstack/react-query'

import { Icon } from '@iconify/react'

import { Controller, useForm } from 'react-hook-form'

import { fetchColumnType } from '@/services/modules/task'
import type { TColumnType } from '@/services/modules/task/types'
import { useProject } from '@/context/project-context'
import { createColumn } from '@/services/modules/task-group'
import { createSubTaskColumn } from '@/services/modules/sub-task'
import CustomButton from '@/components/button'
import { useWorkspace } from '@/context/workspace-context'
import axios from 'axios'
import toast from 'react-hot-toast'

interface CreateColumnMenuProps {
  anchorEl: any
  setAnchorEl: (v: any) => void
  refetch: () => void
  isSubTask?: boolean
  taskGroupAllData: { taskGroupID: number; taskID?: number }
}

const getIcon = (key: TColumnType['Key']) => {
  switch (key) {
    case 'USR':
      return 'tdesign:user'
    case 'TXT':
      return 'streamline:pencil'

    case 'DDL':
      return 'hugeicons:book-02'

    case 'DPK':
      return 'solar:calendar-date-linear'

    case 'LBL':
      return 'material-symbols:table-chart-view-outline'

    case 'NUM':
      return 'mingcute:dots-fill'

    case 'FLE':
      return 'lucide:files'

    default:
      return 'mingcute:dots-fill'
  }
}

type FormValidateType = {
  columnName: string
}

const CreateColumnMenu = ({
  anchorEl,
  setAnchorEl,
  isSubTask = false,
  taskGroupAllData,
  refetch
}: CreateColumnMenuProps) => {
  // ** GET COLUMN TYPES
  const { data: additionalColumnsType } = useQuery({
    queryKey: ['column-type'],
    queryFn: () => fetchColumnType()
  })

  // ** Hooks
  const { project } = useProject()
  const { selected } = useWorkspace()

  // ** States
  const [selectedColumnType, setSelectedColumnType] = useState<TColumnType | null>(null)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValidateType>({ defaultValues: { columnName: '' } })

  const handleTypeClicked = (t: TColumnType) => {
    setSelectedColumnType(t)
    reset()
  }

  const handleClose = () => {
    setAnchorEl(null)
            setSelectedColumnType(null)

  }

  const handleTypeClose = () => setSelectedColumnType(null)

  const fetchUpdatedColumns = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL1}/GetBugDynamicColumnList`,
        {
          params: {
            WorkspaceID: selected?.WorkspaceID,
            GroupID: taskGroupAllData.taskGroupID
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching updated columns:', error)
      throw error
    }
  }

  const onSubmit = async (data: FormValidateType) => {
    const body = {
      ...data,
      ...taskGroupAllData,
      columnTypeID: selectedColumnType?.ColumnTypeID,
      projectID: project?.ID,
      workspaceID: selected?.WorkspaceID
    }

    if (isSubTask) {
      return createSubTaskColumn(body).then(() => {
        refetch()
        handleClose()
        setSelectedColumnType(null)
        reset()
      })
    }

    // Add logic here to add the new column using axios
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL1}/CreateBugDynamicColumn`,
        null,
        {
          params: {
            WorkspaceID: selected?.WorkspaceID,
            ColumntypeID: selectedColumnType?.ColumnTypeID,
            Columnname: data.columnName,
            GroupID: taskGroupAllData.taskGroupID,
            LoginuserID: project?.ID
          }
        }
      )
      
      toast.success("Column Created Successfully!")

      // ✅ FIX: Dispatch event so BugList immediately re-fetches dynamic columns
      window.dispatchEvent(new Event('columnCreated'))
      
      // Fetch updated column list after successful creation
      await fetchUpdatedColumns()
      
      refetch()
      handleClose()
      setSelectedColumnType(null)
      reset()
    } catch (error) {
      console.error('Error creating dynamic column:', error)
      toast.error("Failed to create column")
    }
  }

  useEffect(() => {
    if (!!anchorEl) {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorEl])

  return (
    <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose} TransitionComponent={Zoom}>
      <div className='min-w-64 w-full max-w-72 p-3'>
        {selectedColumnType ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={6}>
              <Grid size={12}>
                <Box display={'flex'} gap={3} width={'200px'}>
                  <Typography fontWeight={'bold'} fontSize={13} textTransform={'uppercase'}>
                    {`Add ${selectedColumnType?.Title}`}
                  </Typography>
                  <Icon icon={getIcon(selectedColumnType?.Key)} fontSize={20} className='text-primary' />
                </Box>
              </Grid>
              <Grid size={12}>
                <Controller
                  name='columnName'
                  control={control}
                  rules={{ required: 'Please name your column' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='Enter a label for column'
                      {...field}
                      onChange={e => {
                        e.preventDefault()
                        e.stopPropagation()

                        field.onChange(e)
                      }}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                  <CustomButton
                    circular
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className={'ri-arrow-left-s-line'} />}
                    size='small'
                    onClick={handleTypeClose}
                  >{`Back`}</CustomButton>
                  <CustomButton
                    type='submit'
                    circular
                    variant='outlined'
                    endIcon={!isSubmitting && <i className='ri-add-line' />}
                    disabled={isSubmitting}
                    size='small'
                  >
                    {isSubmitting ? <CircularProgress color='secondary' size={20} /> : `Add Column`}
                  </CustomButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography fontWeight={'bold'} fontSize={13} textTransform={'uppercase'}>
                Essentials
              </Typography>
            </Grid>
            {additionalColumnsType?.map(item => (
              <Grid size={{ xs: 12, md: 6 }} key={item?.ColumnTypeID}>
                <Box
                  component={MenuItem}
                  display={'flex'}
                  alignItems={'center'}
                  gap={3}
                  p={0}
                  px={1}
                  className='rounded-lg'
                  py={1}
                  onClick={() => handleTypeClicked(item)}
                >
                  <Icon icon={getIcon(item?.Key)} />
                  <Typography fontSize={14} textTransform={'capitalize'}>
                    {item?.Title}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </Menu>
  )
}

export default CreateColumnMenu
