// ** React Imports
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { AdditionalColumn, ProjectViewData, Role } from '@/services/modules/project/types'
import type { TaskGroup } from '@/services/modules/task-group/types'
import type { ProjectUsers } from '@/services/modules/invite/types'
import { fetchColumnType } from '@/services/modules/task'
import type { TColumnType } from '@/services/modules/task/types'

// ** Types

type ColumnVisibility = {
  Taskname: boolean
  owner: boolean
  Priority: boolean
  Status: boolean
  Timeline: boolean
  [key: string]: boolean
}

interface ProjectContextType {
  project: ProjectViewData | null
  role: Role | null
  users: ProjectUsers[]
  columnVisibility: ColumnVisibility
  setColumnVisibility: (visibility: ColumnVisibility) => void
  additionalColumns: AdditionalColumn[]
  additionalColumnsType: TColumnType[]
  seeAllColumns: () => void
  refetchProject: () => void
  taskGroups: TaskGroup[]
  refetchTaskGroup: () => void
}

// ** Defaults
const defaultProvider: ProjectContextType = {
  project: null,
  role: null,
  users: [],
  columnVisibility: {
    Taskname: true,
    owner: true,
    Priority: true,
    Status: true,
    Timeline: true
  },
  additionalColumnsType: [],
  setColumnVisibility: () => {},
  additionalColumns: [],
  seeAllColumns: () => {},
  refetchProject: () => {},
  taskGroups: [],
  refetchTaskGroup: () => {}
}

const ProjectContext = createContext<ProjectContextType>(defaultProvider)

interface ProjectProviderProps {
  project: ProjectViewData | null
  refetchProject: () => void
  taskGroups: TaskGroup[]
  refetchTaskGroup: () => void
  role: Role | null
  users: ProjectUsers[]
  children: ReactNode
}

const ProjectProvider = ({
  project,
  refetchProject,
  taskGroups,
  refetchTaskGroup,
  role,
  users,
  children
}: ProjectProviderProps) => {
  // ** GET COLUMN TYPES
  const { data: additionalColumnsType } = useQuery({
    queryKey: ['column-type'],
    queryFn: () => fetchColumnType()
  })

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({ ...defaultProvider.columnVisibility })

  const generateVisibility = useCallback(() => {
    const additionalVisiblity: ColumnVisibility = {
      Taskname: true,
      owner: true,
      Priority: true,
      Status: true,
      Timeline: true
    }

    project?.additionalColumns?.forEach(element => {
      additionalVisiblity[element.AdditionalColumnID] = true
    })

    setColumnVisibility({ ...defaultProvider.columnVisibility, ...additionalVisiblity })
  }, [project?.additionalColumns])

  useEffect(() => {
    generateVisibility()
  }, [generateVisibility])

  const values: ProjectContextType = {
    project,
    role,
    users,
    columnVisibility,
    additionalColumnsType: additionalColumnsType || [],
    setColumnVisibility,
    additionalColumns: project?.additionalColumns || [],
    seeAllColumns: generateVisibility,
    refetchProject,
    taskGroups,
    refetchTaskGroup
  }

  return <ProjectContext.Provider value={values}>{children}</ProjectContext.Provider>
}

export { ProjectContext, ProjectProvider }

export const useProject = () => {
  const value = useContext(ProjectContext)

  if (!value) throw new Error('Tried to use context without a provider')

  return value
}
