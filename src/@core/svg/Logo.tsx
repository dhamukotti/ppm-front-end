import Image from 'next/image'

import logo from '@public/images/logos/logo-pp.png'
import logoSmall from '@public/images/logos/logo-pp-small.png'

import type { Mode } from '../types'

const PPMLogo = ({ isCollapsed, mode }: { isCollapsed: boolean | undefined; mode: Mode | undefined }) => {
  return (
    <div className='flex items-center gap-2'>
      {/* Small Logo */}
      <Image
        src={logoSmall}
        alt='missionHomeopathySmall'
        priority
        height={40}
        className={`transition-all duration-300 ease-linear ${isCollapsed ? 'opacity-1 translate-x-0' : 'opacity-0 -translate-x-10'}`}
      />

      {/* Full Logo */}
      <Image
        src={logo}
        alt='missionHomeopathyFull'
        priority
        height={40}
        className={`transition-all w-auto duration-400 ease-linear ${
          isCollapsed ? 'opacity-0 translate-x-2 w-0' : 'opacity-100 -translate-x-10 w-auto'
        } ${mode === 'light' ? '' : 'invert-[0.2]'} ms-7`}
      />
    </div>
  )
}

export default PPMLogo
