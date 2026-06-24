'use client'

import { useQuery } from '@tanstack/react-query'

import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent } from '@mui/material'

import { fetchAllRecentActivities } from '@/services/modules/recent-activity'
import RecentActivityCard from './activity-card'
import WorkspaceCard from './workspace-card'
import ActivityMessage from './activity-message'

const RecentActivities = () => {
  const { data } = useQuery({ queryKey: ['recent-activity-page'], queryFn: fetchAllRecentActivities })



  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Typography className='text-lg lg:text-3xl font-bold text-textPrimary'>Recent Activity</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <Card className='min-h-[70vh]'>
          <CardContent>
            <Accordion defaultExpanded className='shadow-none p-0'>
              <AccordionSummary aria-controls='panel1-content' id='panel1-header' className='px-0'>
                <Typography className='text-lg lg:text-xl font-semibold text-textPrimary' ml={2}>
                  Recently visited
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='p-0'>
                <Box
                  display={'flex'}
                  gap={3}
                  sx={{
                    overflowX: 'auto', // Enable horizontal scrolling
                    whiteSpace: 'nowrap', // Prevent child elements from wrapping to a new line
                    paddingBottom: 1, // Optional: Adds padding for scroll visibility
                    '&::-webkit-scrollbar': {
                      height: '5px' // Customize scrollbar height
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#888', // Customize scrollbar color
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: '#555' // Scrollbar on hover
                    }
                  }}
                >
                  {data?.recentlyVisited?.map(rv => (
                    <Box py={2} key={rv?.ID}>
                      <RecentActivityCard rv={rv} />
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded className='shadow-none p-0'>
              <AccordionSummary aria-controls='panel2-content' id='panel2-header' className='px-0'>
                <Typography className='text-lg lg:text-xl font-semibold text-textPrimary' ml={2}>
                  My Workspaces
                </Typography>
              </AccordionSummary>
              <AccordionDetails className='p-0'>
                {data?.myWorkspaces?.map(workspace => (
                  <Box py={2} key={workspace?.WorkspaceID}>
                    <WorkspaceCard workspace={workspace} />
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card className='shadow-lg'>
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={12}>
                <Typography fontWeight={700} variant='body2' fontSize={18}>
                  Recent Activity
                </Typography>
              </Grid>
              {data?.recentActivities?.map(rca => (
                <Grid size={12} key={rca?.RecentActivityID}>
                  <ActivityMessage rca={rca} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default RecentActivities
