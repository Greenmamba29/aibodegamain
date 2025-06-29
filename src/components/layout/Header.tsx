import React, { useState } from 'react';
import { Search, Menu, X, User, LogOut, Settings, Plus, Code, Crown, CreditCard, Package, Smartphone, Bell, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NotificationBell } from '../ui/NotificationBell';
import { AuthModal } from '../auth/AuthModal';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'developer' | 'admin' | 'products' | 'payment-success' | 'payment-cancel' | 'mobile' | 'profile' | 'purchase-history' | 'settings') => void;
  onOpenProfile?: () => void;
  onOpenPurchaseHistory?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  onOpenProfile, 
  onOpenPurchaseHistory, 
  onOpenSettings 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isRoleToggleOpen, setIsRoleToggleOpen] = useState(false);
  const { user, profile, signOut, updateProfile } = useAuthStore();
  const { searchQuery, setSearchQuery, searchApps } = useAppStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchApps(searchQuery);
    // Scroll to apps section
    const appsSection = document.getElementById('apps-section');
    if (appsSection) {
      appsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    if (onNavigate) onNavigate('home');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
      if (onNavigate) onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeveloperPortal = () => {
    if (onNavigate) onNavigate('developer');
    setIsProfileOpen(false);
    setIsRoleToggleOpen(false);
  };

  const handleAdminDashboard = () => {
    if (onNavigate) onNavigate('admin');
    setIsProfileOpen(false);
  };

  const handleProductsPage = () => {
    if (onNavigate) onNavigate('products');
    setIsProfileOpen(false);
  };

  const handleMobileView = () => {
    if (onNavigate) onNavigate('mobile');
    setIsProfileOpen(false);
  };

  const handleViewProfile = () => {
    if (onOpenProfile) onOpenProfile();
    setIsProfileOpen(false);
    setIsRoleToggleOpen(false);
  };

  const handlePurchaseHistory = () => {
    if (onOpenPurchaseHistory) onOpenPurchaseHistory();
    setIsProfileOpen(false);
  };

  const handleSettings = () => {
    if (onOpenSettings) onOpenSettings();
    setIsProfileOpen(false);
  };

  const handleContactSupport = () => {
    toast.success('Support request sent! Our team will contact you shortly.');
  };

  const handleToggleRole = async () => {
    try {
      const newRole = profile?.role === 'developer' ? 'consumer' : 'developer';
      await updateProfile({ role: newRole });
      
      toast.success(`Switched to ${newRole} mode`);
      
      setIsProfileOpen(false);
      setIsRoleToggleOpen(false);
      
      // Navigate appropriately based on new role
      if (newRole === 'developer' && onNavigate) {
        onNavigate('developer');
      } else if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Error toggling role:', error);
      toast.error('Error changing role. Please try again.');
    }
  };

  const handleRoleToggleClick = () => {
    if (profile?.role === 'developer') {
      setIsRoleToggleOpen(!isRoleToggleOpen);
    } else {
      // Direct toggle for consumers
      handleToggleRole();
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const getSubscriptionBadge = () => {
    if (!profile?.subscription_tier || profile.subscription_tier === 'free') return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        profile.subscription_tier === 'pro' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        <Crown className="w-3 h-3 mr-1" />
        {profile.subscription_tier.toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
                  VIBE STORE
                </h1>
                <p className="text-xs text-gray-500 -mt-1">AI Indie App Marketplace</p>
              </div>
            </button>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search AI apps, developers, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  />
                </div>
              </form>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Mobile View Button - Only for consumers - Icon Only */}
                  {profile?.role !== 'developer' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleMobileView}
                      className="hidden lg:flex p-2"
                      title="Mobile View"
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Subscription Badge - Desktop Only */}
                  {profile?.subscription_tier !== 'free' && (
                    <div className="hidden sm:block">
                      {getSubscriptionBadge()}
                    </div>
                  )}

                  {/* Notifications */}
                  <NotificationBell />

                  {/* Role Toggle Button */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRoleToggleClick}
                      className="hidden sm:flex items-center space-x-2"
                    >
                      {profile?.role === 'developer' ? (
                        <>
                          <Code className="w-4 h-4" />
                          <span>Developer</span>
                          <ToggleRight className="w-4 h-4 text-purple-600" />
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>Consumer</span>
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        </>
                      )}
                    </Button>

                    {/* Developer Toggle Dropdown */}
                    {isRoleToggleOpen && profile?.role === 'developer' && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsRoleToggleOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                          <button 
                            onClick={handleDeveloperPortal}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Code className="w-4 h-4" />
                            <span>Developer Portal</span>
                          </button>
                          <button 
                            onClick={handleViewProfile}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <User className="w-4 h-4" />
                            <span>View Profile</span>
                          </button>
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button 
                              onClick={handleToggleRole}
                              className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center space-x-2"
                            >
                              <ToggleLeft className="w-4 h-4" />
                              <span>Switch to Consumer</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Admin Button */}
                  {profile?.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={Settings}
                      onClick={handleAdminDashboard}
                      className="hidden sm:flex"
                    >
                      Admin
                    </Button>
                  )}
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-200"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-purple-200">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-24">
                          {profile?.full_name || 'User'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500 capitalize">
                            {profile?.role || 'Consumer'}
                          </p>
                          {profile?.subscription_tier !== 'free' && (
                            <span className="text-xs text-purple-600 font-medium">
                              {profile?.subscription_tier?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {isProfileOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                            <p className="text-xs text-gray-500">{profile?.email}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{profile?.followers_count || 0} followers</span>
                                <span>{profile?.following_count || 0} following</span>
                              </div>
                              {getSubscriptionBadge()}
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleViewProfile}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>View Profile</span>
                          </button>
                          
                          <button 
                            onClick={handleProductsPage}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <Crown className="w-4 h-4" />
                            <span>
                              {profile?.subscription_tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                            </span>
                          </button>
                          
                          <button 
                            onClick={handlePurchaseHistory}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>Purchase History</span>
                          </button>
                          
                          <button 
                            onClick={handleSettings}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                          
                          {profile?.role === 'admin' && (
                            <button 
                              onClick={handleAdminDashboard}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </button>
                          )}
                          
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 bg-white">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search AI apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              {!user ? (
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600"
                    onClick={() => openAuthModal('signin')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 text-white"
                    onClick={() => openAuthModal('signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleViewProfile}
                    icon={User}
                  >
                    View Profile
                  </Button>
                  {profile?.role === 'developer' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleDeveloperPortal}
                      icon={Code}
                    >
                      Developer Portal
                    </Button>
                  )}
                  {profile?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleAdminDashboard}
                      icon={Settings}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  {profile?.role !== 'developer' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleMobileView}
                      icon={Smartphone}
                    >
                      Mobile View
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleToggleRole}
                    icon={profile?.role === 'developer' ? ToggleRight : ToggleLeft}
                  >
                    Switch to {profile?.role === 'developer' ? 'Consumer' : 'Developer'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};