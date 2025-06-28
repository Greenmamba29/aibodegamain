import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { DollarSign, TrendingUp, Users, Download, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const revenueData = [
  { month: 'Jan', revenue: 1200, transactions: 45 },
  { month: 'Feb', revenue: 1800, transactions: 67 },
  { month: 'Mar', revenue: 2400, transactions: 89 },
  { month: 'Apr', revenue: 2100, transactions: 78 },
  { month: 'May', revenue: 2800, transactions: 102 },
  { month: 'Jun', revenue: 3200, transactions: 118 },
]

const appRevenueData = [
  { name: 'AI Image Generator', revenue: 8500, color: '#8B5CF6' },
  { name: 'Text Summarizer Pro', revenue: 6200, color: '#3B82F6' },
  { name: 'Voice Cloner AI', revenue: 4800, color: '#10B981' },
  { name: 'Code Assistant', revenue: 3200, color: '#F59E0B' },
  { name: 'Other Apps', revenue: 2100, color: '#EF4444' },
]

export const RevenueAnalytics: React.FC = () => {
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenueStats()
  }, [])

  const loadRevenueStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all transactions for developer's apps
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          created_at,
          app:apps!inner(developer_id)
        `)
        .eq('app.developer_id', user.id)
        .eq('status', 'completed')

      if (error) throw error

      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const totalTransactions = transactions?.length || 0
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyRevenue = transactions?.filter(t => {
        const date = new Date(t.created_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }).reduce((sum, t) => sum + t.amount, 0) || 0

      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      setRevenueStats({
        totalRevenue,
        monthlyRevenue,
        totalTransactions,
        averageOrderValue
      })
    } catch (error) {
      console.error('Error loading revenue stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(revenueStats.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(revenueStats.monthlyRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{revenueStats.totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+15%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(revenueStats.averageOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+5%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Transaction Volume</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by App */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Revenue by App</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appRevenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {appRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              {appRevenueData.map((app, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: app.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{app.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(app.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Payout Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Available Balance</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(revenueStats.totalRevenue * 0.7)}
              </p>
              <p className="text-sm text-green-700 mt-1">Ready for payout</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Pending</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(revenueStats.monthlyRevenue * 0.7)}
              </p>
              <p className="text-sm text-yellow-700 mt-1">Processing (7 days)</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Total Paid Out</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency((revenueStats.totalRevenue - revenueStats.monthlyRevenue) * 0.7)}
              </p>
              <p className="text-sm text-blue-700 mt-1">Lifetime earnings</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Revenue Share</h4>
            <p className="text-sm text-gray-600">
              You keep 70% of all sales revenue. Platform fee is 30% which covers payment processing, 
              hosting, marketing, and platform maintenance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}