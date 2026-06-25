// ** React Imports
import type { ReactNode } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'
import {
  writeTaskUpdate
} from '@/services/modules/task-updates'
// ** API Imports
import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'

import type { TaskListItemType } from '@/services/modules/task/types'
import TaskDetailsDialog from '../details/index'

interface TaskNameCellProps {
  renderTextField: ReactNode
  rowData: TaskListItemType
  refetch: () => void
  // NOTE: onRefreshMessageCount may be called with incoming WS message data from children
  onRefreshMessageCount?: (data?: any) => void
}

// Styled Badge with smaller size
const SmallBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    fontSize: '0.625rem',
    height: '16px',
    minWidth: '16px',
    padding: '0 4px',
  },
}))

const TaskNameCell = ({ renderTextField, rowData, refetch }: TaskNameCellProps) => {
  const [openTaskView, setOpenTaskView] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const { profile, user } = useAuth()

  // WebSocket refs
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  
  // Track message IDs to prevent duplicate counting
  const seenMessageIdsRef = useRef<Set<string>>(new Set())
  const messageCountRef = useRef(0)

  const maxReconnectAttempts = 5
  const reconnectInterval = 3000

  const connectWebSocket = useCallback(() => {
    if (isConnectingRef.current || (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)) {
      return
    }

    const wsUrl = `wss://uat.ppmbackend.projectpulse360.com/statusTaskUpdate?taskId=${rowData?.TaskID}&senderID=${user?.id}`
    isConnectingRef.current = true

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnectingRef.current = false
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = async (event) => {
        try {
          // Normalize incoming data to string
          let raw = null
          if (typeof event.data === 'string') {
            raw = event.data
          } else if (event.data instanceof Blob) {
            raw = await event.data.text()
          } else if (event.data instanceof ArrayBuffer) {
            raw = new TextDecoder().decode(event.data)
          } else {
            raw = String(event.data)
          }

          if (raw === "heartbeat" || (typeof raw === 'string' && raw.trim().toLowerCase() === "heartbeat")) {
            return
          }

          let data
          try {
            data = JSON.parse(raw)
          } catch (err) {
            console.error('Error parsing WebSocket message JSON:', err)
            return
          }


          // Determine a stable message id for deduplication.
          // Prefer server/client provided uniqueId or SenderID+timestamp+Message fallback.
          const stableId =
            data?.uniqueId ||
            data?.UniqueId ||
            (data?.timestamp ? `${data?.TaskID || rowData?.TaskID}_${data?.timestamp}_${data?.SenderID || ''}` : null) ||
            `${data?.TaskID || rowData?.TaskID}_${data?.Message || ''}_${data?.SenderID || ''}`

          const messageId = String(stableId || `${data?.TaskID || rowData?.TaskID}_${Date.now()}_${Math.random()}`)

          // Only process if we haven't seen this message before
          if (!seenMessageIdsRef.current.has(messageId)) {
            seenMessageIdsRef.current.add(messageId)
            
            // Check if this message is for the current task
            const candidateIds = [
              data?.TaskID,
              data?.taskId,
              data?.taskID,
              data?.task?.id
            ]
            const foundId = candidateIds.find(id => id !== undefined && id !== null)

            const currentTaskId = rowData?.TaskID
            const appliesToCurrentTask = foundId == null || String(foundId) === String(currentTaskId)

            if (appliesToCurrentTask) {
              // Only increment if dialog is NOT open
              if (!openTaskView) {
                messageCountRef.current = messageCountRef.current + 1
                setMessageCount(prev => prev + 1)
              } else {
              }
            }
          } else {
          }

          // Always refetch when update is received
          refetch()
        } catch (error) {
          console.error('Error handling WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('TaskNameCell WebSocket error:', error)
        isConnectingRef.current = false
      }

      ws.onclose = (event) => {
        isConnectingRef.current = false
        socketRef.current = null

        // Auto-reconnect logic
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, reconnectInterval)
        }
      }

      socketRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      isConnectingRef.current = false
    }
  }, [rowData?.TaskID, user?.id, refetch, openTaskView])

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'Component unmounting')
      socketRef.current = null
    }

    reconnectAttemptsRef.current = 0
    isConnectingRef.current = false
  }, [])

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connectWebSocket()

    return () => {
      disconnectWebSocket()
    }
  }, [connectWebSocket, disconnectWebSocket])

  const handleTaskViewClick = () => {
    setOpenTaskView(true)
    // Reset message count when opening dialog
    messageCountRef.current = 0
    setMessageCount(0)
    // Clear seen messages for this session
    seenMessageIdsRef.current.clear()
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket()
    }
  }

  const handleClose = () => {
    setOpenTaskView(false)
    // Ensure WebSocket is connected after closing
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket()
    }
  }

  // Function to force refresh message count (called from dialog)
  // Now supports receiving optional WS message data from child components so parent can dedupe & increment.
  const handleRefreshMessageCount = (incomingData?: any) => {
    try {
      if (!incomingData) {
        // No data provided, nothing to dedupe against; just ensure websocket active.
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket()
        }
        return
      }

      // Build same stableId logic as in onmessage
      const data = incomingData
      const stableId =
        data?.uniqueId ||
        data?.UniqueId ||
        (data?.timestamp ? `${data?.TaskID || rowData?.TaskID}_${data?.timestamp}_${data?.SenderID || ''}` : null) ||
        `${data?.TaskID || rowData?.TaskID}_${data?.Message || ''}_${data?.SenderID || ''}`

      const messageId = String(stableId || `${data?.TaskID || rowData?.TaskID}_${Date.now()}_${Math.random()}`)

      // If we've already seen it (either via this component WS or previous notification), skip
      if (seenMessageIdsRef.current.has(messageId)) {
        return
      }

      // Mark as seen then decide whether to increment
      seenMessageIdsRef.current.add(messageId)

      // Determine if applies to this task
      const candidateIds = [
        data?.TaskID,
        data?.taskId,
        data?.taskID,
        data?.task?.id
      ]
      const foundId = candidateIds.find(id => id !== undefined && id !== null)
      const currentTaskId = rowData?.TaskID
      const appliesToCurrentTask = foundId == null || String(foundId) === String(currentTaskId)

      if (appliesToCurrentTask) {
        // Only increment if dialog is NOT open
        if (!openTaskView) {
          messageCountRef.current = messageCountRef.current + 1
          setMessageCount(prev => prev + 1)
        } else {
        }
      }
    } catch (err) {
      console.error('TaskNameCell: Error in handleRefreshMessageCount', err)
    } finally {
      // ensure websocket active
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket()
      }
    }
  }

  return (
    <>
      <Box display={'flex'} gap={3} alignItems={'center'}>
        {renderTextField}
        <IconButton size='small' onClick={handleTaskViewClick}>
          <SmallBadge badgeContent={messageCount} color="error">
            <Icon icon={'lucide:message-circle-more'} fontSize={22} />
          </SmallBadge>
        </IconButton>
      </Box>
      <TaskDetailsDialog 
        open={openTaskView} 
        close={handleClose} 
        taskData={rowData} 
        refetchTasks={refetch} 
        onRefreshMessageCount={handleRefreshMessageCount}
      />
    </>
  )
}

export default TaskNameCell
