import { useEffect, useState } from 'react'

import { TextField, Typography } from '@mui/material'
import type { Getter } from '@tanstack/react-table'

interface ColumnTextFieldProps {
  table: any
  getValue: Getter<string>
  index: number
  id: string
  canEdit: boolean
}

export const ColumnTextField = ({ table, getValue, index, id, canEdit = true }: ColumnTextFieldProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue || '')

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
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
      className='min-w-44'
      value={value  ?? "-"}
      slotProps={{ htmlInput: { maxLength: 254 } }}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  ) : (
    <Typography className='w-full min-w-20' width={'100%'}>
      {value ?? '-'}
    </Typography>
  )
}

type DefaultColumnType = {
  getValue: Getter<string>
  row: { index: number }
  column: { id: string }
  table: any
}

// Give our default column cell renderer editing superpowers!
export const defaultColumn: any = (canEdit: boolean) => ({
  cell: ({ getValue, row: { index }, column: { id }, table }: DefaultColumnType) => {
    return <ColumnTextField getValue={getValue} index={index} id={id} table={table} canEdit={canEdit} />
  }
})
