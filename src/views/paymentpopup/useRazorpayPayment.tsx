import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
interface UseRazorpayPaymentProps {
  userId: number
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayError {
  error: {
    metadata?: {
      payment_id?: string
      paymentId?: string
      order_id?: string
      orderId?: string
    }
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export const useRazorpayPayment = ({ userId, onPaymentSuccess, onPaymentFailure }: UseRazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [scriptLoadAttempts, setScriptLoadAttempts] = useState(0)
  const logoImage = 'https://appsuresolutions.netlify.app/assets/header_logo-Bj3Dgdu3.svg'

  // Improved script loading with retry mechanism
  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const scriptId = 'razorpay-sdk'
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement
      
      // If script is already loaded and Razorpay is available
      if (existingScript && window.Razorpay) {
        setRazorpayLoaded(true)
        resolve()
        return
      }
      
      // If script exists but Razorpay is not available yet, wait for it
      if (existingScript) {
        const checkRazorpay = () => {
          if (window.Razorpay) {
            setRazorpayLoaded(true)
            resolve()
          } else {
            setTimeout(checkRazorpay, 100)
          }
        }
        setTimeout(checkRazorpay, 100)
        return
      }

      // Create and load new script
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        // Give some time for Razorpay to initialize
        const checkLoad = () => {
          if (window.Razorpay) {
            setRazorpayLoaded(true)
            setScriptLoadAttempts(0)
            resolve()
          } else {
            // If not loaded yet, wait more
            setTimeout(checkLoad, 100)
          }
        }
        setTimeout(checkLoad, 100)
      }
      
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK')
        // Remove failed script
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
        
        // Retry up to 3 times
        if (scriptLoadAttempts < 3) {
          setScriptLoadAttempts(prev => prev + 1)
          setTimeout(() => {
            loadRazorpayScript().then(resolve).catch(reject)
          }, 1000 * scriptLoadAttempts) // Exponential backoff
        } else {
          setRazorpayLoaded(false)
          reject(new Error('Failed to load Razorpay SDK after 3 attempts'))
        }
      }
      
      document.body.appendChild(script)
    })
  }, [scriptLoadAttempts])

  // Load Razorpay SDK once with retry capability
  useEffect(() => {
    let mounted = true
    
    const initializeRazorpay = async () => {
      try {
        await loadRazorpayScript()
        if (mounted) {
          setRazorpayLoaded(true)
        }
      } catch (error) {
        console.error('Failed to initialize Razorpay:', error)
        if (mounted) {
          setRazorpayLoaded(false)
        }
      }
    }
    
    initializeRazorpay()
    
    return () => {
      mounted = false
    }
  }, [loadRazorpayScript])
const paymentcheck = async () => {
  const Baseurl = process.env.NEXT_PUBLIC_API_URL1
  const userid = localStorage.getItem('userData')
  const value= JSON.parse(userid as string)
  try {
    const res = await axios.post(`${Baseurl}/CheckAccountExpiry/${value?.userData?.UserID}`)

    
    if (res.data && res.data.length > 0) {
      const paymentData = {
       isExpired: res.data[0].isExpired,
       projectCount:res.data[0].projectCount,
       workspaceCount:res.data[0].workspaceCount,
       taskGroupCount:res.data[0].taskGroupCount,
       boardCount:res.data[0].boardCount,
       boardsectionCount:res.data[0].boardsectionCount,
       boardTaskCount:res.data[0].boardTaskCount,
       amount:res.data[0].amount
            //  isExpired: true
      }
      // localStorage.setItem('paymentStatus', JSON.stringify(paymentData))
            localStorage.setItem('paymentStatus', JSON.stringify(paymentData))


    }
  } catch (error) {
    console.error('Payment check error:', error)
  }
}
  const updatePaymentConfirmation = async (
    userIdParam: number,
    paymentId?: string | null,
    status: string = ''
  ) => {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL1}/UpdatePaymentconfirmation`
      const params = new URLSearchParams()
      params.append('UserID', String(userIdParam))
      params.append('PaymentID', paymentId ?? '')

      const url = `${baseUrl}?${params.toString()}`

      const resp = await fetch(url, {
        method: 'POST'
      })

      const text = await resp.text()

      const isExpired = status !== 'Success'
      // const paymentData = {
      //   isExpired
      // }

      paymentcheck()
      // localStorage.setItem('paymentStatus', JSON.stringify(paymentData))

      return { ok: resp.ok, status: resp.status, body: text }
    } catch (err) {
      console.error('Error calling UpdatePaymentconfirmation:', err)
      const paymentData = {
        isExpired: true
      }
      try {
        localStorage.setItem('paymentStatus', JSON.stringify(paymentData))
      } catch (e) {
        console.error('Error saving paymentStatus to localStorage on failure:', e)
      }
      return { ok: false, error: err }
    }
  }

  const openRazorPaySdk = async (razorPayOrderId: string, amount: number) => {
    // Ensure Razorpay is loaded before proceeding
    if (!razorpayLoaded || !window.Razorpay) {
    
      try {
        setIsLoading(true)
        await loadRazorpayScript()
      } catch (error) {
        console.error('Failed to load Razorpay SDK:', error)
        alert('Unable to load payment gateway. Please check your internet connection and try again.')
        setIsLoading(false)
        return
      }
    }

    setIsLoading(false)
    setPaymentStatus('')

    const options = {
      key: 'rzp_test_S2PQXDlmtoFOad',
      name: 'Your Company Name',
      description: 'Subscription Payment',
      image: logoImage,
      order_id: razorPayOrderId,
      handler: function (response: RazorpayResponse) {
        setPaymentStatus('Payment Successful!')
        toast.success('Payment successful! Subscription activated.')

        updatePaymentConfirmation(userId, response.razorpay_payment_id, 'Success')
          .then(res => {
            onPaymentSuccess?.()
          })
          .catch(err => {
            console.error('Error updating payment confirmation after success:', err)
            try {
              localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: false }))
              onPaymentSuccess?.()
            } catch (e) {
              console.error('Failed to write local payment status after success fallback:', e)
            }
          })
      },
      modal: {
        confirm_close: true,
        ondismiss: async (reason: any) => {
          const dismissReason = reason === undefined ? 'cancelled' : reason

          if (reason === undefined) {
            setPaymentStatus('Payment Cancelled')
            toast.error('Payment cancelled. Please complete the payment to activate your subscription.')

            updatePaymentConfirmation(userId, '', 'Cancelled')
              .then(res => {
                onPaymentFailure?.()
              })
              .catch(err => {
                console.error('Error updating cancellation confirmation:', err)
                try {
                  localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
                  onPaymentFailure?.()
                } catch (e) {
                  console.error('Error writing cancel fallback to localStorage:', e)
                }
              })
          } else if (reason === 'timeout') {
            setPaymentStatus('Payment Timed Out')
            toast.error('Payment timed out. Please try again.')

            updatePaymentConfirmation(userId, '', 'Timeout')
              .then(res => {
                onPaymentFailure?.()
              })
              .catch(err => {
                console.error('Error updating timeout confirmation:', err)
                try {
                  localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
                  onPaymentFailure?.()
                } catch (e) {
                  console.error('Error writing timeout fallback to localStorage:', e)
                }
              })
          } else {
            setPaymentStatus('Payment Failed')
            toast.error('Payment failed. Please check your payment details and try again.')

            updatePaymentConfirmation(userId, '', 'Failed')
              .then(res => {
                onPaymentFailure?.()
              })
              .catch(err => {
                console.error('Error updating failure confirmation:', err)
                try {
                  localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
                  onPaymentFailure?.()
                } catch (e) {
                  console.error('Error writing failure fallback to localStorage:', e)
                }
              })
          }
        }
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9042531799'
      },
      theme: {
        color: '#e59722'
      }
    }

    try {
      const rzp1 = new window.Razorpay(options)

      rzp1.on('payment.failed', function (response: RazorpayError) {
        setIsLoading(false)
        setPaymentStatus('Payment Failed')
        toast.error('Payment failed. Please check your payment details and try again.')

        const failedPaymentId =
          response?.error?.metadata?.payment_id ?? response?.error?.metadata?.paymentId ?? ''

        updatePaymentConfirmation(userId, failedPaymentId, 'Failed')
          .then(res => {
            onPaymentFailure?.()
          })
          .catch(err => {
            console.error('Error updating failed payment confirmation:', err)
            try {
              localStorage.setItem('paymentStatus', JSON.stringify({ isExpired: true }))
              onPaymentFailure?.()
            } catch (e) {
              console.error('Error writing failed fallback to localStorage:', e)
            }
          })
      })

      rzp1.open()
    } catch (error) {
      console.error('Error opening Razorpay:', error)
      toast.error('Error initializing payment gateway. Please try again.')
    }
  }

  const generateRazorPayOrder = async () => {
    // Check and ensure Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      try {
        setIsLoading(true)
        await loadRazorpayScript()
      } catch (error) {
        console.error('Failed to load Razorpay SDK:', error)
        toast.error('Unable to load payment gateway. Please check your internet connection.')
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setPaymentStatus('')

    try {
      const formData = new FormData()
            const value = localStorage.getItem('paymentStatus')
            const parsed = JSON.parse(value as string)
            const finalamount = (parsed.amount *100)
      formData.append('amount', finalamount.toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL1}/GenerateRazorID/`, {
        method: 'POST',
        headers: {},
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setIsLoading(false)

      if (data && data.id) {
        openRazorPaySdk(data.id, 30)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('generateRazorPayOrder Error:', error)
      setPaymentStatus('Error generating order')
      setIsLoading(false)
      toast.error('Failed to create payment order. Please try again.')
    }
  }

  return {
    isLoading,
    razorpayLoaded,
    paymentStatus,
    generateRazorPayOrder
  }
}
