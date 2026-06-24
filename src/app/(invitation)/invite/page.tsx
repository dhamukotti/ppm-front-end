import InvitationManagementPage from '@/views/invite'

const Page = async ({ searchParams }: { searchParams: Promise<{ invitation_id: string }> }) => {
  const getParams = await searchParams

  const invitationID = getParams?.invitation_id

  return <InvitationManagementPage invitationID={invitationID} />
}

export default Page
