import BugQueueComponent from '@/views/bug-queue'

const BugQueuePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const getParams = await params

  return <BugQueueComponent workspaceID={getParams?.id} />
}

export default BugQueuePage
