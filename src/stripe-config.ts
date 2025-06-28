export interface StripeProduct {
  id: string
  priceId: string
  name: string
  description: string
  mode: 'payment' | 'subscription'
  price?: number
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SQuVpVA1J6FswT',
    priceId: 'price_1RWMd4A0StV0UO51s3jJHi3j',
    name: 'Priority Support',
    description: 'Add-on: Slack channel, response under 2h.',
    mode: 'subscription',
    price: 29.00
  },
  {
    id: 'prod_SQuVND0ZVqY3GO',
    priceId: 'price_1RWMdsA0StV0UO51j6ivoPKT',
    name: 'AI Voice Assistant',
    description: 'Add-on: Voice-enabled bot per seat (Pica + ElevenLabs).',
    mode: 'subscription',
    price: 79.00
  },
  {
    id: 'prod_SQuVVkcZMmfmBf',
    priceId: 'price_1RWMeFA0StV0UO51XHtIBLTk',
    name: 'Advanced Analytics',
    description: 'Add-on: Heatmaps, funnel tracking, insights.',
    mode: 'subscription',
    price: 79.00
  },
  {
    id: 'prod_SQuVHnLvDxSfbh',
    priceId: 'price_1RWMfGA0StV0UO51jJ3OqZgD',
    name: 'Starter',
    description: 'Starter: Basic support routing, limited messages, basic integrations. (kind)',
    mode: 'subscription',
    price: 19.99
  }
]

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId)
}

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id)
}