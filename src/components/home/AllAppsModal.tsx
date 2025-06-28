import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Star, Download, ExternalLink, Github, Globe, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FollowButton } from '../ui/FollowButton';
import { PricingBadge } from '../ui/PricingBadge';
import { useAppStore } from '../../store/appStore';

interface AllAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppAction: (app: any) => void;
  purchasedApps: Set<string>;
  getActionButtonText: (app: any) => string;
  getActionButtonIcon: (app: any) => any;
  initialCategoryFilter?: string | null;
  initialCategoryName?: string | null;
}

export const AllAppsModal: React.FC<AllAppsModalProps> = ({
  isOpen,
  onClose,
  onAppAction,
  purchasedApps,
  getActionButtonText,
  getActionButtonIcon,
  initialCategoryFilter,
  initialCategoryName
}) => {
  const { apps, categories, loading, fetchApps, fetchCategories, searchApps, filterByCategory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('popular');

  useEffect(() => {
    if (isOpen) {
      fetchApps();
      fetchCategories();
      
      // Apply initial category filter if provided
      if (initialCategoryFilter) {
        setSelectedCategory(initialCategoryFilter);
        filterByCategory(initialCategoryFilter);
      }
    }
  }, [isOpen, initialCategoryFilter, fetchApps, fetchCategories, filterByCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchApps(query);
    } else {
      if (selectedCategory !== 'all') {
        filterByCategory(selectedCategory);
      } else {
        fetchApps();
      }
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      if (searchQuery.trim()) {
        searchApps(searchQuery);
      } else {
        fetchApps();
      }
    } else {
      await filterByCategory(categoryId);
    }
  };

  const filteredApps = apps.filter(app => {
    if (selectedCategory !== 'all' && app.category_id !== selectedCategory) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating':
        return b.rating_average - a.rating_average;
      case 'popular':
      default:
        return b.downloads_count - a.downloads_count;
    }
  });

  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return 'All Categories';
    if (initialCategoryFilter === selectedCategory && initialCategoryName) {
      return initialCategoryName;
    }
    const category = categories.find(c => c.id === selectedCategory);
    return category?.name || 'Unknown Category';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All AI Apps' : `${getSelectedCategoryName()} Apps`}
              </h2>
              {selectedCategory !== 'all' && (
                <p className="text-gray-600 mt-1">
                  Explore {getSelectedCategoryName().toLowerCase()} applications
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search apps, developers, or categories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                icon={Search}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badge */}
          {selectedCategory !== 'all' && (
            <div className="flex items-center mt-4">
              <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <Filter className="w-4 h-4 mr-2" />
                {getSelectedCategoryName()}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Apps Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-80"></div>
                </div>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Apps Found</h3>
              <p className="text-gray-600">
                {selectedCategory !== 'all' 
                  ? `No apps found in ${getSelectedCategoryName()}. Try browsing other categories.`
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {selectedCategory !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => handleCategoryChange('all')}
                  className="mt-4"
                >
                  Browse All Categories
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => {
                const isPurchased = purchasedApps.has(app.id);
                const ActionIcon = getActionButtonIcon(app);
                
                return (
                  <Card key={app.id} hover className="h-full overflow-hidden">
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
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {app.title}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{app.rating_average.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {app.description}
                      </p>
                      
                      {/* Developer info */}
                      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {app.developer?.avatar_url ? (
                            <img
                              src={app.developer.avatar_url}
                              alt={app.developer.full_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {app.developer?.full_name?.charAt(0) || 'D'}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700">
                            {app.developer?.full_name || 'Developer'}
                          </span>
                        </div>
                        
                        {app.developer && (
                          <FollowButton
                            userId={app.developer.id}
                            size="sm"
                            variant="outline"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
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
                          onClick={() => onAppAction(app)}
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
                              className="px-2"
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
                              className="px-2"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredApps.length} of {apps.length} apps
              {selectedCategory !== 'all' && ` in ${getSelectedCategoryName()}`}
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};