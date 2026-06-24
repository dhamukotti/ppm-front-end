import { useEffect, useState } from 'react'

import { Button } from '@mui/material'

import moment from 'moment'

import type { SprintItem } from '@/services/modules/sprint-item/types'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { updateSprint } from '@/services/modules/sprint-item'
import { UpdateSrpintItem } from '@/services/modules/sprint-item'
import { useAuth } from '@/hooks/useAuth'

const DatePickerDynamic = ({
  startDate,
  endDate,
  onChange,
  render
}: {
  startDate: Date | null
  endDate: Date | null
  onChange: (v: [Date | null, Date | null]) => void
  render: any
}) => {
  return (
    <AppReactDatepicker
      monthsShown={2}
      selectsRange
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      customInput={render}
    />
  )
}

const SprintTimelineManagement = ({ original, refetch }: { original: SprintItem; refetch: () => void }) => {
  const [startDate, setStartDate] = useState<Date | null>(null)

  const [endDate, setEndDate] = useState<Date | null>(null)
  const { profile, user } = useAuth()
  const handleDateChange = async (dates: [Date | null, Date | null]) => {
    if (!dates) return

    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)

    if (start && end) {
      await updateSprint({
        id: original?.SprintID?.toString(),
        body: { SprintTimelineStart: start, SprintTimelineEnd: end }
      })
//        const value = localStorage.getItem('userData')
  

//  const bodyvalue = {
//               Sprintname:original.Name,
//               Goals:"-",
//               startdate: moment(start).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
//               endate:moment(end).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
//               LoginuserID:user?.id,
//               SprintgroupID:original.SprintGroupID,
//               WorkspaceID:original.WorkSpaceID,
//               sprintID:original?.SprintID?.toString()
//             }

            //    //const response = await UpdateSrpintItem(bodyvalue
            //   // id: filteredSprintData?.[rowIndex]?.SprintID?.toString(),
            //   // body: { Name: value }
            // )

      await refetch()

      if (original?.SprintTimelineStart) {
        const start = moment(original.SprintTimelineStart, 'DD-MM-YYYY HH:mm A')
        if (start.isValid()) setStartDate(start.toDate())
      }
      if (original?.SprintTimelineEnd) {
        const end = moment(original.SprintTimelineEnd, 'DD-MM-YYYY HH:mm A')
        if (end.isValid()) setEndDate(end.toDate())
      }
    }
  }

  useEffect(() => {
    if (original?.SprintTimelineStart) {
      const start = moment(original.SprintTimelineStart, 'DD-MM-YYYY HH:mm A')
      if (start.isValid()) setStartDate(start.toDate())
    } else {
      setStartDate(null)
    }
    if (original?.SprintTimelineEnd) {
      const end = moment(original.SprintTimelineEnd, 'DD-MM-YYYY HH:mm A')
      if (end.isValid()) setEndDate(end.toDate())
    } else {
      setEndDate(null)
    }
  }, [original?.SprintTimelineStart, original?.SprintTimelineEnd, original])
  return (
    <DatePickerDynamic
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      render={
        <Button
          size='small'
          className='rounded-full p-1 leading-3 px-2'
          variant={startDate && endDate ? 'contained' : 'outlined'}
        >
          {startDate && endDate
            ? `${moment(startDate).format('MMM DD')} - ${moment(endDate).format('MMM DD')}`
            : 'Add timeline'}
        </Button>
      }
    />
  )
}

export default SprintTimelineManagement
