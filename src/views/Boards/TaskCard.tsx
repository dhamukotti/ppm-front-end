// @components/TaskCard.tsx
'use client'

import { Card, Typography, Box, Chip, Avatar } from '@mui/material'
import { Icon } from '@iconify/react'
import { useState } from 'react'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    priority: string
    assignee: string
  }
}

const TaskCard = ({ task }: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const getPriorityColor = () => {
    switch(task.priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getPriorityIcon = () => {
    switch(task.priority) {
      case 'high': return 'mdi:alert-circle'
      case 'medium': return 'mdi:alert'
      case 'low': return 'mdi:check-circle'
      default: return 'mdi:circle'
    }
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        p: 2,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
        <Icon 
          icon="mdi:drag-vertical" 
          className="text-gray-400"
          style={{ fontSize: '20px', color: 'rgba(156, 163, 175, 1)', marginTop: '2px' }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {task.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip
          icon={<Icon icon={getPriorityIcon()} style={{ fontSize: '16px' }} />}
          label={task.priority}
          color={getPriorityColor()}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
            {task.assignee.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {task.assignee}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

export default TaskCard
