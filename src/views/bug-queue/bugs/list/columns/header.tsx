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
import { useWorkspace } from 'src/context/workspace-context'

import DeleteDialog from '@/components/dialog/delete-dialog'
import type { AdditionalColumn } from '@/services/modules/project/types'
import { deleteColumn, updateColumn } from '@/services/modules/task-group'

interface DynamicTableHeaderProps {
  column: any
  refetch: () => void
  isSubTask?: boolean
  groupData?: any[]
  allBugsData?: any[]
  colValueList?: any[]
  columnId?: string
}

const DynamicTableHeader = ({ 
  column, 
  refetch, 
  isSubTask = false,
  groupData = [],
  allBugsData = [],
  colValueList = [],
  columnId = ''
}: DynamicTableHeaderProps) => {
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
  const { selected } = useWorkspace()

  // ✅ State to preserve column data for delete/edit even after menu closes
  const [activeColumn, setActiveColumn] = useState<any>(null)
  
  // ✅ State for showing bugs data
  const [bugsMenuAnchor, setBugsMenuAnchor] = useState<any>(null)

  // ✅ Get groupID from groupData (first item's groupID)
  const groupID = useMemo(() => {
    if (groupData && groupData.length > 0 && groupData[0]?.groupID) {
      return groupData[0].groupID;
    }
    // Fallback to column?.groupID if available
    return column?.groupID || null;
  }, [groupData, column?.groupID]);

  const handleMenuOpen = (e: any, columnData: any) => {
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
      setValue(selectedColumn.colname || selectedColumn.columnName)
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
      const AdditionalColumnID = selectedColumn?.additionalColumnID || column?.additionalColumnID;
      const Columnname = value;
      
      if (!AdditionalColumnID) {
        toast.error('Column ID not found');
        return;
      }

      const Baseurl = process.env.NEXT_PUBLIC_API_URL1

      const response = await axios.post(
        `${Baseurl}/UpdateBugDynamicColumn?WorkspaceID=${selected?.WorkspaceID}&Columname=${encodeURIComponent(Columnname)}&GroupID=${groupID}&LoginuserID=${user?.id}&AdditionalColumnID=${AdditionalColumnID}`
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
      
      // ✅ Use activeColumn for dynamicColumnId
      const dynamicColumnId = activeColumn?.additionalColumnID?.toString();
      
      // ✅ Validate groupID
      if (!groupID) {
        toast.error('Group ID not found. Please refresh the page and try again.');
        console.error('Group ID is missing:', { groupData, column });
        return;
      }
      
      // ✅ Validate dynamicColumnId
      if (!dynamicColumnId) {
        toast.error('Column ID not found');
        return;
      }
      
     
      
      await axios.post(
        `${Baseurl}/RemoveBugDynamicColumn?WorkspaceID=${selected?.WorkspaceID}&GroupID=${groupID}&LoginuserID=${user?.id}&AdditionalColumnID=${dynamicColumnId}`
      );
      window.dispatchEvent(new Event('columnCreated'));

      setDeleteOpen(false);
      setActiveColumn(null);
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
    handleMenuClose()
  }

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const getDeleteTitle = () => {
    if (activeColumn) {
      const columnName = activeColumn?.colname || activeColumn?.columnName || 'this column';
      return `Delete '${columnName}' column?`;
    }
    return `Delete column?`;
  }

  const handleBugsMenuOpen = (e: any) => {
    setBugsMenuAnchor(e?.currentTarget)
  }

  const handleBugsMenuClose = () => {
    setBugsMenuAnchor(null)
  }

  const columnStats = useMemo(() => {
    const totalBugs = allBugsData?.length || groupData?.length || 0
    const bugsWithValues = allBugsData?.filter(bug => bug?.currentValue !== null).length || 0
    const bugsWithoutValues = totalBugs - bugsWithValues
    
    const uniqueValues = [...new Set(
      colValueList
        ?.filter(item => item?.additionalColumnID?.toString() === columnId)
        ?.map(item => item?.value)
        ?.filter(Boolean) || []
    )]
    
    return { totalBugs, bugsWithValues, bugsWithoutValues, uniqueValues }
  }, [allBugsData, groupData, colValueList, columnId])

  // For the new structure where column is a single dynamic column object
  if (!columns || columns.length === 0) {
    return (
      <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          <p style={{ whiteSpace: 'nowrap', marginRight: 15 }}>{column?.colname || column?.ColumnName || 'Column'}</p>
          
          {/* Show groupID for debugging (optional - remove in production) */}
        
         
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

  // Original rendering for backward compatibility
  return (
    <Box display={'flex'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
      {columns.map((data, index) => (
        <React.Fragment key={data.additionalColumnID || index}>
          <Box display={'flex'} alignItems={'center'}>
            <p style={{ whiteSpace: 'nowrap', marginRight: 15 }}>{data.colname || data.columnName}</p>
            
            {columnStats.totalBugs > 0 && (
              <Box 
                onClick={handleBugsMenuOpen}
                sx={{ 
                  cursor: 'pointer', 
                  ml: 1, 
                  px: 1, 
                  py: 0.5, 
                  bgcolor: '#f0f0f0', 
                  borderRadius: 1,
                  fontSize: '12px',
                  '&:hover': { bgcolor: '#e0e0e0' }
                }}
              >
                {columnStats.bugsWithValues}/{columnStats.totalBugs}
              </Box>
            )}
            
            <IconButton size='small' onClick={(e) => handleMenuOpen(e, data)}>
              <Icon icon={'lets-icons:meatballs-menu'} rotate={45} />
            </IconButton>
          </Box>
          {index < columns.length - 1 && <Box mx={1}>|</Box>}
        </React.Fragment>
      ))}

      <Menu 
        open={!!bugsMenuAnchor} 
        anchorEl={bugsMenuAnchor} 
        onClose={handleBugsMenuClose} 
        TransitionComponent={Grow}
        PaperProps={{ sx: { maxHeight: 400, width: 350 } }}
      >
        <Box sx={{ p: 2 }}>
       
          
          {allBugsData?.length > 0 ? (
            allBugsData.map((bug) => (
              <Box key={bug.bugId} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2" fontWeight="500">
                  {bug.bugName || `Bug #${bug.bugId}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current Value: {bug.currentValue?.value || 'Not set'}
                </Typography>
              </Box>
            ))
          ) : groupData?.length > 0 ? (
            groupData.map((bug) => (
              <Box key={bug.BugID} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2" fontWeight="500">
                  {bug.BugName || `Bug #${bug.BugID}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {bug.BugID}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No bugs available
            </Typography>
          )}
          
          {columnStats.uniqueValues.length > 0 && (
            <Box mt={2} pt={1} borderTop="1px solid #eee">
              <Typography variant="caption" color="text.secondary">
                Used Values: {columnStats.uniqueValues.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>

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
  )
}

export default DynamicTableHeader
