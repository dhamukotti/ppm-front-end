import { useEffect, useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import type { Getter } from '@tanstack/react-table'

interface ColumnTextFieldProps {
  table: any
  getValue: Getter<string>
  index: number
  id: string
  canEdit: boolean
}

export const DescriptionTextfiled = ({ table, getValue, index, id, canEdit = true }: ColumnTextFieldProps) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue || '')
  const maxLength = 2000

  const onBlur = () => {
    table.options.meta?.updateData(index, id, value)
  }

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      setValue(newValue)
    }
  }

  const valueLength = value?.length || 0

  return canEdit ? (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        variant='standard'
        multiline
        minRows={3}
        maxRows={6}
        fullWidth
        className='min-w-44'
        value={value ?? '-'}
        onChange={handleChange}
        onBlur={onBlur}
        inputProps={{ maxLength: maxLength }} // ✅ This one stays
        sx={{
          border: 0,
          '& .MuiInputBase-root::before': { borderBottom: 0 },
          '& .MuiInputBase-root:hover::before': { borderBottom: 0 }
        }}
      />

      {/* <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: -14,
          right: 8,
          color: valueLength === maxLength ? 'error.main' : 'text.secondary',
          fontSize: '0.75rem'
        }}
      >
        {valueLength}/{maxLength}
      </Typography> */}
    </Box>
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

export const defaultColumn: any = (canEdit: boolean) => ({
  cell: ({ getValue, row: { index }, column: { id }, table }: DefaultColumnType) => {
    return <DescriptionTextfiled getValue={getValue} index={index} id={id} table={table} canEdit={canEdit} />
  }
})
