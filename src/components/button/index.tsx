/* eslint-disable react/jsx-filename-extension */
import React from 'react'

import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'

interface CustomButtonProps extends ButtonProps {
  circular?: boolean
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, circular, sx, ...props }) => {
  return (
    <Button
      sx={{
        borderRadius: circular ? 30 : 'default',
        fontWeight: 400,
        fontSize: '14px',
        textTransform: 'capitalize',
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export default CustomButton
