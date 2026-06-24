import type { CSSProperties } from 'react'

import type { SxProps, Theme } from '@mui/material'

export const otpInputBox = (smBreakpoint: boolean): CSSProperties => ({
  outline: '0px',
  width: '45px',
  height: '45px',
  fontSize: '23px',
  textAlign: 'center',
  marginLeft: '10px',
  marginRight: '10px',
  border: '1px solid #CFD3DB',
  borderRadius: '4px',
  ...(smBreakpoint && {
    width: '40px',
    height: '40px',
    marginLeft: '7px',
    marginRight: '7px',
    fontSize: 'calc(15px + 1vw)'
  })
})

export const otpBox = (): SxProps<Theme> => ({
  m: 4,
  mt: 5,
  display: 'flex',
  justifyContent: 'center'
})

export const otpTimerText = (): CSSProperties => ({
  color: 'primary.main',
  fontWeight: '400',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center',
  margin: '4px 0px 2px 0px'
})

export const resendBox = (): SxProps<Theme> => ({
  mt: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2
})

export const resendText = (): SxProps<Theme> => ({
  color: 'primary.main',
  cursor: 'pointer',
  textTransform: 'Capitalize',
  fontSize: '1rem',
  fontWeight: '400',
  padding: '6px',
  '&:hover': { backgroundColor: 'none' }
})
