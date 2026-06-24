import { useMemo } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { Box, ListItem, ListItemButton, ListItemIcon, styled, Typography } from '@mui/material'

import { Icon } from '@iconify/react'

import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import { routes } from '@/constants/routes'
import { useWorkspace } from '@/context/workspace-context'

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

const NavItem = ({ title, path }: { title: string; path: string }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { selected } = useWorkspace()

  const paths = useMemo(() => pathname?.split('/'), [pathname])

  const { isCollapsed, isHovered, collapsedWidth } = useVerticalNav()

  // ** Functions
  const isNavLinkActive = () => {
    if (paths?.[1] === 'workspace' && paths?.[2] === selected?.WorkspaceID?.toString() && paths?.[3] === path) {
      return true
    }

    return false
  }

  const handleOpenProject = () => {
    if (selected) {
      router.push(routes.workspaceItem(selected?.WorkspaceID?.toString(), path))
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
          <Icon icon={'gravity-ui:list-check'} />
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
            {title}
          </Typography>
        </MenuItemTextMetaWrapper>
      </MenuNavLink>
    </ListItem>
  )
}

const SprintNavItemsList = () => {
  return (
    <div className='space-y-1'>
      <NavItem title={'Tasks'} path='tasks-sprint' />
      <NavItem title={'Sprints'} path='sprints' />
      <NavItem title={'Bug Queue'} path='bug-queue' />
    </div>
  )
}

export default SprintNavItemsList
