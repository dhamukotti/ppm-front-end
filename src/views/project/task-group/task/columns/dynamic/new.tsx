import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useAuth } from '@/hooks/useAuth'
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
  Zoom,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import axios from 'axios'

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
  canEdit?: boolean,
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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)
  const [successAlert, setSuccessAlert] = useState<string | null>(null)
const { profile,user } = useAuth()
  // ** Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  
  // Allowed file types
  const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg']
  }

  const ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flat()
  const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES)

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
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleDialogClose = () => {
    setOpen(false)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleErrorAlertClose = () => {
    setErrorAlert(null)
  }

  const handleSuccessAlertClose = () => {
    setSuccessAlert(null)
  }

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setErrorAlert(`File size (${fileSizeMB}MB) exceeds the maximum limit of 5MB. Please select a smaller file.`)
      return false
    }
    return true
  }

  const validateFileType = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const fileMimeType = file.type

    // Check both MIME type and extension
    const isValidMimeType = ALLOWED_MIME_TYPES.includes(fileMimeType)
    const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)

    if (!isValidMimeType && !isValidExtension) {
      setErrorAlert(
        `Invalid file type. Only PDF, Excel (.xls, .xlsx), Word (.doc, .docx), and Image files (.jpg, .jpeg, .png, .gif, .webp, .svg) are allowed.`
      )
      return false
    }

    return true
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
        setErrorAlert('Failed to update. Please try again.')
      }
    } else {
      // Validate file size before upload
      if (!validateFileSize(data.file)) {
        return
      }

      // Validate file type before upload
      if (!validateFileType(data.file)) {
        return
      }

      try {
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append("file", data?.file)
        
        // Get TaskID and SubTaskID based on whether it's a subtask or task
        let taskId: string | number
        let subTaskId: string | number | undefined
        
        if (isSubTask) {
          const subRowData = rowData as AdditionalSubTaskListItem
          taskId = subRowData?.TaskMasterID
          subTaskId = subRowData?.SubTaskID
        } else {
          const taskRowData = rowData as TaskListItemType
          taskId = taskRowData?.TaskID
        }
        
        // Use different endpoint based on isSubTask and include TaskID/SubTaskID
          const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
        const uploadEndpoint = isSubTask 
          ? `${BASE_URL}/UploadSubTaskDocument/${columnData?.AdditionalColumnID}/'0'/${data?.displayText}/${taskId}/${subTaskId}/${user?.id}`
          : `${BASE_URL}/UploadTaskDocument/${columnData?.AdditionalColumnID}/'0'/${data?.displayText}/${taskId}/${user?.id}`
        
        const response = await axios.post(
          uploadEndpoint,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 300000,
            
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              )
              setUploadProgress(percentCompleted)
            },
            
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        )
        
        if (response) {
          refetch()
          setOpen(false)
          handleClose()
          setIsUploading(false)
          setUploadProgress(0)
          setSuccessAlert('File uploaded successfully!')
        }
      } catch (error) {
        console.error('File upload failed:', error)
        setErrorAlert('File upload failed. Please try again.')
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }
  const handleclear = async () => {
const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
        let taskId: string | number
        let subTaskId: string | number | undefined
          const subRowData = rowData as AdditionalSubTaskListItem
          taskId = subRowData?.TaskMasterID
  const data = await axios.post(`${BASE_URL}/UploadTaskDocument/${columnData?.AdditionalColumnID}/1/${"-"}/${subRowData?.TaskID}/${user?.id}`).then((res)=>{
refetch()
  })

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
     
            <Box sx={{ position: 'relative' }}>
  {/* Close Icon - positioned absolutely on top */}
  <IconButton 
    size='small' 
    sx={{ 
      position: 'absolute', 
      top: -18, 
      right: -15,
      zIndex: 10 // Ensure it's on top
    }}
    onClick={() => {
      handleclear()
      // Your close button click handler logic here
    }}
  >
    <Icon icon={'icon-park-twotone:close-one'} color='red' />
  </IconButton>
  
  {/* Share Icon */}
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

      {/* Error Alert Snackbar */}
      <Snackbar 
        open={!!errorAlert} 
        autoHideDuration={6000} 
        onClose={handleErrorAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorAlertClose} severity="error" sx={{ width: '100%' }}>
          {errorAlert}
        </Alert>
      </Snackbar>

      {/* Success Alert Snackbar */}
      <Snackbar 
        open={!!successAlert} 
        autoHideDuration={4000} 
        onClose={handleSuccessAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSuccessAlertClose} severity="success" sx={{ width: '100%' }}>
          {successAlert}
        </Alert>
      </Snackbar>

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
                    Kindly upload PDF, Excel, Word, or Image files only (Max 5MB)
                  </Typography>
                </Box>

                {/* Form */}
                <Box flex={1}>
                  {/* File */}
                  {selectedType?.type === 'computer' ? (
                    <Controller
                      control={control}
                      name='file'
                      rules={{ 
                        required: `Please upload a file`,
                        validate: (file) => {
                          if (!file) return true
                          
                          // Validate file size
                          if (file.size > MAX_FILE_SIZE) {
                            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
                            return `File size (${fileSizeMB}MB) exceeds 5MB limit`
                          }

                          // Validate file type
                          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
                          const fileMimeType = file.type
                          const isValidMimeType = ALLOWED_MIME_TYPES.includes(fileMimeType)
                          const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)

                          if (!isValidMimeType && !isValidExtension) {
                            return 'Only PDF, Excel, Word, and Image files are allowed'
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
                          >{`Upload a file from your device (Max 5MB)`}</Typography>
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
                                const file = e?.target?.files[0]
                                if (file && validateFileSize(file) && validateFileType(file)) {
                                  field.onChange(file)
                                } else {
                                  e.target.value = ''
                                }
                              }}
                              error={!!errors?.file}
                              helperText={errors?.file?.message}
                              size='small'
                              placeholder={selectedType?.inputPlaceholder ?? 'e.g. PDF, Excel, Word, Images'}
                              InputProps={{
                                startAdornment: (
                                  <Box display={'flex'} mr={2}>
                                    <Icon icon={selectedType?.icon} fontSize={20} color={theme?.palette.primary.main} />
                                  </Box>
                                )
                              }}
                              inputProps={{
                                accept: '.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg'
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

                {/* Upload Progress Bar */}
                {isUploading && (
                  <Box width="100%" mb={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Uploading...
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>
                        {uploadProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(69, 147, 191, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        }
                      }} 
                    />
                  </Box>
                )}

                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={3}>
                  <CustomButton size='small' variant='text' onClick={handleDialogClose} disabled={isUploading}>
                    Cancel
                  </CustomButton>
                  <CustomButton variant='contained' size='small' type='submit' disabled={isSubmitting || isUploading}>
                    {isUploading ? `Uploading ${uploadProgress}%` : isSubmitting ? 'Saving...' : 'Save'}
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
