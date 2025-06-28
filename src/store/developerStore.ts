import { create } from 'zustand'
import { supabase, App } from '../lib/supabase'

interface DeveloperStats {
  totalApps: number
  totalDownloads: number
  averageRating: number
  followers: number
  revenue: number
}

interface DeveloperState {
  apps: App[]
  stats: DeveloperStats
  loading: boolean
  
  // Actions
  fetchDeveloperApps: () => Promise<void>
  fetchDeveloperStats: () => Promise<void>
  submitApp: (appData: any, files: any[]) => Promise<any>
  updateApp: (appId: string, updates: Partial<App>) => Promise<void>
  deleteApp: (appId: string) => Promise<void>
}

export const useDeveloperStore = create<DeveloperState>((set, get) => ({
  apps: [],
  stats: {
    totalApps: 0,
    totalDownloads: 0,
    averageRating: 0,
    followers: 0,
    revenue: 0,
  },
  loading: false,

  fetchDeveloperApps: async () => {
    set({ loading: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          category:categories(*),
          files:app_files(*)
        `)
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ apps: data || [] })
    } catch (error) {
      console.error('Error fetching developer apps:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchDeveloperStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch apps for stats calculation
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select('downloads_count, rating_average, rating_count, price, pricing_type')
        .eq('developer_id', user.id)

      if (appsError) throw appsError

      // Fetch profile for followers count
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Calculate stats
      const totalApps = apps?.length || 0
      const totalDownloads = apps?.reduce((sum, app) => sum + app.downloads_count, 0) || 0
      const averageRating = apps?.length 
        ? apps.reduce((sum, app) => sum + (app.rating_average * app.rating_count), 0) / 
          apps.reduce((sum, app) => sum + app.rating_count, 0) || 0
        : 0
      const followers = profile?.followers_count || 0
      
      // Calculate revenue (simplified - would need actual transaction data)
      const revenue = apps?.reduce((sum, app) => {
        if (app.pricing_type === 'one_time') {
          return sum + (app.price * app.downloads_count * 0.7) // 70% revenue share
        }
        return sum
      }, 0) || 0

      set({
        stats: {
          totalApps,
          totalDownloads,
          averageRating,
          followers,
          revenue,
        }
      })
    } catch (error) {
      console.error('Error fetching developer stats:', error)
    }
  },

  submitApp: async (appData: any, files: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate slug from title
      const slug = appData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Create app record
      const { data: app, error: appError } = await supabase
        .from('apps')
        .insert({
          title: appData.title,
          slug: slug,
          description: appData.description,
          long_description: appData.longDescription,
          developer_id: user.id,
          category_id: appData.categoryId || null,
          pricing_type: appData.pricingType,
          price: appData.price || 0,
          app_url: appData.appUrl,
          github_url: appData.githubUrl || null,
          demo_url: appData.demoUrl || null,
          repository_url: appData.repositoryUrl || null,
          documentation_url: appData.documentationUrl || null,
          logo_url: appData.logo_url || null,
          screenshots: appData.screenshots || [],
          tags: appData.tags || [],
          status: 'pending',
        })
        .select()
        .single()

      if (appError) throw appError

      // Create file records for uploaded files
      for (const fileData of files) {
        await supabase
          .from('app_files')
          .insert({
            app_id: app.id,
            file_type: fileData.type,
            file_name: fileData.name,
            file_url: fileData.url,
            file_size: fileData.size,
            mime_type: fileData.mimeType,
          })
      }

      // Refresh apps list
      get().fetchDeveloperApps()
      
      return app
    } catch (error) {
      console.error('Error submitting app:', error)
      throw error
    }
  },

  updateApp: async (appId: string, updates: Partial<App>) => {
    try {
      const { error } = await supabase
        .from('apps')
        .update(updates)
        .eq('id', appId)

      if (error) throw error

      // Refresh apps list
      get().fetchDeveloperApps()
    } catch (error) {
      console.error('Error updating app:', error)
      throw error
    }
  },

  deleteApp: async (appId: string) => {
    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', appId)

      if (error) throw error

      // Refresh apps list
      get().fetchDeveloperApps()
    } catch (error) {
      console.error('Error deleting app:', error)
      throw error
    }
  },
}))