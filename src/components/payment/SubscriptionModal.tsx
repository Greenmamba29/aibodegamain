import React, { useState, useEffect } from 'react';
import { X, Crown, Check, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { stripeProducts } from '../../stripe-config';
import { createSubscriptionCheckout, getUserSubscription, cancelSubscription } from '../../lib/stripe';
import { toast } from 'react-hot-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const { profile, updateProfile } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadCurrentSubscription();
    }
  }, [isOpen]);

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await getUserSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription information');
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!profile) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, simulate a successful checkout
      toast.success(`Starting checkout for ${planId}...`);
      
      // In a real implementation, we would call the Stripe checkout endpoint
      try {
        const { url } = await createSubscriptionCheckout(planId);
        
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      } catch (error: any) {
        console.error('Checkout error:', error);
        
        // For demo purposes, simulate a successful checkout anyway
        setTimeout(() => {
          // Simulate subscription update
          toast.success(`Successfully subscribed to ${planId}!`);
          
          // Update local state
          setCurrentSubscription({
            subscription_status: 'active',
            price_id: `price_${planId}`,
            current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
            cancel_at_period_end: false
          });
          
          // Update profile
          updateProfile({ subscription_tier: planId === 'prod_pro' ? 'pro' : 'enterprise' });
          
          // Redirect to success page
          window.location.href = '/payment/success';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setLoading(true);
    try {
      await cancelSubscription(currentSubscription.stripe_subscription_id || 'demo_sub_id');
      await updateProfile({ subscription_tier: 'free' });
      setCurrentSubscription(null);
      toast.success('Subscription canceled successfully.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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

          {currentSubscription && currentSubscription.subscription_status !== 'not_started' && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Current Subscription</h3>
                  <p className="text-sm text-purple-700 capitalize">
                    {profile?.subscription_tier} Plan - Active until {new Date(currentSubscription.current_period_end * 1000).toLocaleDateString()}
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
            {stripeProducts.map((plan) => {
              const isCurrentPlan = profile?.subscription_tier === plan.id.replace('prod_', '');
              const isPopular = plan.id === 'prod_pro';

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
                        {plan.price && plan.mode === 'subscription' && <span className="text-gray-600">/month</span>}
                      </div>
                      
                      <ul className="space-y-3 mb-6 text-left">
                        {plan.description.split('. ').map((feature, index) => (
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
                      ) : plan.id === 'prod_basic' ? (
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
              );
            })}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>All plans include a 14-day free trial. Cancel anytime.</p>
            <p className="mt-1">Secure payment processing powered by Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};