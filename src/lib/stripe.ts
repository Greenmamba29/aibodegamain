import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
}

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
  popular?: boolean
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Browse all apps',
      'Basic support',
      'Community access',
      'Limited downloads per month'
    ],
    stripePriceId: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Everything in Free',
      'Unlimited downloads',
      'Priority support',
      'Advanced analytics',
      'Early access to new features',
      'Remove ads',
      'Premium app access'
    ],
    stripePriceId: 'price_pro_monthly',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Advanced security',
      'Custom analytics dashboard',
      'API access',
      'Team management'
    ],
    stripePriceId: 'price_enterprise_monthly'
  }
]

// Create payment intent for app purchase
export const createAppPaymentIntent = async (appId: string, amount: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        type: 'app_purchase',
        appId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd'
      }
    })

    if (error) throw error
    return data as PaymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Create subscription checkout session
export const createSubscriptionCheckout = async (planId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        type: 'subscription',
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Process app purchase
export const purchaseApp = async (appId: string, paymentMethodId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        type: 'app_purchase',
        appId,
        paymentMethodId
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error processing app purchase:', error)
    throw error
  }
}

// Get user's purchase history
export const getUserPurchases = async () => {
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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return []
  }
}

// Check if user has purchased an app
export const hasUserPurchasedApp = async (appId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('app_id', appId)
      .eq('status', 'completed')
      .single()

    return { hasPurchased: !!data, error }
  } catch (error) {
    return { hasPurchased: false, error }
  }
}

// Get user's current subscription
export const getUserSubscription = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Get revenue analytics for developers
export const getDeveloperRevenue = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

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
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate revenue stats
    const totalRevenue = data?.reduce((sum, t) => sum + (t.amount * 0.7), 0) || 0 // 70% revenue share
    const totalTransactions = data?.length || 0
    
    // Group by month for charts
    const monthlyRevenue = data?.reduce((acc, transaction) => {
      const month = new Date(transaction.created_at).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + (transaction.amount * 0.7)
      return acc
    }, {} as Record<string, number>) || {}

    return {
      totalRevenue,
      totalTransactions,
      monthlyRevenue,
      transactions: data || []
    }
  } catch (error) {
    console.error('Error fetching developer revenue:', error)
    throw error
  }
}

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const hasPublishableKey = !!stripePublishableKey
  const hasSecretKey = !!import.meta.env.STRIPE_SECRET_KEY
  const hasWebhookSecret = !!import.meta.env.STRIPE_WEBHOOK_SECRET

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
  }
}