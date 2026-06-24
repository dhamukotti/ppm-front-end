// ** React Imports
import { useCallback, useMemo, useState } from 'react'

// ** MUI Imports
import { Alert, AlertTitle, CircularProgress, Zoom } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { DialogProps } from '@mui/material/Dialog'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ** Iconify Icon Imports
import { Icon } from '@iconify/react'

// ** Styles and Styled Components
import { debounce } from 'lodash'

import * as styles from './styles'

interface DeleteDialogProps extends DialogProps {
  open: boolean
  setOpen: (value?: boolean) => void
  title?: string
  description?: string
  onConfirm: () => Promise<void>
  confirmText?: string
   refetch: () => void
}

export default function DeleteDialog({
  open,
  setOpen,
  title,
  description,
  onConfirm,
  refetch,
  confirmText,
  ...props
}: DeleteDialogProps) {
  // ** States
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true)
    await onConfirm()
    setIsDeleting(false)
  }, [onConfirm])

  const debounceHandleConfirm = useMemo(() => debounce(handleConfirm, 300), [handleConfirm])

  return (
    <Dialog open={open} fullWidth maxWidth='sm' onClose={handleClose} TransitionComponent={Zoom} {...props}>
      <DialogContent>
        <Box sx={styles.dialogMainContainerStyle}>
          <Typography sx={styles.mainTitleText}>{title ?? `Are you sure ?`}</Typography>

          <Alert severity='warning' sx={styles.toastMainDiv()}>
            <AlertTitle> {'Warning!'}</AlertTitle>
            {description}
          </Alert>

          {/* Button */}

          <Box sx={styles.buttonsContainer}>
            <Button
              variant='contained'
              onClick={debounceHandleConfirm}
              id={'confirm-delete'}
              disabled={isDeleting}
              data-testid={'confirm-delete-button'}
            >
              {isDeleting ? <CircularProgress size={22} color='secondary' /> : (confirmText ?? `Delete`)}
            </Button>

            <Button
              variant='outlined'
              color='secondary'
              onClick={handleClose}
              id={'cancel-delete'}
              data-testid={'cancel-delete-button'}
            >
              {`Cancel`}
            </Button>
          </Box>
        </Box>
        {/* Close Icon */}
        <IconButton
          aria-label='close'
          onClick={handleClose}
          id='close-icon'
          sx={styles?.closeButtonIcon}
          data-testid={'close-button'}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogContent>
    </Dialog>
  )
}
