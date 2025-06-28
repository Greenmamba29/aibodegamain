import React from 'react'
import { ArrowLeft, Home, Search, Heart, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { MobileAppFeed } from './MobileAppFeed'

interface MobilePageProps {
  onNavigate?: (page: 'home') => void
}

export const MobilePage: React.FC<MobilePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => onNavigate?.('home')}
          >
            Back
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            VIBE STORE
          </h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Mobile App Feed */}
      <div className="p-4">
        <MobileAppFeed />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col space-y-1 p-2">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 p-2">
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 p-2">
            <Heart className="w-5 h-5" />
            <span className="text-xs">Liked</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 p-2">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}