import React, { useState, useEffect } from 'react'
import { X, Heart, MessageCircle, Share2, Bookmark, User, Send, MoreHorizontal, Edit, Trash2, ExternalLink, Github, Globe, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { FollowButton } from '../ui/FollowButton'
import { PricingBadge } from '../ui/PricingBadge'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { App, Review } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'

interface ContentCardModalProps {
  isOpen: boolean
  onClose: () => void
  app: App | null
  onAppAction: (app: App) => void
  isPurchased?: boolean
  getActionButtonText: (app: App) => string
  getActionButtonIcon: (app: App) => any
}

export const ContentCardModal: React.FC<ContentCardModalProps> = ({
  isOpen,
  onClose,
  app,
  onAppAction,
  isPurchased = false,
  getActionButtonText,
  getActionButtonIcon
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'likes' | 'followers'>('comments')
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Review[]>([])
  const [likes, setLikes] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const { user, profile } = useAuthStore()

  useEffect(() => {
    if (isOpen && app) {
      fetchComments()
      fetchLikes()
      fetchFollowers()
      checkUserInteractions()
    }
  }, [isOpen, app])

  const fetchComments = async () => {
    if (!app) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url, role)
        `)
        .eq('app_id', app.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikes = async () => {
    if (!app) return
    
    // This would be a "likes" table in a real implementation
    // For now, we'll simulate with dummy data
    setLikes([
      { id: '1', user: { id: '1', full_name: 'John Doe', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' } },
      { id: '2', user: { id: '2', full_name: 'Jane Smith', avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' } },
      { id: '3', user: { id: '3', full_name: 'Mike Johnson', avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' } },
    ])
  }

  const fetchFollowers = async () => {
    if (!app?.developer) return
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          follower:profiles(id, full_name, avatar_url, role)
        `)
        .eq('following_id', app.developer.id)
        .limit(10)

      if (error) throw error
      setFollowers(data || [])
    } catch (error) {
      console.error('Error fetching followers:', error)
    }
  }

  const checkUserInteractions = async () => {
    if (!app || !user) return
    
    // Check if user has liked the app
    // In a real implementation, this would query a likes table
    setIsLiked(false)
    
    // Check if user has bookmarked the app
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('app_id', app.id)
        .eq('user_id', user.id)
        .single()
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookmark:', error)
      }
      
      setIsBookmarked(!!data)
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!app || !user || !comment.trim()) return
    
    setCommentLoading(true)
    try {
      // In a real app, we'd have a comments table
      // For now, we'll use reviews as comments
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          app_id: app.id,
          user_id: user.id,
          rating: 5, // Default rating
          title: 'Comment',
          content: comment.trim()
        })
        .select(`
          *,
          user:profiles(id, full_name, avatar_url, role)
        `)
        .single()

      if (error) throw error
      
      if (data) {
        setComments([data, ...comments])
        setComment('')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleLike = async () => {
    if (!app || !user) return
    
    // Toggle like status
    setIsLiked(!isLiked)
    
    // In a real implementation, this would add/remove from a likes table
    // For now, we'll just update the UI
    if (!isLiked) {
      setLikes([
        { 
          id: 'temp-id', 
          user: { 
            id: user.id, 
            full_name: profile?.full_name || 'You', 
            avatar_url: profile?.avatar_url 
          } 
        },
        ...likes
      ])
    } else {
      setLikes(likes.filter(like => like.user.id !== user.id))
    }
  }

  const handleBookmark = async () => {
    if (!app || !user) return
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('app_id', app.id)
          .eq('user_id', user.id)
          
        if (error) throw error
        setIsBookmarked(false)
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            app_id: app.id,
            user_id: user.id
          })
          
        if (error) throw error
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  const handleShare = () => {
    if (!app) return
    
    if (navigator.share) {
      navigator.share({
        title: app.title,
        text: app.description,
        url: window.location.origin + `/apps/${app.slug}`
      }).catch(err => console.error('Error sharing:', err))
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/apps/${app.slug}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err))
    }
  }

  const handleViewProfile = (userId: string) => {
    // In a real app, this would navigate to the user's profile
    console.log('View profile:', userId)
    // window.location.href = `/profile/${userId}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen || !app) return null

  const ActionIcon = getActionButtonIcon(app)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - App content */}
          <div className="md:w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 p-6 overflow-y-auto max-h-[90vh] md:max-h-none">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {app.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* App Image */}
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 relative">
              {app.logo_url ? (
                <img
                  src={app.logo_url}
                  alt={app.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {app.title.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* Pricing badge */}
              <div className="absolute top-3 right-3">
                <PricingBadge
                  pricingType={app.pricing_type}
                  price={app.price}
                  isPurchased={isPurchased}
                />
              </div>
            </div>

            {/* App Description */}
            <p className="text-gray-600 mb-6">
              {app.description}
            </p>

            {/* Developer info with follow button */}
            {app.developer && (
              <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  {app.developer.avatar_url ? (
                    <img
                      src={app.developer.avatar_url}
                      alt={app.developer.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {app.developer.full_name?.charAt(0) || 'D'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.developer.full_name || 'Developer'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {app.developer.followers_count || 0} followers
                    </p>
                  </div>
                </div>
                
                <FollowButton
                  userId={app.developer.id}
                  size="sm"
                  variant="outline"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col space-y-3 mb-6">
              <Button 
                variant="primary" 
                onClick={() => onAppAction(app)}
                icon={ActionIcon}
                className="w-full"
              >
                {getActionButtonText(app)}
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  icon={Heart}
                  onClick={handleLike}
                >
                  <span className={isLiked ? 'text-red-600' : ''}>
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  icon={Bookmark}
                  onClick={handleBookmark}
                >
                  <span className={isBookmarked ? 'text-blue-600' : ''}>
                    {isBookmarked ? 'Saved' : 'Save'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  icon={Share2}
                  onClick={handleShare}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* External links */}
            <div className="space-y-2 mb-6">
              {app.app_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => window.open(app.app_url, '_blank')}
                  className="w-full justify-start"
                >
                  Visit App
                </Button>
              )}
              
              {app.demo_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => window.open(app.demo_url, '_blank')}
                  className="w-full justify-start"
                >
                  Try Demo
                </Button>
              )}
              
              {app.github_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={Github}
                  onClick={() => window.open(app.github_url, '_blank')}
                  className="w-full justify-start"
                >
                  GitHub Repository
                </Button>
              )}
              
              {app.repository_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={Globe}
                  onClick={() => window.open(app.repository_url, '_blank')}
                  className="w-full justify-start"
                >
                  Repository
                </Button>
              )}
            </div>

            {/* App details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {app.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Downloads</p>
                    <p className="font-semibold text-gray-900">{app.downloads_count.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold text-gray-900">{app.rating_average.toFixed(1)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Reviews</p>
                    <p className="font-semibold text-gray-900">{app.rating_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Social content */}
          <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-4 text-center font-medium text-sm ${
                  activeTab === 'comments'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-4 text-center font-medium text-sm ${
                  activeTab === 'likes'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Likes ({likes.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-4 text-center font-medium text-sm ${
                  activeTab === 'followers'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Followers ({followers.length})
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 4rem)' }}>
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Comment input */}
                  {user && (
                    <div className="flex items-start space-x-3 mb-6">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-3 focus:outline-none resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end p-2 bg-gray-50 border-t border-gray-200">
                            <Button
                              size="sm"
                              icon={Send}
                              onClick={handleSubmitComment}
                              disabled={!comment.trim() || commentLoading}
                              loading={commentLoading}
                            >
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments list */}
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No comments yet</h3>
                      <p className="text-gray-600">Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          {comment.user?.avatar_url ? (
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.full_name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              onClick={() => handleViewProfile(comment.user.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                              onClick={() => handleViewProfile(comment.user.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className="text-white font-semibold">
                                {comment.user?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div 
                                  className="font-medium text-gray-900 hover:underline cursor-pointer"
                                  onClick={() => handleViewProfile(comment.user.id)}
                                >
                                  {comment.user?.full_name || 'User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </div>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                              {comment.rating && (
                                <div className="flex items-center mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <svg 
                                      key={i} 
                                      className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 ml-2">
                              <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                              <button className="text-xs text-gray-500 hover:text-gray-700">Reply</button>
                              {user?.id === comment.user_id && (
                                <button className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'likes' && (
                <div className="space-y-4">
                  {likes.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No likes yet</h3>
                      <p className="text-gray-600">Be the first to like this app!</p>
                    </div>
                  ) : (
                    likes.map((like) => (
                      <div key={like.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => handleViewProfile(like.user.id)}
                        >
                          {like.user.avatar_url ? (
                            <img
                              src={like.user.avatar_url}
                              alt={like.user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {like.user.full_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{like.user.full_name}</p>
                          </div>
                        </div>
                        
                        <FollowButton
                          userId={like.user.id}
                          size="sm"
                          variant="outline"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'followers' && (
                <div className="space-y-4">
                  {followers.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No followers yet</h3>
                      <p className="text-gray-600">Be the first to follow this developer!</p>
                    </div>
                  ) : (
                    followers.map((follow) => (
                      <div key={follow.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => handleViewProfile(follow.follower.id)}
                        >
                          {follow.follower.avatar_url ? (
                            <img
                              src={follow.follower.avatar_url}
                              alt={follow.follower.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {follow.follower.full_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{follow.follower.full_name}</p>
                          </div>
                        </div>
                        
                        <FollowButton
                          userId={follow.follower.id}
                          size="sm"
                          variant="outline"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}