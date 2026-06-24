import { useMemo } from 'react'

import type { Getter } from '@tanstack/react-table'

import type { AdditionalColumn } from '@/services/modules/project/types'
import type { AdditionalSubTaskListItem } from '@/services/modules/sub-task/types'
import type { TaskListItemType } from '@/services/modules/task/types'
import TaskPeople from '../people'
import TaskStatus from '../status'
import DynamicDate from './date-type'
import DynamicDropdown from './dropdown'
import DynamicFiles from './file-upload'
import TaskTextValues from './text-value'

interface DynamicColumnCellProps {
  getValue: Getter<unknown>
  index: number
  row: TaskListItemType | AdditionalSubTaskListItem
  id: string
  columnItem: AdditionalColumn
  table: any
  value: any
  refetch: () => void
  isSubTask: boolean
}

const DynamicColumnCell = (props: DynamicColumnCellProps) => {
  // ** PROPS
  const { getValue, index, row, id, table, columnItem, value, refetch, isSubTask = false } = props

  const getColumnTypeName = useMemo(() => columnItem?.ColumnType.Keyname, [columnItem?.ColumnType.Keyname])

  // ** "DATE" TYPE COLUMN
  if (getColumnTypeName === 'DPK')
    return <DynamicDate canEdit={true} isSubTask={isSubTask} refetch={refetch} rowData={row} dynamicValue={value} columnData={columnItem} />

  // ** "USER" TYPE COLUMN
  if (getColumnTypeName === 'USR') {
    const usersList = row?.additionalValues?.filter(
      addVal => addVal?.AdditionalColumnID === columnItem?.AdditionalColumnID
    )

    return (
      <TaskPeople
        refetch={refetch}
        rowData={row}
        dynamicValue={usersList}
        columnData={columnItem}
        canEdit={true}
        isSubTask={isSubTask}
      />
      // <TaskPeople rowData={row} refetch={refetch} />
    )
  }

  // ** "STATUS" TYPE COLUMN
  if (getColumnTypeName === 'LBL')
    return (
      <TaskStatus
        canEdit={true}
        refetch={refetch}
        row={row}
        dynamicValue={value}
        columnData={columnItem}
        isSubTask={isSubTask}
      />
    )

  // ** "DROPDOWN" TYPE COLUMN
  if (getColumnTypeName === 'DDL') {
    const taskRow = row as TaskListItemType

    const dropdownList = taskRow?.additionalValues?.filter(
      addVal => addVal?.AdditionalColumnID === columnItem?.AdditionalColumnID
    )

    return (
      <DynamicDropdown
        canEdit={true}
        refetch={refetch}
        rowData={row}
        dynamicValue={dropdownList}
        columnData={columnItem}
        isSubTask={isSubTask}
      />
    )
  }

  // ** "FILE" TYPE COLUMN
  if (getColumnTypeName === 'FLE')
    return (
      <DynamicFiles
        canEdit={true}
        refetch={refetch}
        rowData={row}
        dynamicValue={value}
        columnData={columnItem}
        isSubTask={isSubTask}
        
      />
    )

  // ** "TextField" TYPE COLUMN
  return (
    <TaskTextValues
      canEdit={true}
      columnData={columnItem}
      dynamicValue={value}
      getValue={getValue}
      id={id}
      index={index}
      table={table}
    />
  )
}

export default DynamicColumnCell
