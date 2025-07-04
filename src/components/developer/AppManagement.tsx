import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, BarChart3, Star, Download, Clock, CheckCircle, XCircle, AlertCircle, Upload, ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { useDeveloperStore } from '../../store/developerStore';
import { EditContentCardModal } from './EditContentCardModal';
import { App } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export const AppManagement: React.FC = () => {
  const { apps, drafts, loading, fetchDeveloperApps, fetchDrafts, deleteDraft, deleteApp } = useDeveloperStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchDeveloperApps();
    fetchDrafts();
  }, [fetchDeveloperApps, fetchDrafts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewApp = (app: any) => {
    if (app.app_url) {
      window.open(app.app_url, '_blank');
    } else {
      toast.error(t('app_url_not_available'));
    }
  };

  const handleEditApp = (app: App) => {
    setSelectedApp(app);
    setIsEditModalOpen(true);
  };

  const handleViewAnalytics = (appId: string) => {
    // Navigate to analytics view (would implement routing here)
    toast.info('Analytics view coming soon');
  };

  const handleDeleteApp = async (appId: string, appTitle: string) => {
    if (window.confirm(t('confirm_delete_app').replace('{appTitle}', appTitle))) {
      try {
        await deleteApp(appId);
        toast.success(t('app_deleted'));
      } catch (error) {
        console.error('Error deleting app:', error);
        toast.error(t('app_delete_error'));
      }
    }
  };

  const handleDeleteDraft = async (draftId: string, draftTitle: string) => {
    if (window.confirm(t('confirm_delete_draft').replace('{draftTitle}', draftTitle))) {
      try {
        await deleteDraft(draftId);
        toast.success(t('draft_deleted'));
      } catch (error) {
        console.error('Error deleting draft:', error);
        toast.error(t('draft_delete_error'));
      }
    }
  };

  const handleContinueDraft = (draft: any) => {
    // Load draft data into submission form
    toast.info(t('draft_editing_coming_soon'));
  };

  const handleEditSuccess = () => {
    fetchDeveloperApps();
    toast.success(t('app_updated'));
  };

  const handleSubmitNewApp = () => {
    // Navigate to app submission form
    toast.info(t('app_submission_coming_soon'));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'published'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('published_apps')} ({apps.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'drafts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('drafts')} ({drafts.length})
          </button>
        </div>
        
        <Button icon={Upload} onClick={handleSubmitNewApp}>{t('submit_new_app')}</Button>
      </div>

      {/* Published Apps Tab */}
      {activeTab === 'published' && (
        <>
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('no_apps_yet')}</h3>
              <p className="text-gray-600 mb-6">{t('no_apps_description')}</p>
              <Button icon={Upload} onClick={handleSubmitNewApp}>{t('submit_first_app')}</Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {apps.map((app) => (
                <Card key={app.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* App Image */}
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
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
                      </div>

                      {/* App Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{app.title}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                <span className="ml-1 capitalize">{t(app.status)}</span>
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                            
                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Download className="w-4 h-4" />
                                <span>{app.downloads_count.toLocaleString()} {t('downloads')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{app.rating_average.toFixed(1)} ({app.rating_count} reviews)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  app.pricing_type === 'free' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {app.pricing_type === 'free' ? 'Free' : `$${app.price}`}
                                </span>
                              </div>
                              {app.category && (
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {app.category.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Eye}
                              onClick={() => handleViewApp(app)}
                              disabled={!app.app_url}
                            >
                              {t('view')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={BarChart3}
                              onClick={() => handleViewAnalytics(app.id)}
                            >
                              {t('analytics')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Edit}
                              onClick={() => handleEditApp(app)}
                            >
                              {t('edit')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Trash2} 
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDeleteApp(app.id, app.title)}
                            >
                              {t('delete')}
                            </Button>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{t('created')} {new Date(app.created_at).toLocaleDateString()}</span>
                          <span>{t('last_updated')} {new Date(app.updated_at).toLocaleDateString()}</span>
                        </div>

                        {/* File Count Info */}
                        {app.files && app.files.length > 0 && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>{app.files.filter((f: any) => f.file_type === 'screenshot').length} {t('screenshots')}</span>
                            <span>{app.files.filter((f: any) => f.file_type === 'video').length} {t('videos')}</span>
                            <span>{app.files.filter((f: any) => f.file_type === 'documentation').length} {t('docs')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <>
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('no_drafts')}</h3>
              <p className="text-gray-600 mb-6">{t('no_drafts_description')}</p>
              <Button icon={Upload} onClick={handleSubmitNewApp}>{t('submit_new_app')}</Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {drafts.map((draft) => (
                <Card key={draft.id} className="overflow-hidden border-dashed border-2 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{draft.title || 'Untitled Draft'}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FileText className="w-3 h-3 mr-1" />
                            {t('draft')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{draft.description || 'No description provided'}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{t('last_saved')} {new Date(draft.updated_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{draft.pricing_type === 'free' ? t('free') : `$${draft.price}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleContinueDraft(draft)}
                        >
                          {t('continue')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDeleteDraft(draft.id, draft.title)}
                        >
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Content Card Modal */}
      <EditContentCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        app={selectedApp}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};