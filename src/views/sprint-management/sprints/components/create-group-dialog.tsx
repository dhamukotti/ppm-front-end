import { useEffect } from 'react'

import { Dialog, DialogContent, DialogTitle, Divider, IconButton, TextField, Typography, Zoom } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import CustomButton from '@/components/button'
import { addSprintGroups, updateSprintGroups,CreateSprintGroup } from '@/services/modules/sprint-group'
import { useWorkspace } from '@/context/workspace-context'
import type { SprintGroupItem } from '@/services/modules/sprint-group/type'
import { useSprintManagement } from '@/context/sprint-context'

type FormType = {
  name: string
}

interface Props {
  open: boolean
  group?: SprintGroupItem
  setOpen: (v: boolean) => void
}

const CreateSprintGroupDialog = ({ open, setOpen, group }: Props) => {
  const { selected } = useWorkspace()
  const { refetch } = useSprintManagement()

  const form = useForm<FormType>({ defaultValues: { name: '' } })

  const handleClose = () => {
    setOpen(false)
  }

  const onSubmit = async (data: FormType) => {
    try {
      const body = {
        workspaceID: selected?.WorkspaceID,
        name: data?.name
      }

      if (!!group?.SprintGroupID) {
        await updateSprintGroups({ id: group?.SprintGroupID?.toString(), body })
        refetch()
      } else {
        const values ={
          Groupname:data?.name,
          WorkspaceID:selected?.WorkspaceID
        }
        await CreateSprintGroup(values)
        refetch()
      }

      handleClose()
    } catch (error) {
      console.log('error :', error)
    }
  }

  useEffect(() => {
    if (open) {
      if (group) {
        form.reset({ name: group?.GroupName })
      } else {
        form.reset({ name: '' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, open])

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='xs' TransitionComponent={Zoom}>
      <DialogTitle className='py-3'>
        <div className='flex items-center justify-between gap-2'>
          <Typography>Create sprint group</Typography>
          <IconButton size='small' className='rounded' onClick={handleClose}>
            <i className='ri-close-line' />
          </IconButton>
        </div>
      </DialogTitle>

      <Divider />
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-2 space-y-7'>
          <Controller
            control={form.control}
            name='name'
            rules={{ required: 'Please enter a value' }}
            render={({ field, fieldState: { error } }) => (
              <TextField {...field} error={!!error} helperText={error?.message} fullWidth label={'Name'} />
            )}
          />

          <div className='flex items-center justify-between'>
            <CustomButton variant='outlined' circular color='error' onClick={handleClose}>
              Close
            </CustomButton>
            <CustomButton type='submit' variant='contained' circular>
              {!!group ? 'Update' : 'Submit'}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSprintGroupDialog
