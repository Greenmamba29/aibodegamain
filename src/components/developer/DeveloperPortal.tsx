import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Settings, Upload, Eye, Edit, Trash2, Star, Download, Users, TrendingUp, DollarSign, FileDown, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { DeveloperSettings } from './DeveloperSettings';
import { ProfileView } from './ProfileView';
import { AppSubmissionForm } from './AppSubmissionForm';
import { AppManagement } from './AppManagement';
import { DeveloperAnalytics } from './DeveloperAnalytics';
import { RevenueAnalytics } from './RevenueAnalytics';
import { useAuthStore } from '../../store/authStore';
import { useDeveloperStore } from '../../store/developerStore';
import { toast } from 'react-hot-toast';

type TabType = 'overview' | 'apps' | 'submit' | 'analytics' | 'revenue' | 'settings' | 'profile';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { profile, updateProfile } = useAuthStore();
  const { t } = useTranslation();
  const { stats, fetchDeveloperStats } = useDeveloperStore();

  useEffect(() => {
    if (profile?.role === 'developer') {
      fetchDeveloperStats();
    }
  }, [profile, fetchDeveloperStats]);

  // Upgrade to developer if not already
  const handleUpgradeToDeveloper = async () => {
    try {
      await updateProfile({ role: 'developer' });
      toast.success(t('developer_upgrade_success'));
    } catch (error) {
      console.error('Error upgrading to developer:', error);
      toast.error(t('developer_upgrade_failed'));
    }
  };

  // Handle navigation to submit form
  const handleSubmitApp = () => {
    setActiveTab('submit');
  };

  // Handle navigation to apps management
  const handleManageApps = () => {
    setActiveTab('apps');
  };

  // Handle successful app submission
  const handleAppSubmissionSuccess = () => {
    setActiveTab('apps');
    toast.success(t('app_submission_success'));
  };

  // Handle view profile
  const handleViewProfile = () => {
    setActiveTab('profile');
  };

  // Export downloads data as CSV
  const exportDownloadsCSV = () => {
    // Generate CSV data
    const csvData = [
      ['Date', 'Downloads', 'App', 'Revenue'],
      ['2024-06-01', '150', 'DreamCanvas AI', '$105.00'],
      ['2024-06-02', '200', 'TextMind Pro', '$140.00'],
      ['2024-06-03', '175', 'CodeGenius AI', '$122.50'],
      ['2024-06-04', '125', 'VoiceClone Studio', '$87.50'],
      ['2024-06-05', '100', 'DataViz Intelligence', '$70.00'],
      ['2024-06-06', '225', 'MindMate AI', '$157.50'],
      ['2024-06-07', '180', 'DreamCanvas AI', '$126.00'],
    ];
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'downloads_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('csv_download_success'));
  };

  if (profile?.role !== 'developer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
              <Plus className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('become_developer')}
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('become_developer_description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('easy_submission')}</h3>
                  <p className="text-sm text-gray-600">{t('easy_submission_description')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('realtime_analytics')}</h3>
                  <p className="text-sm text-gray-600">{t('analytics_description')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{t('monetization')}</h3>
                  <p className="text-sm text-gray-600">{t('monetization_description')}</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg" 
              onClick={handleUpgradeToDeveloper}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
            >
              {t('start_developing')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('overview'), icon: BarChart3 },
    { id: 'apps', label: t('my_apps'), icon: Eye },
    { id: 'submit', label: t('submit_app'), icon: Plus },
    { id: 'analytics', label: t('analytics'), icon: TrendingUp },
    { id: 'revenue', label: t('revenue'), icon: DollarSign },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
                  {t('developer_portal')}
                </h1>
                <p className="text-gray-600 mt-1">{t('manage_apps_description')}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="primary"
                  icon={Upload}
                  onClick={handleSubmitApp}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
                >
                  {t('submit_app')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <DeveloperOverview stats={stats} onSubmitApp={handleSubmitApp} onManageApps={handleManageApps} onViewProfile={handleViewProfile} onExportDownloads={exportDownloadsCSV} />}
        {activeTab === 'apps' && <AppManagement />}
        {activeTab === 'submit' && <AppSubmissionForm onSuccess={handleAppSubmissionSuccess} />}
        {activeTab === 'analytics' && <DeveloperAnalytics onExportDownloads={exportDownloadsCSV} />}
        {activeTab === 'revenue' && <RevenueAnalytics />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'settings' && <DeveloperSettings />}
      </div>
    </div>
  );
};

// Overview Component
const DeveloperOverview: React.FC<{ 
  stats: any;
  onSubmitApp: () => void;
  onManageApps: () => void;
  onViewProfile: () => void;
  onExportDownloads: () => void;
}> = ({ stats, onSubmitApp, onManageApps, onViewProfile, onExportDownloads }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('my_apps')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalApps || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+2</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('downloads')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalDownloads?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('revenue')}</p>
                <p className="text-3xl font-bold text-gray-900">${stats?.revenue?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+18%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('followers')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.followers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+5</span>
              <span className="text-gray-500 ml-1">this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('ready_to_submit')}</h3>
                <p className="text-gray-600 mb-4">{t('share_innovation')}</p>
                <Button onClick={onSubmitApp} icon={Upload}>
                  {t('submit_app')}
                </Button>
              </div>
              <Upload className="w-16 h-16 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('manage_your_apps')}</h3>
                <p className="text-gray-600 mb-4">{t('update_edit_track')}</p>
                <Button variant="outline" onClick={onManageApps} icon={Eye}>
                  {t('view_all')}
                </Button>
              </div>
              <Eye className="w-16 h-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('your_profile')}</h3>
                <p className="text-gray-600 mb-4">{t('manage_profile_settings')}</p>
                <Button variant="outline" onClick={onViewProfile} icon={User}>
                  {t('view_profile')}
                </Button>
              </div>
              <User className="w-16 h-16 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{t('recent_activity')}</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">$45 {t('earned_from')} "AI Image Generator"</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">50 {t('new_downloads_this_week')}</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">3 {t('new_followers')}</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};