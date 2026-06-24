// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { RootStylesType } from '../types'

const StyledMenuIcon = styled.span<RootStylesType>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: 'white', ${({ rootStyles }) => rootStyles};
`

export default StyledMenuIcon
