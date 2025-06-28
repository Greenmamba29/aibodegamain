import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface NotificationData {
  id: string
  user_id: string
  type: 'follow' | 'review' | 'app_approved' | 'app_rejected' | 'download'
  title: string
  message: string
  data?: any
  read: boolean
  created_at: string
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private notificationCallbacks: ((notification: NotificationData) => void)[] = []
  private followCallbacks: ((data: any) => void)[] = []
  private appStatusCallbacks: ((data: any) => void)[] = []
  private isCleaningUp = false

  // Subscribe to user notifications
  subscribeToNotifications(userId: string) {
    if (this.isCleaningUp) return
    
    const channelName = `notifications:${userId}`
    
    if (this.channels.has(channelName)) {
      return
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (!this.isCleaningUp) {
              const notification = payload.new as NotificationData
              this.notificationCallbacks.forEach(callback => {
                try {
                  callback(notification)
                } catch (error) {
                  console.error('Error in notification callback:', error)
                }
              })
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to notifications for user ${userId}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to notifications for user ${userId}`)
            this.unsubscribe(channelName)
          }
        })

      this.channels.set(channelName, channel)
    } catch (error) {
      console.error('Error setting up notification subscription:', error)
    }
  }

  // Subscribe to follow events
  subscribeToFollows(userId: string) {
    if (this.isCleaningUp) return
    
    const channelName = `follows:${userId}`
    
    if (this.channels.has(channelName)) {
      return
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_follows',
            filter: `following_id=eq.${userId}`
          },
          (payload) => {
            if (!this.isCleaningUp) {
              this.followCallbacks.forEach(callback => {
                try {
                  callback(payload)
                } catch (error) {
                  console.error('Error in follow callback:', error)
                }
              })
            }
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    } catch (error) {
      console.error('Error setting up follow subscription:', error)
    }
  }

  // Subscribe to app status changes for developers
  subscribeToAppStatus(developerId: string) {
    if (this.isCleaningUp) return
    
    const channelName = `app_status:${developerId}`
    
    if (this.channels.has(channelName)) {
      return
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'apps',
            filter: `developer_id=eq.${developerId}`
          },
          (payload) => {
            if (!this.isCleaningUp) {
              this.appStatusCallbacks.forEach(callback => {
                try {
                  callback(payload)
                } catch (error) {
                  console.error('Error in app status callback:', error)
                }
              })
            }
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    } catch (error) {
      console.error('Error setting up app status subscription:', error)
    }
  }

  // Subscribe to global app changes (for admin)
  subscribeToAllApps() {
    if (this.isCleaningUp) return
    
    const channelName = 'all_apps'
    
    if (this.channels.has(channelName)) {
      return
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'apps'
          },
          (payload) => {
            if (!this.isCleaningUp) {
              this.appStatusCallbacks.forEach(callback => {
                try {
                  callback(payload)
                } catch (error) {
                  console.error('Error in app status callback:', error)
                }
              })
            }
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    } catch (error) {
      console.error('Error setting up all apps subscription:', error)
    }
  }

  // Add notification listener
  onNotification(callback: (notification: NotificationData) => void) {
    this.notificationCallbacks.push(callback)
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback)
    }
  }

  // Add follow listener
  onFollow(callback: (data: any) => void) {
    this.followCallbacks.push(callback)
    return () => {
      this.followCallbacks = this.followCallbacks.filter(cb => cb !== callback)
    }
  }

  // Add app status listener
  onAppStatus(callback: (data: any) => void) {
    this.appStatusCallbacks.push(callback)
    return () => {
      this.appStatusCallbacks = this.appStatusCallbacks.filter(cb => cb !== callback)
    }
  }

  // Unsubscribe from channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      try {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
        console.log(`Unsubscribed from ${channelName}`)
      } catch (error) {
        console.error(`Error unsubscribing from ${channelName}:`, error)
      }
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.isCleaningUp = true
    
    this.channels.forEach((channel, name) => {
      try {
        supabase.removeChannel(channel)
        console.log(`Cleaned up channel: ${name}`)
      } catch (error) {
        console.error(`Error cleaning up channel ${name}:`, error)
      }
    })
    
    this.channels.clear()
    this.notificationCallbacks = []
    this.followCallbacks = []
    this.appStatusCallbacks = []
    
    setTimeout(() => {
      this.isCleaningUp = false
    }, 1000)
  }
}

export const realtimeManager = new RealtimeManager()

// Notification functions with error handling
export const createNotification = async (
  userId: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  data?: any
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false
      })

    if (error) {
      console.error('Error creating notification:', error)
    }
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export const getUnreadNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}