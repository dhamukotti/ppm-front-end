import { useMemo, useState } from 'react'

import { Card, Grid2, Typography } from '@mui/material'

import CustomButton from '@/components/button'
import DeleteDialog from '@/components/dialog/delete-dialog'
import IconifyIcon from '@/components/icon'
import { useBugQueue } from '@/context/bug-queue-context'
import { deleteBugApi } from '@/services/modules/bug-queue'

interface DeleteBugsComponentProps {
  showCard: boolean
  selectedRows: any[]
  groupid: any
  workspaceid:any
  setSelectedRows: (value: any) => void
}

const DeleteBugsComponent = ({ showCard, groupid,workspaceid, selectedRows, setSelectedRows }: DeleteBugsComponentProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  console.log(groupid,workspaceid, 'values');

  const { data, refetch } = useBugQueue()
  console.log(selectedRows, 'selectedRows');

  // ** Memos
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])
  console.log(showSelected, 'showSelected');

  // const handleDelete = async () => {
  //   // Use values directly as it contains all the selected bug objects with their full data
  //   const finalArray = values?.map((bug: any) => bug?.BugID) || 
  //     data?.filter((i, idx) => Object?.keys(selectedRows)?.some(k => +k === +idx))?.map(t => t?.BugID)

  //   await deleteBugApi(finalArray)
  //   await refetch()
  //   setDeleteOpen(false)
  //   setSelectedRows({})
  // }
  const handleDelete = async () => {
    // Use selectedRows directly as it contains all the selected bug objects with their full data
    const finalArray = selectedRows?.map((bug: any) => bug?.BugID) || // FIX: replaced undefined 'values' with 'selectedRows'
      data?.filter((i, idx) => Object?.keys(selectedRows)?.some(k => +k === +idx))?.map(t => t?.BugID)

    await deleteBugApi(finalArray)
    await refetch()
    setDeleteOpen(false)
    setSelectedRows({})
  }

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
        description={`All selected rows will be permanently deleted! You cannot revert once deleted.`}
        onConfirm={handleDelete}
        refetch={()=>{}}
      />
    </Grid2>
  )
}

export default DeleteBugsComponent
