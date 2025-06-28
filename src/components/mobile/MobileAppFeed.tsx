import React, { useState, useEffect, useRef } from 'react'
import { Heart, Share2, MessageCircle, Bookmark, MoreHorizontal, ExternalLink, ShoppingCart } from 'lucide-react'
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

  const getActionButtonText = (app: App) => {
    if (app.pricing_type === 'free') return 'Try Free'
    if (purchasedApps.has(app.id)) return 'Open App'
    return `Get for $${app.price}`
  }

  const getActionButtonIcon = (app: App) => {
    if (app.pricing_type === 'free' || purchasedApps.has(app.id)) {
      return ExternalLink
    }
    return ShoppingCart
  }

  if (loading) {
    return (
      <div className="space-y-0 pb-20">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse h-screen bg-gray-200"></div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div 
        ref={feedRef}
        className="snap-y snap-mandatory overflow-y-auto h-screen pb-20"
        style={{ scrollBehavior: 'smooth' }}
      >
        {featuredApps.map((app, index) => {
          const ActionIcon = getActionButtonIcon(app)
          
          return (
            <div 
              key={app.id} 
              className="snap-start h-screen relative flex flex-col"
            >
              {/* App Background/Image */}
              <div className="flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-black">
                {app.screenshots && app.screenshots[0] ? (
                  <img
                    src={app.screenshots[0]}
                    alt={app.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center">
                      <span className="text-white font-bold text-6xl">
                        {app.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              </div>

              {/* Header */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  {app.developer?.avatar_url ? (
                    <img
                      src={app.developer.avatar_url}
                      alt={app.developer.full_name}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white font-semibold text-sm">
                        {app.developer?.full_name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {app.developer?.full_name || 'Developer'}
                    </p>
                    <p className="text-white/80 text-xs">{app.category?.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2 text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* Side Actions */}
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-10">
                <button
                  onClick={() => handleLike(app.id)}
                  className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <Heart className={`w-6 h-6 ${likedApps.has(app.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                
                <button
                  onClick={() => handleShare(app)}
                  className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <Share2 className="w-6 h-6 text-white" />
                </button>
                
                <button
                  className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => handleBookmark(app.id)}
                  className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <Bookmark className={`w-6 h-6 ${bookmarkedApps.has(app.id) ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{app.title}</h3>
                  <p className="text-white/90 text-sm mb-3 line-clamp-2">{app.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
                    <span>{app.downloads_count.toLocaleString()} downloads</span>
                    <span>⭐ {app.rating_average.toFixed(1)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.pricing_type === 'free' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {app.pricing_type === 'free' ? 'Free' : `$${app.price}`}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full bg-white text-black hover:bg-gray-100 font-semibold"
                    onClick={() => handleAppAction(app)}
                    icon={ActionIcon}
                  >
                    {getActionButtonText(app)}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
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