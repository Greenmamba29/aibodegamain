import React, { useState } from 'react'
import { ArrowLeft, Home, Search, Heart, User, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { MobileAppFeed } from './MobileAppFeed'
import { useAuthStore } from '../../store/authStore'

interface MobilePageProps {
  onNavigate?: (page: 'home') => void
}

export const MobilePage: React.FC<MobilePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'liked' | 'profile'>('feed')
  const { profile } = useAuthStore()

  // Only show mobile view for standard users/consumers
  if (profile?.role === 'developer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mobile View</h2>
          <p className="text-gray-600 mb-4">Mobile view is available for consumer profiles only.</p>
          <Button onClick={() => onNavigate?.('home')}>
            Back to Desktop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => onNavigate?.('home')}
            className="text-gray-600"
          >
            Back
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
            VIBE STORE
          </h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Mobile App Feed - Instagram Style */}
      <div className="relative">
        {activeTab === 'feed' && <MobileAppFeed />}
        {activeTab === 'search' && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-600">Search functionality coming soon</p>
          </div>
        )}
        {activeTab === 'liked' && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-600">Liked apps coming soon</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-600">Profile view coming soon</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
              activeTab === 'feed' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
              activeTab === 'search' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
              activeTab === 'liked' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">Liked</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
              activeTab === 'profile' ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}