// Next Imports
import type { Metadata } from 'next'

// Component Imports
import RegisterComponent from '@/views/auth/register'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register and be a part of PPM'
}

const RegisterPage = () => {
  return <RegisterComponent />
}

export default RegisterPage
