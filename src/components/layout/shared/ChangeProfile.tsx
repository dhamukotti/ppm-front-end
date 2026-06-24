import { Button } from '@mui/material'

import { useAuth } from '@/hooks/useAuth'

const ChangeProfileButton = () => {
  const { changeProfiles } = useAuth()

  return (
    <>
      <Button
        variant='outlined'
        size='small'
        startIcon={<i className='ri-refresh-line' />}
        onClick={() => changeProfiles()}
      >
        Change Profiles
      </Button>
    </>
  )
}

export default ChangeProfileButton
