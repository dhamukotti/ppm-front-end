// ** React Imports
import type { ReactNode } from 'react'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { fetchSprintListBasic } from '@/services/modules/sprint-item'
import type { SprintItem } from '@/services/modules/sprint-item/types'
import { useAuth } from '@/hooks/useAuth'

type ColumnVisibility = {
  Taskname: boolean
  ActualSP: boolean
  IsUnplanned: boolean
  EstimatedSP: boolean
  [key: string]: boolean
}

interface SprintTaskManagementType {
  data: SprintItem[]
  refetch: () => void
  columnVisibility: ColumnVisibility
  setColumnVisibility: (visibility: ColumnVisibility) => void
  toggleColumnVisibility: (columnKey: keyof ColumnVisibility) => void
  visibleColumns: string[]
  workspaceID: string
}

// ** Defaults
const defaultColumnVisibility: ColumnVisibility = {
  Taskname: true,
  ActualSP: true,
  Description: true,
  Owner: true,
  IsUnplanned: true,
  EstimatedSP: true
}

const defaultProvider: SprintTaskManagementType = {
  data: [],
  refetch: () => {},
  columnVisibility: defaultColumnVisibility,
  setColumnVisibility: () => {},
  toggleColumnVisibility: () => {},
  visibleColumns: Object.keys(defaultColumnVisibility).filter(key => defaultColumnVisibility[key]),
  workspaceID: ''
}

const SprintTaskManagement = createContext<SprintTaskManagementType>(defaultProvider)

interface SprintTaskManagementProviderProps {
  children: ReactNode
  workspaceID: string
  groupID: string
}

const fetchTaskDynamicColumns = async (loginUserID: number, groupID: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL1}/SprintTaskGetDynamicColumList`,
    {
      params: {
        LoginUserID: loginUserID,
        GroupID: groupID
      }
    }
  )
  return response.data
}

const SprintTaskManagementProvider = ({ children, workspaceID, groupID }: SprintTaskManagementProviderProps) => {
  const { user } = useAuth()
  const loginUserID = user?.id || 0

  const { data = [], refetch } = useQuery({
    queryKey: ['sprint-list-basic', workspaceID],
    queryFn: () => fetchSprintListBasic(workspaceID),
    enabled: !!workspaceID
  })

  const { data: dynamicColumnsData } = useQuery({
    queryKey: ['sprint-task-dynamic-columns', groupID, loginUserID],
    queryFn: () => fetchTaskDynamicColumns(loginUserID, groupID),
    enabled: !!groupID && !!loginUserID
  })

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(defaultColumnVisibility)

  // ✅ FIXED: API returns flat array directly — no columndetails nesting
  useEffect(() => {
    if (dynamicColumnsData && Array.isArray(dynamicColumnsData) && dynamicColumnsData.length > 0) {
      const newVisibility: ColumnVisibility = {
        Taskname: true,
        ActualSP: true,
        Description: true,
        Owner: true,
        IsUnplanned: true,
        EstimatedSP: true
      }

      // ✅ Flat array — each item IS the column directly
      dynamicColumnsData.forEach((column: any) => {
        if (column.additionalColumnID) {
          newVisibility[String(column.additionalColumnID)] = true
        }
      })

      setColumnVisibility(newVisibility)
    }
  }, [dynamicColumnsData])

  const toggleColumnVisibility = useCallback((columnKey: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }, [])

  const visibleColumns = Object.keys(columnVisibility).filter(key => columnVisibility[key])

  const values: SprintTaskManagementType = {
    data,
    refetch,
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    visibleColumns,
    workspaceID
  }

  return <SprintTaskManagement.Provider value={values}>{children}</SprintTaskManagement.Provider>
}

export { SprintTaskManagement, SprintTaskManagementProvider }

export const useSprintTaskManagement = () => {
  const value = useContext(SprintTaskManagement)
  if (!value) throw new Error('Tried to use context without a provider')
  return value
}
