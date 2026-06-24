import { useMemo, useState } from 'react'

import { Card, Grid2, Typography } from '@mui/material'

import CustomButton from '@/components/button'
import IconifyIcon from '@/components/icon'
import DeleteDialog from '@/components/dialog/delete-dialog'
import type { TaskListItemType } from '@/services/modules/task/types'
import { deleteMultipleTask } from '@/services/modules/task'

interface DeleteTasksComponentProps {
  showCard: boolean
  selectedRows: any[]
  taskList?: TaskListItemType[]
  refetch: () => void
  setSelectedRows: (value: any) => void
}

const DeleteTasksComponent = ({
  showCard,
  selectedRows,
  taskList,
  refetch,
  setSelectedRows
}: DeleteTasksComponentProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false)

  // ** Memos
  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

  const handleDelete = async () => {
    const finalArray = taskList
      ?.filter((i, idx) => Object?.keys(selectedRows)?.some(k => +k === +idx))
      ?.map(t => t?.TaskID)

    await deleteMultipleTask(finalArray)
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
          <Typography fontWeight={600}>{`${Object?.keys(selectedRows)?.length} entries  selected`}</Typography>
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
        refetch={refetch}
        setOpen={val => setDeleteOpen(!!val)}
        description={`All selected rows will be permenantly deleted! You cannot revert once deleted.`}
        onConfirm={handleDelete}
      />
    </Grid2>
  )
}

export default DeleteTasksComponent
