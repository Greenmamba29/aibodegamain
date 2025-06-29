import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/home/Hero'
import { FeaturedApps } from './components/home/FeaturedApps'
import { Categories } from './components/home/Categories'
import { Collections } from './components/home/Collections'
import { DeveloperPortal } from './components/developer/DeveloperPortal'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { ProductsPage } from './components/payment/ProductsPage'
import { PaymentSuccess } from './components/payment/PaymentSuccess'
import { PaymentCancel } from './components/payment/PaymentCancel'
import { PurchaseHistoryPage } from './components/payment/PurchaseHistoryPage'
import { MobilePage } from './components/mobile/MobilePage'
import { ProfileView } from './components/developer/ProfileView'
import { DeveloperSettings } from './components/developer/DeveloperSettings'
import { AuthModal } from './components/auth/AuthModal'
import { PageLoader } from './components/ui/LoadingSpinner'
import { useAuthStore } from './store/authStore'
import { useAppStore } from './store/appStore'
import { realtimeManager } from './lib/realtime'
import { updateMetaTags } from './utils/seo'
import { AIToolsPage } from './components/ai/AIToolsPage'
import { TranslationProvider } from './hooks/useTranslation'

type PageType = 'home' | 'developer' | 'admin' | 'products' | 'payment-success' | 'payment-cancel' | 'mobile' | 'profile' | 'purchase-history' | 'settings' | 'ai-tools'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const { initialize, user, profile, error, clearError } = useAuthStore()
  const { fetchApps } = useAppStore()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize()
        
        // Update SEO meta tags
        updateMetaTags({
          title: 'Vibe Store - AI Indie App Marketplace',
          description: 'Discover, share, and monetize cutting-edge AI applications. The premier marketplace for indie AI developers and enthusiasts.',
          keywords: ['AI', 'marketplace', 'indie apps', 'artificial intelligence', 'developers'],
          url: window.location.origin,
          type: 'website'
        })
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeApp()
  }, [initialize])

  // Handle URL routing
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname
      const search = window.location.search

      if (path === '/products') {
        setCurrentPage('products')
      } else if (path === '/payment/success' || search.includes('session_id')) {
        setCurrentPage('payment-success')
      } else if (path === '/payment/cancel') {
        setCurrentPage('payment-cancel')
      } else if (path === '/developer') {
        setCurrentPage('developer')
      } else if (path === '/admin') {
        setCurrentPage('admin')
      } else if (path === '/mobile') {
        setCurrentPage('mobile')
      } else if (path === '/profile') {
        setCurrentPage('profile')
      } else if (path === '/purchase-history') {
        setCurrentPage('purchase-history')
      } else if (path === '/settings') {
        setCurrentPage('settings')
      } else if (path === '/ai-tools') {
        setCurrentPage('ai-tools')
      } else {
        setCurrentPage('home')
      }
    }

    handleRouting()
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouting)
    
    return () => {
      window.removeEventListener('popstate', handleRouting)
    }
  }, [])

  // Initialize real-time subscriptions when user logs in
  useEffect(() => {
    if (user && profile) {
      try {
        // Subscribe to notifications
        realtimeManager.subscribeToNotifications(user.id)
        
        // Subscribe to follows
        realtimeManager.subscribeToFollows(user.id)
        
        // Subscribe to app status changes for developers
        if (profile.role === 'developer') {
          realtimeManager.subscribeToAppStatus(user.id)
        }

        // Request notification permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission().catch(console.error)
        }
      } catch (error) {
        console.error('Failed to initialize real-time subscriptions:', error)
      }
    }

    // Cleanup function
    return () => {
      if (!user) {
        realtimeManager.unsubscribeAll()
      }
    }
  }, [user, profile])

  // Clear errors when they occur
  useEffect(() => {
    if (error) {
      console.error('Auth error:', error)
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleNavigation = (page: PageType) => {
    // Check permissions for admin dashboard
    if (page === 'admin' && profile?.role !== 'admin') {
      alert('Access denied. Admin privileges required.')
      return
    }
    
    setCurrentPage(page)
    
    // Update URL without page reload
    const urls = {
      home: '/',
      developer: '/developer',
      admin: '/admin',
      products: '/products',
      'payment-success': '/payment/success',
      'payment-cancel': '/payment/cancel',
      mobile: '/mobile',
      profile: '/profile',
      'purchase-history': '/purchase-history',
      settings: '/settings',
      'ai-tools': '/ai-tools'
    }
    
    window.history.pushState({}, '', urls[page])
  }

  const handleOpenProfile = () => {
    setCurrentPage('profile')
    window.history.pushState({}, '', '/profile')
  }

  const handleOpenPurchaseHistory = () => {
    setCurrentPage('purchase-history')
    window.history.pushState({}, '', '/purchase-history')
  }

  const handleOpenSettings = () => {
    setCurrentPage('settings')
    window.history.pushState({}, '', '/settings')
  }

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedCategoryName(categoryName)
    
    // Scroll to apps section
    setTimeout(() => {
      const appsSection = document.getElementById('apps-section')
      if (appsSection) {
        appsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleClearCategoryFilter = () => {
    setSelectedCategoryId(null)
    setSelectedCategoryName(null)
    fetchApps() // Reset to show all apps
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return <PageLoader text="Initializing Vibe Store..." />
  }

  // Show mobile page
  if (currentPage === 'mobile') {
    return (
      <ErrorBoundary>
        <MobilePage onNavigate={handleNavigation} />
      </ErrorBoundary>
    )
  }

  // Show payment success page
  if (currentPage === 'payment-success') {
    return (
      <ErrorBoundary>
        <PaymentSuccess />
      </ErrorBoundary>
    )
  }

  // Show payment cancel page
  if (currentPage === 'payment-cancel') {
    return (
      <ErrorBoundary>
        <PaymentCancel />
      </ErrorBoundary>
    )
  }

  // Show purchase history page
  if (currentPage === 'purchase-history') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <PurchaseHistoryPage />
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show profile page
  if (currentPage === 'profile') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <div className="py-8">
            <ProfileView />
          </div>
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show settings page
  if (currentPage === 'settings') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <div className="py-8">
            <DeveloperSettings />
          </div>
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show AI tools page
  if (currentPage === 'ai-tools') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <AIToolsPage />
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show products page
  if (currentPage === 'products') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <ProductsPage />
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show admin dashboard for admins
  if (currentPage === 'admin' && profile?.role === 'admin') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <AdminDashboard />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Show developer portal if user is a developer and navigated there
  if (currentPage === 'developer') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header 
            onNavigate={handleNavigation}
            onOpenProfile={handleOpenProfile}
            onOpenPurchaseHistory={handleOpenPurchaseHistory}
            onOpenSettings={handleOpenSettings}
          />
          <DeveloperPortal />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <TranslationProvider>
      <div className="min-h-screen bg-white">
        <Header 
          onNavigate={handleNavigation}
          onOpenProfile={handleOpenProfile}
          onOpenPurchaseHistory={handleOpenPurchaseHistory}
          onOpenSettings={handleOpenSettings}
        />
        
        <main>
          {/* Show Hero only for non-authenticated users or first-time visitors */}
          {!user && <Hero />}
          
          {/* Always show app browsing sections for authenticated users */}
          <FeaturedApps 
            selectedCategoryId={selectedCategoryId}
            selectedCategoryName={selectedCategoryName}
            onClearFilter={handleClearCategoryFilter}
          />
          <Categories onCategorySelect={handleCategorySelect} />
          <Collections />
        </main>
        
        <Footer />
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
      </TranslationProvider>
    </ErrorBoundary>
  )
}

export default App