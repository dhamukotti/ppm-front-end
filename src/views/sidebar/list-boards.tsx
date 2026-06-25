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

const WorkspaceItem = ({ workspace, onBoardClick }: { workspace: WorkspaceListItem; onBoardClick?: (boardId: string) => void }) => {
  // ** States
  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [open1, setOpen1] = useState(false)

  const { profile } = useAuth()
  const { selected, setSelected, refetchWorkspaces } = useWorkspace()

  const { isCollapsed, isHovered, collapsedWidth } = useVerticalNav()

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

  const handleItemClick = () => {
    setSelected(workspace)
    if (onBoardClick) {
      onBoardClick(workspace.WorkspaceID?.toString())
    }
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
        onClick={handleItemClick}
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
          <Icon
            icon='mdi:view-dashboard-outline'
            fontSize={24}
            color={isNavLinkActive() ? 'black' : 'white'}
          />
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
          {/* <IconButton size='small' onClick={handleOpenMenu}>
            <Icon
              icon={'solar:menu-dots-bold'}
              className='shrink-0'
              fontSize={'0.2rem'}
              color={!isNavLinkActive() ? 'white' : 'black'}
            />
          </IconButton> */}
          <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleOpenClose} TransitionComponent={Zoom}>
         
              <MenuItem onClick={()=>setIsModalOpen(true)}>
              <Box display={'flex'} alignItems={'center'} gap={2}>
                <Icon icon={'mdi:plus-circle-outline'} />
                <Typography>Create WorkSpace</Typography>
              </Box>
            </MenuItem>
          </Menu>
          <DeleteWorkspaceDialog open={open} setOpen={setOpen} onConfirm={debouncedDelete} />
        </MenuItemTextMetaWrapper>
      </MenuNavLink>

   
    </ListItem>
  )
}

const ListBoards = ({ onBoardClick }: { onBoardClick?: (boardId: string) => void }) => {
  // Only showing "Boards" item
  // const hardcodedWorkspaceList: WorkspaceListItem[] = [
  //   {
  //     WorkspaceID: 1,
  //     WorkspaceName: 'Boards',
  //     OrganizationID: 1,
  //     // Add any other required properties from WorkspaceListItem type
  //     CreatedBy: '',
  //     ModifiedBy: '',
  //     CreatedDate: '',
  //     ModifiedDate: '',
  //     userProjects:[],
  //     IsDelete:0,
  //     UpdatedBy:0,
  //   }
  // ]
  const hardcodedWorkspaceList: WorkspaceListItem[] = [
  {
    WorkspaceID: 1,
    WorkspaceName: 'Boards',
    OrganizationID: 1,
    CreateDate: '',
    CreatedBy: '',
    DeletedDate: null,
    Deletedby: null,
    CreatedDate: '',
    ModifiedDate: '',
    ModifiedBy: null,
    IsDelete: 0,
    UpdatedBy: null,
    userProjects: []
  }
]

  return (
    <div className='space-y-1 py-3'>
      {hardcodedWorkspaceList?.map(workspace => <WorkspaceItem key={workspace?.WorkspaceID} workspace={workspace} onBoardClick={onBoardClick} />)}
    </div>
  )
}

export default ListBoards
