import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ error: null, loading: true })
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ error: null, loading: true })
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ error: null, loading: true })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, profile: null })
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get()
      const { profile } = get()
      if (!user) throw new Error('No user logged in')

      set({ error: null, loading: true })
      
      // Create optimistic profile update
      if (profile) {
        const optimisticProfile = { ...profile, ...updates }
        set({ profile: optimisticProfile })
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        // Revert to original profile on error
        if (profile) {
          set({ profile })
        }
        throw error
      }
      
      // No need to fetch the profile again since we've already updated it optimistically
      // and the database update was successful
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  initialize: async () => {
    try {
      set({ loading: true, error: null })
      
      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        set({ loading: false, error: sessionError.message })
        return
      }
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError)
          
          // If profile doesn't exist, try to create it
          if (profileError.code === 'PGRST116') {
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata.full_name || '',
                  avatar_url: session.user.user_metadata.avatar_url || '',
                  role: 'consumer',
                  subscription_tier: 'free',
                  followers_count: 0,
                  following_count: 0
                })
                .select()
                .single()
                
              if (createError) {
                console.error('Error creating profile:', createError)
              } else if (newProfile) {
                set({ profile: newProfile })
              }
            } catch (createError: any) {
              console.error('Error creating profile:', createError)
            }
          }
        }

        set({ 
          user: session.user, 
          profile: profile || null,
          loading: false 
        })
      } else {
        set({ loading: false })
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            // Wait a bit for profile creation trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error after sign in:', profileError)
              
              // If profile doesn't exist, try to create it
              if (profileError.code === 'PGRST116') {
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email || '',
                      full_name: session.user.user_metadata.full_name || '',
                      avatar_url: session.user.user_metadata.avatar_url || '',
                      role: 'consumer',
                      subscription_tier: 'free',
                      followers_count: 0,
                      following_count: 0
                    })
                    .select()
                    .single()
                    
                  if (createError) {
                    console.error('Error creating profile:', createError)
                  } else if (newProfile) {
                    set({ profile: newProfile })
                  }
                } catch (createError: any) {
                  console.error('Error creating profile:', createError)
                }
              }
            }

            set({ 
              user: session.user, 
              profile: profile || null,
              error: null
            })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, profile: null, error: null })
          }
        } catch (error: any) {
          console.error('Auth state change error:', error)
          set({ error: error.message })
        }
      })

      // Return unsubscribe function
      return () => {
        subscription.unsubscribe()
      }
    } catch (error: any) {
      console.error('Initialize error:', error)
      set({ loading: false, error: error.message })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))