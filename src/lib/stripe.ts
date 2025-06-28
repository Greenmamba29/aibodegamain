import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { App } from './supabase';

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
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId: `price_${app.id}`, // This would be replaced with actual price ID in production
        successUrl: `${window.location.origin}/payment/success?app_id=${app.id}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create subscription checkout session
export const createSubscriptionCheckout = async (planId: string): Promise<{ sessionId: string; url: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId: `price_${planId}`, // This would be replaced with actual price ID in production
        successUrl: `${window.location.origin}/payment/success?plan_id=${planId}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

// Check if user has purchased an app
export const hasUserPurchasedApp = async (appId: string): Promise<{ hasPurchased: boolean; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('app_id', appId)
      .eq('status', 'completed')
      .maybeSingle();

    return { hasPurchased: !!data, error };
  } catch (error) {
    console.error('Error checking app purchase:', error);
    return { hasPurchased: false, error };
  }
};

// Get user's purchase history
export const getUserPurchases = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
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
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
};

// Get user's current subscription
export const getUserSubscription = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Get revenue analytics for developers
export const getDeveloperRevenue = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        created_at,
        app:apps!inner(
          id,
          title,
          developer_id
        )
      `)
      .eq('app.developer_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate revenue stats
    const totalRevenue = data?.reduce((sum, t) => sum + (t.amount * 0.7), 0) || 0; // 70% revenue share
    const totalTransactions = data?.length || 0;
    
    // Group by month for charts
    const monthlyRevenue = data?.reduce((acc, transaction) => {
      const month = new Date(transaction.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + (transaction.amount * 0.7);
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalRevenue,
      totalTransactions,
      monthlyRevenue,
      transactions: data || []
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