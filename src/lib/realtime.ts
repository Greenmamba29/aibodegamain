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

  // Subscribe to user notifications
  subscribeToNotifications(userId: string) {
    const channelName = `notifications:${userId}`
    
    if (this.channels.has(channelName)) {
      return
    }

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
          const notification = payload.new as NotificationData
          this.notificationCallbacks.forEach(callback => callback(notification))
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  // Subscribe to follow events
  subscribeToFollows(userId: string) {
    const channelName = `follows:${userId}`
    
    if (this.channels.has(channelName)) {
      return
    }

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
          this.followCallbacks.forEach(callback => callback(payload))
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  // Subscribe to app status changes for developers
  subscribeToAppStatus(developerId: string) {
    const channelName = `app_status:${developerId}`
    
    if (this.channels.has(channelName)) {
      return
    }

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
          this.appStatusCallbacks.forEach(callback => callback(payload))
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  // Subscribe to global app changes (for admin)
  subscribeToAllApps() {
    const channelName = 'all_apps'
    
    if (this.channels.has(channelName)) {
      return
    }

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
          this.appStatusCallbacks.forEach(callback => callback(payload))
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
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
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.notificationCallbacks = []
    this.followCallbacks = []
    this.appStatusCallbacks = []
  }
}

export const realtimeManager = new RealtimeManager()

// Notification functions
export const createNotification = async (
  userId: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  data?: any
) => {
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
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
  }
}

export const getUnreadNotifications = async (userId: string) => {
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
}