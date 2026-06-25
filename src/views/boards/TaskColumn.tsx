// src/app/(dashboard)/your-feature/TaskColumn.tsx
'use client'

import { useState } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  IconButton,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material'
import { Icon } from '@iconify/react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  assignee: string
  taskID?: number
  priorityID?: number
  priorityName?: string
  priorityColorCode?: string
  projectTaskID?: number
  createDate?: string
  attachmentLink?: string
  categoryID?: number
  categoryName?: string
}

interface TaskColumnProps {
  title: string
  tasks: Task[]
  columnId: string
  onDrop: (taskId: string, columnId: any) => void
  color: string
  isMobile: boolean
  onEditTask: (task: Task, columnId: any) => void
  onDeleteTask: (taskId: string, columnId: any) => void
  onViewTask?: (task: Task) => void // Added this prop
}

const TaskColumn = ({ 
  title, 
  tasks, 
  columnId, 
  onDrop, 
  color, 
  isMobile,
  onEditTask,
  onDeleteTask,
  onViewTask // Added this prop
}: TaskColumnProps) => {
  const theme = useTheme()
  const [draggedOver, setDraggedOver] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(true)
  }

  const handleDragLeave = () => {
    setDraggedOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    onDrop(taskId, columnId)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setSelectedTask(task)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedTask(null)
  }

  const handleEdit = () => {
    if (selectedTask) {
      onEditTask(selectedTask, columnId)
    }
    handleMenuClose()
  }

  const handleView = () => {
    if (selectedTask && onViewTask) {
      onViewTask(selectedTask)
    }
    handleMenuClose()
  }

  const handleDeleteClick = () => {
    if (selectedTask) {
      setTaskToDelete(selectedTask)
      setDeleteDialog(true)
    }
    handleMenuClose()
  }

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id, columnId)
      setDeleteDialog(false)
      setTaskToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialog(false)
    setTaskToDelete(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main
      case 'medium':
        return theme.palette.warning.main
      case 'low':
        return theme.palette.success.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'mdi:flag'
      case 'medium':
        return 'mdi:flag-outline'
      case 'low':
        return 'mdi:flag-variant-outline'
      default:
        return 'mdi:flag-outline'
    }
  }

  return (
    <>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          flex: 1,
          minHeight: { xs: '200px', sm: '300px' },
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          backgroundColor: draggedOver 
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.background.paper, 0.4),
          border: `2px dashed ${draggedOver ? theme.palette.primary.main : theme.palette.divider}`,
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2 },
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.action.disabled,
            borderRadius: '3px',
            '&:hover': {
              background: theme.palette.action.active
            }
          }
        }}
      >
        {tasks.map((task) => (
          <Paper
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: '10px',
              cursor: 'grab',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                transform: 'translateY(-2px)',
                borderColor: alpha(theme.palette.primary.main, 0.3)
              },
              '&:active': {
                cursor: 'grabbing',
                transform: 'scale(0.98)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box sx={{ flex: 1, pr: 1, cursor: 'pointer' }} onClick={() => onViewTask && onViewTask(task)}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    lineHeight: 1.4,
                    mb: 0.5,
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {task.title}
                </Typography>
       
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* View Button */}
                {onViewTask && (
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewTask(task)
                      }}
                      sx={{
                        color: theme.palette.text.secondary,
                        padding: '4px',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }
                      }}
                    >
                      <Icon icon="mdi:eye-outline" width={16} />
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* Menu Button */}
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, task)}
                  sx={{
                    color: theme.palette.text.secondary,
                    padding: '4px',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <Icon icon="mdi:dots-vertical" width={18} />
                </IconButton>
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 2,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => onViewTask && onViewTask(task)}
            >
              {task.description}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<Icon icon={getPriorityIcon(task.priority)} style={{ fontSize: '14px' }} />}
                label={task.priorityName || task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                size="small"
                sx={{
                  backgroundColor: alpha(getPriorityColor(task.priority), 0.1),
                  color: getPriorityColor(task.priority),
                  fontWeight: 600,
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  height: { xs: '24px', sm: '26px' },
                  border: `1px solid ${alpha(getPriorityColor(task.priority), 0.3)}`,
                  '& .MuiChip-icon': {
                    color: getPriorityColor(task.priority)
                  }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.75,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                px: 1.25,
                py: 0.5,
                borderRadius: '6px',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}>
                <Icon 
                  icon="mdi:account-circle" 
                  style={{ 
                    fontSize: '16px', 
                    color: theme.palette.primary.main 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                    maxWidth: { xs: '60px', sm: '80px' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {task.assignee}
                </Typography>
              </Box>
            </Box>
            
            {/* Additional Metadata */}
            {(task.createDate || task.attachmentLink) && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 1.5,
                pt: 1.5,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                {task.createDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon 
                      icon="mdi:calendar" 
                      style={{ 
                        fontSize: '14px', 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem'
                      }}
                    >
                      {task.createDate}
                    </Typography>
                  </Box>
                )}
                
                {task.attachmentLink && (
                  <Tooltip title="Has Attachment">
                    <Icon 
                      icon="mdi:paperclip" 
                      style={{ 
                        fontSize: '14px', 
                        color: theme.palette.info.main,
                        cursor: 'pointer'
                      }} 
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(task.attachmentLink, '_blank')
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            )}
          </Paper>
        ))}

        {tasks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: { xs: '150px', sm: '200px' },
              color: theme.palette.text.disabled,
              gap: 1
            }}
          >
            <Icon icon="mdi:inbox" style={{ fontSize: '48px', opacity: 0.3 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.7 }}>
              No tasks yet
            </Typography>
          </Box>
        )}
      </Box>

      {/* Task Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 160,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3]
          }
        }}
      >
        {onViewTask && (
          <MenuItem onClick={handleView}>
            <Icon icon="mdi:eye" style={{ marginRight: 12, color: theme.palette.info.main }} />
            View Details
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <Icon icon="mdi:pencil" style={{ marginRight: 12, color: theme.palette.primary.main }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
          <Icon icon="mdi:delete" style={{ marginRight: 12 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="mdi:alert-circle" style={{ color: theme.palette.error.main, fontSize: '24px' }} />
          Delete Task
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TaskColumn
