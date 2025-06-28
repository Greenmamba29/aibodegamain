import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AdminStats {
  totalUsers: number
  totalApps: number
  pendingApps: number
  totalRevenue: number
  newUsersThisWeek: number
  newAppsThisWeek: number
}

interface AdminState {
  stats: AdminStats
  pendingApps: any[]
  users: any[]
  loading: boolean
  
  // Actions
  fetchAdminStats: () => Promise<void>
  fetchPendingApps: () => Promise<void>
  fetchUsers: () => Promise<void>
  approveApp: (appId: string) => Promise<void>
  rejectApp: (appId: string, reason: string) => Promise<void>
  updateUserRole: (userId: string, role: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: {
    totalUsers: 0,
    totalApps: 0,
    pendingApps: 0,
    totalRevenue: 0,
    newUsersThisWeek: 0,
    newAppsThisWeek: 0,
  },
  pendingApps: [],
  users: [],
  loading: false,

  fetchAdminStats: async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total apps
      const { count: totalApps } = await supabase
        .from('apps')
        .select('*', { count: 'exact', head: true })

      // Fetch pending apps
      const { count: pendingApps } = await supabase
        .from('apps')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch new users this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Fetch new apps this week
      const { count: newAppsThisWeek } = await supabase
        .from('apps')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Calculate total revenue (simplified)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

      set({
        stats: {
          totalUsers: totalUsers || 0,
          totalApps: totalApps || 0,
          pendingApps: pendingApps || 0,
          totalRevenue,
          newUsersThisWeek: newUsersThisWeek || 0,
          newAppsThisWeek: newAppsThisWeek || 0,
        }
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  },

  fetchPendingApps: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ pendingApps: data || [] })
    } catch (error) {
      console.error('Error fetching pending apps:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ users: data || [] })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      set({ loading: false })
    }
  },

  approveApp: async (appId: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', appId)

      if (error) throw error

      // Refresh data
      get().fetchPendingApps()
      get().fetchAdminStats()

      // Create notification for developer
      const { data: app } = await supabase
        .from('apps')
        .select('developer_id, title')
        .eq('id', appId)
        .single()

      if (app) {
        await supabase
          .from('notifications')
          .insert({
            user_id: app.developer_id,
            type: 'app_approved',
            title: 'App Approved!',
            message: `Your app "${app.title}" has been approved and is now live on the marketplace.`,
            read: false
          })
      }
    } catch (error) {
      console.error('Error approving app:', error)
      throw error
    }
  },

  rejectApp: async (appId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', appId)

      if (error) throw error

      // Refresh data
      get().fetchPendingApps()
      get().fetchAdminStats()

      // Create notification for developer
      const { data: app } = await supabase
        .from('apps')
        .select('developer_id, title')
        .eq('id', appId)
        .single()

      if (app) {
        await supabase
          .from('notifications')
          .insert({
            user_id: app.developer_id,
            type: 'app_rejected',
            title: 'App Needs Changes',
            message: `Your app "${app.title}" requires changes: ${reason}`,
            data: { reason },
            read: false
          })
      }
    } catch (error) {
      console.error('Error rejecting app:', error)
      throw error
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (error) throw error

      // Refresh users
      get().fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  },
}))