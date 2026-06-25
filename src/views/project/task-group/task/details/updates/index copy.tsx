import { useMemo, useState, useRef, useCallback, useEffect } from 'react'

import Image from 'next/image'

import { Icon } from '@iconify/react'
import { Avatar, Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'

import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import HtmlEditor from '@/components/input/html-editor'
import { useProject } from '@/context/project-context'
import type { TaskListItemType } from '@/services/modules/task/types'
import { getInitials } from '@/utils/getInitials'
import CustomButton from '@components/button'
import { useAuth } from '@/hooks/useAuth'

import {
  fetchTaskUpdatesList,
  giveReplyToUpdate,
  likeTaskUpdate,
  writeTaskUpdate
} from '@/services/modules/task-updates'
import type { TaskUpdatesListItemType } from '@/services/modules/task-updates/types'

import EmptyImage from '@public/images/cards/upload-files.svg'

interface WriteUpdateProps {
  taskID: string
  setWriteUpdate: (s: boolean) => void
  refetch: () => void
  onRefreshMessageCount?: (data?: any) => void
}

const WriteUpdate = ({ taskID, setWriteUpdate, refetch, onRefreshMessageCount }: WriteUpdateProps) => {
  const [value, setValue] = useState('')
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const { profile, user } = useAuth()

  const maxReconnectAttempts = 5
  const reconnectInterval = 3000

  const connectWebSocket = useCallback(() => {
    if (isConnectingRef.current || (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)) {
      return
    }

    const wsUrl = `wss://uat.ppmbackend.projectpulse360.com/statusTaskUpdate?taskId=${taskID}&senderID=${user?.id}`
    isConnectingRef.current = true

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnectingRef.current = false
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          if (event.data === "heartbeat" || typeof event.data === 'string' && event.data.trim().toLowerCase() === "heartbeat") {
            return
          }
          const data = JSON.parse(event.data)
          
          // Notify parent about new message
          if (onRefreshMessageCount) {
            // pass through the incoming data so parent can dedupe/count correctly
            onRefreshMessageCount(data)
          }
          
          // Refetch updates
          refetch()
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WriteUpdate WebSocket error:', error)
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
  }, [taskID, user?.id, refetch, onRefreshMessageCount])

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

  const handleChange = async (v: string) => {
    try {
      setValue(v)
    } catch (error) {
      console.error('error :', error)
    }
  }

  const handleSendUpdate = async () => {
    try {
      const body = {
        message: value,
        taskID
      }

      const updateRes = await writeTaskUpdate(body)

      refetch()
      setWriteUpdate(false)

      if (updateRes?.status) {
        toast.success('Task-Update Message was recorded successfully!')
        
        // Send WebSocket notification
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const wsMessage = {
            TaskID: taskID, // CRITICAL: Include TaskID
            SenderID: user?.id,
            Message: value,
            ReceiverID: 0,
            timestamp: new Date().toISOString(),
            isUpdate: true,
            // Add unique identifier to prevent duplicate counting
            uniqueId: `${taskID}_${Date.now()}_${Math.random()}`
          }
          
          socketRef.current.send(JSON.stringify(wsMessage))
        } else {
          console.warn('WebSocket is not connected yet.')
          // Try to reconnect
          connectWebSocket()
        }

        // Notify parent about the update
        if (onRefreshMessageCount) {
          // We can pass the same message we just sent; parent will dedupe using uniqueId
          onRefreshMessageCount({
            ...updateRes?.data,
            TaskID: taskID,
            SenderID: user?.id,
            Message: value,
            timestamp: new Date().toISOString(),
            uniqueId: `${taskID}_${Date.now()}_${Math.random()}`
          })
        }
      }
    } catch {}
  }

  return (
    <Box display={'flex'} flexDirection={'column'} gap={4}>
      <HtmlEditor
        placeholder={'Please enter a project description....'}
        onChange={(v: string) => handleChange(v)}
        setContent={value}
        defaultValue={value}
      />
      <Box textAlign={'end'}>
        <CustomButton variant='contained' onClick={handleSendUpdate}>
          Update
        </CustomButton>
      </Box>
    </Box>
  )
}

interface UpdateMessageProps {
  message: TaskUpdatesListItemType
  refetch: () => void
}

type FormType = {
  message: string
}

const UpdateMessage = ({ message, refetch }: UpdateMessageProps) => {
  const [giveReply, setGiveReply] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const { control, handleSubmit, reset } = useForm<FormType>({ defaultValues: { message: '' } })

  const handleLike = async () => {
    try {
      await likeTaskUpdate(message?.UpdateID?.toString())
      refetch()
    } catch {}
  }

  const onReplyClick = () => {
    setGiveReply(!giveReply)
    reset()
  }

  const onGiveReply = async (formData: FormType) => {
    const finalBody = {
      ...formData,
      updateID: message?.UpdateID,
      taskID: message?.TaskID
    }


    await giveReplyToUpdate(finalBody)
    refetch()
    reset()
    setGiveReply(false)
  }

  return (
    <Grid size={12}>
      <Box bgcolor={'background.default'} p={6} borderRadius={4} sx={{ borderBottomLeftRadius: 0 }}>
        {/* Details of user and Notification */}
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <Avatar src={message?.createdBy?.ProfilePicture} sx={{ width: 45, height: 45 }}>
              {getInitials(message?.createdBy?.Name)}
            </Avatar>
            <Typography fontWeight={600}>{message?.createdBy?.Name}</Typography>
          </Box>
          <Box>
            <IconButton onClick={() => setShowReplies(!showReplies)}>
              <Icon
                icon={'mdi:chevron-right'}
                rotate={showReplies ? 45 : 0}
                style={{ transition: 'all linear 300ms' }}
              />
            </IconButton>
          </Box>
        </Box>

        <Box mt={3} px={5} ml={4}>
          <p dangerouslySetInnerHTML={{ __html: message?.Message }} />
        </Box>

        {showReplies && message?.replies?.length ? (
          <Grid container spacing={5} ml={4}>
            {message?.replies?.map(reply => (
              <Grid size={12} key={reply?.UpdateID}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                  <Box display={'flex'} alignItems={'center'} gap={3}>
                    <Avatar src={reply?.createdBy?.ProfilePicture} sx={{ width: 40, height: 40 }}>
                      {getInitials(reply?.createdBy?.Name)}
                    </Avatar>
                    <Typography fontWeight={600}>{reply?.createdBy?.Name}</Typography>
                  </Box>
                </Box>

                <Box mt={3} px={5} ml={6}>
                  <p dangerouslySetInnerHTML={{ __html: reply?.Message }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : null}

        <Box height={giveReply ? 30 : 0} sx={{ transition: 'all linear 300ms' }}>
          {giveReply && (
            <form onSubmit={handleSubmit(onGiveReply)}>
              <Controller
                control={control}
                name='message'
                rules={{ required: 'Please enter something....' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size='small'
                    error={!!fieldState?.error}
                    fullWidth
                    placeholder='Write your reply here'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton type='submit' color='primary'>
                            <Icon icon={'mynaui:send'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </form>
          )}
        </Box>

        <Box mt={6} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Box display={'flex'} alignItems={'center'} gap={3}>
            <CustomButton
              variant={message?.isLiked ? 'contained' : 'outlined'}
              circular
              size='small'
              onClick={handleLike}
              color={message?.isLiked ? 'error' : 'primary'}
            >
              {message?.isLiked ? 'Liked' : 'Like'}
            </CustomButton>
            <CustomButton variant='outlined' circular size='small' onClick={onReplyClick}>
              {giveReply ? 'Hide' : 'Reply'}
            </CustomButton>
          </Box>
          <Box>
            <Typography color={'primary'}>{moment(message?.CreatedAt).fromNow()}</Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

interface ProjectUpdatesProps {
  taskData: TaskListItemType
  onRefreshMessageCount?: (data?: any) => void
}

const ProjectUpdates = ({ taskData, onRefreshMessageCount }: ProjectUpdatesProps) => {
  // ** Hooks
  const { project: projectData } = useProject()

  const { data, refetch } = useQuery({
    queryKey: ['task-update-messages', taskData?.TaskID],
    queryFn: () => fetchTaskUpdatesList(taskData?.TaskID?.toString())
  })

  const [writeUpdate, setWriteUpdate] = useState(false)

  // WebSocket connection in ProjectUpdates
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const { user } = useAuth()

  const maxReconnectAttempts = 5
  const reconnectInterval = 3000

  const connectWebSocket = useCallback(() => {
    if (isConnectingRef.current || (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)) {
      return
    }

    const wsUrl = `wss://uat.ppmbackend.projectpulse360.com/statusTaskUpdate?taskId=${taskData?.TaskID}&senderID=${user?.id}`
    isConnectingRef.current = true

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnectingRef.current = false
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = async (event) => {
        try {
          // Normalize incoming data
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

          
          // IMPORTANT: Notify parent about new message
          // Pass the parsed data so parent can dedupe and increment appropriately
          if (onRefreshMessageCount) {
            onRefreshMessageCount(data)
          }
          
          // Refetch updates
          refetch()

        } catch (error) {
          console.error('Error handling WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('ProjectUpdates WebSocket error:', error)
        isConnectingRef.current = false
      }

      ws.onclose = (event) => {
        isConnectingRef.current = false
        socketRef.current = null

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
  }, [taskData?.TaskID, user?.id, refetch, onRefreshMessageCount])

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

  // Connect WebSocket when component mounts
  useEffect(() => {
    connectWebSocket()

    return () => {
      disconnectWebSocket()
    }
  }, [connectWebSocket, disconnectWebSocket])

  // Notify parent when data is loaded initially
  useEffect(() => {
    if (data && onRefreshMessageCount) {
      // notify parent without payload (parent will just ensure WS active)
      onRefreshMessageCount()
    }
  }, [data, onRefreshMessageCount])

  const canSend = useMemo(
    () =>
      projectData?.userProjects?.Role?.RoleName === 'Member' || projectData?.userProjects?.Role?.RoleName === 'Admin',
    [projectData?.userProjects?.Role?.RoleName]
  )

  const handleWriteUpdate = () => {
    setWriteUpdate(true)
  }

  if (writeUpdate) {
    return (
      <WriteUpdate 
        taskID={taskData?.TaskID?.toString()} 
        setWriteUpdate={setWriteUpdate} 
        refetch={refetch} 
        onRefreshMessageCount={onRefreshMessageCount}
      />
    )
  }

  return (
    <Box px={{ sm: 0, md: 12 }} pb={5}>
      <Box width={'100%'} mb={5} textAlign={'end'}>
        {canSend && (
          <CustomButton
            variant='contained'
            circular
            startIcon={<Icon icon={'mdi:pencil-outline'} />}
            onClick={handleWriteUpdate}
          >
            {'Write an Update'}
          </CustomButton>
        )}
      </Box>
      {data?.length ? (
        <Grid container spacing={5}>
          {data?.map(message => <UpdateMessage key={message?.UpdateID} message={message} refetch={refetch} />)}
        </Grid>
      ) : (
        <div className='w-full bg-primaryLighter p-10 rounded-lg flex flex-col md:flex-row items-center justify-center gap-4'>
          <Box>
            <Image src={EmptyImage} alt='' className='w-full h-auto' />
          </Box>
          <Box flex={1}>
            <Typography
              variant='h6'
              fontWeight={700}
              color={'primary.dark'}
            >{`No updates yet for this item`}</Typography>
          </Box>
        </div>
      )}
    </Box>
  )
}

export default ProjectUpdates
