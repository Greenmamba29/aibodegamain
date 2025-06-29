import React from 'react'
import { Star, Download, ExternalLink, Github, Globe, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { FollowButton } from './FollowButton'
import { PricingBadge } from './PricingBadge'
import { App } from '../../lib/supabase'

interface AppCardProps {
  app: App
  onAction?: (app: App) => void
  onLike?: (appId: string) => void
  onShare?: (app: App) => void
  isPurchased?: boolean
  isLiked?: boolean
  variant?: 'default' | 'mobile' | 'compact'
  className?: string
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onAction,
  onLike,
  onShare,
  isPurchased = false,
  isLiked = false,
  variant = 'default',
  className = ''
}) => {
  const { t } = useTranslation();
  
  const getActionButtonText = () => {
    if (app.pricing_type === 'free') return t('try_free')
    if (isPurchased) return t('open_app')
    return `${t('buy')} $${app.price}`
  }

  const getActionButtonIcon = () => {
    if (app.pricing_type === 'free' || isPurchased) {
      return ExternalLink
    }
    return ShoppingCart
  }

  const ActionIcon = getActionButtonIcon()

  if (variant === 'mobile') {
    return (
      <Card className={`w-full max-w-sm mx-auto overflow-hidden ${className}`}>
        {/* App Image/Logo */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative">
          {app.logo_url ? (
            <img
              src={app.logo_url}
              alt={app.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {app.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
          
          {/* Pricing badge */}
          <div className="absolute top-4 right-4">
            <PricingBadge
              pricingType={app.pricing_type}
              price={app.price}
              isPurchased={isPurchased}
            />
          </div>

          {/* Action buttons overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              onClick={() => onAction?.(app)}
              icon={ActionIcon}
            >
              {getActionButtonText()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-white/50 text-gray-900 hover:bg-white px-3"
              onClick={() => onLike?.(app.id)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-white/50 text-gray-900 hover:bg-white px-3"
              onClick={() => onShare?.(app)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* App Info */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {app.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{app.rating_average.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {app.description}
          </p>
          
          {/* Developer info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {app.developer?.avatar_url ? (
                <img
                  src={app.developer.avatar_url}
                  alt={app.developer.full_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {app.developer?.full_name?.charAt(0) || 'D'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                {app.developer?.full_name || t('developer')}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Download className="w-3 h-3" />
              <span>{app.downloads_count.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default desktop variant
  return (
    <Card hover className={`h-full overflow-hidden ${className}`}>
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-xl flex items-center justify-center relative">
        {app.logo_url ? (
          <img
            src={app.logo_url}
            alt={app.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {app.title.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Pricing badge */}
        <div className="absolute top-3 right-3">
          <PricingBadge
            pricingType={app.pricing_type}
            price={app.price}
            isPurchased={isPurchased}
          />
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
            {app.title}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{app.rating_average.toFixed(1)}</span>
            <span className="text-gray-300">({app.rating_count})</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {app.description}
        </p>
        
        {/* Developer info with follow button */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {app.developer?.avatar_url ? (
              <img
                src={app.developer.avatar_url}
                alt={app.developer.full_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {app.developer?.full_name?.charAt(0) || 'D'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {app.developer?.full_name || t('developer')}
              </p>
              <p className="text-xs text-gray-500">
                {app.developer?.followers_count || 0} followers
              </p>
            </div>
          </div>
          
          {app.developer && (
            <FollowButton
              userId={app.developer.id}
              size="sm"
              variant="outline"
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{app.downloads_count.toLocaleString()}</span>
            </div>
            {app.category && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {app.category.name}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={() => onAction?.(app)}
            icon={ActionIcon}
          >
            {getActionButtonText()}
          </Button>
          
          <div className="flex space-x-1">
            {app.demo_url && (
              <Button 
                variant="outline" 
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(app.demo_url, '_blank')}
                className="px-3"
              />
            )}
            {app.github_url && (
              <Button 
                variant="outline" 
                size="sm"
                icon={Github}
                onClick={() => window.open(app.github_url, '_blank')}
                className="px-3"
              />
            )}
            {app.repository_url && (
              <Button 
                variant="outline" 
                size="sm"
                icon={Globe}
                onClick={() => window.open(app.repository_url, '_blank')}
                className="px-3"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}