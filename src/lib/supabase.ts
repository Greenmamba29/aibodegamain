import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'consumer' | 'developer' | 'admin'
  subscription_tier: 'free' | 'pro' | 'enterprise'
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  github_url?: string
  website_url?: string
  twitter_handle?: string
  linkedin_url?: string
  bio?: string
  location?: string
  company?: string
  notification_preferences: {
    email: boolean
    push: boolean
    follows: boolean
    reviews: boolean
  }
  privacy_settings: {
    profile_public: boolean
    email_public: boolean
    show_followers: boolean
  }
  created_at: string
  updated_at: string
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: Profile
  following?: Profile
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color: string
  created_at: string
}

export interface AppFile {
  id: string
  app_id: string
  file_type: 'logo' | 'screenshot' | 'video' | 'documentation' | 'package' | 'readme'
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  description?: string
  position: number
  created_at: string
}

export interface App {
  id: string
  title: string
  slug: string
  description?: string
  long_description?: string
  developer_id: string
  category_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'archived'
  pricing_type: 'free' | 'one_time' | 'subscription' | 'freemium'
  price: number
  app_url?: string
  github_url?: string
  demo_url?: string
  repository_url?: string
  documentation_url?: string
  logo_url?: string
  screenshots: string[]
  tags: string[]
  featured: boolean
  downloads_count: number
  rating_average: number
  rating_count: number
  created_at: string
  updated_at: string
  developer?: Profile
  category?: Category
  files?: AppFile[]
}

export interface Review {
  id: string
  app_id: string
  user_id: string
  rating: number
  title?: string
  content?: string
  helpful_count: number
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Collection {
  id: string
  title: string
  description?: string
  curator_id: string
  is_public: boolean
  featured: boolean
  created_at: string
  updated_at: string
  curator?: Profile
  apps?: App[]
}

export interface Bookmark {
  id: string
  user_id: string
  app_id: string
  created_at: string
  app?: App
}

// Auth helper functions
export const signInWithProvider = async (provider: 'google' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// User following functions
export const followUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .insert({ following_id: userId })
    .select()
  return { data, error }
}

export const unfollowUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .delete()
    .eq('following_id', userId)
    .eq('follower_id', (await supabase.auth.getUser()).data.user?.id)
  return { data, error }
}

export const checkIfFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('following_id', userId)
    .eq('follower_id', (await supabase.auth.getUser()).data.user?.id)
    .single()
  return { isFollowing: !!data, error }
}

export const getUserFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      *,
      follower:profiles(*)
    `)
    .eq('following_id', userId)
  return { data, error }
}

export const getUserFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      *,
      following:profiles(*)
    `)
    .eq('follower_id', userId)
  return { data, error }
}