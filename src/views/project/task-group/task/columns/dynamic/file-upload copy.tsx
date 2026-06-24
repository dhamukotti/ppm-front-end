import { useState } from 'react'

import Image from 'next/image'

import { Icon } from '@iconify/react'
import {
  Box,
  Dialog,
  Grid2 as Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Zoom
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import ImgUploadBg from '@public/images/cards/upload-files.svg'

import CustomButton from '@components/button'

import type { AdditionalColumn } from '@/services/modules/project/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { taskFileUpload, updateTasks } from '@/services/modules/task'
import type { AdditionalValue, TaskListItemType } from '@/services/modules/task/types'
import type { TFileUploadMenuItems } from './dynamic-files-menu'
import { menuItems } from './dynamic-files-menu'

type FormValidateType = {
  value: string
  file: File | null
  displayText: string
}

const defaultValues: FormValidateType = {
  value: '',
  file: null,
  displayText: ''
}

interface DynamicFilesProps {
  rowData: TaskListItemType | AdditionalSubTaskListItem
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: AdditionalValue
  columnData?: AdditionalColumn
  canEdit?: boolean
}

const DynamicFiles = ({
  canEdit,
  columnData,
  rowData,
  dynamicValue,
  refetch,
  isSubTask = false
}: DynamicFilesProps) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedType, setSelectedType] = useState<TFileUploadMenuItems>(menuItems[0])
  const [open, setOpen] = useState(false)

  // ** Hooks
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValidateType>({ defaultValues })

  //** Function
  const handleOpen = (event: any) => setAnchorEl(event?.currentTarget)

  const handleClose = () => setAnchorEl(null)

  const handleFileTypeClick = (data: TFileUploadMenuItems) => {
    setSelectedType(data)
    setAnchorEl(null)
    reset(defaultValues)
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false)
  }

  const onSubmit = async (data: FormValidateType) => {
    if (!data?.file) {
      try {
        const body: any = {
          DynamicID: dynamicValue?.DynamicID ?? null,
          AdditionalColumnID: columnData?.AdditionalColumnID,
          value: data?.value,
          displayText: data?.displayText,
          Title: `File was added to column '${columnData?.ColumnName}'`,
          PreviousState: dynamicValue?.DisplayText,
          NewState: data?.displayText
        }

        if (isSubTask) {
          const subRowData = rowData as AdditionalSubTaskListItem

          body.TaskID = subRowData?.TaskMasterID
          const response = await updateSubTask({ id: subRowData?.SubTaskID?.toString(), body })

          if (response) {
            refetch()
            setOpen(false)
            handleClose()
          }
        } else {
          const taskRowData = rowData as TaskListItemType

          const response = await updateTasks({ id: taskRowData?.TaskID?.toString(), body })

          if (response) {
            refetch()
            setOpen(false)
            handleClose()
          }
        }
      } catch (error) {
        console.error('error :', error)
      }
    } else {
      try {
        const formData = new FormData()

        const body: any = {
          AdditionalColumnID: columnData?.AdditionalColumnID,
          value: data?.value,
          displayText: data?.displayText,
          Title: `File was added to column '${columnData?.ColumnName}'`,
          PreviousState: dynamicValue?.DisplayText,
          NewState: data?.displayText
        }

        for (const x in body) {
          formData.append(x, body[x])
        }

        if (dynamicValue?.DynamicID) {
          formData.append('DynamicID', dynamicValue?.DynamicID?.toString())
        }

        formData.append('file', data?.file)

        const response = await taskFileUpload({ id: rowData?.TaskID?.toString(), body: formData })

        if (response) {
          refetch()
          setOpen(false)
          handleClose()
        }
      } catch (error) {
        console.error('error ff :', error)
      }
    }
  }

  return (
    <>
      <Box display={'flex'} height={'100%'} alignItems={'center'}>
        {!dynamicValue ? (
          canEdit ? (
            <IconButton onClick={handleOpen}>
              <Icon icon={'bi:plus-circle-dotted'} />
            </IconButton>
          ) : (
            '-'
          )
        ) : (
          <div className='rounded-full border border-primary flex items-center gap-2 py-0.5 px-2'>
            <Tooltip title={dynamicValue?.DisplayText}>
              <Typography variant='body2' className='text-primary text-xs'>
                {dynamicValue?.DisplayText?.slice(0, 8)}
              </Typography>
            </Tooltip>
            <Box>
              <IconButton
                size='small'
                onClick={() => {
                  window?.open(dynamicValue?.DynamicColumnValues)
                }}
              >
                <i className='ri-share-box-line text-primary h-4 w-4' />
              </IconButton>
            </Box>
          </div>
        )}
      </Box>

      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose} TransitionComponent={Zoom}>
        {menuItems?.map(item => (
          <MenuItem
            key={item.title}
            sx={{ borderBottom: item?.hasBottomBorder ? 1 : 0, borderColor: 'divider' }}
            onClick={() => handleFileTypeClick(item)}
          >
            <Box display={'flex'} gap={2} alignItems={'center'}>
              <Icon icon={item?.icon} fontSize={20} color={theme?.palette.primary.main} />
              <Typography variant='body1' fontSize={15}>
                {item?.title}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={open} fullWidth maxWidth='md'>
        <Grid container spacing={4} height={'100%'} alignItems={'stretch'}>
          {/* Upload Files */}
          <Grid size={{ xs: 12, md: 8 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box
                minHeight={600}
                width={'100%'}
                display={'flex'}
                flexDirection={'column'}
                p={{ xs: 4, md: 10 }}
                gap={10}
              >
                {/* Title  */}
                <Box>
                  <Typography variant='h5' color={'primary.main'} fontWeight={700} mb={3}>
                    Upload file from {selectedType?.title}
                  </Typography>
                  <Typography whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
                    Kindly upload any file that you want (it will be supported all format)
                  </Typography>
                </Box>

                {/* Form */}
                <Box flex={1}>
                  {/* File */}
                  {selectedType?.type === 'computer' ? (
                    <Controller
                      control={control}
                      name='file'
                      rules={{ required: `Please upload a file` }}
                      render={({ field, formState: { errors } }) => (
                        <>
                          <Typography
                            variant='subtitle1'
                            fontWeight={700}
                            mb={2}
                          >{`Upload a file from your device`}</Typography>
                          {field?.value ? (
                            <Box
                              width={'max-content'}
                              display={'flex'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                              gap={2}
                            >
                              <Box
                                border={1}
                                borderRadius={1}
                                width={100}
                                height={100}
                                display={'flex'}
                                alignItems={'center'}
                                justifyContent={'center'}
                                position={'relative'}
                              >
                                <Icon icon={'mdi:file-outline'} fontSize={30} />
                                <Box
                                  position={'absolute'}
                                  top={-10}
                                  right={-10}
                                  bgcolor={'error.main'}
                                  borderRadius={100}
                                >
                                  <IconButton size='small' onClick={() => field.onChange(null)}>
                                    <Icon icon={'mdi:close'} color='white' />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography
                                variant='subtitle2'
                                width={'100%'}
                                whiteSpace={'nowrap'}
                                overflow={'hidden'}
                                textOverflow={'ellipsis'}
                              >
                                {field?.value?.name}
                              </Typography>
                            </Box>
                          ) : (
                            <TextField
                              type='file'
                              fullWidth
                              onChange={(e: any) => {
                                field.onChange(e?.target?.files[0])
                              }}
                              error={!!errors?.file}
                              helperText={errors?.file?.message}
                              size='small'
                              placeholder={selectedType?.inputPlaceholder ?? 'e.g. Pdf, Xls, Adobe, Miro, Etc.,'}
                              InputProps={{
                                startAdornment: (
                                  <Box display={'flex'} mr={2}>
                                    <Icon icon={selectedType?.icon} fontSize={20} color={theme?.palette.primary.main} />
                                  </Box>
                                )
                              }}
                            />
                          )}
                        </>
                      )}
                    />
                  ) : (
                    <Controller
                      control={control}
                      name='value'
                      rules={{
                        required: `Please enter a ${selectedType?.inputTitle ?? ''} link`,
                        validate: value => {
                          if (selectedType?.regex) {
                            const isValid = selectedType.regex.some(pattern => pattern.test(value))

                            return (
                              isValid || `Please enter a valid ${selectedType?.inputTitle ?? selectedType?.title} link`
                            )
                          }

                          return true
                        }
                      }}
                      render={({ field, formState: { errors } }) => (
                        <>
                          <Typography
                            variant='subtitle1'
                            fontWeight={700}
                            mb={2}
                          >{`Paste any ${selectedType?.inputTitle ?? selectedType?.title ?? 'file'} link`}</Typography>
                          <TextField
                            fullWidth
                            {...field}
                            error={!!errors?.value}
                            helperText={errors?.value?.message}
                            size='small'
                            placeholder={selectedType?.inputPlaceholder ?? 'e.g. Pdf, Xls, Adobe, Miro, Etc.,'}
                            InputProps={{
                              startAdornment: (
                                <Box display={'flex'} mr={2}>
                                  <Icon icon={selectedType?.icon} fontSize={20} color={theme?.palette.primary.main} />
                                </Box>
                              )
                            }}
                          />
                        </>
                      )}
                    />
                  )}

                  {/* Display Text */}
                  <Controller
                    control={control}
                    name='displayText'
                    rules={{ required: 'Please enter a text to display file' }}
                    render={({ field, formState: { errors } }) => (
                      <>
                        <Typography variant='subtitle1' fontWeight={700} mt={4} mb={2}>{`Text to display`}</Typography>
                        <TextField
                          fullWidth
                          {...field}
                          error={!!errors?.displayText}
                          helperText={errors?.displayText?.message}
                          size='small'
                          placeholder={'Add your file name here'}
                        />
                      </>
                    )}
                  />
                </Box>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={3}>
                  <CustomButton size='small' variant='text' onClick={handleDialogClose}>
                    Cancel
                  </CustomButton>
                  <CustomButton variant='contained' size='small' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </CustomButton>
                </Box>
              </Box>
            </form>
          </Grid>
          {/* SideBackground */}
          <Grid
            size={{ xs: 12, md: 4 }}
            display={{ xs: 'none', md: 'flex' }}
            sx={{ bgcolor: 'rgba(69, 147, 191, 0.22)' }}
          >
            <Box
              minHeight={600}
              width={'100%'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              gap={20}
            >
              <Image src={ImgUploadBg} alt='Image Upload' priority />
              <Typography variant='body1' fontWeight={600}>
                Upload anything...
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Dialog>
    </>
  )
}

export default DynamicFiles
