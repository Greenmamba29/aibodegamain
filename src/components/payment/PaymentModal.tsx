import React, { useState, useEffect } from 'react'
import { X, CreditCard, Lock, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../store/authStore'
import { createAppPaymentIntent, purchaseApp, hasUserPurchasedApp } from '../../lib/stripe'
import { App } from '../../lib/supabase'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  app: App
  onSuccess?: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  app,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [hasPurchased, setHasPurchased] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })
  const { user } = useAuthStore()

  useEffect(() => {
    if (isOpen && app.id) {
      checkPurchaseStatus()
    }
  }, [isOpen, app.id])

  const checkPurchaseStatus = async () => {
    setLoading(true)
    try {
      const { hasPurchased } = await hasUserPurchasedApp(app.id)
      setHasPurchased(hasPurchased)
    } catch (error) {
      console.error('Error checking purchase status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setProcessing(true)
    setError('')

    try {
      // In a real implementation, you would use Stripe Elements
      // For demo purposes, we'll simulate the payment process
      
      // Create payment intent
      const paymentIntent = await createAppPaymentIntent(app.id, app.price)
      
      // Process payment (simplified for demo)
      await purchaseApp(app.id, 'pm_demo_payment_method')
      
      // Success
      setHasPurchased(true)
      onSuccess?.()
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasPurchased ? 'Already Purchased' : 'Purchase App'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Checking purchase status...</p>
            </div>
          ) : hasPurchased ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Purchased!</h3>
              <p className="text-gray-600 mb-6">You already own this app. You can access it anytime.</p>
              <Button onClick={() => window.open(app.app_url, '_blank')}>
                Open App
              </Button>
            </div>
          ) : (
            <>
              {/* App Details */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  {app.logo_url ? (
                    <img src={app.logo_url} alt={app.title} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <span className="text-purple-600 font-semibold text-lg">{app.title.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.title}</h3>
                  <p className="text-sm text-gray-600">{app.description}</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">${app.price}</p>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Lock className="w-4 h-4" />
                  <span>Secured by Stripe</span>
                </div>

                <Input
                  label="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />

                <Input
                  label="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  <Input
                    label="CVC"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={processing}
                  icon={CreditCard}
                >
                  {processing ? 'Processing...' : `Pay $${app.price}`}
                </Button>
              </form>

              <div className="mt-6 text-xs text-gray-500 text-center">
                <p>By purchasing, you agree to our Terms of Service and Privacy Policy.</p>
                <p className="mt-1">Secure payment processing powered by Stripe.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}