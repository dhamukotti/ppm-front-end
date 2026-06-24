'use client'
import { useEffect, useRef, useState } from 'react'

import { Button, Grid2, IconButton, Menu, Typography, Zoom } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import moment from 'moment'

import toast from 'react-hot-toast'

import CustomButton from '@/components/button'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { BugQueueListAPI } from '@/services/modules/bug-queue/types'
import { updateBug } from '@/services/modules/bug-queue'

interface Props {
  bug: BugQueueListAPI
  refetch: () => void
}

type FormType = {
  TimeResolution: Date | null
}

const TimeResolutionColumn = ({ bug, refetch }: Props) => {
  const [open, setOpen] = useState<any>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  // FIX: Use a ref for timerStartTime instead of state so changing it does NOT re-trigger the useEffect
  const timerStartTimeRef = useRef<number | null>(null)
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(0)
  const [isOvertime, setIsOvertime] = useState<boolean>(false)

  const form = useForm<FormType>({ defaultValues: { TimeResolution: null } })

  const handleOpen = (e: any) => {
    setOpen(e?.currentTarget)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const onSubmit = async (data: FormType) => {
    if (data.TimeResolution) {
      const now = moment()
      const target = moment(data.TimeResolution)

      if (target.isAfter(now)) {
        const duration = moment.duration(target.diff(now))

        const hours = Math.floor(duration.asHours())
        const minutes = duration.minutes()
        const seconds = duration.seconds()

        const formatted = `${hours}h ${minutes}m ${seconds}s`

        const body = {
          TimeResolution: formatted,
          TimerStart: 0 // Changed from 1 to 0 to prevent auto-start
        }

        await updateBug({ body, id: bug?.BugID?.toString() })
        // Removed setTimerStartTime(Date.now()) to prevent auto-start
      } else {
        toast.error('TimeResolution is in the past.')
      }

      refetch()
      setOpen(null)
    }
  }

  const parseResolutionToSeconds = (resolution: string) => {
    const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/
    const match = resolution.match(regex)

    if (!match) return 0

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    return hours * 3600 + minutes * 60 + seconds
  }

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return `${h}h ${m}m ${s}s`
  }

  // Function to update overtime in backend
  const updateOvertimeInBackend = async (overtimeSeconds: number) => {
    try {
      const formattedOvertime = formatCountdown(overtimeSeconds)
      await updateBug({
        body: {
          TimeResolution: formattedOvertime,
          TimerStart: 1 // Keep timer running
        },
        id: bug?.BugID?.toString()
      })
    } catch (error) {
      console.error('Failed to update overtime in backend:', error)
    }
  }

  const handleTimerToggle = async () => {
    if (bug?.isTimerStart) {
      // Pause timer - store current countdown including overtime
      const currentCountdown = countdown || bug?.timeResolution || '0h 0m 0s'
      const currentSeconds = parseResolutionToSeconds(currentCountdown)

      await updateBug({
        body: {
          TimerStart: 0,
          TimeResolution: currentCountdown
        },
        id: bug?.BugID?.toString()
      })
      // FIX: Clear ref instead of state
      timerStartTimeRef.current = null

      // Save paused state so resume can reconstruct exact overtime moment
      if (bug?.BugID) {
        localStorage.setItem(`pausedCountdownSeconds_${bug.BugID}`, currentSeconds.toString())
        localStorage.setItem(`pausedMode_${bug.BugID}`, isOvertime ? 'overtime' : 'countdown')

        // Remove active run start markers (we're paused)
        localStorage.removeItem(`overtimeStartTime_${bug.BugID}`)
        localStorage.removeItem(`timerStartTime_${bug.BugID}`)
      }
    } else {
      // Resume timer
      const pausedSecondsStr = bug?.BugID ? localStorage.getItem(`pausedCountdownSeconds_${bug.BugID}`) : null
      const pausedMode = bug?.BugID ? localStorage.getItem(`pausedMode_${bug.BugID}`) : null

      if (pausedSecondsStr && pausedMode === 'overtime' && bug?.BugID) {
        // Resuming from a paused overtime: reconstruct overtimeStartTime so elapsed calculation picks up where it left off
        const pausedSeconds = parseInt(pausedSecondsStr, 10)
        const overtimeStart = Date.now() - pausedSeconds * 1000
        localStorage.setItem(`overtimeStartTime_${bug.BugID}`, overtimeStart.toString())

        // Inform backend timer is running again (we keep TimeResolution as-is; backend will get overtime updates)
        await updateBug({ body: { TimerStart: 1 }, id: bug?.BugID?.toString() })

        // Clean up paused keys
        localStorage.removeItem(`pausedCountdownSeconds_${bug.BugID}`)
        localStorage.removeItem(`pausedMode_${bug.BugID}`)

        // Do NOT set timerStartTime here — overtime path uses overtimeStartTime
        timerStartTimeRef.current = null
      } else if (pausedSecondsStr && pausedMode === 'countdown' && bug?.BugID) {
        // Resuming from a paused countdown — reconstruct timerStartTime so remaining seconds are correct
        const pausedSeconds = parseInt(pausedSecondsStr, 10)
        const totalSeconds = parseResolutionToSeconds(bug?.timeResolution || '0h 0m 0s')
        // elapsed = total - remaining; startTime = now - elapsed
        const elapsedAtPause = totalSeconds - pausedSeconds
        const reconstructedStart = Date.now() - elapsedAtPause * 1000
        localStorage.setItem(`timerStartTime_${bug.BugID}`, reconstructedStart.toString())
        // FIX: Write to ref — does NOT re-trigger the effect
        timerStartTimeRef.current = reconstructedStart

        await updateBug({ body: { TimerStart: 1 }, id: bug?.BugID?.toString() })

        // Clean up paused keys
        localStorage.removeItem(`pausedCountdownSeconds_${bug.BugID}`)
        localStorage.removeItem(`pausedMode_${bug.BugID}`)
      } else {
        // Normal start/resume for countdown path
        await updateBug({ body: { TimerStart: 1 }, id: bug?.BugID?.toString() })
        const now = Date.now()
        // FIX: Write to ref — does NOT re-trigger the effect
        timerStartTimeRef.current = now
        if (bug?.BugID) localStorage.setItem(`timerStartTime_${bug.BugID}`, now.toString())

        // Clean up any paused markers
        if (bug?.BugID) {
          localStorage.removeItem(`pausedCountdownSeconds_${bug.BugID}`)
          localStorage.removeItem(`pausedMode_${bug.BugID}`)
        }
      }
    }

    refetch()
  }

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout
    let syncInterval: NodeJS.Timeout
    let overtimeInterval: NodeJS.Timeout

    if (bug?.timeResolution && bug?.isTimerStart) {
      // Prefer overtimeStart when it exists (this fixes resume-from-overtime issues)
      const storedOvertimeStart = bug?.BugID ? localStorage.getItem(`overtimeStartTime_${bug.BugID}`) : null
      const storedStartTime = bug?.BugID ? localStorage.getItem(`timerStartTime_${bug.BugID}`) : null

      const now = Date.now()

      if (storedOvertimeStart) {
        // We are in overtime and have a stored overtime start time (resume or active overtime)
        const overtimeStartTime = parseInt(storedOvertimeStart, 10)
        let overtime = Math.floor((now - overtimeStartTime) / 1000)
        if (overtime < 0) overtime = 0

        setIsOvertime(true)
        setOvertimeSeconds(overtime)
        setCountdown(formatCountdown(overtime))

        overtimeInterval = setInterval(() => {
          setOvertimeSeconds(prev => {
            const newSeconds = prev + 1
            const formatted = formatCountdown(newSeconds)
            setCountdown(formatted)

            if (newSeconds % 10 === 0) {
              updateOvertimeInBackend(newSeconds)
            }

            return newSeconds
          })
        }, 1000)
      } else {
        // Normal countdown / not currently saved as overtime
        const totalSeconds = parseResolutionToSeconds(bug.timeResolution)

        // FIX: Determine startTime strictly from localStorage first, then ref, then create new.
        // Using a ref instead of state means this block does NOT cause an infinite re-render loop.
        let startTime: number

        if (storedStartTime) {
          // Always prefer persisted localStorage value — survives re-renders and page refreshes
          startTime = parseInt(storedStartTime, 10)
          timerStartTimeRef.current = startTime
        } else if (timerStartTimeRef.current) {
          // In-memory ref exists (set earlier this session) but not yet in localStorage — persist it
          startTime = timerStartTimeRef.current
          if (bug?.BugID) localStorage.setItem(`timerStartTime_${bug.BugID}`, startTime.toString())
        } else {
          // No record at all — this is a brand-new timer start
          startTime = Date.now()
          timerStartTimeRef.current = startTime
          if (bug?.BugID) localStorage.setItem(`timerStartTime_${bug.BugID}`, startTime.toString())
        }

        // FIX: Calculate remaining seconds from wall-clock elapsed time (not interval ticks).
        // This means the countdown is always accurate even after re-renders, refetch, or tab switching.
        const elapsedSeconds = Math.floor((now - startTime) / 1000)

        // Calculate remaining seconds
        let remainingSeconds = totalSeconds - elapsedSeconds

        // Check if we're already in overtime
        const currentIsOvertime = remainingSeconds < 0
        setIsOvertime(currentIsOvertime)

        if (currentIsOvertime) {
          // We're in overtime - set overtime start time (if not present) and switch to overtime handling
          let overtime: number

          // If there's a leftover overtimeStart stored (shouldn't be here because we checked above),
          // compute overtime using that. Otherwise, create one now based on when countdown hit zero.
          const storedOvertimeStartNow = bug?.BugID ? localStorage.getItem(`overtimeStartTime_${bug.BugID}`) : null

          if (storedOvertimeStartNow) {
            const overtimeStartValue = parseInt(storedOvertimeStartNow, 10)
            overtime = Math.floor((now - overtimeStartValue) / 1000)
          } else {
            // First time entering overtime: compute start as the moment countdown reached zero
            const overtimeStartTime = now - Math.abs(remainingSeconds) * 1000
            if (bug?.BugID) localStorage.setItem(`overtimeStartTime_${bug.BugID}`, overtimeStartTime.toString())
            overtime = Math.abs(remainingSeconds)
          }

          setOvertimeSeconds(overtime)
          setCountdown(formatCountdown(overtime))

          // Start overtime counter
          overtimeInterval = setInterval(() => {
            setOvertimeSeconds(prev => {
              const newSeconds = prev + 1
              const formatted = formatCountdown(newSeconds)
              setCountdown(formatted)

              // Update backend every 10 seconds when in overtime
              if (newSeconds % 10 === 0) {
                updateOvertimeInBackend(newSeconds)
              }

              return newSeconds
            })
          }, 1000)
        } else {
          // FIX: Normal countdown — drive the display from wall-clock time on every tick,
          // not a stale closure variable. This prevents the timer from freezing or jumping.
          setCountdown(formatCountdown(remainingSeconds))

          countdownInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = totalSeconds - elapsed

            if (remaining <= 0) {
              clearInterval(countdownInterval)
              clearInterval(syncInterval)
              setCountdown('0h 0m 0s')
              setIsOvertime(true)
              setOvertimeSeconds(0)

              // Store overtime start time
              if (bug?.BugID) localStorage.setItem(`overtimeStartTime_${bug.BugID}`, Date.now().toString())

              // Update backend when timer reaches 0
              updateOvertimeInBackend(0)

              // Start overtime counter when timer reaches 0
              overtimeInterval = setInterval(() => {
                setOvertimeSeconds(prev => {
                  const newSeconds = prev + 1
                  const formatted = formatCountdown(newSeconds)
                  setCountdown(formatted)

                  // Update backend every 10 seconds when in overtime
                  if (newSeconds % 10 === 0) {
                    updateOvertimeInBackend(newSeconds)
                  }

                  return newSeconds
                })
              }, 1000)
            } else {
              setCountdown(formatCountdown(remaining))
            }
          }, 1000)

          // 🔄 Sync with backend every 10 seconds
          syncInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = totalSeconds - elapsed
            if (remaining > 0) {
              const formatted = formatCountdown(remaining)
              updateBug({ body: { TimeResolution: formatted }, id: bug?.BugID?.toString() })
            }
          }, 10000)
        }
      }
    } else {
      setCountdown(null)
      timerStartTimeRef.current = null
      setOvertimeSeconds(0)
      setIsOvertime(false)
      if (bug?.BugID) {
        localStorage.removeItem(`timerStartTime_${bug.BugID}`)
        localStorage.removeItem(`overtimeStartTime_${bug.BugID}`)
      }
    }

    return () => {
      clearInterval(countdownInterval)
      clearInterval(syncInterval)
      clearInterval(overtimeInterval)
    }
    // FIX: Removed timerStartTime from deps array — it was causing the effect to re-run and
    // reset startTime to Date.now() on every refetch/render. Now only re-runs when the bug
    // data actually changes from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bug?.timeResolution, bug?.isTimerStart, bug?.BugID])

  // Clean up localStorage on component unmount
  useEffect(() => {
    return () => {
      if (bug?.BugID) {
        localStorage.removeItem(`timerStartTime_${bug.BugID}`)
        localStorage.removeItem(`overtimeStartTime_${bug.BugID}`)
      }
    }
  }, [bug?.BugID])

  return (
    <div className='flex items-center gap-2'>
      {bug?.timeResolution && (
        <IconButton size='small' className='p-0' onClick={handleTimerToggle}>
          {!bug?.isTimerStart ? (
            <i className='ri-play-circle-line text-textPrimary size-6' />
          ) : (
            <i className='ri-pause-circle-line text-primary size-6' />
          )}
        </IconButton>
      )}

      {!!bug?.isTimerStart && bug?.timeResolution ? (
        <div className='px-2'>
          {/* <Typography className={`text-sm font-medium ${isOvertime ? 'text-error' : 'text-primary'}`}> */}
                      <Typography className={`text-sm font-medium ${isOvertime ? 'text-error' : 'text-primary'}`}>

            {countdown || bug?.timeResolution || 'Add Time'}
          {/* //  {isOvertime && ' (overtime)'} */}
          </Typography>
        </div>
      ) : (
        <Button size='small' className='text-sm' onClick={handleOpen}>
          {bug?.timeResolution || 'Add Time'}
        </Button>
      )}

      <Menu
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        TransitionComponent={Zoom}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        sx={{ '& .MuiList-root': { p: 0 } }}
      >
        <div className='p-2 max-w-[300px]'>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Grid2 container spacing={6}>
              <Grid2 size={12}>
                <div className='flex w-full justify-center'>
                  <Controller
                    control={form.control}
                    name='TimeResolution'
                    render={({ field }) => (
                      <AppReactDatepicker
                        inline
                        selected={field?.value}
                        showTimeInput
                        minDate={new Date()}
                        minTime={new Date()}
                        id='date-range-picker'
                        onChange={date => {
                          field?.onChange(date)
                        }}
                      />
                    )}
                  />
                </div>
              </Grid2>
              <Grid2 size={12}>
                <div className='flex justify-between gap-2 items-center'>
                  <CustomButton circular variant='outlined' color='secondary' onClick={handleClose}>
                    Close
                  </CustomButton>
                  <CustomButton
                    variant='contained'
                    circular
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                    type='submit'
                  >
                    {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </CustomButton>
                </div>
              </Grid2>
            </Grid2>
          </form>
        </div>
      </Menu>
    </div>
  )
}

export default TimeResolutionColumn
