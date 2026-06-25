import { useMemo, useState, useCallback, useContext, useEffect } from 'react'

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
import moment from 'moment'
import { useQuery } from '@tanstack/react-query'

import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import TaskPeople from '../../../sprints/groups/sprint-list/owner'

import { debounce } from 'lodash'
import { useAuth } from '@/hooks/useAuth'

import CustomButton from '@/components/button'
import type { SprintGroupItem } from '@/services/modules/sprint-group/type'
import { createSprint, fetchSprintList, updateSprint, createSprintItems, UpdateSrpintItem } from '@/services/modules/sprint-item'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import SprintTimelineManagement from './timeline'
import { ColumnTextField } from '@/views/project/task-group/task/columns/default-column'
import { GoalsTextfiled } from '@/views/project/task-group/task/columns/GoalsDefaultcolum'
import { SprintManagement } from 'src/context/sprint-context'
import DeleteTasksComponent from '../../components/Delete-sprint'
import CreateColumnMenu from '@/views/sprint-management/tasks/create-column'
import { useProject } from '@/context/project-context'
import DynamicTableHeader from '../../columns/dynamic/header'
// Import the dynamic cell component - you'll need to create this file
import SprintDynamicCell from '../../columns/dynamic/cell'

// Create a new function to fetch sprint info list


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
  const [showCard, setShowCard] = useState(false)
  const [selectedSprint1, setSelectedSprint1] = useState<any>(null)
  const [addColumnAnchor, setAddColumnAnchor] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [sprintDynamicColumns, setSprintDynamicColumns] = useState<any[]>([])
  const [sprintInfoData, setSprintInfoData] = useState<any>(null)
  // ✅ FIX: local data state to hold optimistic updates so sibling fields are always fresh
  const [localData, setLocalData] = useState<any[]>([])
  
  const { role, users } = useProject()

  const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])
  const { profile, user } = useAuth()
  const canEdit = useMemo(() => role?.RoleName === 'Admin' || role?.RoleName === 'Member', [role?.RoleName])

  // Get column visibility from sprint context
  const { columnVisibility: sprintColumnVisibility } = useContext(SprintManagement)
  
  // Add debug logging
  useEffect(() => {
  }, [sprintColumnVisibility]);

const fetchSprintInfoList = async (sprintGroupId: number) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL1;
  
  try {
    const response = await axios.get(
      `${BASE_URL}/GetSprintInfoList`,
      {
        params: {
          SprintGroupID: sprintGroupId
        }
      }
    );
    
    // The API returns data in the format: [{ colList: [...], detailList: [...], colvalueList: [...] }]
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sprint info list:', error);
    throw error;
  }
};

// Helper function to filter dynamic values
const filterDynamicValue = (columnId: string, colvalueList: any[], sprintId: number) => {
  if (!colvalueList || !Array.isArray(colvalueList)) return null;
  
  return colvalueList.find(
    (item: any) => 
      item?.sprintID?.toString() === sprintId?.toString() && 
      item?.additionalColumnID?.toString() === columnId?.toString()
  ) || null;
};
  // Fetch sprint info list - this now provides both data and dynamic columns
  const sprintListApi = useQuery({
    queryKey: ['sprint-info-list', sg?.SprintGroupID],
    queryFn: async () => {
      const response = await fetchSprintInfoList(sg?.SprintGroupID);
      // Store the full response which contains colList and detailList
      if (response && response.length > 0) {
        setSprintInfoData(response[0]);
        // Set dynamic columns from colList from the API response
        if (response[0]?.colList && response[0].colList.length > 0) {
          setSprintDynamicColumns(response[0].colList);
        } else {
          setSprintDynamicColumns([]);
        }
      }
      return response;
    },
    enabled: !!sg?.SprintGroupID
  })

  const { data: sprintListData = [], refetch: refetchSprints } = useQuery({
    queryKey: ['sprint-info-list', sg?.SprintGroupID],
    queryFn: async () => {
      const response = await fetchSprintInfoList(sg?.SprintGroupID);
      if (response && response.length > 0) {
        setSprintInfoData(response[0]);
        // Set dynamic columns from colList from the API response
        if (response[0]?.colList && response[0].colList.length > 0) {
          setSprintDynamicColumns(response[0].colList);
        } else {
          setSprintDynamicColumns([]);
        }
      }
      return response;
    },
    enabled: !!sg?.SprintGroupID
  })

  useEffect(() => {
    if (showSelected) {
      setShowCard(true)
    } else {
      const timeout = setTimeout(() => setShowCard(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [showSelected])

  // Remove the separate getSprintDynamicColumns useEffect and function
  // We're now getting dynamic columns from the GetSprintInfoList response

  // Helper function to get dynamic values from colvalueList
  const getDynamicValueForSprint = (sprintId: number, columnId: string) => {
    if (!sprintInfoData?.colvalueList || !Array.isArray(sprintInfoData.colvalueList)) {
      return null;
    }
    
    // Find the dynamic value for this sprint and column
    const dynamicValue = sprintInfoData.colvalueList.find(
      (item: any) => 
        item?.sprintID?.toString() === sprintId?.toString() && 
        item?.additionalColumnID?.toString() === columnId?.toString()
    );
    
    return dynamicValue || null;
  };

  // Get the detailList from the response
  const getSprintDetailList = useMemo(() => {
    if (sprintInfoData?.detailList && Array.isArray(sprintInfoData.detailList)) {
      return sprintInfoData.detailList;
    }
    return [];
  }, [sprintInfoData]);

  // Transform detailList items to match SprintItem interface
  const transformedSprintData = useMemo(() => {
    const detailList = getSprintDetailList;
    return detailList.map((item: any) => ({
      SprintID: item.sprintID,
      Name: item.name,
      Goals: item.goals,
      SprintTimelineStart: item.sprinttimelinestart,
      SprintTimelineEnd: item.sprinttimelineend,
      SprintStatus: item.sprintstatus,
      SprintTimeElapsedinSeconds: item.sprintTimeElapsedinSeconds,
      CompleteDate: item.completedate,
      IsSprintComplete: item.isSprintComplete,
      IsSprintActive: item.isSprintActive,
      WorkSpaceID: sg?.WorkspaceID,
      SprintGroupID: sg?.SprintGroupID,
      // Keep the original data for reference
      originalItem: detailList,
      colvalueList: sprintInfoData?.colvalueList || [] // Add colvalueList to each sprint item
    }));
  }, [getSprintDetailList, sg, sprintInfoData]);

  // ✅ FIX: Sync localData whenever transformedSprintData changes (i.e. after refetch)
  // This keeps localData fresh from server while still allowing optimistic updates in between
  useEffect(() => {
    setLocalData(transformedSprintData)
  }, [transformedSprintData])

  // Filter sprint data based on selected sprint and search term
  const filteredSprintData = useMemo(() => {
    // ✅ FIX: use localData instead of transformedSprintData so optimistic edits are reflected immediately
    const originalData = localData ?? []
    if (!selectedSprint && !sprintSearchTerm?.trim()) {
      return originalData
    }
    
    return originalData.filter((sprint: any) => {
      if (selectedSprint) {
        return sprint.SprintID === selectedSprint.SprintID
      }
      
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
  }, [localData, selectedSprint, sprintSearchTerm])

  // Define static columns
  const staticColumns: ColumnDef<any>[] = useMemo(
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
        id: 'Name',
        accessorKey: 'Name',
        size: 200,
        maxSize: 1000,
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Sprint
          </Typography>
        ),
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          return <ColumnTextField canEdit={true} getValue={getValue} index={index} id={id} table={table} />
        }
      },
      {
        id: 'Goals',
        accessorKey: 'Goals',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Goals
          </Typography>
        ),
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
          return <GoalsTextfiled canEdit={true} getValue={getValue} index={index} id={id} table={table} />
        }
      },
      {
        id: 'SprintTimeline',
        accessorKey: 'SprintTimeline',
        header: () => (
          <Typography variant='body2' fontWeight={800}>
            Sprint Timeline
          </Typography>
        ),
        
        cell: ({ row: { original } }) => (
          <SprintTimelineManagement original={original} refetch={sprintListApi?.refetch} />
        )
      },
    ],
    [sprintListApi?.refetch]
  )
  

  // Dynamic columns from colList with custom headers and dynamic cells
  const dynamicColumns = useMemo((): ColumnDef<any>[] => {
    if (!sprintDynamicColumns || sprintDynamicColumns.length === 0) return []

    return sprintDynamicColumns.map((column, index) => {
      // Get the column ID - this should match what's in the context
      const columnId = column?.additionalColumnID?.toString() || 
                      column?.additionalColumnID?.toString() || 
                      column?.ColumnID?.toString() || 
                      `dynamic-${index}`;
      
      
      return {
        id: columnId,
        accessorKey: columnId, // Use columnId as accessorKey for dynamic columns
        accessorFn: (row) => {
          // Get the dynamic value for this sprint from colvalueList
          return getDynamicValueForSprint(row?.SprintID || row?.sprintID, columnId);
        },
        minSize: 250,
        size: 250,
        sortable: false,
        header: () => {
          // Use DynamicTableHeader but pass the column data from colList
          return <DynamicTableHeader column={column} refetch={() => sprintListApi.refetch()} />
        },
        cell: ({ getValue, row: { original, index }, column: { id }, table }) => {
          // Get the full dynamic value object
          const dynamicValue = getDynamicValueForSprint(original?.SprintID, columnId);

          return (
            <SprintDynamicCell
              getValue={getValue}
              columnItem={column}
              index={index}
              row={original}
              id={id}
              table={table}
              value={dynamicValue} // Pass the full dynamic value object
              refetch={sprintListApi.refetch}
            />
          );
        }
      }
    })
  }, [sprintDynamicColumns, sprintInfoData, sprintListApi.refetch])

  // Combine static and dynamic columns
  const allColumns: ColumnDef<any>[] = useMemo(() => {
    return [...staticColumns, ...dynamicColumns]
  }, [staticColumns, dynamicColumns])

  // Filter columns based on visibility from sprint context
  const visibleColumns = useMemo(() => {

    
    return allColumns.filter(column => {
      const columnId = column.id as string;
      // const accessorKey = column.accessorKey as string;
      
      
      // Always show select column
      if (columnId === 'select') {
        return true;
      }
      
      // Check if this column exists in visibility
      const isVisible = sprintColumnVisibility[columnId];
      
      
      // If the column doesn't exist in visibility, default to showing it
      if (isVisible === undefined) {
        return true;
      }
      
      // Return the visibility value (should be true/false)
      return isVisible;
    });
  }, [allColumns, sprintColumnVisibility]);


  const table = useReactTable({
    data: filteredSprintData as any[],
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
      updateData: async (rowIndex: number, columnId: any, value: any) => {
        // Handle Name column update
        if (columnId === 'Name' && filteredSprintData?.[rowIndex]?.SprintID) {
          // ✅ FIX: optimistically update localData immediately so when Goals is updated
          // next, it can read the correct latest Name value instead of the stale server value
          setLocalData((prev: any[]) =>
            prev.map((row: any) =>
              row.SprintID === filteredSprintData?.[rowIndex]?.SprintID
                ? { ...row, Name: value }
                : row
            )
          )

          try {
            const value1 = localStorage.getItem('userData')
            const data1 = JSON.parse(value1 as any);

            const bodyvalue = {
              Sprintname: value,
              Goals: filteredSprintData?.[rowIndex]?.Goals || "-",
              LoginuserID: user?.id,
              SprintgroupID: filteredSprintData?.[rowIndex]?.SprintGroupID,
              WorkspaceID: filteredSprintData?.[rowIndex]?.WorkSpaceID,
              sprintID: filteredSprintData?.[rowIndex]?.SprintID?.toString()
            }

            const response = await UpdateSrpintItem(bodyvalue)
            if (response as any) {
              sprintListApi?.refetch()
            }
          } catch (error) {
            console.error('error :', error)
          }
        }

        // Handle Goals column update
        if (columnId === 'Goals' && filteredSprintData?.[rowIndex]?.SprintID) {
          // ✅ FIX: optimistically update localData immediately
          setLocalData((prev: any[]) =>
            prev.map((row: any) =>
              row.SprintID === filteredSprintData?.[rowIndex]?.SprintID
                ? { ...row, Goals: value }
                : row
            )
          )

          try {
            const value1 = localStorage.getItem('userData')
            const data = JSON.parse(value1 as any);

            // ✅ FIX: read the latest Name from localData which was already updated optimistically
            // previously this used filteredSprintData?.[rowIndex]?.Name which was stale
            // and always returned "New Sprint" because refetch had not completed yet
            const currentName = localData.find(
              (row: any) => row.SprintID === filteredSprintData?.[rowIndex]?.SprintID
            )?.Name || filteredSprintData?.[rowIndex]?.Name || "New Sprint"

            const bodyvalue = {
              Sprintname: currentName,
              Goals: value || "New Goal",
              LoginuserID: user?.id,
              SprintgroupID: filteredSprintData?.[rowIndex]?.SprintGroupID,
              WorkspaceID: filteredSprintData?.[rowIndex]?.WorkSpaceID,
              sprintID: filteredSprintData?.[rowIndex]?.SprintID?.toString()
            }

            const response = await UpdateSrpintItem(bodyvalue)
            if (response as any) {
              sprintListApi?.refetch()
            }
          } catch (error) {
            console.error('error :', error)
          }
        }

        // Handle dynamic column updates
        if (value?.additionalColumnID && filteredSprintData?.[rowIndex]?.SprintID) {
          try {
            const value1 = localStorage.getItem('userData')
            const data = JSON.parse(value1 as any);

            const bodyvalue = {
              ...value,
              LoginuserID: user?.id,
              SprintgroupID: filteredSprintData?.[rowIndex]?.SprintGroupID,
              WorkspaceID: filteredSprintData?.[rowIndex]?.WorkSpaceID,
              sprintID: filteredSprintData?.[rowIndex]?.SprintID?.toString()
            }

            const response = await UpdateSrpintItem(bodyvalue)
            if (response as any) {
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
      Sprintname: "New Sprint",
      LoginuserID: user?.id,
      SprintgroupID: sg?.SprintGroupID,
      WorkspaceID: sg?.WorkspaceID
    }
    await createSprintItems(body)
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
      <div style={{ overflowX: 'auto', width: '100%' }}>
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
                    backgroundColor: 'none',
                    '& td': { }
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
      </div>
      <div className='flex justify-between items-center gap-2 m-2'>
        <CustomButton
          variant='text'
          size='small'
          endIcon={<i className='ri-add-line' />}
          onClick={debouncedHandleAddSprint}
        >
          {adding ? 'Adding...' : 'Add Sprint'}
        </CustomButton>
         
        <CustomButton
          variant='outlined'
          circular
          size='small'
          color='secondary'
          startIcon={<i className='ri-add-line' />}
          onClick={e => {
            setAnchorEl(e?.currentTarget)
          }}
        >
          Add New Column
        </CustomButton>
      </div>
      {showCard &&
        <DeleteTasksComponent
          showCard={showCard}
          selectedRows={selectedRows}
          sprintlist={transformedSprintData}
          refetch={refetchSprints}
          setSelectedRows={setSelectedRows}
        />}

      <CreateColumnMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        onSubmit={(data) => {
          // After adding a new column, refetch to get updated colList
          sprintListApi.refetch();
          
        }}
        spintid={sg.WorkspaceID}
        groupid={sg.SprintGroupID}
      />

    </div>
  )
}

export default SprintList
