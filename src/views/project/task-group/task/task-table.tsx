import { Fragment, useCallback, useMemo, useState } from 'react'

import { debounce } from 'lodash'

import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Checkbox,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import CustomButton from '@/components/button'
import IconifyIcon from '@/components/icon'
import { useProject } from '@/context/project-context'
import { useWorkspace } from '@/context/workspace-context'
import { addTasks, updateTasks } from '@/services/modules/task'
import type { AdditionalValue, TaskListItemType } from '@/services/modules/task/types'
import { ColumnTextField, defaultColumn } from './columns/default-column'
import DynamicColumnCell from './columns/dynamic/cell'
import DynamicTableHeader from './columns/dynamic/header'
import TaskPeople from './columns/people'
import TaskPriority from './columns/priority'
import TaskStatus from './columns/status'
import TaskTimeline from './columns/timeline'
import SubTaskTable from './sub-task/sub-task-table'
import CreateColumnMenu from './create-column'
import TaskNameCell from './columns/task-name'

interface TaskTableProps {
  taskList?: TaskListItemType[]
  isLoading: boolean
  taskGroupID: number
  refetch: () => void
  selectedRows: any
  setSelectedRows: (rows: any) => void
}

const filterDynamicValue = (additionColumnID: number, additionalValues: AdditionalValue[]) => {
  const filteredValues = additionalValues.find(item => item.AdditionalColumnID === additionColumnID)

  return filteredValues ?? null
}

const TaskTable: React.FC<TaskTableProps> = ({
  taskList = [],
  taskGroupID,
  isLoading,
  refetch,
  selectedRows,
  setSelectedRows
}) => {
  // ** Project Context
  const { project, columnVisibility, role, refetchProject, users } = useProject()

  // ** Hooks
  const { selected } = useWorkspace()

  // ** States
  const [addColumnAnchor, setAddColumnAnchor] = useState<any>(null)
  const [adding, setAdding] = useState(false)

  const canEdit = useMemo(() => role?.RoleName === 'Admin' || role?.RoleName === 'Member', [role?.RoleName])

  const dynamicColumn = useCallback((): ColumnDef<TaskListItemType>[] => {
    return project?.additionalColumns
      ? project.additionalColumns.map(i => {
          return {
            accessorFn: row =>
              filterDynamicValue(i?.AdditionalColumnID, row?.additionalValues ?? [])?.DynamicColumnValues,
            id: i?.AdditionalColumnID?.toString(),
            accessorKey: i?.AdditionalColumnID,
            minSize: 250,
            size: 250,
            sortable: false,
            header: () => {
              return <DynamicTableHeader column={i} refetch={refetchProject} />
            },
            cell: ({ getValue, row: { index, original: row }, column: { id }, table }) => {
              const value = filterDynamicValue(i?.AdditionalColumnID, row?.additionalValues ?? [])

              return (
                <DynamicColumnCell
                  getValue={getValue}
                  columnItem={i}
                  index={index}
                  row={row}
                  id={id}
                  table={table}
                  value={value}
                  refetch={refetch}
                  isSubTask={false}
                />
              )
            }
          }
        })
      : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, refetch, project?.additionalColumns, users, refetchProject])

  // ** Functions
  const handleAddTask = useCallback(async () => {
    setAdding(true)
    await addTasks({ projectID: project?.ID, workspaceID: selected?.WorkspaceID, taskGroupID })
    refetch()
    setAdding(false)
  }, [project?.ID, refetch, selected?.WorkspaceID, taskGroupID])

  const debouncedHandleAddTask = useMemo(() => debounce(handleAddTask, 100), [handleAddTask])

  const columns: ColumnDef<TaskListItemType>[] = useMemo(
    () => [
      {
        id: 'select',
        accessorKey: 'select',
        size: 20,
        maxSize: 20,
        align: 'right',
        header: ({ table }) => {
          return (
            <div className='flex justify-end pr-1 w-20'>
              {canEdit && (
                <Checkbox
                  checked={!!table?.getIsAllRowsSelected?.()} // ✅ Avoids undefined error
                  indeterminate={!!table?.getIsSomeRowsSelected?.()}
                  onChange={table?.getToggleAllRowsSelectedHandler?.()}
                />
              )}
            </div>
          )
        },
        cell: ({ row }) => (
          <div className='flex px-1 !w-20'>
            {row.getCanExpand() ? (
              <IconButton
                size='small'
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: 'pointer' }
                }}
              >
                {row.getIsExpanded() ? (
                  <IconifyIcon icon={'line-md:chevron-down'} />
                ) : (
                  <IconifyIcon icon={'line-md:chevron-right'} />
                )}
              </IconButton>
            ) : null}
            {canEdit && (
              <Checkbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler()
                }}
              />
            )}
          </div>
        )
      },
      {
        accessorKey: 'Taskname',
        size: 200,
        maxSize: 1000,
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Task
          </Typography>
        ),
        cell: ({ getValue, row: { original, index }, column: { id }, table }) => {
          return (
            <TaskNameCell
              renderTextField={
                canEdit ? (
                  <ColumnTextField canEdit={canEdit} getValue={getValue} index={index} id={id} table={table} />
                ) : (
                  <Typography width={'100%'}>{original?.Taskname}</Typography>
                )
              }
              rowData={original}
              refetch={refetch}
            />
          )
        }
      },
      {
        accessorFn: row => row.Owner.Name,
        id: 'owner',
        size: 150,
        maxSize: 150,
        cell: ({ row: { original } }) => {
          return <TaskPeople rowData={original} refetch={refetch} />
        },
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Owner
          </Typography>
        )
      },
      {
        accessorFn: row => row.Priority.PriorityName,
        id: 'Priority',
        size: 200,
        maxSize: 200,
        headerName: 'Priority',
        cell: ({ row: { original: row } }) => {
          return <TaskPriority row={row} refetch={refetch} canEdit={canEdit} />
        }
      },
      {
        accessorFn: row => row.Status.Statusname,
        id: 'Status',
        size: 200,
        maxSize: 200,
        headerName: 'Status',
        cell: ({ row: { original: row } }) => {
          return <TaskStatus row={row} refetch={refetch} canEdit={canEdit} />
        }
      },
      {
        accessorKey: 'Timeline',
        headerName: 'Timeline',
        cell: ({ row: { original: row } }) => {
          return <TaskTimeline row={row} refetch={refetch} canEdit={canEdit} />
        }
      },
      ...dynamicColumn()
    ],
    [canEdit, dynamicColumn, refetch]
  )

  // const table = useReactTable({
  //   data: (taskList ?? []) as TaskListItemType[],
  //   columns,
  //   initialState: { columnPinning: { left: ['select', 'Taskname'], right: ['add-column'] } },
  //   state: {
  //     columnPinning: { left: ['select', 'Taskname'] },
  //     rowSelection: selectedRows,
  //     columnVisibility: {
  //       ...columnVisibility,
  //       'add-column': canEdit
  //     }
  //   },
  //   defaultColumn: defaultColumn(canEdit),
  //   enableRowSelection: true,
  //   getRowCanExpand: () => true,
  //   onRowSelectionChange: setSelectedRows,
  //   getCoreRowModel: getCoreRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getExpandedRowModel: getExpandedRowModel(),
  //   meta: {
  //     updateData: async (rowIndex: number, columnId: any, value: { AdditionalColumnID: string }) => {
  //       if (columnId === 'Taskname' && taskList?.[rowIndex]?.TaskID) {
  //         try {
  //           const body = {
  //             Taskname: value,
  //             Title: 'Task Name Changed',
  //             PreviousState: taskList?.[rowIndex]?.Taskname,
  //             NewState: value
  //           }

  //           const response = await updateTasks({ id: taskList?.[rowIndex]?.TaskID?.toString(), body })

  //           if (response) {
  //             refetch()
  //           }
  //         } catch (error) {
  //           console.error('error :', error)
  //         }
  //       }

  //       if (value?.AdditionalColumnID && taskList?.[rowIndex]?.TaskID) {
  //         const body = { ...value }

  //         const response = await updateTasks({ id: taskList?.[rowIndex]?.TaskID?.toString(), body })

  //         if (response) {
  //           refetch()
  //         }
  //       }
  //     }
  //   }
  // })
const table = useReactTable({
    data: (taskList ?? []) as TaskListItemType[],
    columns,
    initialState: { columnPinning: { left: ['select', 'Taskname'], right: ['add-column'] } },
    state: {
      columnPinning: { left: ['select', 'Taskname'] },
      rowSelection: selectedRows,
      columnVisibility: {
        ...columnVisibility,
        'add-column': canEdit
      }
    },
    defaultColumn: defaultColumn(canEdit),
    enableRowSelection: true,
    getRowCanExpand: () => true,
    onRowSelectionChange: setSelectedRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: any, value: string | { AdditionalColumnID: string }) => {
        if (columnId === 'Taskname' && taskList?.[rowIndex]?.TaskID) {
          try {
            const body = {
              Taskname: value,
              Title: 'Task Name Changed',
              PreviousState: taskList?.[rowIndex]?.Taskname,
              NewState: value
            }

            const response = await updateTasks({ id: taskList?.[rowIndex]?.TaskID?.toString(), body })

            if (response) {
              refetch()
            }
          } catch (error) {
            console.error('error :', error)
          }
        }

        if (typeof value === 'object' && value?.AdditionalColumnID && taskList?.[rowIndex]?.TaskID) {
          const body = { ...value }

          const response = await updateTasks({ id: taskList?.[rowIndex]?.TaskID?.toString(), body })

          if (response) {
            refetch()
          }
        }
      }
    }
  })
  const renderSubComponent = ({ row }: { row: TaskListItemType }) => {
    return (
      <SubTaskTable
        canEdit={canEdit}
        taskRow={row}
        taskGroupData={{ taskGroupID, projectID: project?.ID || 0, workspaceID: selected?.WorkspaceID || 0 }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[20vh] w-full'>
        <CircularProgress size={24} />
      </div>
    )
  }

  return (
    <div className='border rounded-lg overflow-hidden border-actionHover'>
      <div>
        <TableContainer>
          <Table className='min-w-[700px]'>
            <TableHead sx={{ backgroundColor: 'background.default' }}>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      sx={{ fontWeight: 600, pb: 2, textTransform: 'uppercase' }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow key={row.id}>
                        {/* 2nd row is a custom 1 cell row */}
                        <TableCell colSpan={row.getVisibleCells().length}>
                          {renderSubComponent({ row: row?.original })}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className='flex items-center justify-center h-20 w-full'>
                      <Typography>No Tasks Added</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {role?.RoleName !== 'Viewer' && (
        <div className='flex justify-between items-center gap-2 m-2'>
          <CustomButton
            variant='text'
            size='small'
            endIcon={<i className='ri-add-line' />}
            onClick={debouncedHandleAddTask}
          >
            {adding ? 'Adding...' : 'Add Task'}
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
      <CreateColumnMenu
        anchorEl={addColumnAnchor}
        refetch={refetchProject}
        setAnchorEl={setAddColumnAnchor}
        taskGroupAllData={{ taskGroupID }}
      />
    </div>
  )
}

export default TaskTable
