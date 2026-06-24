import { useEffect, useState } from 'react'
import { Box, CircularProgress, Menu, MenuItem, TextField, Typography, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { fetchColumnType } from '@/services/modules/task'
import type { TColumnType } from '@/services/modules/task/types'
import CustomButton from '@/components/button'
import { CreateDynamicColumn } from '@/services/modules/sprint-item'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'

interface CreateColumnMenuProps {
  anchorEl: any
  spintid: number
  groupid:number
  setAnchorEl: (v: any) => void
  onSubmit?: (data: { columnName: string; columnTypeID: number }) => void
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
  spintid,
  groupid,
  setAnchorEl,
  onSubmit: onSubmitCallback
}: CreateColumnMenuProps) => {
  const { data: additionalColumnsType } = useQuery({
    queryKey: ['column-type'],
    queryFn: () => fetchColumnType()
  })

  // ** States
  const [selectedColumnType, setSelectedColumnType] = useState<TColumnType | null>(null)
  const { user } = useAuth()
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<FormValidateType>({ 
    defaultValues: { columnName: '' },
    mode: 'onChange'
  })

  const handleTypeClicked = (t: TColumnType) => {
    setSelectedColumnType(t)
    reset()
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedColumnType(null)
    reset()
  }

  const handleTypeClose = () => {
    setSelectedColumnType(null)
    reset()
  }

  const onSubmit = async (data: FormValidateType) => {
    if (!selectedColumnType) return
    
    try {
      // Prepare the data for API call
      const columnData = {
        Columnname: data.columnName,
        ColumntypeID: selectedColumnType.ColumnTypeID,
        SprintWorkspaceID: spintid,
        LoginuserID: user?.id,
        sprintGroupID: Number(groupid)
      }

      // Call the API to create dynamic column
      const response = await CreateDynamicColumn(columnData)
      
      // If API call is successful, call the callback
      if (onSubmitCallback) {
        await onSubmitCallback({
          columnName: data.columnName,
          columnTypeID: selectedColumnType.ColumnTypeID
        })
      }

      // Dispatch custom event to notify filter menu
      window.dispatchEvent(new CustomEvent('columnCreated', { 
        detail: { columnName: data.columnName } 
      }));

      // Close menu and reset form on successful submission
      handleClose()
      
    } catch (error) {
      console.error('Failed to create dynamic column:', error)
      // You can add error handling here (show toast, etc.)
    }
  }

  const fetchSprintDynamicColumns = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintDynamiccolumnLlist`, {
      params: {
        LoginuserID: user?.id,
        WorkspaceID: spintid
      }
    })

    return response.data
  }

  // Handle form submission with validation
  const handleFormSubmit = handleSubmit(onSubmit)

  useEffect(() => {
    if (!!anchorEl) {
      reset()
      setSelectedColumnType(null)
    }
    fetchSprintDynamicColumns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorEl])

  return (
    <Menu 
      open={!!anchorEl} 
      anchorEl={anchorEl} 
      onClose={handleClose} 
      TransitionComponent={Zoom}
      keepMounted
    >
      <div className='min-w-64 w-full max-w-72 p-3'>
        {selectedColumnType ? (
          <form onSubmit={handleFormSubmit}>
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
                  rules={{ 
                    required: 'Please name your column',
                    minLength: {
                      value: 1,
                      message: 'Column name cannot be empty'
                    }
                  }}
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
                      FormHelperTextProps={{
                        sx: { 
                          opacity: error ? 1 : 0,
                          transition: 'opacity 0.2s'
                        }
                      }}
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
                    startIcon={<i className='ri-arrow-left-s-line' />}
                    size='small'
                    onClick={handleTypeClose}
                    type="button"
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
