export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_basic',
    priceId: 'price_basic',
    name: 'Basic Plan',
    description: 'Access to all free apps and basic features',
    mode: 'subscription',
    price: 0
  },
  {
    id: 'prod_pro',
    priceId: 'price_pro',
    name: 'Pro Plan',
    description: 'Unlimited downloads, priority support, and premium features',
    mode: 'subscription',
    price: 9.99
  },
  {
    id: 'prod_enterprise',
    priceId: 'price_enterprise',
    name: 'Enterprise Plan',
    description: 'Custom integrations, dedicated support, and advanced analytics',
    mode: 'subscription',
    price: 29.99
  },
  {
    id: 'prod_lifetime',
    priceId: 'price_lifetime',
    name: 'Lifetime Access',
    description: 'One-time payment for lifetime access to all premium features',
    mode: 'payment',
    price: 199.99
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};