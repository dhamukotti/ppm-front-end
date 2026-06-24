import React, { useMemo, useState } from 'react'

import { Icon } from '@iconify/react'
import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  Grid,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Zoom
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import moment from 'moment'

import type { RecentActivityListType, TaskListItemType } from '@/services/modules/task/types'
import { getInitials } from '@/utils/getInitials'
import { fetchRecentActivityList } from '@/services/modules/task'

const FilterMenuItem = () => {
  return (
    <Box pl={2} display={'flex'} alignItems={'center'} justifyContent={'space-between'} minWidth={140}>
      <Typography>People</Typography>
      <Checkbox size='small' />
    </Box>
  )
}

const ActivityTable = ({ taskData }: { taskData: TaskListItemType }) => {
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['recent-activity-task', taskData?.TaskID],
    queryFn: () => fetchRecentActivityList({ taskID: taskData?.TaskID?.toString() })
  })


  const columns: ColumnDef<RecentActivityListType>[] = useMemo(
    () => [
      {
        accessorKey: 'DoneAt',
        cell: ({ row: { original } }) => {
          return (
            <Box display={'flex'} alignItems={'center'} gap={2}>
              <Icon icon={'mingcute:parking-fill'} fontSize={20} />
              <Typography variant='subtitle2'>{moment(original?.DoneAt).fromNow()}</Typography>
            </Box>
          )
        }
      },
      {
        accessorKey: 'doneBy',
        cell: ({ row: { original } }) => {
          return (
            <Box display={'flex'} alignItems={'center'} gap={4}>
              <Avatar variant='circular' sx={{ width: 40, height: 40 }} src={original?.doneBy?.ProfilePicture}>
                {getInitials(original?.doneBy?.Name)}
              </Avatar>
              <Typography variant='body1'>{original?.doneBy?.Name}</Typography>
            </Box>
          )
        }
      },
      {
        accessorKey: 'Title',
        cell: ({ row: { original } }) => {
          return <Typography variant='body1'>{original?.Title}</Typography>
        }
      },
      {
        accessorKey: 'PreviousState',
        cell: ({ row: { original } }) => {
          return (
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              <Typography variant='body1' color={original?.IsCritical ? 'error.main' : 'textPrimary'}>
                {original?.PreviousState ?? '-'}
              </Typography>
              <Icon icon={'mdi:chevron-right'} fontSize={22} color={original?.IsCritical ? 'red' : 'inherit'} />
            </Box>
          )
        }
      },
      {
        accessorKey: 'NewState',
        cell: ({ row: { original } }) => {
          return (
            <Typography variant='body1' color={original?.IsCritical ? 'error.main' : 'textPrimary'}>
              {original?.NewState ?? '-'}
            </Typography>
          )
        }
      }
    ],
    []
  )

  const table = useReactTable({
    data: (activityData ?? []) as RecentActivityListType[],
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      {isLoading ? (
        <Box display={'flex'} height={'100%'} alignItems={'center'} justifyContent={'center'}>
          <CircularProgress />
        </Box>
      ) : (
        <Table
          sx={{
            minWidth: 'max-content',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => {
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      return (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns?.length}>
                  <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={70} width={'100%'}>
                    <Typography>No Data Found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  )
}

const ProjectActivityLogs = ({ taskData }: { taskData: TaskListItemType }) => {
  const [filterMenu, setFilterMenu] = useState(null)

  const handleFilterMenuOpen = (e: any) => {
    setFilterMenu(e.currentTarget)
  }

  const handleFilterMenuClose = () => {
    setFilterMenu(null)
  }

  return (
    <Box px={4} sx={{ overflowY: 'auto' }}>
      <Grid container spacing={5}>
        {/* Filters */}
        <Grid item xs={12}>
          <Box display={'flex'} alignItems={'center'} gap={1} sx={{ cursor: 'pointer' }} onClick={handleFilterMenuOpen}>
            <Typography>Filter Log</Typography>
            <Icon icon={'mdi:caret-down'} fontSize={18} />
          </Box>
          <Menu open={!!filterMenu} anchorEl={filterMenu} TransitionComponent={Zoom} onClose={handleFilterMenuClose}>
            <FilterMenuItem />
          </Menu>
        </Grid>
        {/* Table */}
        <Grid item xs={12}>
          <ActivityTable taskData={taskData} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProjectActivityLogs
