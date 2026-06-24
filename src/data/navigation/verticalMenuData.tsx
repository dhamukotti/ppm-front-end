// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'ri-layout-grid-line'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'ri-information-line'
  },
  {
    label: 'Bug Queue',
    href: '/bug-queue',
    icon: 'ri-information-line'
  }
  
]

export default verticalMenuData
