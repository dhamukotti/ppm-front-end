// ** MUI Imports
import Image from 'next/image'

import Box from '@mui/material/Box'

// import CircularProgress from '@mui/material/CircularProgress'

import type { SxProps, Theme } from '@mui/material'

// Images
import logoMainDark from '@public/images/logos/logo-pp-dark.png'
import logoMain from '@public/images/logos/logo-pp.png'

import { useSettings } from '@/@core/hooks/useSettings'

const FallbackSpinner = ({ sx, height }: { sx?: SxProps<Theme> | undefined; height?: string }) => {
  const { settings } = useSettings()

  return (
    <Box
      data-skin={settings.mode}
      sx={{
        width: '100%',
        height: height ?? '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        ...sx
      }}
    >
      <Image
        src={settings.mode === 'dark' || settings.mode === 'system' ? logoMainDark : logoMain}
        alt='Loading....'
        quality={100}
        sizes='100vw'
        className='w-full h-auto max-w-48 animate-bounce duration-1000 ease-in-out'
      />
    </Box>
  )
}

export default FallbackSpinner
