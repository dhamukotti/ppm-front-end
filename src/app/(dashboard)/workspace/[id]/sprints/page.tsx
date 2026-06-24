import SprintManagementPage from '@/views/sprint-management/sprints'

const WorkspaceSprints = async ({ params }: { params: Promise<{ id: string }> }) => {
  const getParams = await params

  return <SprintManagementPage workspaceID={getParams?.id} />
}

export default WorkspaceSprints
