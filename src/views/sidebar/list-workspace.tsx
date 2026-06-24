import { useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  Typography,
  Zoom
} from '@mui/material'

import { debounce } from 'lodash'

import CustomAvatar from '@/@core/components/mui/Avatar'
import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import { useWorkspace } from '@/context/workspace-context'
import { deleteWorkspace } from '@/services/modules/workspace'
import type { WorkspaceListItem } from '@/services/modules/workspace/type'
import { getInitials } from '@/utils/getInitials'
import DeleteWorkspaceDialog from './delete-workspace'
import { useAuth } from '@/hooks/useAuth'
import { deleteSprintWorkspace } from '@/services/modules/sprint-workspace'
import CreateWorkspaceDialog from './create-workspace-dialog'
import CreateProject from './create-project-dialog'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../paymentpopup/useRazorpayPayment'

const MenuNavLink = styled(ListItemButton)(() => ({
  width: '100%',
  borderRadius: 8,
  transition: 'padding-left .25s ease-in-out',
  '& .MuiTypography-root': {
    fontWeight: 300,
    fontSize: '0.9rem'
  }
}))

const MenuItemTextMetaWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out'
}))

const WorkspaceItem = ({ workspace }: { workspace: WorkspaceListItem }) => {
  // ** States
  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [open1, setOpen1] = useState(false)
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  
  const { profile, user } = useAuth()
  const { selected, setSelected, refetchWorkspaces } = useWorkspace()

  const { isCollapsed, isHovered, collapsedWidth } = useVerticalNav()

  // ** Use Payment Hook
  const { isLoading, razorpayLoaded, generateRazorPayOrder } = useRazorpayPayment({
    userId: Number(user?.id),
    onPaymentSuccess: () => {
      checkPaymentStatus()
      setShowPaymentExpiredDialog(false)
    },
    onPaymentFailure: () => {
      checkPaymentStatus()
      setShowPaymentExpiredDialog(true)
    }
  })

  // ** Functions
  const isNavLinkActive = () => {
    if (selected?.WorkspaceID === workspace?.WorkspaceID) {
      return true
    } else {
      return false
    }
  }

  const handleOpenMenu = (e: any) => {
    setAnchorEl(e.currentTarget)
  }

  const handleOpenClose = () => {
    setAnchorEl(null)
  }

  const handleDeleteOpen = () => {
    setOpen(true)
    handleOpenClose()
  }
  
  const handleClose = () => setOpen1(false)

  const handleDelete = async () => {
    try {
 

      const response =
        profile === 'projects'
          ? await deleteWorkspace({
              OrganizationID: workspace.OrganizationID,
              WorkspaceID: workspace.WorkspaceID?.toString(),
              WorkspaceName: workspace.WorkspaceName
            })
          : await deleteSprintWorkspace({
              OrganizationID: workspace.OrganizationID,
              WorkspaceID: workspace.WorkspaceID?.toString(),
              WorkspaceName: workspace.WorkspaceName
            })

      if (response?.status) {
        refetchWorkspaces()
        setOpen(false)
        handleOpenClose()

        if (selected?.WorkspaceID === workspace?.WorkspaceID) {
          setSelected(null)
        }
      }
    } catch (error) {
      console.error('Delete Workspace Error :', error)
    }
  }

  const debouncedDelete = debounce(handleDelete, 400)

  // check payment status stored in localStorage and set dialog state accordingly
  const checkPaymentStatus = (): boolean => {
    const paymentStatus = localStorage.getItem('paymentStatus')

    try {
      if (paymentStatus) {
        const parsed = JSON.parse(paymentStatus)
        // If parsed explicitly says expired, show payment dialog and disallow selecting the workspace
        if (parsed.isExpired === true) {
          setShowPaymentExpiredDialog(true)
          return false
        }
        // If parsed explicitly says not expired, hide dialog and allow selecting the workspace
        if (parsed.isExpired === false) {
          setShowPaymentExpiredDialog(false)
          return true
        }
        // In case parsed.isExpired is missing or unexpected, be conservative: treat as expired
        setShowPaymentExpiredDialog(true)
        return false
      }
      // No stored status → treat as expired by default (user must renew)
      setShowPaymentExpiredDialog(true)
      return false
    } catch (error) {
      console.error('Error parsing payment status:', error)
      // On parse error, treat as expired to be safe
      setShowPaymentExpiredDialog(true)
      return false
    }
  }

  const handleSelect = (ws: WorkspaceListItem) => {
    const canOpen = checkPaymentStatus()
    if (canOpen) {
      setSelected(ws)
    }
    // if cannot open, checkPaymentStatus already set the expired dialog
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
  }

  return (
    <ListItem
      disablePadding
      className='nav-link'
      sx={{
        transition: 'padding .25s ease-in-out'
      }}
    >
      <MenuNavLink
        disableTouchRipple
        disableRipple
        className={isNavLinkActive() ? 'active' : ''}
        onClick={() => handleSelect(workspace)}
        sx={{
          py: 2.25,
          backgroundColor: isNavLinkActive() ? 'rgba(255,255,255,0.8)' : 'inherit',
          '&:hover': {
            backgroundColor: isNavLinkActive() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)'
          },
          pl: isCollapsed && !isHovered ? ((collapsedWidth || 0) - 38 - 16) / 8 : 2.25,
          pr: isCollapsed && !isHovered ? ((collapsedWidth || 0) - 38 - 16) / 8 : 2.25
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 35,
            transition: 'margin .25s ease-in-out',
            color: 'white'
          }}
        >
          <CustomAvatar
            skin={isNavLinkActive() ? 'light' : 'filled'}
            color='error'
            variant='circular'
            sx={{ width: 28, height: 28, fontSize: '1rem' }}
          >
            {getInitials(workspace?.WorkspaceName)}
          </CustomAvatar>
        </ListItemIcon>

        <MenuItemTextMetaWrapper
          sx={{
            ...(isCollapsed && !isHovered ? { opacity: 0 } : { opacity: 1 })
          }}
          className='truncate'
        >
          <Typography
            {...(!isCollapsed &&
              !isHovered && {
                noWrap: true
              })}
            className={`truncate !font-normal ${isNavLinkActive() ? 'text-black' : 'text-white'}`}
          >
            {workspace?.WorkspaceName}
          </Typography>
          <IconButton size='small' onClick={handleOpenMenu}>
            <Icon
              icon={'solar:menu-dots-bold'}
              className='shrink-0'
              fontSize={'0.2rem'}
              color={!isNavLinkActive() ? 'white' : 'black'}
            />
          </IconButton>
          <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleOpenClose} TransitionComponent={Zoom}>
            <MenuItem onClick={() => setIsModalOpen(true)}>
              <Box display={'flex'} alignItems={'center'} gap={2}>
                <Icon icon={'mdi:plus-circle-outline'} />
                <Typography>Create WorkSpace</Typography>
              </Box>
            </MenuItem>
            {profile === 'projects' && (
              <MenuItem onClick={() => setOpen1(true)}>
                <Box display={'flex'} alignItems={'center'} gap={2}>
                  <Icon icon={'mdi:plus-circle-outline'} />
                  <Typography>Create Project</Typography>
                </Box>
              </MenuItem>
            )}
            <MenuItem onClick={handleDeleteOpen}>
              <Box display={'flex'} alignItems={'center'} gap={2}>
                <Icon icon={'mdi:delete-outline'} />
                <Typography>Delete</Typography>
              </Box>
            </MenuItem>
          </Menu>
          <DeleteWorkspaceDialog open={open} setOpen={setOpen} onConfirm={debouncedDelete} />
        </MenuItemTextMetaWrapper>
      </MenuNavLink>
      <CreateProject open={open1} onCloseModal={handleClose} />

      <CreateWorkspaceDialog
        open={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        refetchWorkspaces={refetchWorkspaces}
      />
      <SubscriptionExpiredDialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        onRenew={generateRazorPayOrder}
        isLoading={isLoading}
        razorpayLoaded={razorpayLoaded}
      />
    </ListItem>
  )
}

const ListWorkspaces = () => {
  const { workspace: workspaceList } = useWorkspace()

  return (
    <div className='space-y-1 py-3'>
      {workspaceList?.map(workspace => <WorkspaceItem key={workspace?.WorkspaceID} workspace={workspace} />)}
    </div>
  )
}

export default ListWorkspaces
