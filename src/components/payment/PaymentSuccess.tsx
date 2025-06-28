import React, { useEffect, useState } from 'react'
import { CheckCircle, Crown, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { getProductByPriceId } from '../../stripe-config'

export const PaymentSuccess: React.FC = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')

    if (sessionId) {
      // Wait a moment for webhook processing
      setTimeout(() => {
        fetchSubscriptionData()
      }, 3000)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
        return
      }

      if (data && data.price_id) {
        setSubscription(data)
        const productInfo = getProductByPriceId(data.price_id)
        setProduct(productInfo)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing your subscription...
            </h2>
            <p className="text-gray-600">
              Please wait while we set up your account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to {product?.name || 'Premium'}!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your subscription has been activated successfully. You now have access to all premium features.
            </p>

            {product && (
              <div className="flex items-center justify-center space-x-2 mb-8">
                <Crown className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-semibold text-purple-600">
                  {product.name} Subscriber
                </span>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Access to priority support channels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics and insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered features and tools</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Early access to new features</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                icon={ArrowRight}
                onClick={() => window.location.href = '/'}
              >
                Start Exploring
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/account'}
              >
                Manage Subscription
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              You can manage your subscription anytime in your account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}