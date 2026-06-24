import React, { useEffect, useState } from 'react'

import { TextField, Typography } from '@mui/material'
import type { Getter } from '@tanstack/react-table'

interface TaskEffortCellProps {
  table: any
  getValue: Getter<string>
  index: number
  id: string
  canEdit: boolean
}

const TaskEffortCell = ({ table, getValue, index, id, canEdit }: TaskEffortCellProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue ?? '')

  const onBlur = () => {
    table.options.meta?.updateData(index, id, value)
  }

  useEffect(() => {
    setValue(initialValue)
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
      fullWidth
      placeholder='eg. 10 hours'
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  ) : (
    <Typography width={'100%'}>{value ?? '-'}</Typography>
  )
}

export default TaskEffortCell
