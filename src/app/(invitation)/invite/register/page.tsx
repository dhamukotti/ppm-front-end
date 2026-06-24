import RegisterOnInvite from '@/views/invite/register'

const Page = async ({ searchParams }: { searchParams: Promise<{ invitationID: string }> }) => {
  const getParams = await searchParams

  return <RegisterOnInvite invitationID={getParams?.invitationID} />
}

export default Page
