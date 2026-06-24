import { Box, Typography } from '@mui/material'

import CustomAvatar from '@/@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import type { Workspace } from '@/services/modules/recent-activity/types'

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  return (
    <Box
      border={1}
      width={'100%'}
      display={'flex'}
      p={3}
      borderRadius={1}
      gap={3}
      borderColor={'divider'}
      alignItems={'center'}
    >
      <CustomAvatar skin={'light'} color={'warning'} variant='rounded' sx={{ width: 50, height: 50, fontSize: 27 }}>
        {getInitials(workspace?.WorkspaceName)}
      </CustomAvatar>
      <Box display={'flex'} flexDirection={'column'} gap={1}>
        <Typography variant='body1' fontWeight={600} fontSize={18}>
          {workspace?.WorkspaceName}
        </Typography>
      </Box>
    </Box>
  )
}

export default WorkspaceCard
