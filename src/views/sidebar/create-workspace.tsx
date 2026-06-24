'use client'

// React Imports
import type { AnchorHTMLAttributes, ForwardRefRenderFunction, ReactElement, ReactNode } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'

// Third-party Imports
import type { CSSObject } from '@emotion/styled'
import classnames from 'classnames'
import { useUpdateEffect } from 'react-use'
import SubscriptionExpiredDialog from '@/views/paymentpopup/SubscriptionExpiredDialog'
import { useRazorpayPayment } from '../paymentpopup/useRazorpayPayment'
// Type Imports
import MenuButton from '@/@menu/components/vertical-menu/MenuButton'
import useVerticalMenu from '@/@menu/hooks/useVerticalMenu'
import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import StyledMenuLabel from '@/@menu/styles/StyledMenuLabel'
import StyledVerticalMenuItem from '@/@menu/styles/vertical/StyledVerticalMenuItem'
import type { MenuItemElement, MenuItemExactMatchUrlProps, RootStylesType } from '@/@menu/types'
import { menuClasses } from '@/@menu/utils/menuClasses'
import { renderMenuIcon } from '@/@menu/utils/menuUtils'
import CreateWorkspaceDialog from './create-workspace-dialog'
import { useWorkspace } from '@/context/workspace-context'
import { useAuth } from '@/hooks/useAuth'

export type MenuItemProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'prefix'> &
  RootStylesType &
  MenuItemExactMatchUrlProps & {
    icon?: ReactElement
    prefix?: ReactNode
    suffix?: ReactNode
    disabled?: boolean
    target?: string
    rel?: string
    component?: string | ReactElement
    onActiveChange?: (active: boolean) => void

    /**
     * @ignore
     */
    level?: number
  }

const CreateWorkspace: ForwardRefRenderFunction<HTMLLIElement, MenuItemProps> = (props, ref) => {
  // Props
  const {
    icon,
    level = 0,
    disabled = false,
    exactMatch = true,
    activeUrl,
    component,
    onActiveChange,
    rootStyles,
    ...rest
  } = props

  // States
  const [active, setActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showTrialPopup, setShowTrialPopup] = useState(false)
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false)
  const { profile, user } = useAuth()

  // Hooks
  const pathname = usePathname()
  const { refetchWorkspaces, workspace } = useWorkspace()
  const { menuItemStyles, renderExpandedMenuItemIcon, textTruncate } = useVerticalMenu()
  const [showPaymentExpiredDialog, setShowPaymentExpiredDialog] = useState(false)
  const { isCollapsed, isPopoutWhenCollapsed, isBreakpointReached } = useVerticalNav()

  // Get the styles for the specified element.
  const getMenuItemStyles = (element: MenuItemElement): CSSObject | undefined => {
    // If the menuItemStyles prop is provided, get the styles for the specified element.
    if (menuItemStyles) {
      // Define the parameters that are passed to the style functions.
      const params = { level, disabled, active, isSubmenu: false }

      // Get the style function for the specified element.
      const styleFunction = menuItemStyles[element]

      if (styleFunction) {
        // If the style function is a function, call it and return the result.
        // Otherwise, return the style function itself.
        return typeof styleFunction === 'function' ? styleFunction(params) : styleFunction
      }
    }
  }

  const workspaceLength = workspace?.length || 0


  // Change active state when the url changes
  useEffect(() => {
    const href = rest.href || (component && typeof component !== 'string' && component.props.href)

    if (href) {
      // Check if the current url matches any of the children urls
      if (exactMatch ? pathname === href : activeUrl && pathname.includes(activeUrl)) {
        setActive(true)
      } else {
        setActive(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Call the onActiveChange callback when the active state changes.
  useUpdateEffect(() => {
    onActiveChange?.(active)
  }, [active])

  // const handleCreateWorkspaceClick = () => {
  //    try {
  //     const localStorageData = localStorage.getItem('paymentStatus')
      
  //    if (localStorageData) {
  //       const parsedData = JSON.parse(localStorageData)
  
  //   if (parsedData?.workspaceCount == 1 && workspaceLength >= 1) {
  //         setShowPaymentExpiredDialog(true)
  //      } else {
  //       setShowPaymentExpiredDialog(false)
  //   }
  //     } else {
  //       setShowPaymentExpiredDialog(true)
  //    }
  //    } catch (error) {
  //     console.error('Error parsing localStorage:', error)
  //     setIsModalOpen(true)
  //    }
  // }
const handleCreateWorkspaceClick = () => {
  try {
    const localStorageData = localStorage.getItem('paymentStatus');
    
    // Default: show payment dialog (restrict access)
    let shouldShowPaymentDialog = true;
    
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      
      const workspaceCount = parsedData?.workspaceCount;
      const isExpired = parsedData?.isExpired;
      
      // User is allowed if EITHER:
      // 1. They have more than 1 workspace allowed, OR
      // 2. Their subscription is not expired
      if (workspaceCount > 1 || isExpired === false) {
        shouldShowPaymentDialog = false;
      }
    }
    
    // Show/hide payment dialog based on the logic above
    setShowPaymentExpiredDialog(shouldShowPaymentDialog);
    
    // If allowed, proceed with workspace creation
    if (!shouldShowPaymentDialog) {
      // TODO: Add your workspace creation logic here

      setIsModalOpen(true);
    }
    
  } catch (error) {
    console.error('Error parsing localStorage:', error);
    setIsModalOpen(true);
    setShowPaymentExpiredDialog(true); // Show payment dialog on error
  }
};


 const handleClosePaymentDialog = () => {
    setShowPaymentExpiredDialog(false)
  }
    const { isLoading, razorpayLoaded, generateRazorPayOrder } = useRazorpayPayment({
    userId: Number(user?.id),
    onPaymentSuccess: () => {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
      setShowPaymentExpiredDialog(false)
    },
    onPaymentFailure: () => {
      const canOpen = checkPaymentStatus()
      setShouldOpenDialog(canOpen)
      setShowPaymentExpiredDialog(true)
    }
  })
  const checkPaymentStatus = () => {
    const paymentStatus = localStorage.getItem('paymentStatus')

    try {
      if (paymentStatus) {
        const parsed = JSON.parse(paymentStatus)
        // If parsed explicitly says expired, show payment dialog and disallow opening the Task Group dialog
        if (parsed.isExpired === true) {
          setShowPaymentExpiredDialog(true)
          return false
        }
        // If parsed explicitly says not expired, ensure payment dialog is hidden and allow opening Task Group dialog
        if (parsed.isExpired === false) {
          setShowPaymentExpiredDialog(false)
          return true
        }
        // In case parsed.isExpired is missing or unexpected, be conservative: treat as expired
        setShowPaymentExpiredDialog(true)
        return false
      }
      // No stored status → treat as expired by default (user must renew)
      setShowPaymentExpiredDialog(true)
      return false
    } catch (error) {
      console.error('Error parsing payment status:', error)
      // On parse error, treat as expired to be safe
      setShowPaymentExpiredDialog(true)
      return false
    }
  }
  return (
    <>
      <StyledVerticalMenuItem
        ref={ref}
        level={level}
        isCollapsed={isCollapsed}
        isPopoutWhenCollapsed={isPopoutWhenCollapsed}
        disabled={disabled}
        buttonStyles={getMenuItemStyles('button')}
        menuItemStyles={getMenuItemStyles('root')}
        rootStyles={rootStyles}
      >
        <MenuButton
          className={classnames(menuClasses.button, { [menuClasses.active]: active }, !isCollapsed && 'gap-2')}
          component={component}
          tabIndex={disabled ? -1 : 0}
          onClick={handleCreateWorkspaceClick}
        >
          {/* Menu Item Label */}
          <StyledMenuLabel
            className={`text-white text-sm uppercase leading-1 ${active ? 'font-semibold' : 'font-normal'}`}
            rootStyles={getMenuItemStyles('label')}
            textTruncate={textTruncate}
          >
            {'Create Workspaces'}
          </StyledMenuLabel>

          {/* Menu Item Icon */}
          {renderMenuIcon({
            icon,
            level,
            active,
            disabled,
            renderExpandedMenuItemIcon,
            isBreakpointReached
          })}
        </MenuButton>
      </StyledVerticalMenuItem>
      <CreateWorkspaceDialog
        open={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        refetchWorkspaces={refetchWorkspaces}
      />
         <SubscriptionExpiredDialog
        open={showPaymentExpiredDialog}
        onClose={handleClosePaymentDialog}
        onRenew={generateRazorPayOrder}
        isLoading={isLoading}
        razorpayLoaded={razorpayLoaded}
      />
      
      {/* Trial Version Expired Popup */}
      {showTrialPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Trial Version Expired</h2>
            <p className="text-gray-600 mb-6">
              Subscribe and enjoy the premium features!
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowTrialPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTrialPopup(false)
                  // Add your subscription redirect logic here
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default forwardRef(CreateWorkspace)
