import React, { useMemo, useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Box, Checkbox, Divider, FormControlLabel, Grow, Menu, Typography } from '@mui/material'
import CustomButton from '@components/button'
import { useSprintTaskManagement } from '@/context/sprint-tast-context'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'

// ✅ FIXED: matches flat API response shape
interface DynamicColumn {
  additionalColumnID: number
  columnName: string
  id: number
  keyname: string
  title: string
  groupID: number
}

interface SprintTaskGroup {
  taskGroupID: number
  groupname: string
  sprintID: number
  sprintname: string
  sprintGoals: string
  sprintTimelineEnd: string
  sprintTimeLineStart: string
  sprintTimeElapsedInSeconds: number
}

const FilterMenuItem = ({ menuID, name }: { menuID: string; name: string }) => {
  const { columnVisibility, toggleColumnVisibility } = useSprintTaskManagement()
  const menuIdStr = String(menuID)

  const handleChange = () => {
    toggleColumnVisibility(menuIdStr as keyof typeof columnVisibility)
  }

  return (
    <Box px={4} py={2} sx={{ minWidth: 200 }}>
      <FormControlLabel
        label={name}
        control={<Checkbox checked={columnVisibility[menuIdStr] || false} onChange={handleChange} />}
      />
    </Box>
  )
}

const SprintTaskFilterButton = ({ workspaceID }: { workspaceID: string }) => {
  const { columnVisibility, setColumnVisibility, visibleColumns } = useSprintTaskManagement()
  const [anchorEl, setAnchorEl] = useState(null)
  const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()


  useEffect(() => {
    fetchDynamicColumns()

    const handleColumnCreated = () => {
      fetchDynamicColumns()
    }
    window.addEventListener('columnCreated', handleColumnCreated)
    return () => {
      window.removeEventListener('columnCreated', handleColumnCreated)
    }
  }, [workspaceID])



  const fetchDynamicColumns = async () => {
    setLoading(true)
    try {
      // ✅ STEP 1: Fetch all sprint task groups for this workspace
      const groupResponse = await axios.get<SprintTaskGroup[]>(
        `${process.env.NEXT_PUBLIC_API_URL1}/GetSprintTaskGroupInfoList`,
        {
          params: {
            WorkspaceID: workspaceID
          }
        }
      )

      const groups = groupResponse.data

      if (!groups || !Array.isArray(groups) || groups.length === 0) {
        setLoading(false)
        return
      }

      // ✅ STEP 2: Fetch dynamic columns for ALL group IDs in parallel
      const columnRequests = groups.map((group) =>
        axios.get<DynamicColumn[]>(
          `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskGetDynamicColumList`,
          {
            params: {
              LoginUserID: user?.id || '76',
              GroupID: group.taskGroupID
            }
          }
        )
      )

      const columnResponses = await Promise.all(columnRequests)

      // ✅ STEP 3: Merge all columns and deduplicate by additionalColumnID
      const allColumns: DynamicColumn[] = []
      const seenIDs = new Set<number>()

      columnResponses.forEach((response) => {
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((col) => {
            if (!seenIDs.has(col.additionalColumnID)) {
              seenIDs.add(col.additionalColumnID)
              allColumns.push(col)
            }
          })
        }
      })


      if (allColumns.length > 0) {
        setDynamicColumns(allColumns)

        const updatedVisibility = { ...columnVisibility }
        let hasChanges = false

        allColumns.forEach((col) => {
          const columnKey = String(col.additionalColumnID)
          if (updatedVisibility[columnKey] === undefined) {
            updatedVisibility[columnKey] = true
            hasChanges = true
          }
        })

        if (hasChanges) {
          setColumnVisibility(updatedVisibility)
        }
      }
    } catch (error) {
      console.error('Error fetching task dynamic columns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (e: any) => setAnchorEl(e?.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const seeAllColumns = () => {
    const allVisible: any = {
      Taskname: true,
      ActualSP: true,
      Description: true,
      Owner: true,
      IsUnplanned: true,
      EstimatedSP: true
    }
    dynamicColumns.forEach((col) => {
      allVisible[String(col.additionalColumnID)] = true
    })
    setColumnVisibility(allVisible)
  }

  const allSelected = useMemo(() => {
    const allKeys = Object.keys(columnVisibility)
    if (allKeys.length === 0) return false
    return allKeys.every(key => columnVisibility[key] === true)
  }, [columnVisibility])

  const selectedCount = useMemo(() => visibleColumns?.length || 0, [visibleColumns])

  const menuItems = [
    <Box key="all-option" px={4} py={2} sx={{ minWidth: 200 }}>
      <FormControlLabel
        label={`All - ${selectedCount} selected`}
        control={<Checkbox checked={allSelected} onClick={seeAllColumns} />}
      />
    </Box>,

    <Divider key="divider-1" />,

    <Box key="items-header" px={2} py={2}>
      <Typography fontWeight={600} fontSize={15}>
        ITEMS COLUMNS
      </Typography>
    </Box>,

    <FilterMenuItem key="Taskname"    menuID="Taskname"    name="Task Name"    />,
    <FilterMenuItem key="Description" menuID="Description" name="Description"  />,
    <FilterMenuItem key="Owner"       menuID="Owner"       name="Owner"        />,
    <FilterMenuItem key="ActualSP"    menuID="ActualSP"    name="Actual SP"    />,
    <FilterMenuItem key="EstimatedSP" menuID="EstimatedSP" name="Estimated SP" />,
    <FilterMenuItem key="IsUnplanned" menuID="IsUnplanned" name="Is Unplanned" />,
  ]

  // ✅ FIXED: dynamicColumns is now correctly populated — renders title as label
  if (dynamicColumns.length > 0) {
    dynamicColumns.forEach((column) => {
      menuItems.push(
        <FilterMenuItem
          key={`dynamic-${column.additionalColumnID}`}
          menuID={String(column.additionalColumnID)}
          name={column.columnName.toUpperCase()}  // ✅ changed from column.title to column.columnName
        />
      )
    })
  }

  return (
    <>
      <CustomButton
        variant='outlined'
        startIcon={<Icon icon={'hugeicons:filter'} style={{ marginInline: 2 }} />}
        endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
        sx={{ px: 3.5 }}
        onClick={handleOpen}
      >
        Filter {loading ? '(Loading...)' : ''}
      </CustomButton>
      <Menu
        sx={{ maxHeight: 400 }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={handleClose}
        TransitionComponent={Grow}
      >
        {menuItems}
      </Menu>
    </>
  )
}

export default SprintTaskFilterButton
