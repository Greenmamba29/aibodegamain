import React, { useEffect } from 'react'
import { CheckCircle, Crown, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { useAuthStore } from '../../store/authStore'

export const SubscriptionSuccess: React.FC = () => {
  const { profile, updateProfile } = useAuthStore()

  useEffect(() => {
    // Refresh profile to get updated subscription status
    const refreshProfile = async () => {
      try {
        // The webhook should have already updated the profile
        // but we can refresh it to be sure
        window.location.reload()
      } catch (error) {
        console.error('Error refreshing profile:', error)
      }
    }

    // Delay to allow webhook processing
    setTimeout(refreshProfile, 2000)
  }, [])

  const getPlanFeatures = (tier: string) => {
    switch (tier) {
      case 'pro':
        return [
          'Priority support',
          'Advanced analytics',
          'Early access to new features',
          'Remove ads',
          'Unlimited app downloads'
        ]
      case 'enterprise':
        return [
          'Everything in Pro',
          'Custom integrations',
          'Dedicated support',
          'White-label options',
          'Advanced security',
          'Custom analytics'
        ]
      default:
        return []
    }
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
              Welcome to {profile?.subscription_tier?.toUpperCase()}!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your subscription has been activated successfully. You now have access to all premium features.
            </p>

            <div className="flex items-center justify-center space-x-2 mb-8">
              <Crown className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold text-purple-600">
                {profile?.subscription_tier?.toUpperCase()} Member
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Premium Features:</h3>
              <ul className="space-y-2 text-left">
                {getPlanFeatures(profile?.subscription_tier || '').map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
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
                onClick={() => window.location.href = '/settings'}
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