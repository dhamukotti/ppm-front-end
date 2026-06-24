'use client'

// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Component Imports

// ** Third Party Imports
import OtpInput from 'react-otp-input'

// ** JWT Imports
import jwt from 'jsonwebtoken'

// ** Styles and Styled Components Imports
import { CardContent, Divider } from '@mui/material'
import { styled } from '@mui/material/styles'

import { routes } from '@/constants/routes'
import { verifyEmail, verifyOtp } from '@/services/auth'
import type { ApiResponse } from '@/types/api-response'
import * as styles from './styles'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { maxWidth: '35rem' }
}))

const INIT_MINUTE = 0
const INIT_SECONDS = 10

const VerifyEmail = ({ obfuscate, email }: { obfuscate: string; email: string }) => {
  // ** Hooks
  const router = useRouter()
  const smBreakpoint = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // ** States
  const [otp, setOtp] = useState('')

  const [otpValid, setOtpValid] = useState(false)
  const [minutes, setMinutes] = useState(INIT_MINUTE)
  const [seconds, setSeconds] = useState(INIT_SECONDS)

  // ** otp change function
  const handleOTPChange = (otpValue: string) => {
    setOtp(otpValue)
    setOtpValid(otpValue?.length === 6)
  }

  // ** reset otp change function
  const handleResendOtp = async () => {
    setOtp('')

    const body: any = {
      email
    }

    await verifyEmail(body).then((res: ApiResponse) => {
      if (res.status) {
        setMinutes(INIT_MINUTE)
        setSeconds(INIT_SECONDS)
      }
    })
  }

  //  ** check otp function
  const checkOtp = async () => {
    const body = {
      email,
      otp: otp
    }

    if (otpValid) {
      await verifyOtp(body).then((res: ApiResponse) => {

        if (res?.status) {
          const base64 = jwt.sign(body, process?.env?.NEXT_PUBLIC_API_SECRET_KEY ?? 'THIS_IS_A_SECRET', {
            expiresIn: '7m'
          })

          router.replace(routes.resetPassword + `?k=${base64}`)
        } else {
          setOtp('')
        }
      })
    }
  }

  useEffect(() => {
    checkOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValid, router])

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval)
        } else {
          setMinutes(minutes - 1)
          setSeconds(59)
        }
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })

  return (
    <>
      <Box height={'100dvh'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <Card>
          <CardContent>
            <div>
              <Typography variant='h5'>{'Verify your email ✉️'}</Typography>
              <Typography>
                {'We sent a verification code to your register email. Enter the code from the mail in the field below.'}
              </Typography>
              <Typography fontWeight={700} mt={2}>
                {obfuscate ?? ''}
              </Typography>
            </div>
            <Divider />
            <Box sx={styles.otpBox()}>
              <OtpInput
                value={otp}
                inputStyle={styles.otpInputBox(smBreakpoint)}
                onChange={handleOTPChange}
                numInputs={6}
                renderInput={(props, index) => <input {...props} data-testid={'otpInput' + index} />}
              />
            </Box>
            <Divider />

            <p style={styles.otpTimerText()}>
              {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </p>

            <Box sx={styles.resendBox()}>
              <Typography>{`Didn't get the mail?`}</Typography>
              <Button
                sx={styles.resendText()}
                onMouseDown={handleResendOtp}
                disabled={minutes === 0 && seconds === 0 ? false : true}
                data-testid='resend-button'
              >
                {'Resend'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default VerifyEmail
