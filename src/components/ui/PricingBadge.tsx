import React from 'react'
import { Crown, Check } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

interface PricingBadgeProps {
  pricingType: 'free' | 'one_time' | 'subscription' | 'freemium'
  price: number
  isPurchased?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PricingBadge: React.FC<PricingBadgeProps> = ({
  pricingType,
  price,
  isPurchased = false,
  size = 'md',
  className = ''
}) => {
  const { t } = useTranslation();
  
  const getBadgeContent = () => {
    if (isPurchased) {
      return {
        text: t('owned'),
        className: 'bg-blue-100 text-blue-800',
        icon: <Check className="w-3 h-3" />
      }
    }

    switch (pricingType) {
      case 'free':
        return {
          text: t('free'),
          className: 'bg-green-100 text-green-800',
          icon: null
        }
      case 'freemium':
        return {
          text: t('freemium'),
          className: 'bg-purple-100 text-purple-800',
          icon: <Crown className="w-3 h-3" />
        }
      case 'subscription':
        return {
          text: `$${price}/mo`,
          className: 'bg-orange-100 text-orange-800',
          icon: <Crown className="w-3 h-3" />
        }
      case 'one_time':
      default:
        return {
          text: `$${price}`,
          className: 'bg-purple-100 text-purple-800',
          icon: null
        }
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  const badge = getBadgeContent()

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full font-medium
      ${badge.className}
      ${sizeClasses[size]}
      ${className}
    `}>
      {badge.icon}
      <span>{badge.text}</span>
    </span>
  )
}