import React, { useMemo, useState } from 'react'

import { Icon } from '@iconify/react'

import { Box, Checkbox, Divider, FormControlLabel, Grow, Menu, Typography } from '@mui/material'

import CustomButton from '@components/button'

import { useProject } from 'src/context/project-context'

const FilterMenuItem = ({ menuID, name }: { menuID: string; name: string }) => {
  const { columnVisibility, setColumnVisibility } = useProject()

  const handleChange = () => {
    setColumnVisibility({ ...columnVisibility, [menuID]: !columnVisibility[menuID] })
 
  }

  return (
    <Box px={4} py={2} sx={{ minWidth: 200 }}>
      <FormControlLabel
        label={name}
        control={<Checkbox checked={columnVisibility[menuID]} onChange={handleChange} />}
      />
    </Box>
  )
}

const ProjectFilterButton = () => {
  // Hooks
  const { columnVisibility, additionalColumns, seeAllColumns } = useProject()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpen = (e: any) => setAnchorEl(e?.currentTarget)

  const handleClose = () => setAnchorEl(null)

  const allSelected = useMemo(() => {
    return Object.keys(columnVisibility)?.every(key => columnVisibility[key])
  }, [columnVisibility])

  const selectedCount = useMemo(() => {
    return Object.keys(columnVisibility)?.filter(v => columnVisibility[v])?.length
  }, [columnVisibility])

  return (
    <>
      <CustomButton
        variant='outlined'
        startIcon={<Icon icon={'hugeicons:filter'} style={{ marginInline: 2 }} />}
        endIcon={<Icon icon={'akar-icons:chevron-down'} style={{ marginInline: 5 }} />}
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
        <Box px={4} py={2} sx={{ minWidth: 200 }}>
          <FormControlLabel
            label={`All - ${selectedCount} selected`}
            control={<Checkbox checked={allSelected} onClick={seeAllColumns} />}
          />
        </Box>
        <Divider />
        <Box px={2} py={2}>
          <Typography fontWeight={600} fontSize={15}>
            ITEMS COLUMNS
          </Typography>
        </Box>
        <FilterMenuItem menuID='Taskname' name={'Task'} />
        <FilterMenuItem menuID='owner' name='Owner' />
        <FilterMenuItem menuID='Priority' name='Priority' />
        <FilterMenuItem menuID='Status' name='Status' />
        <FilterMenuItem menuID='Timeline' name='Timeline' />
        {additionalColumns?.map(cols => (
          <FilterMenuItem
            key={cols?.AdditionalColumnID}
            menuID={cols?.AdditionalColumnID?.toString()}
            name={cols?.ColumnName}
          />
        ))}
      </Menu>
    </>
  )
}

export default ProjectFilterButton
