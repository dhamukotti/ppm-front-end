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
  column: any
  refetch: () => void
  isSubTask?: boolean
}

const DynamicTableHeader = ({ column, refetch, isSubTask = false }: DynamicTableHeaderProps) => {
  
  const initialValue = useMemo(() => column?.colname || column?.ColumnName || column?.colName, [column?.colname, column?.ColumnName, column?.colName])
  const { user } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleMenuOpen = (e: any, columnData: any) => {
    e.stopPropagation(); // Add this to prevent event bubbling
    e.preventDefault();
    setAnchorEl(e?.currentTarget)
    setSelectedColumn(columnData)
    setActiveColumn(columnData)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedColumn(null)
  }

  const onEditClick = () => {
    setAnchorEl(null)
    if (selectedColumn) {
      setValue((selectedColumn as any).colname || (selectedColumn as any).columnName)
    } else if (column) {
      setValue(column.colname || column.columnName)
    }
    setEditOpen(true)
  }

  useEffect(() => {
    if (column?.columndetails && Array.isArray(column.columndetails)) {
      setColumns(column.columndetails)
    } else {
      setColumns([])
    }
  }, [column?.columndetails])
  
  const updateColumnFn = async () => {
    try {
      const AdditionalColumnID = (selectedColumn as any)?.additionalColumnID || column?.additionalColumnID;
      const Columnname = value;
      
      if (!AdditionalColumnID) {
        toast.error('Column ID not found');
        return;
      }

      const Baseurl = process.env.NEXT_PUBLIC_API_URL1 || 'https://uat.ppmbackend.projectpulse360.com'

      const response = await axios.post(
        `${Baseurl}/SprintTaskChangeDynamicColumnName?Columnname=${(Columnname)}&AdditionalColumnID=${AdditionalColumnID}&LoginuserID=${user?.id}`
      );
         refetch();
      setEditOpen(false);
      refetch();

      // ✅ ADDED: Notify SprintTaskFilterButton to refetch and reflect updated column name
      window.dispatchEvent(new Event('columnCreated'));

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
      const dynamicColumnId = (activeColumn as any)?.additionalColumnID?.toString() || column?.additionalColumnID?.toString();
      
      if (!dynamicColumnId) {
        toast.error('Column ID not found');
        return;
      }
      
      await axios.post(
        `${Baseurl}/SprintTaskRemoveDynamicColumn?AdditionalColumnID=${dynamicColumnId}&LoginuserID=${user?.id}`
      );
      
      setDeleteOpen(false);
      setActiveColumn(null);
      refetch();

      // ✅ ADDED: Notify SprintTaskFilterButton to refetch and reflect deleted column removal
      window.dispatchEvent(new Event('columnCreated'));

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
    handleMenuClose()
  }

  const getDeleteTitle = () => {
    if (activeColumn) {
      const columnName = (activeColumn as any)?.colname || (activeColumn as any)?.columnName || 'this column';
      return `Delete '${columnName}' column?`;
    } else if (column) {
      const columnName = column?.colname || column?.ColumnName || 'this column';
      return `Delete '${columnName}' column?`;
    }
    return `Delete column?`;
  }

  // If no column data, show loading or return null
  if (!column) {
    return <Typography variant="body2" fontWeight={600}>Loading...</Typography>
  }

  return (
    <>
      <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'} sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            sx={{ 
              whiteSpace: 'nowrap', 
              marginRight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}
          >
            {column?.colname || column?.ColumnName || column?.colName || 'Column'}
          </Typography>
          <IconButton 
            size='small' 
            onClick={(e) => handleMenuOpen(e, column)}
            sx={{ flexShrink: 0 }}
          >
            <Icon icon={'lets-icons:meatballs-menu'} rotate={45} width={16} height={16} />
          </IconButton>
        </Box>
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
    </>
  )
}

export default DynamicTableHeader
