import { useState } from 'react'
import { Card, Collapse, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { useSprintManagement } from '@/context/sprint-context'
import type { SprintGroupItem } from '@/services/modules/sprint-group/type'
import CreateSprintGroupDialog from '../components/create-group-dialog'
import SprintList from './sprint-list'

const GroupItem = ({ sg, selectedSprint, sprintSearchTerm }: { 
  sg: SprintGroupItem;
  selectedSprint?: any;
  sprintSearchTerm?: string;
}) => {
  const [collapse, setCollapse] = useState(true)
  const [openEdit, setOpenEdit] = useState(false)
  const [anchorEl, setAnchorEl] = useState<any | null>(null)

  const toggleCollapse = () => setCollapse(!collapse)

  const handleMenuClose = () => setAnchorEl(null)

  const handleMenuOpen = (e: any) => {
    setAnchorEl(e?.currentTarget)
  }

  return (
    <Card className='rounded-lg'>
      <div className='py-2 px-3 flex items-center gap-2 justify-between'>
        <div className='flex items-center gap-2'>
          <IconButton size='small' className='rounded-xl' onClick={toggleCollapse}>
            <i className={`ri-arrow-right-s-line transition-all duration-300 ${collapse ? 'rotate-90' : ''}`} />
          </IconButton>

          <Typography className='font-semibold text-lg'>{sg?.GroupName}</Typography>
        </div>

        <div>
          <IconButton size='small' className='rounded-xl' onClick={handleMenuOpen}>
            <i className={`ri-more-2-line`} />
          </IconButton>

          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                setAnchorEl(null)
                setOpenEdit(true)
              }}
            >
              <div className='flex items-center gap-3'>
                <i className='ri-pencil-line size-4' />
                Edit
              </div>
            </MenuItem>
            <MenuItem>
              <div className='flex items-center gap-3'>
                <i className='ri-delete-bin-line size-4' />
                Delete
              </div>
            </MenuItem>
          </Menu>
        </div>
      </div>

      {openEdit && <CreateSprintGroupDialog open={openEdit} setOpen={setOpenEdit} group={sg} />}

      <Collapse in={collapse}>
        <SprintList 
          sg={sg} 
          selectedSprint={selectedSprint}
          sprintSearchTerm={sprintSearchTerm}
        />
      </Collapse>
    </Card>
  )
}

const SearchGroupList = ({ 
  searchTerm, 
  selectedGroups, 
  selectedSprint, 
  sprintSearchTerm 
}: { 
  searchTerm?: string; 
  selectedGroups?: any[];
  selectedSprint?: any;
  sprintSearchTerm?: string;
}) => {
  const { data } = useSprintManagement()

  // Filter data based on search term OR selected groups
  const filteredData = data?.filter(sg => {
    // If there are selected groups, show only those groups
    if (selectedGroups && selectedGroups.length > 0) {
      return selectedGroups.some(selected => selected.id === sg.SprintGroupID || selected.SprintGroupID === sg.SprintGroupID)
    }
    
    // If no search term, return all
    if (!searchTerm) return true
    
    // If there's a search term, filter by it
    const searchLower = searchTerm.toLowerCase()
    
    return (
      sg?.GroupName?.toLowerCase().includes(searchLower) ||
      sg?.SprintGroupID?.toString().includes(searchLower)
    )
  })

  return (
    <div className='space-y-9'>
      {filteredData?.map(sg => (
        <GroupItem 
          key={sg?.SprintGroupID} 
          sg={sg}
          selectedSprint={selectedSprint}
          sprintSearchTerm={sprintSearchTerm}
        />
      ))}
    </div>
  )
}

export default SearchGroupList
