import { useState } from 'react'

import { Card, Collapse, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import toast from 'react-hot-toast'

import { useSprintManagement } from '@/context/sprint-context'
import type { SprintGroupItem } from '@/services/modules/sprint-group/type'
import CreateSprintGroupDialog from '../components/create-group-dialog'
import SprintList from './sprint-list'
import { useAuth } from '@/hooks/useAuth'
import DeleteDialog from '@/components/dialog/delete-dialog'
import { useBugQueue } from '@/context/bug-queue-context'
import { fetchSprintGroups } from '@/services/modules/sprint-group'
import { useQuery } from '@tanstack/react-query'

import axios from 'axios'
const GroupItem = ({ sg }: { sg: SprintGroupItem }) => {
  const [collapse, setCollapse] = useState(true)
  const [openEdit, setOpenEdit] = useState(false)
    const [showCard, setShowCard] = useState(false)
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const toggleCollapse = () => setCollapse(!collapse)
  const { data, refetch } = useSprintManagement()
  const handleMenuClose = () => setAnchorEl(null)
  const { profile,user } = useAuth()
  // const { data1,refetch } = useSprintManagement()
  const handleMenuOpen = (e: any) => {
    setAnchorEl(e?.currentTarget)
  }

  // const { data: groupsData = [], refetch: refetchGroups } = useQuery({
  //   queryKey: ['sprint-groups', sg.WorkspaceID],
  //   queryFn: () => fetchSprintGroups(sg.WorkspaceID),
  //   enabled: !!sg.WorkspaceID
  // })


  
const handleDelete = async () => {



  try {
  deleteSprintGroup()

          // refetch() 
    setDeleteOpen(false)
 
  } catch (error) {
    console.log('Delete failed:', error)
  }
}


const deleteSprintGroup = async () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;

  try {
    const response = await axios.post(
      `${BASE_URL}/SprintGroupDelete`,
      null,
      {
        params: {
          Sprintgroupid: sg.SprintGroupID,
          LoginUserID: user?.id
        }
      }
    );
    refetch()
// refetchGroups()
    // You can return the response if needed
    // return response.data;
    toast.success(`Sprint group deleted successfully`)

  } catch (error) {
    console.error('Error deleting sprint group:', error);
    // Optional: throw or handle error
    throw error;
  }
};


  return (
    <Card className='rounded-lg'>
      <div className='py-2 px-3 flex items-center gap-2 justify-between'>
        <div className='flex items-center gap-2'>
          <IconButton size='small' className='rounded-xl' onClick={toggleCollapse}>
            <i className={`ri-arrow-right-s-line transition-all duration-300 ${collapse ? 'rotate-90' : ''}`} />
          </IconButton>

          <Typography className='font-semibold text-lg'>{sg?.GroupName}</Typography>
        </div>

        <div>
          <IconButton size='small' className='rounded-xl' onClick={handleMenuOpen}>
            <i className={`ri-more-2-line`} />
          </IconButton>

          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                setAnchorEl(null)
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
      </div>

      {openEdit && <CreateSprintGroupDialog open={openEdit} setOpen={setOpenEdit} group={sg} />}
 <DeleteDialog
        open={deleteOpen}
        setOpen={val => setDeleteOpen(!!val)}
        title={`Delete this Sprint Group ?`}
        onConfirm={handleDelete}
        refetch={refetch}
        description={'You wont be able to revert this action'}
      />
      <Collapse in={collapse}>
        <SprintList sg={sg} />
      </Collapse>
     
    </Card>
  )
}

const GroupList = () => {
  const { data } = useSprintManagement()

  return <div className='space-y-9'>{data?.map(sg => <GroupItem key={sg?.SprintGroupID} sg={sg} />)}</div>
}

export default GroupList
