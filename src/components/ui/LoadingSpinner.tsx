import React from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTranslation } from '../../hooks/useTranslation'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const { t } = useTranslation();
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-purple-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{t(text) || text}</p>
      )}
    </div>
  )
}

// Full page loading component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'loading' }) => {
  const { t } = useTranslation();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text || t('loading')} />
    </div>
  )
}

// Skeleton loading components
export const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}