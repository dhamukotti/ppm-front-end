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
import axios from 'axios'
import { toast } from 'react-hot-toast'

import type { AdditionalColumn } from '@/services/modules/project/types'
import { updateSubTask } from '@/services/modules/sub-task'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import { deleteDynamicValue, updateTasks } from '@/services/modules/task'
import { addDropdownItem, fetchDropDownList } from '@/services/modules/task-group'
import type { DynamicDropdownList } from '@/services/modules/task-group/types'
import type { AdditionalValue, SprintItem } from '@/services/modules/sprint-item/types'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'

interface DynamicDropdownProps {
  rowData: SprintItem 
  refetch: () => void
  isSubTask?: boolean
  dynamicValue?: AdditionalValue[]
  columnData?: AdditionalColumn
  canEdit?: boolean
}

type FormValidateType = { dropdown: any }

// Define interface for the sprint dropdown response
interface SprintDropdownResponse {
  dynamicDropdownID: number;
  valuetxt: string;
}

const DynamicDropdown = ({ columnData, rowData, dynamicValue, refetch, canEdit }: DynamicDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [createMenu, setCreateMenu] = useState(false)
  const { user } = useAuth();

  // Find the specific column data from dynamicValue array
  const currentColumnData = useMemo(() => {
    if (!dynamicValue || !columnData) return null;
    return dynamicValue.find(item => item.additionalColumnID === columnData.additionalColumnID);
  }, [dynamicValue, columnData]);

  // Get the selected values for this specific column
  const selectedValues = useMemo(() => {
    if (!currentColumnData?.dynamicDropdownValueList) return [];
    return currentColumnData.dynamicDropdownValueList;
  }, [currentColumnData]);

  // API function for fetching sprint dropdown values - inside component
  const fetchSprintDropdownValues = async (taskGroupID: string, taskID: string): Promise<SprintDropdownResponse[]> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskGetDynamicDropdownvaluelist?GroupID=${taskGroupID}&TaskID=${taskID}`
    );
    return response.data;
  };

  // API function for creating new dynamic values
  const callInsertDynamicValuesAPI = async (newValue: string) => {
    const DynamicColumnID = columnData?.additionalColumnID;
    const LoginuserID = user?.id;

    const DynamicValue = newValue;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;

    const apiUrl = `${BASE_URL}/SprintTaskCreateDynamicDropdownValues?AdditionalColID=${DynamicColumnID}&LoginUserID=${LoginuserID}&GroupID=${(rowData as any)?.taskGroupID}&TaskID=${(rowData as any)?.taskID}&Dynamicvalue=${encodeURIComponent(DynamicValue)}`;

    try {
      const response = await axios.post(apiUrl);
      toast.success('Value created successfully');
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      toast.error('Failed to create value');
      throw error;
    }
  };

  // This query remains unchanged
  const { data: dropdownItems, refetch: refetchDDL } = useQuery({
    queryKey: ['dropdown-items', rowData?.TaskGroupID],
    queryFn: () => fetchDropDownList({ taskGroupID: rowData?.TaskGroupID?.toString() })
  })

  // Query for fetching sprint dropdown values
  const { data: sprintDropdownValues, refetch: refetchSprintValues } = useQuery({
    queryKey: ['sprint-dropdown-values', (rowData as any)?.taskGroupID, (rowData as any)?.taskID],
    queryFn: () => fetchSprintDropdownValues(
      (rowData as any)?.taskGroupID?.toString() || '',
      (rowData as any)?.taskID?.toString() || ''
    ),
    enabled: !!((rowData as any)?.taskGroupID && (rowData as any)?.taskID)
  });

  // Transform sprint dropdown values to match the expected format
  const transformedSprintValues = useMemo(() => {
    if (!sprintDropdownValues) return [];
    return sprintDropdownValues.map(item => ({
      Dynamic_ddl_ID: item.dynamicDropdownID,
      Valuetxt: item.valuetxt
    }));
  }, [sprintDropdownValues]);

  // Combine both sources or use whichever is appropriate
  const listItems = useMemo(() => {
    // If we have sprint dropdown values, use them (filtering out already selected ones)
    if (transformedSprintValues.length > 0) {
      return transformedSprintValues.filter(i =>
        selectedValues?.every((val:any) => {

          return val.dynamicddlID !== i?.Dynamic_ddl_ID;
        })
      );
    }
    
    // Otherwise fall back to the original dropdown items
    const finalArr = dropdownItems?.filter(i =>
      selectedValues?.every((val:any) => {
        return val.dynamicddlID !== i?.Dynamic_ddl_ID;
      })
    )

    return finalArr ?? []
  }, [selectedValues, dropdownItems, transformedSprintValues])

  const handleOpen = (e: any) => {
    canEdit && setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setCreateMenu(false)
  }

  const handleDropdownSelect = async (item: { Dynamic_ddl_ID: number; Valuetxt: string } | null) => {

    try {
      if (!item) return;
      
      // Construct the API URL with the required parameters
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
      const DynamicColumnID = columnData?.additionalColumnID;
      const LoginuserID = user?.id;
      const SprintID = (rowData as any)?.taskID;
      const SprintGroupID = (rowData as any)?.taskGroupID;
      const DynamicValue = item?.Dynamic_ddl_ID;
      
      const apiUrl = `${BASE_URL}/SprintTaskAssignDynamicDropdownValue?AdditionalColID=${DynamicColumnID}&LoginUserID=${LoginuserID}&GroupID=${SprintGroupID}&TaskID=${SprintID}&DynamicDropDownID=${DynamicValue}`;
      
      // Make the API call using POST method
      const response = await axios.post(apiUrl);
      
      if (response) {
        toast.success('Value selected successfully');
        await refetch();
        await refetchSprintValues();
        handleClose();
      }
    } catch (error) {
      console.error('error selecting dropdown value :', error)
      toast.error('Failed to select value');
    }
  }

  // const handleDeleteLabel = async (id: string) => {
  //   try {
  //     await deleteDynamicValue(id);
  //     toast.success('Value deleted successfully');
  //     refetch();
  //     refetchSprintValues();
  //   } catch (error) {
  //     console.error('error deleting value :', error);
  //     toast.error('Failed to delete value');
  //   }
  // }

  // React Hook Form setup
  
  
  
  
  const handleDeleteLabel = async (id: string) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
    const DynamicColumnID = columnData?.additionalColumnID;
    const LoginuserID = user?.id;
    const taskid = (rowData as any)?.taskID;
    const groupid = (rowData as any)?.taskGroupID;
    
    // Construct the URL with all required parameters
    const apiUrl = `${BASE_URL}/SprintTaskRemoveDynamicDropdownValues?AdditionalColID=${DynamicColumnID}&LoginUserID=${LoginuserID}&GroupID=${groupid}&TaskID=${taskid}&DynamicDropdownValueID=${id}`;
    
    // Use DELETE method instead of GET (adjust based on API requirement)
    const response = await axios.post(apiUrl, {
      data: { dynamicDropDownID: id } // If API expects the ID in body
    });
    
    if (response) {
      toast.success('Value deleted successfully');
      await refetch();
      await refetchSprintValues();
    }
  } catch (error) {
    console.error('error deleting value :', error);
    toast.error('Failed to delete value');
  }
}
  
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValidateType>({
    defaultValues: {
      dropdown: ''
    }
  });

  // Submit handler for creating new dropdown value
  const onSubmit = async (data: FormValidateType) => {
    try {
      if (!data.dropdown) return;
      
      // Call the create API
      const response = await callInsertDynamicValuesAPI(data.dropdown);
      
      if (response) {
        // Refetch the sprint dropdown values to include the newly created one
        await refetchSprintValues();
        
        // Reset form and close create menu (go back to selection view)
        reset();
        setCreateMenu(false);
      }
    } catch (error) {
      console.error('error creating dropdown value :', error);
    }
  };

  return (
    <Box display={'flex'} alignItems={'center'} height={'100%'}>
      <Box onClick={handleOpen} sx={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}>
        {selectedValues?.length ? (
          <Box display={'flex'} alignItems={'center'} gap={2}>
            {/* Show only first value as chip */}
            <Chip variant='tonal' size='small' label={selectedValues?.[0]?.valueText || selectedValues?.[0]?.Dropdown?.Valuetxt} />
            {/* Show count of remaining values if more than one */}
            {selectedValues?.length > 1 && `+${selectedValues?.length - 1}`}
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
                          helperText={errors?.dropdown ? 'This field is required' : ''}
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
                        <li {...props} key={option.Dynamic_ddl_ID}>
                          {option.Valuetxt}
                        </li>
                      )}
                      size='small'
                      renderInput={params => <TextField {...params} placeholder='Select a value' />}
                      getOptionLabel={option => {
                        return option.Valuetxt || ''
                      }}
                      isOptionEqualToValue={(option:any, value:any) => option.dynamicDropdownValueID === value?.dynamicDropdownValueID}
                      onChange={(event, newValue) => {
                        handleDropdownSelect(newValue)
                      }}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box minHeight={'50px'}>
                  {selectedValues?.length ? (
                    <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} rowGap={3} columnGap={3}>
                      {selectedValues?.map((item:any, index:any) => {
                        // Get the value text from either structure
                        const valueText = item?.valueText || item?.Dropdown?.Valuetxt;
                        
                        // Create a unique key using combination of id and index
                        const uniqueKey = item.dynamicddlID 
                          ? `${item.dynamicddlID}-${index}` 
                          : `item-${index}`;
                        
                        return (
                          <Box
                            key={uniqueKey}
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
                              {valueText}
                            </Typography>
                            
                            <IconButton
                              size='small'
                              sx={{ p: 0 }}
                              onClick={() => handleDeleteLabel(item.dynamicddlID?.toString() || index.toString())}
                            >
                              <Icon icon={'ep:close-bold'} color='red' />
                            </IconButton>
                          </Box>
                        );
                      })}
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
