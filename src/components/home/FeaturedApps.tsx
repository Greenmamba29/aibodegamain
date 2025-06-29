import React, { useEffect, useState } from 'react';
import { Star, Download, ExternalLink, Github, Globe, ShoppingCart, Filter, X } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FollowButton } from '../ui/FollowButton';
import { PricingBadge } from '../ui/PricingBadge';
import { PaymentModal } from '../payment/PaymentModal';
import { AllAppsModal } from './AllAppsModal';
import { ContentCardModal } from './ContentCardModal';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { usePaymentStore } from '../../store/paymentStore';
import { toast } from 'react-hot-toast';

interface FeaturedAppsProps {
  selectedCategoryId?: string | null;
  selectedCategoryName?: string | null;
  onClearFilter?: () => void;
}

export const FeaturedApps: React.FC<FeaturedAppsProps> = ({
  selectedCategoryId,
  selectedCategoryName,
  onClearFilter
}) => {
  const { featuredApps, apps, loading, fetchFeaturedApps, fetchApps } = useAppStore();
  const { user } = useAuthStore();
  const { purchasedApps, fetchPurchases, addPurchasedApp } = usePaymentStore();
  const { t } = useTranslation();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAllAppsModalOpen, setIsAllAppsModalOpen] = useState(false);
  const [isContentCardModalOpen, setIsContentCardModalOpen] = useState(false);

  useEffect(() => {
    if (selectedCategoryId) {
      // If a category is selected, show filtered apps instead of featured apps
      fetchApps();
    } else {
      fetchFeaturedApps();
    }
  }, [selectedCategoryId, fetchFeaturedApps, fetchApps]);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user, fetchPurchases]);

  const handleAppAction = (app: any) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }
    
    if (app.pricing_type === 'free' || purchasedApps.has(app.id)) {
      // Open app directly
      window.open(app.app_url, '_blank');
    } else {
      // Show payment modal
      setSelectedApp(app);
      setIsPaymentModalOpen(true);
    }
  };

  const handleAppClick = (app: any) => {
    setSelectedApp(app);
    setIsContentCardModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    if (selectedApp) {
      // Add to purchased apps
      addPurchasedApp(selectedApp.id);
      
      // Show success message
      toast.success(`You've successfully purchased ${selectedApp.title}!`);
      
      // Open app after purchase
      setTimeout(() => {
        window.open(selectedApp.app_url, '_blank');
      }, 1000);
    }
  };

  const getActionButtonText = (app: any) => {
    if (app.pricing_type === 'free') return t('try_free');
    if (purchasedApps.has(app.id)) return t('open_app');
    return `${t('buy')} $${app.price}`;
  };

  const getActionButtonIcon = (app: any) => {
    if (app.pricing_type === 'free' || purchasedApps.has(app.id)) {
      return ExternalLink;
    }
    return ShoppingCart;
  };

  // Determine which apps to show
  const appsToShow = selectedCategoryId ? apps : featuredApps;
  const sectionTitle = selectedCategoryId 
    ? `${selectedCategoryName} ${t('apps')}`
    : user ? t('discover') : t('featured_apps');
  const sectionDescription = selectedCategoryId
    ? `${t('explore')} ${selectedCategoryName?.toLowerCase()} ${t('applications')}`
    : user ? t('discover_description') : t('featured_description');

  if (loading) {
    return (
      <section id="apps-section" className={`py-20 ${user ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>
            <p className="text-gray-600">{sectionDescription}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="apps-section" className={`py-20 ${user ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">{sectionTitle}</h2>
              {selectedCategoryId && onClearFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={onClearFilter}
                  className="ml-4"
                >
                  {t('clear_filter')}
                </Button>
              )}
            </div>
            <p className="text-gray-600">{sectionDescription}</p>
            
            {/* Category Filter Badge */}
            {selectedCategoryId && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  <Filter className="w-4 h-4 mr-2" />
                  {t('filtered_by')}: {selectedCategoryName}
                  {onClearFilter && (
                    <button
                      onClick={onClearFilter}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {appsToShow.map((app) => {
              const isPurchased = purchasedApps.has(app.id);
              const ActionIcon = getActionButtonIcon(app);
              
              return (
                <Card 
                  key={app.id} 
                  hover 
                  className="h-full overflow-hidden cursor-pointer"
                  onClick={() => handleAppClick(app)}
                >
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
                            {app.developer?.full_name || 'Developer'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppAction(app);
                        }}
                        icon={ActionIcon}
                      >
                        {getActionButtonText(app)}
                      </Button>
                      
                      <div className="flex space-x-1">
                        {app.demo_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={ExternalLink}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(app.demo_url, '_blank');
                            }}
                            className="px-3"
                          />
                        )}
                        {app.github_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={Github}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(app.github_url, '_blank');
                            }}
                            className="px-3"
                          />
                        )}
                        {app.repository_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={Globe}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(app.repository_url, '_blank');
                            }}
                            className="px-3"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsAllAppsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 text-white border-none hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
            >
              {selectedCategoryId ? `${t('view_all')} ${selectedCategoryName} ${t('apps')}` : t('view_all')}
            </Button>
          </div>
        </div>
      </section>

      {/* All Apps Modal */}
      <AllAppsModal
        isOpen={isAllAppsModalOpen}
        onClose={() => setIsAllAppsModalOpen(false)}
        onAppAction={handleAppAction}
        purchasedApps={purchasedApps}
        getActionButtonText={getActionButtonText}
        getActionButtonIcon={getActionButtonIcon}
        initialCategoryFilter={selectedCategoryId}
        initialCategoryName={selectedCategoryName}
      />

      {/* Content Card Modal */}
      <ContentCardModal
        isOpen={isContentCardModalOpen}
        onClose={() => setIsContentCardModalOpen(false)}
        app={selectedApp}
        onAppAction={handleAppAction}
        isPurchased={selectedApp ? purchasedApps.has(selectedApp.id) : false}
        getActionButtonText={getActionButtonText}
        getActionButtonIcon={getActionButtonIcon}
      />

      {/* Payment Modal */}
      {selectedApp && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedApp(null);
          }}
          app={selectedApp}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </>
  );
};