import { useEffect, useMemo, useRef, useState } from 'react'
import { TextField, Typography } from '@mui/material'
import type { Getter } from '@tanstack/react-table'
import type { AdditionalColumn,BugQueueListAPI } from '@/services/modules/bug-queue/types'
import { pattern } from '@/constants/patterns'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface TaskTextValuesProps {
  table: BugQueueListAPI
  getValue: Getter<string>
  index: number
  id: string
  columnData: AdditionalColumn
  dynamicValue: any
  canEdit: boolean
  rowData: BugQueueListAPI
}

const TaskTextValues = ({ table, rowData, getValue, index, id, columnData, dynamicValue, canEdit }: TaskTextValuesProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState<string>(initialValue ?? '-')
  const { profile, user } = useAuth()
  const prevBugIDRef = useRef<any>(null) // ✅ Track previous BugID
 
  const isNumber = useMemo(() => {
    return columnData?.ColumnType?.Keyname === 'NUM'
  }, [columnData?.ColumnType?.Keyname])

  // Function to call the API via axios
  const callInsertDynamicValuesAPI = async (newValue: string) => {
    const DynamicColumnID = columnData?.additionalColumnID;
    const LoginuserID = user?.id;
    const DynamicValue = newValue;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;

    const apiUrl = `${BASE_URL}/InsertBugDynamicValues?DynamicColumnID=${DynamicColumnID}&LoginuserID=${LoginuserID}&BugID=${rowData.BugID}&GroupID=${rowData?.groupID}&DynamicValue=${encodeURIComponent(DynamicValue)}`;

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

    // table.options.meta?.updateData(index, id, body)
  }

  useEffect(() => {
    const currentBugID = rowData?.BugID;

    // ✅ Only update value when BugID actually changes to a different bug
    if (prevBugIDRef.current !== currentBugID) {
      prevBugIDRef.current = currentBugID;

      if (dynamicValue?.dynamicColumnValues !== undefined && dynamicValue?.dynamicColumnValues !== null) {
        setValue(dynamicValue.dynamicColumnValues ?? '-');
      } else if (initialValue !== undefined && initialValue !== null) {
        setValue(initialValue ?? '-');
      } else {
        setValue('-');
      }
    } else {
      // Same BugID — normal update flow (existing logic)
      if (dynamicValue?.dynamicColumnValues !== undefined && dynamicValue?.dynamicColumnValues !== null) {
        setValue(dynamicValue.dynamicColumnValues ?? '-');
      } else if (initialValue !== undefined && initialValue !== null) {
        setValue(initialValue ?? '-');
      } else {
        setValue('-');
      }
    }
  }, [initialValue, dynamicValue, rowData?.BugID])

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
