import React, { useState, useEffect } from 'react'
import { UserPlus, UserMinus, Users } from 'lucide-react'
import { Button } from './Button'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../hooks/useTranslation'
import { followUser, unfollowUser, checkIfFollowing } from '../../lib/supabase'

interface FollowButtonProps {
  userId: string
  userName?: string
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showFollowersCount?: boolean
  followersCount?: number
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  userName,
  variant = 'outline',
  size = 'sm',
  showFollowersCount = false,
  followersCount = 0
}) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentFollowersCount, setCurrentFollowersCount] = useState(followersCount)
  const { user } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (user && userId !== user.id) {
      checkFollowStatus()
    }
  }, [user, userId])

  const checkFollowStatus = async () => {
    try {
      const { isFollowing } = await checkIfFollowing(userId)
      setIsFollowing(isFollowing)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!user || userId === user.id) return

    setLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(userId)
        setIsFollowing(false)
        setCurrentFollowersCount(prev => Math.max(0, prev - 1))
      } else {
            <span>{currentFollowersCount} {t('followers')}</span>
        setIsFollowing(true)
        setCurrentFollowersCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error updating follow status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show follow button for own profile or when not logged in
  if (!user || userId === user.id) {
    if (showFollowersCount) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{currentFollowersCount} followers</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={isFollowing ? 'outline' : variant}
        size={size}
        onClick={handleFollow}
        loading={loading}
        icon={isFollowing ? UserMinus : UserPlus}
        className={isFollowing ? 'hover:bg-red-50 hover:border-red-300 hover:text-red-600' : ''}
      >
        {isFollowing ? t('unfollow') : t('follow')}
        {userName && ` ${userName}`}
      </Button>
      
      {showFollowersCount && (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{currentFollowersCount} {t('followers')}</span>
        </div>
      )}
    </div>
  )
}