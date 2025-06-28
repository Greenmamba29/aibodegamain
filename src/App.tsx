import React, { useEffect, useState } from 'react'
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
import { MobilePage } from './components/mobile/MobilePage'
import { AuthModal } from './components/auth/AuthModal'
import { useAuthStore } from './store/authStore'
import { realtimeManager } from './lib/realtime'

type PageType = 'home' | 'developer' | 'admin' | 'products' | 'payment-success' | 'payment-cancel' | 'mobile'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { initialize, user, profile } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Handle URL routing
  useEffect(() => {
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
    } else {
      setCurrentPage('home')
    }
  }, [])

  // Initialize real-time subscriptions when user logs in
  useEffect(() => {
    if (user) {
      // Subscribe to notifications
      realtimeManager.subscribeToNotifications(user.id)
      
      // Subscribe to follows
      realtimeManager.subscribeToFollows(user.id)
      
      // Subscribe to app status changes for developers
      if (profile?.role === 'developer') {
        realtimeManager.subscribeToAppStatus(user.id)
      }

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } else {
      // Clean up subscriptions when user logs out
      realtimeManager.unsubscribeAll()
    }

    return () => {
      if (!user) {
        realtimeManager.unsubscribeAll()
      }
    }
  }, [user, profile])

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
      mobile: '/mobile'
    }
    
    window.history.pushState({}, '', urls[page])
  }

  // Show mobile page
  if (currentPage === 'mobile') {
    return <MobilePage onNavigate={handleNavigation} />
  }

  // Show payment success page
  if (currentPage === 'payment-success') {
    return <PaymentSuccess />
  }

  // Show payment cancel page
  if (currentPage === 'payment-cancel') {
    return <PaymentCancel />
  }

  // Show products page
  if (currentPage === 'products') {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleNavigation} />
        <ProductsPage />
        <Footer />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  // Show admin dashboard for admins
  if (currentPage === 'admin' && profile?.role === 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleNavigation} />
        <AdminDashboard />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  // Show developer portal if user is a developer and navigated there
  if (currentPage === 'developer') {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleNavigation} />
        <DeveloperPortal />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigation} />
      
      <main>
        {/* Show Hero only for non-authenticated users or first-time visitors */}
        {!user && <Hero />}
        
        {/* Always show app browsing sections for authenticated users */}
        <FeaturedApps />
        <Categories />
        <Collections />
      </main>
      
      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

export default App