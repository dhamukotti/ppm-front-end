import { useState } from 'react'

import { Avatar, Box, Button, Card, CardContent, Divider, Typography } from '@mui/material'

import type { ProfileData } from '@/services/modules/profile/types'
import { getInitials } from '@/utils/getInitials'
import UpdateProfileDialog from './update-dialog'

interface OverviewCardProps {
  data: ProfileData
  refetch: () => void
}

interface UserDetailsProps {
  title: string
  value: string
}

const UserDetails = ({ title, value }: UserDetailsProps) => {
  return (
    <Box display={'flex'} alignItems={'center'} gap={2}>
      <Typography fontWeight={600} fontSize={15}>
        {title}:
      </Typography>
      <Typography fontSize={15}>{value}</Typography>
    </Box>
  )
}

const OverviewCard = ({ data, refetch }: OverviewCardProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardContent>
        <Box display={'flex'} flexDirection={'column'} gap={5}>
          <Box display={'flex'} alignItems={'center'} justifyContent={'center'} pt={8}>
            <Avatar
              variant='rounded'
              sx={{ width: 120, height: 120, boxShadow: theme => theme.shadows[4] }}
              src={data?.ProfilePicture}
            >
              {getInitials(data?.Name)}
            </Avatar>
          </Box>
          <Typography fontSize={17} fontWeight={500} textAlign={'center'}>
            {data?.Name}
          </Typography>
          <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Typography fontSize={19}>Details</Typography>
            <Divider />
            <UserDetails title={'Name'} value={data?.Name} />
            <UserDetails title={'Email'} value={data?.Email?.toLowerCase()} />
            <UserDetails title={'Country'} value={data?.country?.Name} />
            <UserDetails title={'Address'} value={data?.Address ?? '-'} />
          </Box>
          <Box display={'flex'} alignItems={'center'} justifyContent={'center'} gap={2}>
            <Button variant='contained' onClick={() => setOpen(true)}>
              Edit
            </Button>
          </Box>
        </Box>
      </CardContent>
      <UpdateProfileDialog open={open} close={() => setOpen(false)} data={data} refetch={refetch} />
    </Card>
  )
}

export default OverviewCard
