import React, { useState, useEffect } from 'react';
import { Bell, X, Check, User, Star, Download, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { realtimeManager, NotificationData, getUnreadNotifications, markNotificationAsRead } from '../../lib/realtime';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'react-hot-toast';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    loadNotifications();

    // Subscribe to real-time notifications
    realtimeManager.subscribeToNotifications(user.id);
    
    const unsubscribe = realtimeManager.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png'
        });
      }
      
      // Show toast notification
      toast.success(notification.title, {
        description: notification.message
      });
    });

    return () => {
      unsubscribe();
      realtimeManager.unsubscribe(`notifications:${user.id}`);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUnreadNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    const promises = notifications.map(n => markNotificationAsRead(n.id));
    await Promise.all(promises);
    setNotifications([]);
    toast.success(t('all_notifications_read'));
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'follow':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'download':
        return <Download className="w-4 h-4 text-green-600" />;
      case 'app_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'app_rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('notifications')}</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    {t('mark_all_read')}
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">{t('loading')}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{t('no_notifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};