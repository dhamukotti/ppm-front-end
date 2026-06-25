import { useEffect, useMemo, useState } from 'react'
import React from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
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
  column: any  // Changed from AdditionalColumn to any to accommodate the new structure
  refetch: () => void
  isSubTask?: boolean
}

const DynamicTableHeader = ({ column, refetch, isSubTask = false }: DynamicTableHeaderProps) => {
  // ** Memo
  const initialValue = useMemo(() => column?.colname || column?.ColumnName, [column?.colname, column?.ColumnName])
  // ** State
  const { user } = useAuth()
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [columns, setColumns] = useState<any[]>([])
  const [selectedColumn, setSelectedColumn] = useState<any>(null)

  // ✅ NEW: Separate state to preserve column data for delete/edit even after menu closes
  // const [activeColumn, setActiveColumn] = useState(null)
  const [activeColumn, setActiveColumn] = useState<any>(null)

  const handleMenuOpen = (e: any, columnData: any) => {
    setAnchorEl(e?.currentTarget)
    setSelectedColumn(columnData)
    setActiveColumn(columnData) // ✅ Keep a stable reference
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedColumn(null)
    // ✅ Do NOT clear activeColumn here — it's needed by delete/edit handlers
  }

  const onEditClick = () => {
    setAnchorEl(null)
    if (selectedColumn) {
      setValue(selectedColumn.colname || selectedColumn.columnName)
    }
    setEditOpen(true)
  }

  useEffect(() => {
    // Check if column has columndetails array (for backward compatibility)
    if (column?.columndetails && Array.isArray(column.columndetails)) {
      setColumns(column.columndetails)
    } else {
      // For the new structure where column itself is the dynamic column
      setColumns([])
    }
  }, [column?.columndetails])
  
  const updateColumnFn = async () => {
    try {
      // Get the correct ID from selectedColumn or fallback to column
      const AdditionalColumnID = selectedColumn?.additionalColumnID || column?.additionalColumnID;
      const Columnname = value;
      
      if (!AdditionalColumnID) {
        toast.error('Column ID not found');
        return;
      }

      const Baseurl = process.env.NEXT_PUBLIC_API_URL1

      const response = await axios.post(
        `${Baseurl}/ChangeSprintDynamicColumnname?Columname=${encodeURIComponent(Columnname)}&DynamicColumnID=${AdditionalColumnID}&LoginuserID=${user?.id}`
      );
            window.dispatchEvent(new Event('columnCreated'));

      
      setEditOpen(false);
      refetch();
      toast.success('Column Name Updated Successfully', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    } catch (error) {
      console.log('error :', error)
      toast.error('Failed to update column name');
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
      const Baseurl = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com';
      // ✅ Use activeColumn instead of selectedColumn (selectedColumn is null after menu closes)
      const dynamicColumnId = activeColumn?.additionalColumnID?.toString();

      
      if (!dynamicColumnId) {
        toast.error('Column ID not found');
        return;
      }
      
      await axios.post(
        `${Baseurl}/RemoveSprintDynamicColumnname?DynamicColumnID=${dynamicColumnId}&LoginuserID=${user?.id}`
      );
                  window.dispatchEvent(new Event('columnCreated'));

      setDeleteOpen(false);
      setActiveColumn(null); // ✅ Clear after successful delete
      refetch();
      toast.success('Column Deleted Successfully', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    } catch (error) {
      console.log('error :', error)
      toast.error('Failed to delete column');
    }
  }

  const onDeleteClick = () => {
    setDeleteOpen(true)
    handleMenuClose() // ✅ This clears selectedColumn, but activeColumn is still set
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // ✅ Use activeColumn for delete title since selectedColumn is null after menu closes
  const getDeleteTitle = () => {
    if (activeColumn) {
      const columnName = activeColumn?.colname || activeColumn?.columnName || 'this column';
      return `Delete '${columnName}' column?`;
    }
    return `Delete column?`;
  }

  // For the new structure where column is a single dynamic column object
  if (!columns || columns.length === 0) {
    return (
      <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          <p style={{ whiteSpace: 'nowrap', marginRight: 15 }}>{column?.colname || column?.ColumnName || 'Column'}</p>
          <IconButton size='small' onClick={(e) => handleMenuOpen(e, column)}>
            <Icon icon={'lets-icons:meatballs-menu'} rotate={45} />
          </IconButton>
        </Box>

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
          title={getDeleteTitle()}
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
    );
  }

  // Original rendering for backward compatibility (when column has columndetails array)
  return (
    <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
      {columns.map((data, index) => (
        <React.Fragment key={data.additionalColumnID || index}>
          <Box display={'flex'} alignItems={'center'}>
            <p style={{ whiteSpace: 'nowrap', marginRight: 15 }}>{data.colname || data.columnName}</p>
            <IconButton size='small' onClick={(e) => handleMenuOpen(e, data)}>
              <Icon icon={'lets-icons:meatballs-menu'} rotate={45} />
            </IconButton>
          </Box>
          {index < columns.length - 1 && <Box mx={1}>|</Box>}
        </React.Fragment>
      ))}

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
        title={getDeleteTitle()}
        refetch={()=>{}}
        onConfirm={handleDelete}
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
