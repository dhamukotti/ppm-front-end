// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import { Inter } from 'next/font/google'

import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'PPM - Project Management',
  description: 'PPM - A Project Management Software'
}

const inter = Inter({ subsets: ['latin'] })

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className={`flex is-full min-bs-full flex-auto flex-col ${inter.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
