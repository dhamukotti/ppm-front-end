import { useMemo, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import {
  Box,
  FormControl,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  TextField,
  Typography
} from '@mui/material'

import { Icon } from '@iconify/react'

import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import { useWorkspace } from '@/context/workspace-context'
import type { ProjectListItem } from '@/services/modules/project/types'
import { routes } from '@/constants/routes'
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

const ProjectItem = ({ project }: { project: ProjectListItem }) => {
  const pathname = usePathname()
  const router = useRouter()

  const paths = useMemo(() => pathname?.split('/'), [pathname])

  const { isCollapsed, isHovered, collapsedWidth } = useVerticalNav()

  // ** Functions
  const isNavLinkActive = () => {
    if (paths?.[1] === 'project' && paths?.[2]?.toString() === project?.ID?.toString()) {
      return true
    }

    return false
  }

  const handleOpenProject = () => {
    router.push(`${routes.project}/${project?.ID}`)
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
        onClick={handleOpenProject}
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
          sx={theme => ({
            minWidth: 24,
            justifyContent: isCollapsed && !isHovered ? 'flex-end' : 'flex-start',
            transition: 'margin .25s ease-in-out',
            color: isNavLinkActive() ? theme?.palette?.primary.main : 'white'
          })}
        >
          <Icon icon={project?.IsOpen ? 'gravity-ui:list-check' : 'gravity-ui:list-check-lock'} />
        </ListItemIcon>
        <MenuItemTextMetaWrapper
          sx={{
            ...(isCollapsed && !isHovered ? { opacity: 0 } : { opacity: 1 })
          }}
        >
          <Typography
            {...(!isCollapsed &&
              !isHovered && {
                noWrap: true
              })}
            className={`whitespace-nowrap text-ellipsis overflow-hidden !font-normal ${isNavLinkActive() ? 'text-black' : 'text-white'}`}
          >
            {project?.ProjectName}
          </Typography>
        </MenuItemTextMetaWrapper>
      </MenuNavLink>
    </ListItem>
  )
}

const ListProjects = () => {
  const { projects: projectList, selected } = useWorkspace()

  const { isCollapsed, isHovered } = useVerticalNav()

  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(false)

  const handleOpenAnchor = (e: any) => setAnchorEl(e.currentTarget)
  const handleCloseAnchor = () => setAnchorEl(null)

  const handleOpen = () => {
    setOpen(true)
    handleCloseAnchor()
  }

  const handleClose = () => setOpen(false)

  return (
    <div className='space-y-3 py-3'>
      {!!selected && (
        <div className='flex items-center gap-1'>
          <div className='flex-1'>
            <FormControl fullWidth>
              <TextField
                type='text'
                placeholder='Search'
                autoComplete='off'
                InputProps={{
                  sx: {
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': {
                      border: '2px solid white'
                    },
                    '&:hover': {
                      '.MuiOutlinedInput-notchedOutline': {
                        border: '2px solid white'
                      }
                    }
                  },
                  endAdornment: <Icon icon={'ion:search'} fontSize={27} />
                }}
                size='small'
                variant='outlined'
                fullWidth
              />
            </FormControl>
          </div>
          <ListItemIcon
            sx={{
              minWidth: 30,
              justifyContent: isCollapsed && !isHovered ? 'flex-end' : 'flex-start',
              transition: 'margin .25s ease-in-out',
              color: 'white'
            }}
          >
            <IconButton sx={{ p: 0 }} onClick={handleOpenAnchor}>
              <Icon icon={'ph:plus-fill'} color='white' />
            </IconButton>
            <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleCloseAnchor}>
              <MenuItem sx={{ minWidth: 150 }} onClick={handleOpen}>
                <Box display={'flex'} alignItems={'center'} gap={3}>
                  <Typography variant='body2'>New Project</Typography>
                </Box>
              </MenuItem>
            </Menu>
            <CreateProject open={open} onCloseModal={handleClose} />
          </ListItemIcon>
        </div>
      )}
      <div className='space-y-1'>
        {projectList?.map(project => <ProjectItem key={project?.ID} project={project} />)}
      </div>
    </div>
  )
}

export default ListProjects
