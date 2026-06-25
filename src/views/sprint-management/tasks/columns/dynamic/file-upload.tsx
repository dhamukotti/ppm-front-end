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

import type { AdditionalColumn } from '@/services/modules/sprint-item/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { taskFileUpload, updateTasks } from '@/services/modules/task'
import type { AdditionalValue, SprintItem } from '@/services/modules/sprint-item/types'
import type { TFileUploadMenuItems } from './dynamic-files-menu'
import { menuItems } from './dynamic-files-menu'
import toast from 'react-hot-toast'
  
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
  rowData: SprintItem 
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: AdditionalValue
  columnData?: AdditionalColumn
  canEdit?: boolean,
  allColValues?: any[] // Add this to pass the colvalueList from parent
}

const DynamicFiles = ({
  canEdit,
  columnData,
  rowData,
  dynamicValue: propDynamicValue,
  refetch,
  isSubTask = false,
  allColValues = [] // Accept colvalueList from parent
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
  
  // Helper function to safely get column ID regardless of casing
  const getColumnId = (column: any): string | number | undefined => {
    if (!column) return undefined;
    
    // Check for all possible variations
    return column?.AdditionalColumnID || 
           column?.additionalColumnID || 
           column?.AdditionalcolumnID ||
           column?.additionalcolumnid ||
           column?.id || 
           column?.ID ||
           column?.Id ||
           column?.columnId ||
           column?.ColumnId ||
           column?.columnid ||
           column?.COLUMNID ||
           undefined;
  }

  // Helper function to get column ID from dynamic value
  const getColumnIdFromDynamicValue = (value: any): string | number | undefined => {
    if (!value) return undefined;
    
    // Check for all possible variations in the dynamic value
    return value?.AdditionalColumnID || 
           value?.additionalColumnID || 
           value?.AdditionalcolumnID ||
           value?.additionalcolumnid ||
           value?.ColumnID ||
           value?.columnID ||
           value?.ColumnId ||
           value?.columnId ||
           value?.id || 
           value?.ID ||
           value?.Id ||
           undefined;
  }

  // Helper function to get sprint ID from rowData (handles both camelCase and PascalCase)
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

  // Helper function to get taskGroupID from rowData (handles both camelCase and PascalCase)
  const getTaskGroupId = (data: any): string | number | undefined => {
    if (!data) return undefined;
    
    return data?.taskGroupID ||
           data?.TaskGroupID ||
           data?.taskgroupID ||
           data?.taskgroupid ||
           data?.TaskGroupId ||
           data?.taskGroupId ||
           undefined;
  }

  // Helper function to get taskID from rowData (handles both camelCase and PascalCase)
  const getTaskId = (data: any): string | number | undefined => {
    if (!data) return undefined;

    return data?.taskID ||
           data?.TaskID ||
           data?.taskId ||
           data?.TaskId ||
           data?.taskid ||
           undefined;
  }

  // Get column ID from columnData
  const columnId = getColumnId(columnData);
  
  // Get current sprint ID from rowData
  const currentSprintId = getSprintId(rowData);

  // Get current taskGroupID from rowData — used to scope file values per row
  const currentTaskGroupId = getTaskGroupId(rowData);

  // Get current taskID from rowData — used as secondary scope identifier
  const currentTaskId = getTaskId(rowData);

  // ** Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com'
  
  // Find the dynamic value from rowData if not provided as prop
  const getDynamicValue = (): AdditionalValue | undefined => {
    // If provided as prop, use it
    if (propDynamicValue) {
      return propDynamicValue
    }
    
    // Get column ID safely
    const colId = getColumnId(columnData);
    
    if (!colId) return undefined;

    // Helper to match a row's taskGroupID and taskID against the current row
    const matchesCurrentRow = (item: any): boolean => {
      const itemTaskGroupId = getTaskGroupId(item);
      const itemTaskId = getTaskId(item);

      // Match by taskGroupID — primary row identifier
      if (currentTaskGroupId !== undefined && itemTaskGroupId !== undefined) {
        if (String(itemTaskGroupId) !== String(currentTaskGroupId)) return false;
      }

      // Additionally match by taskID if available on the item
      if (currentTaskId !== undefined && itemTaskId !== undefined) {
        if (String(itemTaskId) !== String(currentTaskId)) return false;
      }

      return true;
    }
    
    // First try to find in allColValues (passed from parent with colvalueList)
    // Filter by taskGroupID + taskID (row-level scope) AND column ID
    if (allColValues && Array.isArray(allColValues) && allColValues.length > 0) {
      // Filter by both sprint ID and row-level identifiers (taskGroupID / taskID)
      const valuesForThisRow = allColValues.filter((item: any) => {
        const itemSprintId = item?.sprintID || item?.SprintID;
        const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
        return sprintMatches && matchesCurrentRow(item);
      });
      
      // Then find the one with matching column ID
      const foundValue = valuesForThisRow.find((item: any) => {
        const itemColumnId = getColumnId(item);
        return String(itemColumnId) === String(colId);
      });
      
      if (foundValue) {
        return foundValue;
      }
    }
    
    // Try to find in rowData.colvalueList if it exists (for backward compatibility)
    if (rowData && 'colvalueList' in rowData && Array.isArray((rowData as any).colvalueList)) {
      // Filter by row-level identifiers in addition to sprint ID
      const valuesFromRowData = (rowData as any).colvalueList.filter((item: any) => {
        const itemSprintId = item?.sprintID || item?.SprintID;
        const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
        return sprintMatches && matchesCurrentRow(item);
      });
      
      const colValue = valuesFromRowData.find(
        (item: any) => {
          const itemColumnId = getColumnId(item);
          return String(itemColumnId) === String(colId);
        }
      )
      
      if (colValue) {
        return colValue;
      }
    }
    
    // Try to access from additionalValues if it exists
    if (rowData && (rowData as any).additionalValues && Array.isArray((rowData as any).additionalValues)) {
      // Filter by row-level identifiers
      const valuesFromAdditional = (rowData as any).additionalValues.filter((item: any) => {
        const itemSprintId = item?.sprintID || item?.SprintID;
        const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
        return sprintMatches && matchesCurrentRow(item);
      });
      
      const additionalValue = valuesFromAdditional.find(
        (item: any) => {
          const itemColumnId = getColumnId(item);
          return String(itemColumnId) === String(colId);
        }
      );
      
      if (additionalValue) {
        return additionalValue;
      }
    }
    
    // Try to access from dynamicColumns if it exists
    if (rowData && (rowData as any).dynamicColumns && Array.isArray((rowData as any).dynamicColumns)) {
      // Filter by row-level identifiers
      const valuesFromDynamic = (rowData as any).dynamicColumns.filter((item: any) => {
        const itemSprintId = item?.sprintID || item?.SprintID;
        const sprintMatches = !itemSprintId || String(itemSprintId) === String(currentSprintId);
        return sprintMatches && matchesCurrentRow(item);
      });
      
      const dynamicColumn = valuesFromDynamic.find(
        (item: any) => {
          const itemColumnId = getColumnId(item);
          return String(itemColumnId) === String(colId);
        }
      );
      
      if (dynamicColumn) {
        return dynamicColumn;
      }
    }
    
    // If we have rowData and columnData but couldn't find in arrays, 
    // check if the value is directly on the rowData with the column ID as key
    if (rowData && columnId) {
      const directValue = (rowData as any)[columnId.toString()];
      if (directValue) {
        return directValue;
      }
    }
    
    return undefined
  }

  const dynamicValue = getDynamicValue()
  
  // Get column ID from dynamic value using the helper function
  const dynamicValueColumnId = getColumnIdFromDynamicValue(dynamicValue);
  
  // Helper function to clean any value by removing leading/trailing commas and whitespace
  const cleanValue = (value: any): string => {
    if (!value) return '';
    if (typeof value !== 'string') return String(value);
    
    // Remove leading commas, spaces, and trim
    return value.replace(/^[,\s]+/, '').trim();
  }

  // Helper function to get display text (handles both camelCase and PascalCase)
  const getDisplayText = (value: AdditionalValue | undefined): string => {
    if (!value) return ''
    
    // Check for direct string value
    if (typeof value === 'string') return cleanValue(value)
    
    // Check for object with displayText/DisplayText properties
    let displayText = (value as any)?.displayText || 
                     (value as any)?.DisplayText || 
                     (value as any)?.fileName || 
                     (value as any)?.FileName ||
                     (value as any)?.name ||
                     (value as any)?.Name ||
                     (value as any)?.value ||
                     (value as any)?.Value ||
                     (value as any)?.text ||
                     (value as any)?.Text ||
                     '';
    
    // Clean the display text
    displayText = cleanValue(displayText);
    
    // If displayText is empty, try to get from dynamicColumnValues
    if (!displayText) {
      const dynamicValues = getDynamicColumnValues(value);
      // If dynamicValues is a URL, extract filename from it
      if (dynamicValues && typeof dynamicValues === 'string') {
        try {
          // Try to extract filename from URL
          const urlParts = dynamicValues.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          // Remove query parameters if any
          const fileNamePart = lastPart.split('?')[0];
          if (fileNamePart && fileNamePart.includes('.')) {
            return cleanValue(decodeURIComponent(fileNamePart));
          }
        } catch (e) {
          console.error('Error extracting filename from URL:', e);
        }
      }
      return cleanValue(dynamicValues || '');
    }
    
    return displayText;
  }

  // Helper function to get dynamic column values
  const getDynamicColumnValues = (value: AdditionalValue | undefined): string => {
    if (!value) return ''
    
    // Check for direct string value
    if (typeof value === 'string') return cleanValue(value)
    
    // Check for object with dynamicColumnValues/DynamicColumnValues properties
    let dynamicValue = (value as any)?.dynamicColumnValues || 
                      (value as any)?.DynamicColumnValues || 
                      (value as any)?.fileUrl || 
                      (value as any)?.FileUrl || 
                      (value as any)?.url || 
                      (value as any)?.Url || 
                      (value as any)?.path ||
                      (value as any)?.Path ||
                      (value as any)?.filePath ||
                      (value as any)?.FilePath ||
                      (value as any)?.value ||
                      (value as any)?.Value ||
                      '';
    
    // Clean the dynamic value
    return cleanValue(dynamicValue);
  }

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
      const formData = new FormData()
      
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com';
      
      // Use only UploadSprintDynamicDocument API
      const uploadEndpoint = `${BASE_URL}/SprintTaskFileUpload/${columnId}/${user?.id}/${(rowData as any)?.taskID || (rowData as any)?.taskID || ''}/${(rowData as any)?.taskGroupID || (rowData as any)?.taskGroupID || ''}/${encodeURIComponent(data.value)}/${encodeURIComponent(data?.displayText)}`
      
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
              toast.success("Link Uploaded Successfully")

        setSuccessAlert('Text updated successfully!')
      }
    } catch (error) {
      console.error('Error updating text:', error)
      setErrorAlert('Failed to update. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
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
      formData.append("file", data.file)
      
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com';
      
      // Use only UploadSprintDynamicDocument API
      const uploadEndpoint = `${BASE_URL}/SprintTaskFileUpload/${columnId}/${user?.id}/${(rowData as any)?.taskID || (rowData as any)?.taskID || ''}/${(rowData as any)?.taskGroupID || (rowData as any)?.taskGroupID || ''}/-/${encodeURIComponent(data?.displayText)}`
      
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
        // Get the file path from response - adjust based on your API response structure
        const filePath = response?.data?.filePath || response?.data?.path || response?.data?.url || '';
        
        // Get file extension and set appropriate icon
        const fileExtension = data.file?.name?.split('.').pop()?.toLowerCase();
        let iconName = 'mdi:file-outline'; // default icon
        
        // Set icon based on file extension
        if (fileExtension) {
          switch (fileExtension) {
            case 'pdf':
              iconName = 'mdi:file-pdf-outline';
              break;
            case 'xls':
            case 'xlsx':
              iconName = 'mdi:file-excel-outline';
              break;
            case 'doc':
            case 'docx':
              iconName = 'mdi:file-word-outline';
              break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
            case 'svg':
              iconName = 'mdi:file-image-outline';
              break;
            default:
              iconName = 'mdi:file-outline';
          }
        }
        
        refetch()
        setOpen(false)
        handleClose()
        setIsUploading(false)
        setUploadProgress(0)
                      toast.success("File Uploaded Successfully")

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
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com';
      
      // Use dynamic values instead of hardcoded ones
      const uploadEndpoint = `${BASE_URL}/SprintTaskRemoveFileUpload/${columnId}/${user?.id}/${(rowData as any)?.taskID || (rowData as any)?.taskID || ''}/${(rowData as any)?.taskGroupID}`
      
      await axios.post(uploadEndpoint)
      toast.success("File Removed Successfully")
      refetch()
      setSuccessAlert('File removed successfully!')
    } catch (error) {
      console.error('File removal failed:', error)
      setErrorAlert('Failed to remove file. Please try again.')
    }
  }

  const displayText = getDisplayText(dynamicValue)
  const dynamicColumnValues = getDynamicColumnValues(dynamicValue)

  return (
    <>
      <Box display={'flex'} height={'100%'} alignItems={'center'}>
        {!displayText ? (
          canEdit ? (
            <IconButton onClick={handleOpen}>
              <Icon icon={'bi:plus-circle-dotted'} />
            </IconButton>
          ) : (
            '-'
          )
        ) : (
          <div className='rounded-full border border-primary flex items-center gap-2 py-0.5 px-2'>
            <Tooltip title={displayText}>
              <Typography variant='body2' className='text-primary text-xs'>
                {displayText?.slice(0, 8)}
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
                  zIndex: 10
                }}
                onClick={handleclear}
              >
                <Icon icon={'icon-park-twotone:close-one'} color='red' />
              </IconButton>
              
              {/* Share Icon */}
              <IconButton
                size='small'
                onClick={() => {
                  if (dynamicColumnValues) {
                    const decodedUrl = decodeURIComponent(dynamicColumnValues);
                    window.open(decodedUrl, '_blank', 'noopener,noreferrer');
                  }
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
