'use client'

import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { usePathname, useRouter } from 'next/navigation'

import { Box, CircularProgress, Typography } from '@mui/material'

import toast from 'react-hot-toast'

import acceptedInvite from '@public/images/pages/accepted-invite.svg'
import accessDenied from '@public/images/pages/access-denied.svg'

import { routes } from '@/constants/routes'

import CustomButton from '@components/button'
import { useWorkspace } from 'src/context/workspace-context'
import { useAuth } from 'src/hooks/useAuth'
import type { ApiResponse } from '@/types/api-response'
import { acceptInvitationApi } from '@/services/modules/invite'

const InvitationManagementPage = ({ invitationID }: { invitationID: string }) => {
  const router = useRouter()
  const { user } = useAuth()
  const pathname = usePathname()
  const { refetchWorkspaces } = useWorkspace()

  const [response, setResponse] = useState<ApiResponse | null>(null)

  const acceptInvitationApiCall = useCallback(async () => {
    if (invitationID) {
      try {
        const response = await acceptInvitationApi(invitationID)

        setResponse(response)

        if (response?.data?.projectID) {
          refetchWorkspaces()
          router.replace(`/project/${response?.data?.projectID}`)
        } else {
          if (response?.statusCode === 307) {
            if (response?.data?.redirect === '/register') {
              router.replace(`/invite/register?invitationID=${invitationID}`)
            } else {
              router.replace(routes.login + `?returnUrl=${pathname}`)
            }
          }

          if (response?.statusCode === 403) {
            if (user) {
              toast.error(`You need to be logged in with valid account to accept invitation`)
            } else {
              router.replace(routes.login + `?returnUrl=${pathname}`)
            }
          }
        }
      } catch (error) {
        console.error('Invitation Accept Error :', error)
        setResponse(null)
      }
    }
  }, [invitationID, pathname, refetchWorkspaces, router, user])

  useEffect(() => {
    acceptInvitationApiCall()
  }, [acceptInvitationApiCall])

  return (
    <Box
      display={'flex'}
      alignItems={'center'}
      flexDirection={'column'}
      gap={20}
      justifyContent={'center'}
      height={'100dvh'}
    >
      {response?.statusCode === 403 ? (
        <>
          <Typography variant='h5' fontWeight={800}>
            Access Denied
          </Typography>
          <Image
            src={accessDenied}
            alt='Access Denied'
            width={400}
            height={400}
            style={{ width: '100%', maxWidth: 400, height: 'auto' }}
          />
          <CustomButton circular variant='contained' onClick={() => router.replace(routes.dashboard)}>
            Back to home
          </CustomButton>
        </>
      ) : response?.statusCode === 200 ? (
        <>
          <Image
            src={acceptedInvite}
            alt='Invite Accepted'
            width={400}
            height={400}
            style={{ width: '100%', maxWidth: 400, height: 'auto' }}
          />
          <Typography variant='h5' fontWeight={800}>
            Invitation accepted
          </Typography>
        </>
      ) : (
        <CircularProgress />
      )}
    </Box>
  )
}

export default InvitationManagementPage
