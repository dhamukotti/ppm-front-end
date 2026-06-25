import { useEffect, useMemo, useState } from 'react'
import { TextField, Typography } from '@mui/material'
import type { Getter } from '@tanstack/react-table'
import type { AdditionalColumn } from '@/services/modules/project/types'
import { pattern } from '@/constants/patterns'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast' // Make sure to import toast

interface TaskTextValuesProps {
  table: any
  getValue: Getter<string>
  index: number
  id: string
  columnData: AdditionalColumn
  dynamicValue: any
  canEdit: boolean
  rowData: string
}

const TaskTextValues = ({ table, rowData, getValue, index, id, columnData, dynamicValue, canEdit }: TaskTextValuesProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState<string>(initialValue ?? '-')
  const { profile, user } = useAuth()

 
  const isNumber = useMemo(() => {
    return columnData?.ColumnType?.Keyname === 'NUM'
  }, [columnData?.ColumnType?.Keyname])

  // Function to call the API via axios
  const callInsertDynamicValuesAPI = async (newValue: string) => {
    const DynamicColumnID = columnData?.additionalColumnID;
    const LoginuserID = user?.id;
    const Taskid = (rowData as any)?.taskID;
  //  const groupid = rowData.gr
    const DynamicValue = newValue;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;

    const apiUrl = `${BASE_URL}/InsertDynamicSprintTaskValues?DynamicColumnID=${DynamicColumnID}&LoginuserID=${LoginuserID}&TaskID=${Taskid}&GroupID=${(rowData as any)?.taskGroupID}&DynamicValue=${encodeURIComponent(DynamicValue)}`;

    try {
      const response = await axios.post(apiUrl);
      // Show success toaster
      toast.success('Value updated successfully');
    } catch (error) {
      console.error('API call failed:', error);
      // Show error toaster
      toast.error('Failed to update value');
    }
  };

  const onBlur = async () => {
    // Call the API first
    await callInsertDynamicValuesAPI(value);
    
    // Then update the table data
    const body = {
      DynamicID: dynamicValue?.DynamicID ?? null,
      AdditionalColumnID: columnData?.AdditionalColumnID,
      value,
      Title: `Column '${columnData?.ColumnName}' was updated`,
      PreviousState: initialValue,
      NewState: value
    }

    table.options.meta?.updateData(index, id, body)
  }

  useEffect(() => {
    setValue((initialValue as any)?.dynamicColumnValues ?? '-')
  }, [initialValue])

  return canEdit ? (
    <TextField
      variant='standard'
      sx={{
        border: 0,
        '& .MuiInputBase-root::before': {
          borderBottom: 0
        },
        '& .MuiInputBase-root:hover::before': {
          borderBottom: 0
        }
      }}
      placeholder='Please enter a value'
      fullWidth
      value={value}
      inputProps={{ maxLength: 50 }}
      onChange={e => {
        let newValue = e.target.value;
        if (isNumber) {
          if (newValue === '' || pattern.numbersAllowed?.test(newValue)) {
            setValue(newValue);
          }
        } else {
          setValue(newValue);
        }
      }}
      onBlur={onBlur}
    />
  ) : (
    <Typography>{value ?? '-'}</Typography>
  )
}

export default TaskTextValues
