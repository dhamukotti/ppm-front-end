import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '@iconify/react'
import { Box, Checkbox, Divider, FormControlLabel, Grow, Menu, Typography } from '@mui/material'
import CustomButton from '@components/button'
import { useProject } from 'src/context/project-context'
import { useBugQueue } from 'src/context/bug-queue-context'
import { useWorkspace } from 'src/context/workspace-context'

// Interface for dynamic columns
interface DynamicColumn {
  additionalColumnID: number
  colname: string
  typeID: number
  dynamicColumnTypeInfo: string
  lookups?: {
    id: number
    title: string
    key: string
  }
}

interface BugGroup {
  bugGroupID: number
  [key: string]: any
}

const FilterMenuItem = ({ menuID, name }: { menuID: string; name: string }) => {
  const { columnVisibility, toggleColumnVisibility } = useBugQueue()

  const handleChange = () => {
    toggleColumnVisibility(menuID as keyof typeof columnVisibility)
  }

  return (
    <Box px={4} py={2} sx={{ minWidth: 200 }}>
      <FormControlLabel
        label={name}
        control={<Checkbox checked={!!columnVisibility[menuID]} onChange={handleChange} />}
      />
    </Box>
  )
}

const ProjectFilterButton = () => {
  const { columnVisibility, setColumnVisibility, visibleColumns } = useBugQueue()
  const [anchorEl, setAnchorEl] = useState(null)
  const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([])
  const [groups, setGroups] = useState<BugGroup[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const { selected } = useWorkspace()

  // Ref to always have latest columnVisibility inside the fetch callback
  // without needing it as a useEffect dependency (avoids infinite re-fetch loop)
  const columnVisibilityRef = useRef(columnVisibility)
  useEffect(() => {
    columnVisibilityRef.current = columnVisibility
  }, [columnVisibility])

  // Ref to always have latest groups inside the polling callback
  const groupsRef = useRef<BugGroup[]>([])
  useEffect(() => {
    groupsRef.current = groups
  }, [groups])

  // Step 1: Fetch all groups (unchanged)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL1}/GetBuggroupList?WorkspaceID=${selected?.WorkspaceID}`
        )
        const groupsData: BugGroup[] = await response.json()

        if (groupsData && groupsData.length > 0) {
          setGroups(groupsData)
        }
      } catch (error) {
        console.error('Error fetching groups:', error)
      }
    }

    fetchGroups()
  }, [selected?.WorkspaceID])

  // Step 2: Core fetch logic extracted into a stable useCallback
  const fetchAllDynamicColumns = useCallback(async (currentGroups: BugGroup[]) => {
    if (!currentGroups || currentGroups.length === 0) return
    
    setIsFetching(true)

    try {
      // Fetch dynamic columns for every group in parallel
      const requests = currentGroups.map(group =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL1}/GetBugInfoList?GroupID=${group.bugGroupID}`
        ).then(res => res.json())
      )

      const results = await Promise.all(requests)

      
      // Merge all dynamic columns across all groups, deduplicate by additionalColumnID
      const mergedColumnsMap = new Map<number, DynamicColumn>()

      results.forEach(data => {
        if (data && data.length > 0 && data[0].colList) {
          const cols: DynamicColumn[] = data[0].colList
          cols.forEach(col => {
            // Deduplicate: only add if not already present
            if (!mergedColumnsMap.has(col.additionalColumnID)) {
              mergedColumnsMap.set(col.additionalColumnID, col)
            }
          })
        }
      })

      const mergedColumns = Array.from(mergedColumnsMap.values())

      // Update dynamic columns state
      setDynamicColumns(prev => {
        const prevIds = prev.map(c => c.additionalColumnID).sort().join(',')
        const nextIds = mergedColumns.map(c => c.additionalColumnID).sort().join(',')
        if (prevIds === nextIds) return prev
        return mergedColumns
      })

      // Immediately sync columnVisibility with the new merged dynamic columns
      const currentVisibility = { ...columnVisibilityRef.current }
      let hasChanges = false

      // Remove stale dynamic column keys that no longer exist
      Object.keys(currentVisibility).forEach(key => {
        if (key.startsWith('Dynamic_')) {
          const dynamicId = parseInt(key.replace('Dynamic_', ''))
          const stillExists = mergedColumnsMap.has(dynamicId)
          if (!stillExists) {
            delete currentVisibility[key]
            hasChanges = true
          }
        }
      })

      // Add new dynamic columns that are not yet in visibility
      mergedColumns.forEach(col => {
        const columnKey = `Dynamic_${col.additionalColumnID}`
        if (currentVisibility[columnKey] === undefined) {
          currentVisibility[columnKey] = true // Default to visible
          hasChanges = true
        }
      })

      if (hasChanges) {
        setColumnVisibility(currentVisibility)
      }
      
    } catch (error) {
      console.error('Error fetching dynamic columns for groups:', error)
      setDynamicColumns([])
    } finally {
      setIsFetching(false)
    }
  }, [setColumnVisibility])

  // Step 3: Initial fetch when groups first load
  useEffect(() => {
    if (groups.length === 0) return
    fetchAllDynamicColumns(groups)
  }, [groups, fetchAllDynamicColumns])

  // Step 4: Poll every 5 seconds to pick up newly created dynamic columns immediately
  useEffect(() => {
    const interval = setInterval(() => {
      if (groupsRef.current.length > 0 && !isFetching) {
        fetchAllDynamicColumns(groupsRef.current)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchAllDynamicColumns, isFetching])

  const handleOpen = (e: any) => setAnchorEl(e?.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const seeAllColumns = () => {
    const currentAllSelected = Object.keys(columnVisibility).length > 0 && 
      Object.keys(columnVisibility).every(key => columnVisibility[key])

    const newVisibility: Record<string, boolean> = {
      BugID: !currentAllSelected,
      BugName: !currentAllSelected,
      Reporter: !currentAllSelected,
      BugDescription: !currentAllSelected,
      TimeResolution: !currentAllSelected,
      Priority: !currentAllSelected,
      Status: !currentAllSelected,
    }

    dynamicColumns.forEach(col => {
      newVisibility[`Dynamic_${col.additionalColumnID}`] = !currentAllSelected
    })

    // setColumnVisibility(newVisibility)
    setColumnVisibility(newVisibility as any)
  }

  const allSelected = useMemo(() => {
    return Object.keys(columnVisibility).length > 0 &&
      Object.keys(columnVisibility).every(key => columnVisibility[key])
  }, [columnVisibility])

  const selectedCount = useMemo(() => {
    return visibleColumns?.length
  }, [visibleColumns])

  // Build menu items with proper dynamic columns rendering
  const menuChildren = useMemo(() => {
    const children = [
      <Box key="all-select" px={4} py={2} sx={{ minWidth: 200 }}>
        <FormControlLabel
          label={`All - ${selectedCount} selected`}
          control={<Checkbox checked={allSelected} onChange={seeAllColumns} />}
        />
      </Box>,
      <Divider key="divider-1" />,
      <Box key="items-columns" px={2} py={2}>
        <Typography fontWeight={600} fontSize={15}>
          ITEMS COLUMNS
        </Typography>
      </Box>,
      <FilterMenuItem key="BugName" menuID="BugName" name="Bug Name" />,
      <FilterMenuItem key="BugDescription" menuID="BugDescription" name="Bug Details" />,
      <FilterMenuItem key="Reporter" menuID="Reporter" name="Reporter" />,
      <FilterMenuItem key="TimeResolution" menuID="TimeResolution" name="Time Resolution" />,
      <FilterMenuItem key="Priority" menuID="Priority" name="Priority" />,
      <FilterMenuItem key="Status" menuID="Status" name="Status" />,
    ]

    // Append dynamic columns section if any exist
    if (dynamicColumns.length > 0) {
      children.push(
        <Divider key="divider-dynamic" />,
        <Box key="dynamic-header" px={2} py={2}>
          <Typography fontWeight={600} fontSize={15}>
            {/* DYNAMIC COLUMNS ({dynamicColumns.length}) */}
          </Typography>
        </Box>
      )

      dynamicColumns.forEach(column => {
        children.push(
          <FilterMenuItem
            key={`Dynamic_${column.additionalColumnID}`}
            menuID={`Dynamic_${column.additionalColumnID}`}
            name={column.colname}
          />
        )
      })
    }
    
    return children
  }, [dynamicColumns, allSelected, selectedCount])

  return (
    <>
      <CustomButton
        variant="outlined"
        startIcon={<Icon icon="hugeicons:filter" style={{ marginInline: 2 }} />}
        endIcon={<Icon icon="akar-icons:chevron-down" style={{ marginInline: 5 }} />}
        sx={{ px: 3.5 }}
        onClick={handleOpen}
      >
        Filter
      </CustomButton>
      <Menu
        sx={{ maxHeight: 400 }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={handleClose}
        TransitionComponent={Grow}
      >
        {menuChildren}
      </Menu>
    </>
  )
}

export default ProjectFilterButton
