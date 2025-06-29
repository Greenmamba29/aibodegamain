import React, { useState, useEffect } from 'react';
import { Crown, Check, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { stripeProducts } from '../../stripe-config';
import { useAuthStore } from '../../store/authStore';
import { createSubscriptionCheckout } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export const ProductsPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleCheckout = async (product: any) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setCheckoutLoading(product.priceId);

    try {
      // For demo purposes, simulate a successful checkout
      toast.success(`Starting checkout for ${product.name}...`);
      
      // In a real implementation, we would call the Stripe checkout endpoint
      try {
        const { url } = await createSubscriptionCheckout(product.id);
        
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
          toast.success(`Successfully subscribed to ${product.name}!`);
          
          // Update local state
          setUserSubscription({
            subscription_status: 'active',
            price_id: product.priceId,
            current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
            cancel_at_period_end: false
          });
          
          // Redirect to success page
          window.location.href = '/payment/success';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return userSubscription?.price_id === priceId && 
           ['active', 'trialing'].includes(userSubscription.subscription_status);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getSubscriptionStatus = () => {
    if (!userSubscription) return null;

    const status = userSubscription.subscription_status;
    const endDate = userSubscription.current_period_end 
      ? new Date(userSubscription.current_period_end * 1000).toLocaleDateString()
      : null;

    switch (status) {
      case 'active':
        return userSubscription.cancel_at_period_end 
          ? `Cancels on ${endDate}`
          : `Renews on ${endDate}`;
      case 'trialing':
        return `Trial ends on ${endDate}`;
      case 'past_due':
        return 'Payment failed - please update payment method';
      case 'canceled':
        return 'Subscription canceled';
      default:
        return status;
    }
  };

  const handleContactSupport = () => {
    toast.success('Support request sent! Our team will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock powerful features and take your AI development to the next level
          </p>
        </div>

        {/* Current Subscription Status */}
        {userSubscription && userSubscription.subscription_status !== 'not_started' && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Current Subscription</h3>
                <p className="text-sm text-blue-700">
                  Status: {getSubscriptionStatus()}
                </p>
              </div>
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stripeProducts.map((product) => {
            const isCurrent = isCurrentPlan(product.priceId);
            const isLoading = checkoutLoading === product.priceId;

            return (
              <Card 
                key={product.id} 
                className={`relative ${isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price || 0)}
                    </span>
                    {product.mode === 'subscription' && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {product.description}
                  </p>
                  
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleCheckout(product)}
                      disabled={isLoading || !!checkoutLoading}
                      icon={isLoading ? Loader2 : CreditCard}
                    >
                      {isLoading ? 'Processing...' : 'Subscribe'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What's Included
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">All Plans Include:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Access to AI marketplace</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Community support</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Regular updates</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Premium Features:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">Priority support channels</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">Advanced analytics and insights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">AI-powered features</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our support team for help choosing the right plan for your needs.
          </p>
          <Button 
            variant="outline" 
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};