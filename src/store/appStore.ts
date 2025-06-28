import { create } from 'zustand'
import { supabase, App, Category, Review, Collection } from '../lib/supabase'

interface AppState {
  apps: App[]
  categories: Category[]
  featuredApps: App[]
  collections: Collection[]
  selectedApp: App | null
  loading: boolean
  searchQuery: string
  selectedCategory: string | null
  
  // Actions
  fetchApps: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchFeaturedApps: () => Promise<void>
  fetchCollections: () => Promise<void>
  fetchAppById: (id: string) => Promise<void>
  searchApps: (query: string) => Promise<void>
  filterByCategory: (categoryId: string | null) => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [],
  categories: [],
  featuredApps: [],
  collections: [],
  selectedApp: null,
  loading: false,
  searchQuery: '',
  selectedCategory: null,

  fetchApps: async () => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ apps: data || [] })
    } catch (error) {
      console.error('Error fetching apps:', error)
      set({ apps: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      set({ categories: data || [] })
    } catch (error) {
      console.error('Error fetching categories:', error)
      set({ categories: [] })
    }
  },

  fetchFeaturedApps: async () => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .eq('status', 'approved')
        .eq('featured', true)
        .order('rating_average', { ascending: false })
        .limit(6)

      if (error) throw error

      set({ featuredApps: data || [] })
    } catch (error) {
      console.error('Error fetching featured apps:', error)
      set({ featuredApps: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchCollections: async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          curator:profiles(*),
          collection_apps(
            app:apps(
              *,
              developer:profiles(*),
              category:categories(*)
            )
          )
        `)
        .eq('is_public', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include apps array
      const collections = data?.map(collection => ({
        ...collection,
        apps: collection.collection_apps?.map(ca => ca.app) || []
      })) || []
      
      set({ collections })
    } catch (error) {
      console.error('Error fetching collections:', error)
      set({ collections: [] })
    }
  },

  fetchAppById: async (id: string) => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single()

      if (error) throw error

      set({ selectedApp: data })
    } catch (error) {
      console.error('Error fetching app:', error)
      set({ selectedApp: null })
    } finally {
      set({ loading: false })
    }
  },

  searchApps: async (query: string) => {
    set({ loading: true, searchQuery: query })
    
    try {
      let queryBuilder = supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .eq('status', 'approved')

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      }

      if (get().selectedCategory) {
        queryBuilder = queryBuilder.eq('category_id', get().selectedCategory)
      }

      const { data, error } = await queryBuilder
        .order('rating_average', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ apps: data || [] })
    } catch (error) {
      console.error('Error searching apps:', error)
      set({ apps: [] })
    } finally {
      set({ loading: false })
    }
  },

  filterByCategory: async (categoryId: string | null) => {
    set({ loading: true, selectedCategory: categoryId })
    
    try {
      let queryBuilder = supabase
        .from('apps')
        .select(`
          *,
          developer:profiles(*),
          category:categories(*)
        `)
        .eq('status', 'approved')

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId)
      }

      if (get().searchQuery) {
        queryBuilder = queryBuilder.or(`title.ilike.%${get().searchQuery}%,description.ilike.%${get().searchQuery}%,tags.cs.{${get().searchQuery}}`)
      }

      const { data, error } = await queryBuilder
        .order('rating_average', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ apps: data || [] })
    } catch (error) {
      console.error('Error filtering apps:', error)
      set({ apps: [] })
    } finally {
      set({ loading: false })
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId })
  },
}))