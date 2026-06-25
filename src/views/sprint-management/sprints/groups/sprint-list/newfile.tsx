import { useMemo, useState, useContext } from 'react'

import {
  Box,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { useQuery } from '@tanstack/react-query'

import type { ColumnDef } from '@tanstack/react-table'

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import { debounce } from 'lodash'

import CustomButton from '@/components/button'
import type { SprintGroupItem } from '@/services/modules/sprint-group/type'
import { createSprint, fetchSprintList, updateSprint } from '@/services/modules/sprint-item'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import SprintTimelineManagement from './timeline'
import { ColumnTextField } from '@/views/project/task-group/task/columns/default-column'
import { SprintManagement } from 'src/context/sprint-context'

const SprintList = ({ 
  sg, 
  selectedSprint, 
  sprintSearchTerm 
}: { 
  sg: SprintGroupItem;
  selectedSprint?: any;
  sprintSearchTerm?: string;
}) => {
  // ** States
  const [selectedRows, setSelectedRows] = useState<any>({})
  const [adding, setAdding] = useState(false)
  
  // Get column visibility from sprint context
  const { columnVisibility: sprintColumnVisibility } = useContext(SprintManagement)

  const sprintListApi = useQuery({
    queryKey: ['sprint-list', sg?.SprintGroupID],
    queryFn: () => fetchSprintList({ SprintGroupID: sg?.SprintGroupID })
  })

  // Filter sprint data based on selected sprint and search term
  const filteredSprintData = useMemo(() => {
    const originalData = sprintListApi?.data?.data ?? []
    
    // If no filters, return original data
    if (!selectedSprint && !sprintSearchTerm?.trim()) {
      return originalData
    }
    
    return originalData.filter((sprint: SprintItem) => {
      // If there's a selected sprint, show only that sprint
      if (selectedSprint) {
        return sprint.SprintID === selectedSprint.SprintID
      }
      
      // If there's a search term, filter by it
      if (sprintSearchTerm?.trim()) {
        const searchLower = sprintSearchTerm.toLowerCase()
        return (
          sprint?.Name?.toLowerCase().includes(searchLower) ||
          sprint?.SprintID?.toString().toLowerCase().includes(searchLower) ||
          sprint?.Goals?.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
  }, [sprintListApi?.data?.data, selectedSprint, sprintSearchTerm])

  // Define all columns first
  const allColumns: ColumnDef<SprintItem>[] = useMemo(
    () => [
      {
        id: 'select',
        accessorKey: 'select',
        size: 20,
        maxSize: 20,
        header: ({ table }) => {
          return (
            <div className='flex justify-start ml-1 !w-20'>
              <Checkbox
                checked={!!table?.getIsAllRowsSelected?.()}
                indeterminate={!!table?.getIsSomeRowsSelected?.()}
                onChange={table?.getToggleAllRowsSelectedHandler?.()}
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <div className='flex px-1 !w-20'>
            <Checkbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler()
              }}
            />
          </div>
        )
      },
      {
        accessorKey: 'Name',
        size: 200,
        maxSize: 1000,
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Sprint
          </Typography>
        ),
        cell: ({ getValue, row: { index, original }, column: { id }, table }) => {
          // Highlight selected sprint
          const isSelectedSprint = selectedSprint && original.SprintID === selectedSprint.SprintID
          
          return (
            <div 
              className={isSelectedSprint ? 'bg-blue-50 border-l-4 border-blue-500 pl-2' : ''}
              style={isSelectedSprint ? { fontWeight: 600, color: '#1976d2' } : {}}
            >
              <ColumnTextField canEdit={true} getValue={getValue} index={index} id={id} table={table} />
            </div>
          )
        }
      },
      {
        accessorKey: 'Goals',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Goals
          </Typography>
        ),
        cell: ({ row: { original } }) => {
          const isSelectedSprint = selectedSprint && original.SprintID === selectedSprint.SprintID
          
          return (
            <div 
              className={isSelectedSprint ? 'bg-blue-50' : ''}
              style={isSelectedSprint ? { fontWeight: 600, color: '#1976d2' } : {}}
            >
              {original?.Goals || '-'}
            </div>
          )
        }
      },
      {
        accessorKey: 'ActiveSprint',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Active Sprint
          </Typography>
        ),
        cell: ({ row: { original } }) => {
          const isSelectedSprint = selectedSprint && original.SprintID === selectedSprint.SprintID
          
          return (
            <div className={isSelectedSprint ? 'bg-blue-50' : ''}>
              {original?.SprintStatus === 'Active' ? <i className='ri-check-line' /> : <></>}
            </div>
          )
        }
      },
      {
        accessorKey: 'SprintTimeline',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Sprint Timeline
          </Typography>
        ),
        cell: ({ row: { original } }) => {
          const isSelectedSprint = selectedSprint && original.SprintID === selectedSprint.SprintID
          
          return (
            <div className={isSelectedSprint ? 'bg-blue-50' : ''}>
              <SprintTimelineManagement original={original} refetch={sprintListApi?.refetch} />
            </div>
          )
        }
      },
      {
        accessorKey: 'Completed',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Completed 
          </Typography>
        ),
        cell: ({ row: { original } }) => {
          const isSelectedSprint = selectedSprint && original.SprintID === selectedSprint.SprintID
          
          return (
            <div className={isSelectedSprint ? 'bg-blue-50' : ''}>
              {original?.SprintStatus === 'Completed' ? <i className='ri-check-line' /> : <></>}
            </div>
          )
        }
      }
      
    ],
    [sprintListApi?.refetch, selectedSprint]
  )

  // Filter columns based on visibility from sprint context
  // Map table column keys to context visibility keys
  const visibleColumns = useMemo(() => {
    const columnVisibilityMap: Record<string, string> = {
      'Name': 'Name',
      'Goals': 'Goals',
      'SprintTimeline': 'SprintTimeline',
      'ActiveSprint': 'ActiveSprint', // Map ActiveSprint to SprintStatus in context
      'Completed': 'SprintStatus'  
         // Map Completed to SprintStatus in context
    }

    return allColumns.filter(column => {
      // const accessorKey = column.accessorKey as string
      const accessorKey = (column as any).accessorKey as string
      // Always show select column
      if (accessorKey === 'select') return true
      
      // Get the corresponding context key
      const contextKey = columnVisibilityMap[accessorKey]
      
      // If no mapping found, show the column by default
      if (!contextKey) return true
      
      // Check visibility from context
      return sprintColumnVisibility[contextKey] !== false
    })
  }, [allColumns, sprintColumnVisibility])

  const table = useReactTable({
    data: filteredSprintData as SprintItem[],
    columns: visibleColumns,
    initialState: { columnPinning: { left: ['select', 'Taskname'], right: ['add-column'] } },
    state: {
      rowSelection: selectedRows
    },
    getRowCanExpand: () => true,
    enableRowSelection: true,
    onRowSelectionChange: setSelectedRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: any, value: string | { AdditionalColumnID: string }
) => {
        if (columnId === 'Name' && filteredSprintData?.[rowIndex]?.SprintID) {
          try {
            const response = await updateSprint({
              id: filteredSprintData?.[rowIndex]?.SprintID?.toString(),
              body: { Name: value }
            })

            if (response) {
              sprintListApi?.refetch()
            }
          } catch (error) {
            console.error('error :', error)
          }
        }
      }
    }
  })

  const handleAddSprint = async () => {
    setAdding(true)

    const body = {
      workspaceID: sg?.WorkspaceID,
      sprintGroupID: sg?.SprintGroupID
    }

    await createSprint(body)
    sprintListApi.refetch()

    setAdding(false)
  }

  const debouncedHandleAddSprint = debounce(handleAddSprint, 500)

  if (sprintListApi?.isLoading)
    return (
      <div className='w-full flex justify-center'>
        <CircularProgress />
      </div>
    )

  if (sprintListApi?.isError) return <div>Error</div>

  return (
    <div className='px-3'>
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
                  sx={{ fontWeight: 600, pb: 1, height: 67.5, textTransform: 'uppercase' }}
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
              const isSelectedSprint = selectedSprint && row.original.SprintID === selectedSprint.SprintID
              
              return (
                <TableRow 
                  key={row.id}
                  sx={isSelectedSprint ? { 
                    backgroundColor: '#e3f2fd',
                    '& td': { 
                      borderColor: '#1976d2',
                      borderWidth: '1px 0'
                    }
                  } : {}}
                >
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
              <TableCell colSpan={visibleColumns?.length}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={70} width={'100%'}>
                  <Typography>
                    {selectedSprint || sprintSearchTerm ? 'No matching sprints found' : 'No Data Found'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='flex justify-between items-center gap-2 m-2'>
        <CustomButton
          variant='text'
          size='small'
          endIcon={<i className='ri-add-line' />}
          onClick={debouncedHandleAddSprint}
        >
          {adding ? 'Adding...' : 'Add Sprint'}
        </CustomButton>
      </div>
    </div>
  )
}

export default SprintList
