// ** React Imports
import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useQueries, useQuery } from '@tanstack/react-query'

import { fetchProjectList } from '@/services/modules/project'
import { fetchWorkspaceList } from '@/services/modules/workspace'

import { fetchBugPriorityList } from '@/services/modules/bug-queue'
import { fetchProjectPriorityList } from '@/services/modules/project-priority'
import type { ProjectPriorityList } from '@/services/modules/project-priority/types'
import { fetchProjectStatusList } from '@/services/modules/project-status'
import type { ProjectStatusList } from '@/services/modules/project-status/types'
import type { ProjectListItem } from '@/services/modules/project/types'
import { fetchSprintWorkspaceList } from '@/services/modules/sprint-workspace'
import type { WorkspaceListItem } from '@/services/modules/workspace/type'
import { useAuth } from 'src/hooks/useAuth'

interface WorkspaceContextType {
  workspace: WorkspaceListItem[]
  projects: ProjectListItem[]
  priorityList: ProjectPriorityList[]
  statusList: ProjectStatusList[]
  refetchProjects: () => void
  selected: WorkspaceListItem | null
  setSelected: (workspace: any | null) => void
  refetchWorkspaces: () => void
}

const defaultProvider: WorkspaceContextType = {
  workspace: [],
  projects: [],
  priorityList: [],
  statusList: [],
  refetchProjects: () => {},
  selected: null,
  setSelected: () => {},
  refetchWorkspaces: () => {}
}

const WorkspaceContext = createContext<WorkspaceContextType>(defaultProvider)

interface WorkspaceProviderProps {
  children: ReactNode
}

const WorkspaceProvider: FC<WorkspaceProviderProps> = ({ children }) => {
  // ** Auth Imports
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // ** API calls
  // const { data, refetch } = useQuery({
  //   queryKey: ['workspaces', auth?.user?.userData?.UserID, auth?.profile],
  //   queryFn: () => (auth?.profile === 'projects' ? fetchWorkspaceList() : fetchSprintWorkspaceList()),
  //   enabled: !!auth?.user
  // })

  const { data, refetch } = useQuery({
  queryKey: ['workspaces', auth?.user?.userData?.UserID, auth?.profile],
  queryFn: () =>
    (auth?.profile === 'projects'
      ? fetchWorkspaceList()
      : fetchSprintWorkspaceList()) as Promise<WorkspaceListItem[]>,
  enabled: !!auth?.user
})
  // ** States
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceListItem | null>(null)

  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects', auth?.user?.userData?.UserID],
    queryFn: () =>
      activeWorkspace?.WorkspaceID ? fetchProjectList(activeWorkspace?.WorkspaceID?.toString() || '') : [],
    enabled: !!activeWorkspace?.WorkspaceID && auth?.profile === 'projects'
  })

  const [{ data: projectPriorityList }, { data: projectStatusList = [] }] = useQueries({
    queries: [
      {
        queryKey: ['project-priority-list', auth?.user, auth?.profile],
        queryFn: () => (auth?.profile === 'sprints' ? fetchBugPriorityList({}) : fetchProjectPriorityList({})),
        retry: false,
        enabled: !!auth?.user
      },
      {
        queryKey: ['project-status-list', auth?.profile],
        queryFn: () => auth?.profile === 'projects' && fetchProjectStatusList({}),
        retry: false,
        enabled: Boolean(auth?.user)
      }
    ]
  })

  useEffect(() => {
    if (auth?.user) {
      refetch()
      auth?.profile === 'projects' && refetchProjects()
    }
  }, [auth?.profile, auth?.user, refetch, refetchProjects])

  useEffect(() => {
    if (activeWorkspace) {
      if (auth?.profile === 'projects') {
        refetchProjects()
      } else {
        if (pathname?.includes('workspace')) {
          const paths = pathname?.split('/')

          paths[2] = activeWorkspace?.WorkspaceID?.toString()

          const resolvedPath = paths?.join('/')

          router.replace(resolvedPath)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.profile, data, refetchProjects])

  const values = {
    workspace: data || defaultProvider?.workspace,
    projects: projects || [],
    priorityList: projectPriorityList || [],
    statusList: projectStatusList || [],
    refetchProjects: refetchProjects,
    selected: activeWorkspace || null,
    setSelected: setActiveWorkspace,
    refetchWorkspaces: refetch
  }

  return <WorkspaceContext.Provider value={values}>{children}</WorkspaceContext.Provider>
}

export { WorkspaceContext, WorkspaceProvider }

export const useWorkspace = () => {
  const value = useContext(WorkspaceContext)

  if (value === undefined) throw new Error('Tried to use context without a provider')

  return value
}
