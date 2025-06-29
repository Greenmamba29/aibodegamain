import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useTranslation } from '../../hooks/useTranslation'
import { useAdminStore } from '../../store/adminStore'
import { realtimeManager } from '../../lib/realtime'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'users' | 'analytics'>('overview')
  const { t } = useTranslation()
  const { 
    stats, 
    pendingApps, 
    users, 
    loading, 
    fetchAdminStats, 
    fetchPendingApps, 
    fetchUsers,
    approveApp,
    rejectApp
  } = useAdminStore()

  useEffect(() => {
    fetchAdminStats()
    fetchPendingApps()
    fetchUsers()

    // Subscribe to real-time app changes
    realtimeManager.subscribeToAllApps()
    
    const unsubscribe = realtimeManager.onAppStatus((data) => {
      // Refresh pending apps when status changes
      fetchPendingApps()
      fetchAdminStats()
    })

    return () => {
      unsubscribe()
      realtimeManager.unsubscribe('all_apps')
    }
  }, [])

  const tabs = [
    { id: 'overview', label: t('overview'), icon: TrendingUp },
    { id: 'apps', label: t('app_moderation'), icon: Zap },
    { id: 'users', label: t('user_management'), icon: Users },
    { id: 'analytics', label: t('analytics'), icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin_dashboard')}</h1>
            <p className="text-gray-600 mt-1">{t('admin_dashboard_description')}</p>
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
                  onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'overview' && <AdminOverview stats={stats} />}
        {activeTab === 'apps' && <AppModeration apps={pendingApps} onApprove={approveApp} onReject={rejectApp} />}
        {activeTab === 'users' && <UserManagement users={users} />}
        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  )
}

// Overview Component
const AdminOverview: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_users')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+{stats?.newUsersThisWeek || 0}</span>
              <span className="text-gray-500 ml-1">{t('this_week')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_apps')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalApps || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+{stats?.newAppsThisWeek || 0}</span>
              <span className="text-gray-500 ml-1">{t('this_week')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pending_reviews')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingApps || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600 font-medium">{t('needs_attention')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('platform_revenue')}</p>
                <p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">{t('vs_last_month')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{t('recent_platform_activity')}</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('new_users_registered_today', { count: 15 })}</p>
                <p className="text-xs text-gray-500">{t('hours_ago', { hours: 2 })}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('new_apps_submitted', { count: 3 })}</p>
                <p className="text-xs text-gray-500">{t('hours_ago', { hours: 4 })}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t('apps_require_review', { count: 2 })}</p>
                <p className="text-xs text-gray-500">{t('hours_ago', { hours: 6 })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// App Moderation Component
const AppModeration: React.FC<{ 
  apps: any[]
  onApprove: (appId: string) => Promise<void>
  onReject: (appId: string, reason: string) => Promise<void>
}> = ({ apps, onApprove, onReject }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.developer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = async (appId: string) => {
    if (window.confirm('Are you sure you want to approve this app?')) {
      await onApprove(appId)
    }
  }

  const handleReject = async (appId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:')
    if (reason) {
      await onReject(appId, reason)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search apps or developers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Apps List */}
      <div className="space-y-4">
        {filteredApps.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    {app.logo_url ? (
                      <img src={app.logo_url} alt={app.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <span className="text-purple-600 font-semibold text-lg">{app.title.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{app.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By {app.developer?.full_name}</span>
                      <span>•</span>
                      <span>{app.category?.name}</span>
                      <span>•</span>
                      <span>Submitted {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => window.open(app.app_url, '_blank')}
                  >
                    View App
                  </Button>
                  
                  {app.status === 'pending' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApprove(app.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleReject(app.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// User Management Component
const UserManagement: React.FC<{ users: any[] }> = ({ users }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="consumer">Consumer</option>
          <option value="developer">Developer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{user.full_name?.charAt(0) || 'U'}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'developer' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{user.followers_count} followers</div>
                        <div>{user.following_count} following</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" icon={Eye}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" icon={Edit}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics Component
const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600">Detailed platform analytics and insights will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}