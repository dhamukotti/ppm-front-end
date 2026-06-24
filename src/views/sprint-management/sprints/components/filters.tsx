import React, { useMemo, useState, useEffect, Fragment, use } from 'react'
import { Icon } from '@iconify/react'
import { Box, Checkbox, Divider, FormControlLabel, Grow, Menu, Typography } from '@mui/material'
import CustomButton from '@components/button'
import { useSprintManagement } from 'src/context/sprint-context' 
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
// Dynamic column interface based on API response
interface DynamicColumn {
  additionalColumnID: number;
  columnName: string;
  columnTypeID: number;
  title: string;
  keyname: string;
  columntypeLookupID: number;
}

interface ApiResponse {
  workspaceID: number;
  workspacename: string;
  sprintGroupID: number;
  groupName: string;
  columndetails: DynamicColumn[];
}

const FilterMenuItem = ({ menuID, name }: { menuID: string; name: string }) => {
  const { columnVisibility, toggleColumnVisibility } = useSprintManagement()
  
  // Convert menuID to string to ensure proper comparison
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

const SprintFilterButton = () => {
  // Hooks
  const { columnVisibility, setColumnVisibility, visibleColumns, workspaceID } = useSprintManagement()
  const [anchorEl, setAnchorEl] = useState(null)
  const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([])
  const [loading, setLoading] = useState(false)
  const { profile, user } = useAuth()
  // Fetch dynamic columns from API
  useEffect(() => {
    fetchDynamicColumns()

    // Listen for column creation events
    const handleColumnCreated = () => {
      fetchDynamicColumns();
    };

    window.addEventListener('columnCreated', handleColumnCreated);

    // Cleanup
    return () => {
      window.removeEventListener('columnCreated', handleColumnCreated);
    };
  }, [])

  const fetchDynamicColumns = async () => {
    setLoading(true)
    try {
      const response = await axios.get<ApiResponse[]>(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintDynamiccolumnLlist?LoginuserID=${user?.id}&WorkspaceID=${workspaceID}`)
      if (response.data && response.data.length > 0 && response.data[0].columndetails) {
        setDynamicColumns(response.data[0].columndetails)
        
        // Initialize dynamic columns in columnVisibility if they don't exist
        const updatedVisibility = { ...columnVisibility }
        let hasChanges = false
        
        response.data[0].columndetails.forEach((col) => {
          // Use additionalColumnID as string for the key (matching context logic)
          const columnKey = String(col.additionalColumnID)
          if (updatedVisibility[columnKey] === undefined) {
            updatedVisibility[columnKey] = true // Set default to true
            hasChanges = true
          }
        })
        
        // Only update if there were changes
        if (hasChanges) {
          setColumnVisibility(updatedVisibility)
        }
      }
    } catch (error) {
      console.error('Error fetching dynamic columns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (e: any) => setAnchorEl(e?.currentTarget)

  const handleClose = () => setAnchorEl(null)
  
  const seeAllColumns = () => {
    // Create allVisible object with both static and dynamic columns
    const allVisible: any = {
      Name: true,
      Goals: true,
      SprintTimeline: true,
      SprintStatus: true,
      ActiveSprint: true,
    }
    
    // Add dynamic columns with their additionalColumnID as keys (matching context)
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

  const selectedCount = useMemo(() => {
    return visibleColumns?.length || 0
  }, [visibleColumns])

  // Prepare menu items as an array
  const menuItems = [
    // All option
    <Box key="all-option" px={4} py={2} sx={{ minWidth: 200 }}>
      <FormControlLabel
        label={`All - ${selectedCount} selected`}
        control={<Checkbox checked={allSelected} onClick={seeAllColumns} />}
      />
    </Box>,
    
    <Divider key="divider-1" />,
    
    // Items Columns header
    <Box key="items-header" px={2} py={2}>
      <Typography fontWeight={600} fontSize={15}>
        ITEMS COLUMNS
      </Typography>
    </Box>,
    
    // Static Columns
    <FilterMenuItem key="Name" menuID='Name' name={'Sprint'} />,
    <FilterMenuItem key="Goals" menuID='Goals' name='Goals' />,
    <FilterMenuItem key="SprintTimeline" menuID='SprintTimeline' name='Sprint Timeline' />,
    <FilterMenuItem key="SprintStatus" menuID='SprintStatus' name='Sprint Status' />,
    // <FilterMenuItem key="ActiveSprint" menuID='ActiveSprint' name='Active Sprint' />,
  ]

  // Add dynamic columns if they exist - using additionalColumnID as menuID
  if (dynamicColumns.length > 0) {
    dynamicColumns.forEach((column) => {
      menuItems.push(
        <FilterMenuItem 
          key={`dynamic-${column.additionalColumnID}`} 
          menuID={String(column.additionalColumnID)} // Use additionalColumnID as string
          name={(column.columnName).toUpperCase()} 
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

export default SprintFilterButton
