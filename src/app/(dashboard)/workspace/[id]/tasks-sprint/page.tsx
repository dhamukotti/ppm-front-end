import SprintTaskManagementPage from '@/views/sprint-management/tasks'

const WorkspaceSprintTasks = async ({ params }: { params: Promise<{ id: string }> }) => {
  const getParams = await params

  return <SprintTaskManagementPage workspaceID={getParams?.id} />
}

export default WorkspaceSprintTasks
