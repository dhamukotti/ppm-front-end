import ProjectManagementPage from '@/views/project'

const ProjectPage = async (params: { params: Promise<{ id: string }> }) => {
  const projectID = await params?.params

  return <ProjectManagementPage projectID={projectID.id} />
}

export default ProjectPage
