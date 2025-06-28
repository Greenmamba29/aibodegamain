import React, { useState, useEffect, useRef } from 'react'
import { Heart, Share2, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react'
import { AppCard } from '../ui/AppCard'
import { Button } from '../ui/Button'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import { usePaymentStore } from '../../store/paymentStore'
import { PaymentModal } from '../payment/PaymentModal'
import { App } from '../../lib/supabase'

export const MobileAppFeed: React.FC = () => {
  const { featuredApps, loading, fetchFeaturedApps } = useAppStore()
  const { user } = useAuthStore()
  const { purchasedApps, fetchPurchases } = usePaymentStore()
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [likedApps, setLikedApps] = useState<Set<string>>(new Set())
  const [bookmarkedApps, setBookmarkedApps] = useState<Set<string>>(new Set())
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFeaturedApps()
  }, [fetchFeaturedApps])

  useEffect(() => {
    if (user) {
      fetchPurchases()
    }
  }, [user, fetchPurchases])

  const handleAppAction = (app: App) => {
    if (app.pricing_type === 'free' || purchasedApps.has(app.id)) {
      // Open app directly
      window.open(app.app_url, '_blank')
    } else {
      // Show payment modal
      setSelectedApp(app)
      setIsPaymentModalOpen(true)
    }
  }

  const handleLike = (appId: string) => {
    setLikedApps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(appId)) {
        newSet.delete(appId)
      } else {
        newSet.add(appId)
      }
      return newSet
    })
  }

  const handleShare = (app: App) => {
    if (navigator.share) {
      navigator.share({
        title: app.title,
        text: app.description,
        url: window.location.origin + `/apps/${app.slug}`
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/apps/${app.slug}`)
      alert('Link copied to clipboard!')
    }
  }

  const handleBookmark = (appId: string) => {
    setBookmarkedApps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(appId)) {
        newSet.delete(appId)
      } else {
        newSet.add(appId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-96"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div 
        ref={feedRef}
        className="space-y-6 pb-20 max-w-md mx-auto"
        style={{ 
          scrollSnapType: 'y mandatory',
          overflowY: 'auto',
          height: '100vh'
        }}
      >
        {featuredApps.map((app, index) => (
          <div 
            key={app.id} 
            className="scroll-snap-align-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* App Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {app.developer?.avatar_url ? (
                    <img
                      src={app.developer.avatar_url}
                      alt={app.developer.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {app.developer?.full_name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {app.developer?.full_name || 'Developer'}
                    </p>
                    <p className="text-sm text-gray-500">{app.category?.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* App Image */}
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative">
                {app.logo_url ? (
                  <img
                    src={app.logo_url}
                    alt={app.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">
                        {app.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      onClick={() => handleLike(app.id)}
                    >
                      <Heart className={`w-6 h-6 ${likedApps.has(app.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      onClick={() => handleShare(app)}
                    >
                      <Share2 className="w-6 h-6 text-gray-700" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      <MessageCircle className="w-6 h-6 text-gray-700" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleBookmark(app.id)}
                  >
                    <Bookmark className={`w-6 h-6 ${bookmarkedApps.has(app.id) ? 'fill-gray-700 text-gray-700' : 'text-gray-700'}`} />
                  </Button>
                </div>

                {/* Likes count */}
                <p className="font-semibold text-gray-900 mb-2">
                  {app.downloads_count.toLocaleString()} downloads
                </p>

                {/* App info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">{app.title}</h3>
                  <p className="text-gray-600 text-sm">{app.description}</p>
                </div>

                {/* Action button */}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleAppAction(app)}
                >
                  {app.pricing_type === 'free' 
                    ? 'Try Free' 
                    : purchasedApps.has(app.id) 
                    ? 'Open App' 
                    : `Get for $${app.price}`
                  }
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedApp && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedApp(null)
          }}
          app={selectedApp}
          onSuccess={() => {
            fetchPurchases()
            if (selectedApp) {
              setTimeout(() => {
                window.open(selectedApp.app_url, '_blank')
              }, 1000)
            }
          }}
        />
      )}
    </>
  )
}