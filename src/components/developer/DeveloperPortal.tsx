import React, { useState, useEffect } from 'react'
import { Plus, BarChart3, Settings, Upload, Eye, Edit, Trash2, Star, Download, Users, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { AppSubmissionForm } from './AppSubmissionForm'
import { AppManagement } from './AppManagement'
import { DeveloperAnalytics } from './DeveloperAnalytics'
import { RevenueAnalytics } from './RevenueAnalytics'
import { useAuthStore } from '../../store/authStore'
import { useDeveloperStore } from '../../store/developerStore'

type TabType = 'overview' | 'apps' | 'submit' | 'analytics' | 'revenue' | 'settings'

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { profile, updateProfile } = useAuthStore()
  const { stats, fetchDeveloperStats } = useDeveloperStore()

  useEffect(() => {
    if (profile?.role === 'developer') {
      fetchDeveloperStats()
    }
  }, [profile, fetchDeveloperStats])

  // Upgrade to developer if not already
  const handleUpgradeToDeveloper = async () => {
    try {
      await updateProfile({ role: 'developer' })
    } catch (error) {
      console.error('Error upgrading to developer:', error)
    }
  }

  // Handle navigation to submit form
  const handleSubmitApp = () => {
    setActiveTab('submit')
  }

  // Handle navigation to apps management
  const handleManageApps = () => {
    setActiveTab('apps')
  }

  if (profile?.role !== 'developer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center">
              <Plus className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Become a Developer
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers sharing their AI innovations on Vibe Store. 
              Submit your apps, track analytics, and monetize your creations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Upload className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Submission</h3>
                  <p className="text-sm text-gray-600">Upload your apps with drag & drop interface</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">Track downloads, ratings, and revenue</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-teal-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Monetization</h3>
                  <p className="text-sm text-gray-600">70% revenue share with Stripe integration</p>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleUpgradeToDeveloper}
              className="text-lg px-8 py-4"
            >
              Start Developing
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'apps', label: 'My Apps', icon: Eye },
    { id: 'submit', label: 'Submit App', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
                <p className="text-gray-600 mt-1">Manage your AI applications and track performance</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="primary" 
                  icon={Upload}
                  onClick={handleSubmitApp}
                >
                  Submit New App
                </Button>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                </div>
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {profile?.full_name?.charAt(0) || 'D'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <DeveloperOverview stats={stats} onSubmitApp={handleSubmitApp} onManageApps={handleManageApps} />}
        {activeTab === 'apps' && <AppManagement />}
        {activeTab === 'submit' && <AppSubmissionForm />}
        {activeTab === 'analytics' && <DeveloperAnalytics />}
        {activeTab === 'revenue' && <RevenueAnalytics />}
        {activeTab === 'settings' && <DeveloperSettings />}
      </div>
    </div>
  )
}

// Overview Component
const DeveloperOverview: React.FC<{ 
  stats: any
  onSubmitApp: () => void
  onManageApps: () => void
}> = ({ stats, onSubmitApp, onManageApps }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Apps</p>
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
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
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
                <p className="text-sm font-medium text-gray-600">Followers</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.followers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Submit?</h3>
                <p className="text-gray-600 mb-4">Share your latest AI innovation with the community</p>
                <Button onClick={onSubmitApp} icon={Upload}>
                  Submit New App
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Your Apps</h3>
                <p className="text-gray-600 mb-4">Update, edit, and track your published applications</p>
                <Button variant="outline" onClick={onManageApps} icon={Eye}>
                  View All Apps
                </Button>
              </div>
              <Eye className="w-16 h-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">$45 earned from "AI Image Generator"</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">50 new downloads this week</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">3 new followers</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Component
const DeveloperSettings: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Developer Settings</h3>
          <p className="text-gray-600">Manage your developer profile and preferences</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Tell users about yourself and your development experience..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="primary">Save Changes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}