const InvitationResult = async ({ params }: { params: Promise<{ result: string }> }) => {
  const getParams = await params

  console.log('getParams :', getParams?.result)

  return <>Here</>
}

export default InvitationResult
