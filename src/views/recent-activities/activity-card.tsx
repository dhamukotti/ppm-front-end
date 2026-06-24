import Image from 'next/image'

import { useRouter } from 'next/navigation'

import { Icon } from '@iconify/react'
import { Box, Typography } from '@mui/material'

import ImgRecentVisitedCard from '@public/images/cards/recently-visited.svg'
import ImgProjectItemLogo from '@public/images/cards/project-logo.svg'

import type { RecentlyVisited } from '@/services/modules/recent-activity/types'

const RecentActivityCard = ({ rv }: { rv: RecentlyVisited }) => {
  const router = useRouter()

  return (
    <Box
      border={1}
      width={'max-content'}
      display={'flex'}
      flexDirection={'column'}
      p={3}
      borderRadius={1}
      gap={2}
      borderColor={'divider'}
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(`/project/${rv?.ID}`)}
    >
      <Image src={ImgRecentVisitedCard} alt='' />
      <Box display={'flex'} gap={4} alignItems={'center'}>
        <Icon icon={'lucide:sidebar'} fontSize={22} />
        <Typography variant='subtitle1' fontWeight={700}>
          {rv?.ProjectName}
        </Typography>
      </Box>
      <Box display={'flex'} gap={4} alignItems={'center'}>
        <Image src={ImgProjectItemLogo} alt='' width={23} />
        <Typography variant='subtitle1' fontWeight={500}>
          {`${rv?.ProjectName} > ${rv?.workspace?.WorkspaceName}`}
        </Typography>
      </Box>
    </Box>
  )
}

export default RecentActivityCard
