'use client'

import { useQuery } from '@tanstack/react-query'

import { Grid2 } from '@mui/material'

import FallbackSpinner from '@/components/spinner'
import { useAuth } from '@/hooks/useAuth'
import { fetchProfileData } from '@/services/modules/profile'
import ProfileTabs from './tabs'
import OverviewCard from './overview'

const UserProfilePage = () => {
  const { user } = useAuth()

  // ** API CALL
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.userData?.UserID],
    queryFn: () => fetchProfileData()
  })

  if (isLoading) return <FallbackSpinner height={'80vh'} />

  return (
    <Grid2 container spacing={6}>
      <Grid2 size={{ xs: 12, md: 4 }}>{data && <OverviewCard data={data} refetch={refetch} />}</Grid2>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <ProfileTabs />
      </Grid2>
    </Grid2>
  )
}

export default UserProfilePage
