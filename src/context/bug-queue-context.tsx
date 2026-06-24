// ** React Imports
import type { ReactNode } from 'react'
import { createContext,useState, useContext,useCallback } from 'react'

import { useQuery } from '@tanstack/react-query'

import { fetchBugQueueList } from '@/services/modules/bug-queue'
import type { BugQueueListAPI } from '@/services/modules/bug-queue/types'



type ColumnVisibility = {
  BugID:boolean
  Reporter: boolean
  BugDescription: boolean
  TimeResolution: boolean
  Priority: boolean
  [key: string]: boolean
}





interface BugQueueContextType {
  data: BugQueueListAPI[]
  refetch: () => void,
   columnVisibility: ColumnVisibility
  setColumnVisibility: (visibility: ColumnVisibility) => void
  toggleColumnVisibility: (columnKey: keyof ColumnVisibility) => void
  visibleColumns: string[]
}

const defaultColumnVisibility: ColumnVisibility = {
  BugID:true,
  BugName:true,
  Reporter: true,
  BugDescription: true,
  TimeResolution: true,
  Priority: true,
  Status:true
}


// ** Defaults
const defaultProvider: BugQueueContextType = {
  data: [],
  refetch: () => {},  
  columnVisibility: defaultColumnVisibility,
  setColumnVisibility: () => {},
  toggleColumnVisibility: () => {},
  visibleColumns: Object.keys(defaultColumnVisibility).filter(key => defaultColumnVisibility[key])

}

const BugQueueContext = createContext<BugQueueContextType>(defaultProvider)

interface BugQueueProviderProps {
  children: ReactNode
  workspaceID: string
}

const BugQueueProvider = ({ children, workspaceID }: BugQueueProviderProps) => {
  const { data = [], refetch } = useQuery({
    queryKey: ['bug-list', workspaceID],
    queryFn: () => fetchBugQueueList(workspaceID),
    enabled: !!workspaceID
  })
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(defaultColumnVisibility)
   // Toggle visibility for a specific column
    const toggleColumnVisibility = useCallback((columnKey: keyof ColumnVisibility) => {
      setColumnVisibility(prev => ({
        ...prev,
        [columnKey]: !prev[columnKey]
      }))
    }, [])

      const visibleColumns = Object.keys(columnVisibility).filter(key => columnVisibility[key])


  const values: BugQueueContextType = {
    data,
    refetch,
     columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    visibleColumns
  }

  return <BugQueueContext.Provider value={values}>{children}</BugQueueContext.Provider>
}

export { BugQueueContext, BugQueueProvider }

export const useBugQueue = () => {
  const value = useContext(BugQueueContext)

  if (!value) throw new Error('Tried to use context without a provider')

  return value
}
