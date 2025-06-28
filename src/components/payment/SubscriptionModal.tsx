import React, { useState, useEffect } from 'react'
import { X, Crown, Check, CreditCard } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { useAuthStore } from '../../store/authStore'
import { subscriptionPlans, createSubscriptionCheckout, getUserSubscription, cancelSubscription } from '../../lib/stripe'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')
  const { user, profile, updateProfile } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      loadCurrentSubscription()
    }
  }, [isOpen])

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await getUserSubscription()
      setCurrentSubscription(subscription)
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { url } = await createSubscriptionCheckout(planId)
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return

    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    setLoading(true)
    try {
      await cancelSubscription(currentSubscription.stripe_subscription_id)
      await updateProfile({ subscription_tier: 'free' })
      setCurrentSubscription(null)
      alert('Subscription canceled successfully.')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentSubscription && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Current Subscription</h3>
                  <p className="text-sm text-purple-700 capitalize">
                    {profile?.subscription_tier} Plan - Active until {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  loading={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = profile?.subscription_tier === plan.id
              const isPopular = plan.id === 'pro'

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${isPopular ? 'ring-2 ring-purple-500' : ''} ${isCurrentPlan ? 'bg-purple-50 border-purple-200' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                        {plan.price > 0 && <span className="text-gray-600">/{plan.interval}</span>}
                      </div>
                      
                      <ul className="space-y-3 mb-6 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : plan.id === 'free' ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => updateProfile({ subscription_tier: 'free' })}
                        >
                          Downgrade to Free
                        </Button>
                      ) : (
                        <Button
                          variant={isPopular ? 'primary' : 'outline'}
                          className="w-full"
                          onClick={() => handleSubscribe(plan.id)}
                          loading={loading}
                          icon={CreditCard}
                        >
                          {currentSubscription ? 'Upgrade' : 'Subscribe'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>All plans include a 14-day free trial. Cancel anytime.</p>
            <p className="mt-1">Secure payment processing powered by Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  )
}