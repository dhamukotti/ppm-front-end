'use client'

// Component Imports
import PPMLogo from '@core/svg/Logo'

// Config Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const Logo = () => {
  // Hooks
  const { isHovered, isCollapsed } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { mode } = settings

  return (
    <div className='flex items-center min-bs-[24px]'>
      <PPMLogo isCollapsed={isCollapsed && !isHovered} mode={mode} />
    </div>
  )
}

export default Logo
