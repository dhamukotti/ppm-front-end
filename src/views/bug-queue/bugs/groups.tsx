'use client'

import { useEffect, useMemo,useRef, useState, forwardRef, useImperativeHandle } from 'react'

import { Card,MenuItem,Menu, CardContent, Collapse, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'

import { useWorkspace } from '@/context/workspace-context'

import BugList from './list'
import DeleteBugsComponent from './delete-bugs'
import NewBugQueue from '../main-screen/bug-add-dialog'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import DeleteDialog from '@/components/dialog/delete-dialog'

interface BugGroup {
  bugGroupID: number
  groupname: string
}

export interface BugQueueGroupRef {
  refetchGroups: () => void
}

// Add the prop interface for BugGroupItem
interface BugGroupItemProps {
  group: BugGroup
  workspaceID: number
  onRefetch: () => void
  isSelected?: boolean // Add this prop
}

const BugGroupItem = ({ group, workspaceID, onRefetch, isSelected }: BugGroupItemProps) => {
  const [collapse, setCollapse] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])
  const [showCard, setShowCard] = useState(false)
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const { user } = useAuth()
  console.log(group,'gr');
  const bugQueueGroupRef = useRef<BugQueueGroupRef>(null)
  const handleBugGroupCreated = () => {
    bugQueueGroupRef.current?.refetchGroups()
  }
  console.log(selectedRows,'selectedRows');
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const toggleCollapse = () => setCollapse(!collapse)

  // Auto-expand when group is selected
  useEffect(() => {
    if (isSelected) {
      setCollapse(true)
    }
  }, [isSelected])

  useEffect(() => {
    if (showSelected) {
      setShowCard(true)
    } else {
      const timeout = setTimeout(() => setShowCard(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [showSelected])
  const [openEdit, setOpenEdit] = useState(false)
  const [editGroupName, setEditGroupName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => setAnchorEl(null)

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim()) {
      toast.error('Group name cannot be empty')
      return
    }
    
    setIsSubmitting(true)
    try {
      const loginuserID = user?.id
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL1}/UpdateBuggroup`,
        null,
        {
          params: {
            WorkspaceID: workspaceID,
            LoginuserID: loginuserID,
            Groupid: group.bugGroupID,
            Groupname: editGroupName
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Bug group updated successfully')
        setOpenEdit(false)
        setEditGroupName('')
        onRefetch()
      } else {
        toast.error('Failed to update bug group')
        console.error('Failed to update bug group')
      }
    } catch (err) {
      toast.error('Error updating bug group')
      console.error('Error updating bug group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGroup = async () => {
    setIsSubmitting(true)
    try {
      const loginuserID = user?.id
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL1}/RemoveBuggroup`,
        null,
        {
          params: {
            WorkspaceID: workspaceID,
            LoginuserID: loginuserID,
            GroupID: group.bugGroupID
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Bug group deleted successfully')
        setDeleteOpen(false)
        onRefetch()
      } else {
        toast.error('Failed to delete bug group')
        console.error('Failed to delete bug group')
      }
    } catch (err) {
      toast.error('Error deleting bug group')
      console.error('Error deleting bug group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ FIXED: Extract bugIDs from selectedRows based on the API response structure
  // The API returns an array where detailList contains the bug objects
  const selectedBugIDs = useMemo(() => 
    Object.values(selectedRows).map((row: any) => {
      // Handle different possible row structures
      if (row && row.bugID) {
        return row.bugID
      } else if (row && row.detailList && Array.isArray(row.detailList)) {
        // If row has detailList array, extract bugIDs from it
        return row.detailList.map((bug: any) => bug.bugID)
      }
      return null
    }).flat().filter(Boolean), // flatten the array and remove falsy values
  [selectedRows])

  console.log(selectedBugIDs,'selectedBugIDs');

  return (
    <Card className='rounded-lg'>
      <div className='py-2 px-3 flex items-center gap-2 justify-between'>
        <div className='flex items-center gap-2'>
          <IconButton size='small' className='rounded-xl' onClick={toggleCollapse}>
            <i className={`ri-arrow-right-s-line transition-all duration-300 ${collapse ? 'rotate-90' : ''}`} />
          </IconButton>

          <Typography className='font-semibold text-lg'>{group.groupname}</Typography>
        </div>
        
        <IconButton onClick={handleMenuClick} size="small">
          <i className='ri-more-2-fill' />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              setEditGroupName(group.groupname)
              setOpenEdit(true)
            }}
          >
            <div className='flex items-center gap-3'>
              <i className='ri-pencil-line size-4' />
              Edit
            </div>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setAnchorEl(null)
              setDeleteOpen(true)
            }}
          >
            <div className='flex items-center gap-3'>
              <i className='ri-delete-bin-line size-4' />
              Delete
            </div>
          </MenuItem>
        </Menu>
      </div>
      {true && (
        <NewBugQueue
          open={false}
          onCloseModal={() => {}}
          onBugGroupCreated={handleBugGroupCreated}
          ref={bugQueueGroupRef}
        />
      )}
      <Collapse in={collapse}>
        <CardContent className='space-y-4'>
          <BugList
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            workspaceID={workspaceID}
            bugGroupID={group.bugGroupID}
          />

          {/* ✅ Pass selectedBugIDs to DeleteBugsComponent */}
          <DeleteBugsComponent 
            groupid={group.bugGroupID} 
            workspaceid={workspaceID} 
            showCard={showCard} 
            selectedRows={selectedRows} 
            setSelectedRows={setSelectedRows}
           // selectedBugIDs={selectedBugIDs}
          />
        </CardContent>
      </Collapse>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => !isSubmitting && setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bug Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleUpdateGroup} variant="contained" disabled={isSubmitting || !editGroupName.trim()}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        setOpen={val => setDeleteOpen(!!val)}
        title={`Delete this Bug Group ?`}
        onConfirm={handleDeleteGroup}
     refetch={()=>{}}        
     description={'You wont be able to revert this action'}
      />
    </Card>
  )
}

// Update the forwardRef to accept props
interface BugQueueGroupProps {
  selectedGroupId?: number // Add this prop
}

const BugQueueGroup = forwardRef<BugQueueGroupRef, BugQueueGroupProps>((props, ref) => {
  const { selected } = useWorkspace()
  const [bugGroups, setBugGroups] = useState<BugGroup[]>([])
  const [loading, setLoading] = useState(false)

  const fetchGroups = async () => {
    if (!selected?.WorkspaceID) return
    
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL1}/GetBuggroupList?WorkspaceID=${selected.WorkspaceID}`
      )
      const data = await res.json()
      setBugGroups(data)
    } catch (err) {
      console.error('Failed to fetch bug groups', err)
      toast.error('Failed to fetch bug groups')
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refetchGroups: fetchGroups
  }))

  useEffect(() => {
    fetchGroups()
  }, [selected?.WorkspaceID])

  // Filter groups based on selectedGroupId
  const filteredGroups = props.selectedGroupId 
    ? bugGroups.filter(group => group.bugGroupID === props.selectedGroupId)
    : bugGroups

  if (!selected?.WorkspaceID) return null

  if (loading) {
    return (
      <div className='flex items-center justify-center h-20'>
        <Typography>Loading groups...</Typography>
      </div>
    )
  }

  if (!filteredGroups.length) {
    return (
      <div className='flex items-center justify-center h-20'>
        <Typography>
          {props.selectedGroupId ? 'No group found with selected filter' : 'No bug groups found'}
        </Typography>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {filteredGroups.map(group => (
        <BugGroupItem 
          key={group.bugGroupID} 
          group={group} 
          workspaceID={selected.WorkspaceID} 
          onRefetch={fetchGroups}
          isSelected={props.selectedGroupId === group.bugGroupID}
        />
      ))}
    </div>
  )
  
})

BugQueueGroup.displayName = 'BugQueueGroup'

export default BugQueueGroup
