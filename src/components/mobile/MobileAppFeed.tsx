import React, { useState, useEffect, useRef } from 'react'
import { Plus, ExternalLink, ShoppingCart } from 'lucide-react'
import { Button } from '../ui/Button'
import { MobileContentCard } from './MobileContentCard'
import { UserContentCreator, UserContent } from '../ui/UserContentCreator'
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
  const [isContentCreatorOpen, setIsContentCreatorOpen] = useState(false)
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
    if (!user) {
      alert('Please sign in to purchase apps')
      return
    }

    if (app.pricing_type === 'free' || purchasedApps.has(app.id)) {
      // Open app directly
      if (app.app_url) {
        window.open(app.app_url, '_blank')
      } else {
        alert('App URL not available')
      }
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

  const handleContentSubmit = (content: UserContent) => {
    console.log('User content submitted:', content)
    // Here you would typically save the content to your backend
    alert('Content posted successfully!')
  }

  const handlePurchaseSuccess = () => {
    if (selectedApp) {
      // Refresh purchases to update the UI
      fetchPurchases()
      // Open app after purchase
      setTimeout(() => {
        if (selectedApp.app_url) {
          window.open(selectedApp.app_url, '_blank')
        }
      }, 1000)
    }
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
        {featuredApps.map((app, index) => (
          <MobileContentCard
            key={app.id}
            app={app}
            onLike={handleLike}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onAction={handleAppAction}
            isLiked={likedApps.has(app.id)}
            isBookmarked={bookmarkedApps.has(app.id)}
            getActionButtonText={getActionButtonText}
            getActionButtonIcon={getActionButtonIcon}
          />
        ))}
      </div>

      {/* Floating Create Content Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={() => setIsContentCreatorOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
        >
        </Button>
      </div>

      {/* User Content Creator Modal */}
      <UserContentCreator
        isOpen={isContentCreatorOpen}
        onClose={() => setIsContentCreatorOpen(false)}
        onSubmit={handleContentSubmit}
      />

      {/* Payment Modal */}
      {selectedApp && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedApp(null)
          }}
          app={selectedApp}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </>
  )
}