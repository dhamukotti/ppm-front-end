import { Icon } from '@iconify/react'
import { Box, Typography } from '@mui/material'
import moment from 'moment'

import type { RecentActivity } from '@/services/modules/recent-activity/types'

const ActivityMessage = ({ rca }: { rca: RecentActivity }) => {
  return (
    <Box display={'flex'} gap={4} alignItems={'start'}>
      {/* Icon */}
      <Box
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        width={30}
        height={30}
        borderRadius={9999}
        bgcolor={'#5DC983'}
      >
        <Icon icon={'mdi:message'} color='white' fontSize={16} />
      </Box>
      {/* Message */}
      <Box display={'flex'} flexDirection={'column'}>
        <Box>
          <Typography component={'span'} fontWeight={600}>{`${rca?.doneBy?.Name}`}</Typography>
        </Box>
        <Typography component={'span'}>{`${rca?.Description}`}</Typography>
        <Typography variant='body2'>{moment(rca?.DoneAt).format('MMM DD')}</Typography>
      </Box>
    </Box>
  )
}

export default ActivityMessage
