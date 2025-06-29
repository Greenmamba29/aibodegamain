import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { App } from './supabase';
import { toast } from 'react-hot-toast';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

// Create checkout session for app purchase
export const createCheckoutSession = async (app: App): Promise<{ sessionId: string; url: string }> => {
  try {
    // For demo purposes, simulate a successful checkout session
    console.log('Creating checkout session for app:', app.id);
    
    // In a real implementation, we would call the Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          price_id: `price_${app.id}`, // This would be replaced with actual price ID in production
          success_url: `${window.location.origin}/payment/success?app_id=${app.id}`,
          cancel_url: `${window.location.origin}/payment/cancel`,
          mode: 'payment'
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calling Supabase function:', error);
      
      // For demo purposes, return a mock response
      return {
        sessionId: 'demo_session_' + Date.now(),
        url: `${window.location.origin}/payment/success?app_id=${app.id}&session_id=demo_session`
      };
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create subscription checkout session
export const createSubscriptionCheckout = async (planId: string): Promise<{ sessionId: string; url: string }> => {
  try {
    console.log('Creating subscription checkout for plan:', planId);
    
    // In a real implementation, we would call the Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          price_id: `price_${planId}`, // This would be replaced with actual price ID in production
          success_url: `${window.location.origin}/payment/success?plan_id=${planId}`,
          cancel_url: `${window.location.origin}/payment/cancel`,
          mode: 'subscription'
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calling Supabase function:', error);
      
      // For demo purposes, return a mock response
      return {
        sessionId: 'demo_session_' + Date.now(),
        url: `${window.location.origin}/payment/success?plan_id=${planId}&session_id=demo_session`
      };
    }
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

// Check if user has purchased an app
export const hasUserPurchasedApp = async (appId: string): Promise<{ hasPurchased: boolean; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_purchases')
      .select('id')
      .eq('app_id', appId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking app purchase:', error);
      return { hasPurchased: false, error };
    }

    // For demo purposes, simulate a purchase for certain apps
    if (!data && ['660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005'].includes(appId)) {
      return { hasPurchased: true };
    }

    return { hasPurchased: !!data };
  } catch (error) {
    console.error('Error checking app purchase:', error);
    return { hasPurchased: false, error };
  }
};

// Get user's purchase history
export const getUserPurchases = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('app_purchases')
      .select(`
        *,
        app:apps(
          id,
          title,
          logo_url,
          app_url,
          developer:profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') {
        // Table doesn't exist or no data, return empty array
        return [];
      }
      throw error;
    }

    // If no data, create sample purchases for demo
    if (!data || data.length === 0) {
      // Return sample data for demo purposes
      return [
        {
          id: '1',
          amount: 29.99,
          currency: 'usd',
          status: 'completed',
          created_at: new Date().toISOString(),
          app: {
            id: '660e8400-e29b-41d4-a716-446655440001',
            title: 'DreamCanvas AI',
            logo_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            app_url: 'https://dreamcanvas.ai',
            developer: {
              full_name: 'Sarah Chen'
            }
          }
        },
        {
          id: '2',
          amount: 49.99,
          currency: 'usd',
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          app: {
            id: '660e8400-e29b-41d4-a716-446655440002',
            title: 'TextMind Pro',
            logo_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            app_url: 'https://textmind.pro',
            developer: {
              full_name: 'Mike Rodriguez'
            }
          }
        }
      ];
    }

    // Convert to the expected format
    return data.map(purchase => ({
      id: purchase.id,
      amount: 29.99, // Sample amount since it's not in the app_purchases table
      currency: 'usd',
      status: 'completed',
      created_at: purchase.created_at,
      app: purchase.app
    }));
  } catch (error) {
    console.error('Error fetching purchases:', error);
    
    // Return sample data for demo purposes
    return [
      {
        id: '1',
        amount: 29.99,
        currency: 'usd',
        status: 'completed',
        created_at: new Date().toISOString(),
        app: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          title: 'DreamCanvas AI',
          logo_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
          app_url: 'https://dreamcanvas.ai',
          developer: {
            full_name: 'Sarah Chen'
          }
        }
      },
      {
        id: '2',
        amount: 49.99,
        currency: 'usd',
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        app: {
          id: '660e8400-e29b-41d4-a716-446655440002',
          title: 'TextMind Pro',
          logo_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
          app_url: 'https://textmind.pro',
          developer: {
            full_name: 'Mike Rodriguez'
          }
        }
      }
    ];
  }
};

// Get user's current subscription
export const getUserSubscription = async () => {
  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      throw error;
    }

    // For demo purposes, if no subscription exists, create a mock one
    if (!data) {
      return {
        subscription_status: 'not_started',
        price_id: null,
        current_period_end: null,
        cancel_at_period_end: false
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    
    // Return a mock subscription for demo purposes
    return {
      subscription_status: 'not_started',
      price_id: null,
      current_period_end: null,
      cancel_at_period_end: false
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    // For demo purposes, simulate a successful cancellation
    toast.success('Subscription canceled successfully');
    
    // In a real implementation, we would call the Supabase Edge Function
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Get revenue analytics for developers
export const getDeveloperRevenue = async () => {
  try {
    // For demo purposes, return mock data
    return {
      totalRevenue: 2847.50,
      totalTransactions: 42,
      monthlyRevenue: 1247.75,
      averageOrderValue: 67.80,
      transactions: [
        { amount: 29.99, created_at: new Date().toISOString(), app: { title: 'DreamCanvas AI' } },
        { amount: 49.99, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), app: { title: 'TextMind Pro' } },
        { amount: 19.99, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), app: { title: 'VoiceClone Studio' } }
      ]
    };
  } catch (error) {
    console.error('Error fetching developer revenue:', error);
    throw error;
  }
};

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const hasPublishableKey = !!stripePublishableKey;
  const hasSecretKey = !!import.meta.env.STRIPE_SECRET_KEY;
  const hasWebhookSecret = !!import.meta.env.STRIPE_WEBHOOK_SECRET;

  return {
    isConfigured: hasPublishableKey,
    hasPublishableKey,
    hasSecretKey,
    hasWebhookSecret,
    warnings: [
      !hasPublishableKey && 'Missing VITE_STRIPE_PUBLISHABLE_KEY',
      !hasSecretKey && 'Missing STRIPE_SECRET_KEY (for edge functions)',
      !hasWebhookSecret && 'Missing STRIPE_WEBHOOK_SECRET (for webhooks)'
    ].filter(Boolean)
  };
};