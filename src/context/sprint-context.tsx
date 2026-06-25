// ** React Imports
import type { ReactNode } from 'react'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { fetchSprintGroups } from '@/services/modules/sprint-group'
import { useAuth } from '@/hooks/useAuth'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { SprintGroupItem } from '@/services/modules/sprint-group/type'

type ColumnVisibility = {
  Name: boolean
  Goals: boolean
  SprintTimeline: boolean
  SprintStatus: boolean
  ActiveSprint: boolean
  [key: string]: boolean
}

interface SprintManagementType {
  data: SprintGroupItem[]
  refetch: () => void
  columnVisibility: ColumnVisibility
  setColumnVisibility: (visibility: ColumnVisibility) => void
  toggleColumnVisibility: (columnKey: keyof ColumnVisibility) => void
  visibleColumns: string[]
  workspaceID: string
}

const defaultColumnVisibility: ColumnVisibility = {
  Name: true,
  Goals: true,
  SprintTimeline: true,
  SprintStatus: true,
   ActiveSprint: false
}

// ** Defaults
const defaultProvider: SprintManagementType = {
  data: [],
  refetch: () => {},
  columnVisibility: defaultColumnVisibility,
  setColumnVisibility: () => {},
  toggleColumnVisibility: () => {},
  visibleColumns: Object.keys(defaultColumnVisibility).filter(key => defaultColumnVisibility[key]),
  workspaceID: ''
}

const SprintManagement = createContext<SprintManagementType>(defaultProvider)

interface SprintManagementProviderProps {
  children: ReactNode
  workspaceID: string
}

// ** Fetch sprint groups function

// ** Fetch dynamic columns function
const fetchSprintDynamicColumns = async (loginuserID: number, workspaceID: string) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetSprintDynamiccolumnLlist`, {
    params: {
      LoginuserID: loginuserID,
      WorkspaceID: workspaceID
    }
  })
  return response.data
}

const SprintManagementProvider = ({ children, workspaceID }: SprintManagementProviderProps) => {
  const { user } = useAuth()
  const loginuserID = user?.id || 0

  const { data = [], refetch } = useQuery({
    queryKey: ['sprint-groups', workspaceID],
    queryFn: () => fetchSprintGroups(workspaceID),
    enabled: !!workspaceID
  })

  // ** GET DYNAMIC COLUMNS
  const { data: dynamicColumnsData } = useQuery({
    queryKey: ['sprint-dynamic-columns', workspaceID, loginuserID],
    queryFn: () => fetchSprintDynamicColumns(loginuserID, workspaceID),
    enabled: !!workspaceID && !!loginuserID
  })

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(defaultColumnVisibility)

  // Generate visibility when dynamic columns data changes
  useEffect(() => {
    if (dynamicColumnsData && Array.isArray(dynamicColumnsData) && dynamicColumnsData.length > 0) {
      // Start with default columns
      const newVisibility: ColumnVisibility = {
        Name: true,
        Goals: true,
        SprintTimeline: true,
        SprintStatus: true,
        ActiveSprint: true
      }
      // Add dynamic columns from API response
      dynamicColumnsData.forEach((group: any) => {
        if (group.columndetails && Array.isArray(group.columndetails)) {
          group.columndetails.forEach((column: any) => {
            if (column.additionalColumnID) {
              newVisibility[column.additionalColumnID] = true
            }
          })
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

  const values: SprintManagementType = {
    data,
    refetch,
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    visibleColumns,
    workspaceID
  }

  return <SprintManagement.Provider value={values}>{children}</SprintManagement.Provider>
}

export { SprintManagement, SprintManagementProvider }

export const useSprintManagement = () => {
  const value = useContext(SprintManagement)

  if (!value) throw new Error('Tried to use context without a provider')

  return value
}
