import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Box,
  Dialog,
  DialogContent,
  Grid2,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'

import DeleteDialog from '@/components/dialog/delete-dialog'
import type { AdditionalColumn } from '@/services/modules/project/types'
import { deleteColumn, updateColumn } from '@/services/modules/task-group'

interface DynamicTableHeaderProps {
  column: AdditionalColumn
  refetch: () => void
  isSubTask?: boolean
}

const DynamicTableHeader = ({ column, refetch, isSubTask = false }: DynamicTableHeaderProps) => {
  // ** Memo
  const initialValue = useMemo(() => column?.ColumnName, [column?.ColumnName])

  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleMenuOpen = (e: any) => {
    setAnchorEl(e?.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const onEditClick = () => {
    setAnchorEl(null)
    setEditOpen(true)
  }

  const updateColumnFn = async () => {
    try {
      const updateColumnBody = { columnName: value, projectID: column?.ProjectID, isSubTask }

      await updateColumn({ id: column?.AdditionalColumnID?.toString(), body: updateColumnBody })
      setEditOpen(false)

      refetch()
    } catch (error) {
      console.log('error :', error)
    }
  }

  const onBlur = async () => {
    await updateColumnFn()
    setEditOpen(false)
    handleMenuClose()
  }

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      onBlur()
    }
  }

  const handleDelete = async () => {
    try {
      await deleteColumn(column?.AdditionalColumnID?.toString(), isSubTask)
      refetch()
    } catch (error) {
      console.log('error :', error)
    }
  }

  const onDeleteClick = () => {
    setDeleteOpen(true)
    handleMenuClose()
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
      <p style={{ whiteSpace: 'nowrap', marginRight: 15 }}>{column?.ColumnName}</p>

      <IconButton size='small' onClick={handleMenuOpen}>
        <Icon icon={'lets-icons:meatballs-menu'} rotate={45} />
      </IconButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleMenuClose} TransitionComponent={Grow}>
        <MenuItem onClick={onEditClick}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <i className={'ri-pencil-line text-lg'} />
            <Typography fontSize={13}>Edit</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={onDeleteClick}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <i className={'ri-delete-bin-5-line text-lg'} />
            <Typography fontSize={13}>Delete</Typography>
          </Box>
        </MenuItem>
      </Menu>

      <DeleteDialog
        open={deleteOpen}
        setOpen={val => setDeleteOpen(!!val)}
        title={`Delete '${column?.ColumnName}' column ?`}
        onConfirm={handleDelete}
        refetch={()=>{}}
        description={'You wont be able to revert this action'}
      />

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogContent>
          <Grid2 container spacing={4}>
            <Grid2 size={12}>
              <Typography>Change Column Name</Typography>
            </Grid2>
            <Grid2 size={12}>
              <TextField
                size='small'
                fullWidth
                inputProps={{ maxLength: 50 }}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DynamicTableHeader
