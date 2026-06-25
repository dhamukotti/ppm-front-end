// ** React Imports
import { memo, useCallback, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

// ** Third Party Imports
import { Icon } from '@iconify/react'
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { debounce } from 'lodash'

import { useQuery } from '@tanstack/react-query'

import CustomButton from '@components/button'

import DeleteDialog from '@/components/dialog/delete-dialog'
import {
  addSubTask,
  deleteSubTask,
  fetchSubTaskColumns,
  fetchSubTaskList,
  updateSubTask
} from '@/services/modules/sub-task'
import type { AdditionalValueSubTask, SubTaskListItemType } from '@/services/modules/sub-task/types'
import type { TaskListItemType } from '@/services/modules/task/types'
import { defaultColumn } from '../columns/default-column'
import DynamicColumnCell from '../columns/dynamic/cell'
import TaskPeople from '../columns/people'
import TaskStatus from '../columns/status'
import TaskEffortCell from './effort'
import DynamicTableHeader from '../columns/dynamic/header'
import CreateColumnMenu from '../create-column'

interface SubTableProps {
  taskRow: TaskListItemType
  taskGroupData: { taskGroupID: number; projectID: number; workspaceID: number }
  canEdit: boolean
}

const SubTable = ({ taskRow, taskGroupData, canEdit }: SubTableProps) => {
  // ** Hooks

  // ** States
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteData, setDeleteData] = useState<SubTaskListItemType | null>(null)
  const [adding, setAdding] = useState(false)
  const [addColumnAnchor, setAddColumnAnchor] = useState<any>(null)

  // ** API Calls
  const {
    data: subTaskList = [],
    isLoading,
    refetch: refetchSubTask
  } = useQuery({
    queryKey: ['sub-task-list', taskRow?.TaskID],
    queryFn: () => fetchSubTaskList(taskRow?.TaskID?.toString())
  })

  const { data: additionalSubColumns = [], refetch: refetchAddSubColumns } = useQuery({
    queryKey: ['sub-task-columns', taskRow?.TaskID],
    queryFn: () => fetchSubTaskColumns({ taskID: taskRow?.TaskID })
  })

  // ** Add Task
  const handleAddTask = useCallback(async () => {
    setAdding(true)
    await addSubTask({ taskID: taskRow?.TaskID })
    refetchSubTask()
    setAdding(false)
  }, [refetchSubTask, taskRow?.TaskID])

  const debouncedHandleAddTask = useMemo(() => debounce(handleAddTask, 300), [handleAddTask])

  // ** Delete Sub Task
  const handleDeleteSubTask = (rowData: SubTaskListItemType) => {
    setDeleteOpen(true)
    setDeleteData(rowData)
  }

  const handleDelete = useCallback(async () => {
    if (deleteData?.SubTaskID) {
      const response = await deleteSubTask(deleteData?.SubTaskID?.toString())

      if (response?.status) {
        refetchSubTask()
        setDeleteData(null)
        setDeleteOpen(false)
      }
    }
  }, [deleteData?.SubTaskID, refetchSubTask])

  const filterDynamicValue = (additionColumnID: number, additionalValues: AdditionalValueSubTask[]) => {
    const filteredValues = additionalValues.find(item => item.AdditionalColumnID === additionColumnID)

    return filteredValues ?? null
  }

  const dynamicColumn = useCallback((): ColumnDef<SubTaskListItemType>[] => {
    return additionalSubColumns?.length
      ? additionalSubColumns?.map(i => {
          return {
            accessorFn: row =>
              filterDynamicValue(i?.AdditionalColumnID, row?.additionalValues ?? [])?.DynamicColumnValues,
            id: i?.AdditionalColumnID?.toString(),
            minSize: 250,
            size: 250,
            sortable: false,
            header: () => {
              return <DynamicTableHeader column={i} refetch={refetchAddSubColumns} isSubTask={true} />
            },
            cell: ({ getValue, row: { index, original: row }, column: { id }, table }) => {
              const value = filterDynamicValue(i?.AdditionalColumnID, row?.additionalValues ?? [])

              // Safely handle null/undefined values
              // FIX (TS2322 line ~130): cast to `any` so it satisfies NoInfer<TTValue>
              const safeValue = (getValue() ?? '') as any

              return (
                <DynamicColumnCell
                  getValue={() => safeValue}
                  columnItem={i}
                  index={index}
                  row={{
                    ...row,
                    TaskGroupID: taskGroupData?.taskGroupID,
                    TaskID: row?.TaskMasterID,
                    // FIX (TS2322 line ~133): AdditionalSubTaskListItem requires groupID & BugID
                    groupID: taskGroupData?.taskGroupID,
                    BugID: 0,
    SprintID: 0,        // ✅ added — required by AdditionalSubTaskListItem
    SprintGroupID: 0
                  }}
                  id={id}
                  table={table}
                  value={value}
                  refetch={refetchSubTask}
                  isSubTask={true}
                />
              )
            }
          }
        })
      : []
  }, [additionalSubColumns, refetchAddSubColumns, refetchSubTask, taskGroupData?.taskGroupID])

  // ** Columns
  const columns: ColumnDef<SubTaskListItemType>[] = useMemo(
    () => [
      {
        id: 'delete-subtask',
        accessorKey: 'SubTaskID',
        minSize: 30,
        size: 30,
        header: () => <></>,
        cell: ({ row: { original } }) => {
          return (
            <IconButton sx={{ p: 0 }} size='small' onClick={() => handleDeleteSubTask(original)}>
              <i className='ri-delete-bin-line text-error' />
            </IconButton>
          )
        }
      },
      {
        accessorKey: 'SubTaskName',
        minSize: 300,
        size: 300,
        header: () => (
          <Typography variant='body2' fontWeight={800} className='min-w-44'>
            Sub Task
          </Typography>
        )
      },
      {
        accessorFn: row => row.Owner.Name,
        id: 'owner',
        size: 160,
        maxSize: 160,
        cell: ({ row: { original } }) => {
          return (
            <TaskPeople
              refetch={refetchSubTask}
              rowData={{
                ...original,
                TaskGroupID: taskGroupData?.taskGroupID,
                TaskID: original?.TaskMasterID,
                // FIX (TS2322 line ~183): AdditionalSubTaskListItem requires groupID & BugID
                groupID: taskGroupData?.taskGroupID,
              BugID: 0,
    SprintID: 0,        // ✅ added — required by AdditionalSubTaskListItem
    SprintGroupID: 0
              }}
              isSubTask={true}
            />
          )
        },
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Owner
          </Typography>
        )
      },
      {
        accessorFn: row => row?.Effort,
        id: 'effort',
        size: 200,
        maxSize: 200,
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          // Safely handle null/undefined values by converting to empty string or 0
          // FIX (TS2322 line ~205): cast to `any` so it satisfies NoInfer<TTValue>
          const safeValue = (getValue() ?? '') as any
          return (
            <TaskEffortCell
              canEdit={canEdit}
              getValue={() => safeValue}
              index={index}
              id={id}
              table={table}
            />
          )
        },
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Planned Effort
          </Typography>
        )
      },
      {
        accessorKey: 'Status',
        id: 'Status',
        size: 200,
        maxSize: 200,
        headerName: 'Status',
        cell: ({ row: { original } }) => {
          return (
            <TaskStatus
              canEdit={canEdit}
              row={{
                ...original,
                TaskGroupID: taskGroupData?.taskGroupID,
                TaskID: original?.TaskMasterID,
                // FIX (TS2322 line ~228): AdditionalSubTaskListItem requires groupID & BugID
                groupID: taskGroupData?.taskGroupID,
               BugID: 0,
    SprintID: 0,        // ✅ added — required by AdditionalSubTaskListItem
    SprintGroupID: 0
              }}
              refetch={refetchSubTask}
              isSubTask={true}
            />
          )
        }
      },
      ...dynamicColumn()
    ],
    [canEdit, dynamicColumn, refetchSubTask, taskGroupData?.taskGroupID]
  )

  // const table = useReactTable({
  //   data: subTaskList,
  //   columns,
  //   state: {
  //     columnVisibility: {
  //       'add-column': canEdit,
  //       'delete-subtask': canEdit
  //     }
  //   },
  //   defaultColumn: defaultColumn(canEdit),
  //   getCoreRowModel: getCoreRowModel(),
  //   meta: {
  //     updateData: async (rowIndex: number, columnId: any, value: { AdditionalColumnID: string }) => {
  //       if (columnId === 'SubTaskName' || columnId === 'effort') {
  //         try {
  //           const body: any = {
  //             TaskID: taskRow?.TaskID
  //           }

  //           if (columnId === 'SubTaskName') {
  //             body.SubTaskName = value

  //             body.Title = 'Sub-task name changed'
  //             body.PreviousState = subTaskList?.[rowIndex]?.SubTaskName
  //             body.NewState = value
  //           }

  //           if (columnId === 'effort') {
  //             body.Effort = value
  //             body.Title = 'Sub-task Effort changed'
  //             body.PreviousState = subTaskList?.[rowIndex]?.Effort ?? ''
  //             body.NewState = value
  //           }

  //           const response = await updateSubTask({ id: subTaskList?.[rowIndex]?.SubTaskID?.toString(), body })

  //           if (response) {
  //             refetchSubTask()
  //           }
  //         } catch (error) {
  //           console.error('error :', error)
  //         }
  //       }

  //       if (value?.AdditionalColumnID) {
  //         const body = { ...value, TaskID: taskRow?.TaskID }
  //         const response = await updateSubTask({ id: subTaskList?.[rowIndex]?.SubTaskID?.toString(), body })

  //         if (response) {
  //           refetchSubTask()
  //         }
  //       }
  //     }
  //   }
  // })
const table = useReactTable({
    data: subTaskList,
    columns,
    state: {
      columnVisibility: {
        'add-column': canEdit,
        'delete-subtask': canEdit
      }
    },
    defaultColumn: defaultColumn(canEdit),
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: any, value: string | { AdditionalColumnID: string }) => {
        if (columnId === 'SubTaskName' || columnId === 'effort') {
          try {
            const body: any = {
              TaskID: taskRow?.TaskID
            }

            if (columnId === 'SubTaskName') {
              body.SubTaskName = value

              body.Title = 'Sub-task name changed'
              body.PreviousState = subTaskList?.[rowIndex]?.SubTaskName
              body.NewState = value
            }

            if (columnId === 'effort') {
              body.Effort = value
              body.Title = 'Sub-task Effort changed'
              body.PreviousState = subTaskList?.[rowIndex]?.Effort ?? ''
              body.NewState = value
            }

            const response = await updateSubTask({ id: subTaskList?.[rowIndex]?.SubTaskID?.toString(), body })

            if (response) {
              refetchSubTask()
            }
          } catch (error) {
            console.error('error :', error)
          }
        }

        if (typeof value === 'object' && value?.AdditionalColumnID) {
          const body = { ...value, TaskID: taskRow?.TaskID }
          const response = await updateSubTask({ id: subTaskList?.[rowIndex]?.SubTaskID?.toString(), body })

          if (response) {
            refetchSubTask()
          }
        }
      }
    }
  })
  if (isLoading) {
    return (
      <Box display={'flex'} alignItems={'center'} ml={40} justifyContent={'start'} height={'20vh'} width={'100%'}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box py={4} ml={3} display={'flex'}>
      <Box display={'flex'} flexDirection={'column'} width={50} position={'relative'}>
        <Box height={canEdit ? 67.5 : 48.5} display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <Box height={10} width={10} borderRadius={100} bgcolor={'secondary.light'} />
        </Box>
        {subTaskList?.length ? (
          subTaskList?.map(i => (
            <Box height={70.5} display={'flex'} alignItems={'center'} justifyContent={'end'} key={i?.SubTaskID}>
              <Box width={22} borderTop={'2px dashed'} borderColor={'secondary.light'} position={'relative'}></Box>
            </Box>
          ))
        ) : (
          <Box height={100} display={'flex'} alignItems={'center'} justifyContent={'end'}>
            <Box width={22} borderTop={'2px dashed'} borderColor={'secondary.light'} position={'relative'}></Box>
          </Box>
        )}
        <Box height={canEdit ? 50 : 40} display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <Box height={10} width={10} borderRadius={100} bgcolor={'secondary.light'} />
        </Box>
        <Box
          position={'absolute'}
          borderRight={`2px dashed`}
          borderColor={'secondary.light'}
          sx={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', height: 'calc(100% - 60px)' }}
        />
      </Box>
      <Box
        sx={{
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: '1px' },
          borderRadius: 1,
          border: 1,

          borderColor: theme => theme.palette.divider
        }}
      >
        <Table
          sx={{
            minWidth: 'max-content'
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    colSpan={header.colSpan}
                    sx={{ fontWeight: 600, pb: 2, height: 67.5, textTransform: 'uppercase' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
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
        {canEdit && (
          <div className='flex justify-between items-center gap-2 m-2'>
            <CustomButton
              variant='text'
              size='small'
              color='primary'
              disabled={adding}
              endIcon={<Icon icon={'mdi:plus'} />}
              onClick={debouncedHandleAddTask}
            >
              {adding ? 'Adding' : 'Add Sub Task'}
            </CustomButton>
            <CustomButton
              variant='outlined'
              circular
              size='small'
              color='secondary'
              startIcon={<i className='ri-add-line' />}
              onClick={e => {
                setAddColumnAnchor(e?.currentTarget)
              }}
            >
              Add New Column
            </CustomButton>
          </div>
        )}
      </Box>
      <DeleteDialog
        open={deleteOpen && !!deleteData}
        setOpen={val => setDeleteOpen(!!val)}
        description={`Subtask '${deleteData?.SubTaskName}' will be deleted`}
        onConfirm={handleDelete}
        // FIX (TS2741 line ~412): DeleteDialogProps requires `refetch`
        refetch={refetchSubTask}
      />
      <CreateColumnMenu
        anchorEl={addColumnAnchor}
        setAnchorEl={setAddColumnAnchor}
        isSubTask={true}
        refetch={refetchAddSubColumns}
        taskGroupAllData={{
          taskGroupID: taskGroupData?.taskGroupID,
          taskID: taskRow?.TaskID
        }}
      />
    </Box>
  )
}

export default memo(SubTable)
