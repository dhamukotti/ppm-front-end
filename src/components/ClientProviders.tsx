'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from '@/context/auth-context'

// ** Type Imports
import type { ChildrenType } from '@core/types'
import { WorkspaceProvider } from '@/context/workspace-context'
import AuthGuard from './Guard'
import FallbackSpinner from './spinner'

type Props = ChildrenType

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })

const ClientProviders = (props: Props) => {
  // Props
  const { children } = props

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard fallback={<FallbackSpinner />}>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default ClientProviders
