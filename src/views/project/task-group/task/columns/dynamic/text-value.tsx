import { useEffect, useMemo, useState } from 'react'

import { TextField, Typography } from '@mui/material'

import type { Getter } from '@tanstack/react-table'

import type { AdditionalColumn } from '@/services/modules/project/types'
import { pattern } from '@/constants/patterns'

interface TaskTextValuesProps {
  table: any
  getValue: Getter<string>
  index: number
  id: string
  columnData: AdditionalColumn
  dynamicValue: any
  canEdit: boolean
}

const TaskTextValues = ({ table, getValue, index, id, columnData, dynamicValue, canEdit }: TaskTextValuesProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState<string>(initialValue ?? '-')

  const isNumber = useMemo(() => {
    return columnData?.ColumnType.Keyname === 'NUM'
  }, [columnData?.ColumnType.Keyname])

  const onBlur = () => {
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
 setValue(initialValue ?? '-')
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
        if (isNumber) {
          if (e?.target?.value === '' || pattern.numbersAllowed?.test(e?.target?.value)) {
            setValue(e.target.value)
          }
        } else {
          setValue(e.target.value)
        }
      }}
      onBlur={onBlur}
    />
  ) : (
    <Typography>{value ?? '-'}</Typography>
  )
}

export default TaskTextValues
