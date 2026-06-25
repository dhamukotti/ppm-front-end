import { useMemo, useEffect, useState } from 'react'

import { Card, Grid2, Typography } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'

import CustomButton from '@/components/button'
import IconifyIcon from '@/components/icon'
import DeleteDialog from '@/components/dialog/delete-dialog'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import { deleteSprint } from '@/services/modules/sprint-item'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'

interface DeleteTasksComponentProps {
  showCard: boolean
  selectedRows: any[]
  sprintlist?: SprintItem[]
  refetch: () => void
  setSelectedRows: (value: any) => void
}

const DeleteTasksComponent = ({
  showCard,
  selectedRows,
  sprintlist,
  refetch,
  setSelectedRows
}: DeleteTasksComponentProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { profile, user } = useAuth()

  // ** Memos
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

  const handleDelete = async () => {
    // Get the selected tasks with SprintTaskID
    const finalArray = sprintlist
      ?.filter((i, idx) => Object?.keys(selectedRows)?.some(k => +k === +idx))
      ?.map(t => (t as any)?.SprintTaskID) // Changed from SprintID to SprintTaskID

    // Delete using SprintTaskID
    try {
      const loginUserID = 76 // Replace with actual login user ID from your auth system
      
      // Delete all selected tasks using SprintTaskID
      const deletePromises = finalArray?.map(taskID => {
        return axios.post(`${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskDelete?TaskID=${taskID}&LoginuserID=${user?.id}`)
      }) || []
      
      await Promise.all(deletePromises)
      await refetch()
      toast.success("Sprint Task Deleted successfully")
      setDeleteOpen(false)
      setSelectedRows({})
    } catch (error) {
      console.error('Error deleting tasks:', error)
    }
  }
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await refetch()
    }
    fetchData()
  }, [selectedRows]) // Add dependencies as needed
  

  return (
    <Grid2 size={12}>
      <Card
        sx={{
          display: showCard ? 'block' : 'none',
          animation: showSelected ? 'slide-in-anime 200ms linear' : 'slide-out-anime 200ms linear'
        }}
      >
        <div className='m-2 p-2 flex gap-5 items-center'>
          <Typography fontWeight={600}>{`${Object?.keys(selectedRows)?.length} entries selected`}</Typography>
          <CustomButton
            variant='contained'
            size='small'
            color='error'
            sx={{
              backgroundColor: theme => theme.palette.error.light + '44',
              border: 1,
              borderColor: 'error',
              color: 'error.main',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme => theme.palette.error.light + '55'
              }
            }}
            onClick={() => setDeleteOpen(true)}
            startIcon={<IconifyIcon icon={'solar:trash-bin-minimalistic-2-bold'} color='red' />}
          >
            Delete
          </CustomButton>
        </div>
      </Card>
      <DeleteDialog
        open={deleteOpen}
        setOpen={val => setDeleteOpen(!!val)}
        title={`Delete this Task ?`}
        onConfirm={handleDelete}
        refetch={refetch}
        description={'You wont be able to revert this action'}
      />
    </Grid2>
  )
}

export default DeleteTasksComponent
