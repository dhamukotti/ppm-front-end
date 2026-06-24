import { isNumber } from 'lodash'

import { colorNamesToHex } from 'src/constants/colors'

export function getHexColor(color: string) {
  if (color?.startsWith('#')) {
    return color
  }

  return colorNamesToHex[color?.toLowerCase()] || '#000000' // Default to black if color not found
}

// Utility function to calculate luminance
export function getLuminance(hex: string) {
  try {
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255

    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  } catch (error) {
    console.error('getLuminance: error :', error)

    return 0
  }
}

// Function to get contrasting text color
export function getContrastingTextColor(color: string) {
  const hexColor = getHexColor(color)
  const luminance = getLuminance(hexColor)

  return isNumber(luminance) && luminance > 0.5 ? '#000' : '#FFFFFF'
}

const defaultIcons = [
  {
    StatusID: 1,
    Statusname: 'Done',
    Icon: 'tabler:browser-check',
    IconSize: 28
  },
  {
    StatusID: 2,
    Statusname: 'Working on it',
    Icon: 'la:book',
    IconSize: 26
  },
  {
    StatusID: 3,
    Statusname: 'On Hold',
    Icon: 'hugeicons:hold-03',
    IconSize: 24
  },
  {
    StatusID: 4,
    Statusname: 'Stuck',
    Icon: 'streamline:pencil',
    IconSize: 16
  },
  {
    StatusID: 5,
    Statusname: 'Future Steps',
    Icon: 'fluent-mdl2:renewal-future',
    IconSize: 20
  },
  {
    StatusID: 6,
    Statusname: 'In-Progress',
    Icon: 'mdi:progress-wrench',
    IconSize: 24
  },
  {
    StatusID: 7,
    Statusname: 'Development completed',
    Icon: 'carbon:task-complete',
    IconSize: 24
  },
  {
    StatusID: 8,
    Statusname: 'UAT',
    Icon: 'teenyicons:ab-testing-solid',
    IconSize: 24
  },
  {
    StatusID: 9,
    Statusname: 'Live Deployed',
    Icon: 'fluent:location-live-24-regular',
    IconSize: 24
  }
]

export const generateStatusIcons = (statusname: string) => {
  const defaultStatus = defaultIcons?.find(i => i?.Statusname === statusname)

  if (defaultStatus) {
    return defaultStatus?.Icon
  } else {
    return ''
  }
}

export const getStatusIconSize = (statusname: string) => {
  const defaultStatus = defaultIcons?.find(i => i?.Statusname === statusname)

  if (defaultStatus) {
    return defaultStatus?.IconSize
  } else {
    return 22
  }
}

export const getStatusIconColor = (color: string) => {
  const hexColor = getHexColor(color)
  const luminance = getLuminance(hexColor)

  return isNumber(luminance) && luminance > 0.9 ? '#444444' : '#FFFFFF'
}
