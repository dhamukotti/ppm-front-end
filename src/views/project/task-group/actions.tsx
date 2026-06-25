
import { useState } from 'react'
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import DeleteDialog from '@/components/dialog/delete-dialog'
import NewTaskDialog from '../main-screen/task-group-add-dialog'
import { DeleteTaskgroup,fetchTaskGroupList,Deleteprojectgroup } from '@/services/modules/task-group'
import axios from 'axios'
import toast from 'react-hot-toast'
interface TaskGroupActionsProps {
  groupName?: string
  id?: Number,
  ProjectID?: Number,
    refetch: () => void
}

const TaskGroupActions = ({ groupName,id,ProjectID,refetch  }: TaskGroupActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editGroupName, setEditGroupName] = useState('')
const [editgroupid, seteditgroupid] = useState('')
const [projectId, setprojectId] = useState('')


  const handleMenuOpen = (e: any) => {
    e.stopPropagation()
    setAnchorEl(e?.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const onEditClick = (e: any) => {
    e.stopPropagation()
    setEditGroupName(groupName as string)
    seteditgroupid(id as any)
    // setprojectId(ProjectID as string)
    
    setOpenEdit(true)
    handleMenuClose()
  }

  const onDeleteClick = (e: any) => {
    e.stopPropagation()
    setDeleteOpen(true)
    handleMenuClose()
  }

  const handleClose = () => {
    setOpenEdit(false)
    // Don't clear editGroupName immediately, let it clear after a small delay
    setTimeout(() => {
      setEditGroupName('')
    }, 100)
  }
const deletegroup = async() => {
  try {
    const value = await axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/ProjectTaskGroupDelete?TaskGroupID=${id}&LoginuserID=76`);
 refetch();
    toast.success('Task Group Deleted Successfully');
    refetch();
  } catch (error) {
    console.error('Error deleting task group:', error);
    toast.error('Failed to delete Task Group');
  }
}


  
const handleDelete = async () => {
  try {
    // Prepare the body payload
    // const body = {
    //   projectID: ProjectID,      // your projectID
    //   groupName: groupName    // your groupName
    // }
    deletegroup()

    // await Deleteprojectgroup(id,76)
        // await refetch() 
    setDeleteOpen(false)
 
  } catch (error) {

  }
}




  return (
    <>
      <IconButton size='small' onClick={handleMenuOpen} onFocus={event => event.stopPropagation()}>
        <i className='ri-more-2-fill h-4 w-5' />
      </IconButton>
      
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
        <MenuItem onClick={onEditClick}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <i className={'ri-pencil-line text-lg'} />
            <Typography fontSize={13}>Edit</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={onDeleteClick}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <i className={'ri-delete-bin-5-line text-lg text-error'} />
            <Typography fontSize={13} className='text-error'>
              Delete
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      <NewTaskDialog 
        open={openEdit}
        onCloseModal={handleClose}
        initialGroupName={editGroupName}
        TaskGroupID={editgroupid}
        isEdit={true}
      />

      <DeleteDialog
        open={deleteOpen}
        setOpen={val => setDeleteOpen(!!val)}
        title={`Delete this taskgroup ?`}
        onConfirm={handleDelete}
        refetch={refetch}
        description={'You wont be able to revert this action'}
      />
    </>
  )
}

export default TaskGroupActions
