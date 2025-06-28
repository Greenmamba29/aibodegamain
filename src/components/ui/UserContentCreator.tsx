import React, { useState } from 'react'
import { X, AtSign, Hash, Image, Video, Send, Users } from 'lucide-react'
import { Button } from './Button'
import { FileUpload, UploadedFile } from './FileUpload'
import { useAuthStore } from '../../store/authStore'

interface UserContentCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: UserContent) => void
}

export interface UserContent {
  caption: string
  images: UploadedFile[]
  videos: any[] // Simplified for now
  taggedUsers: string[]
  hashtags: string[]
}

export const UserContentCreator: React.FC<UserContentCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { profile } = useAuthStore()
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState<UploadedFile[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [taggedUsers, setTaggedUsers] = useState<string[]>([])
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image')

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCaption(text)
    
    // Auto-detect hashtags and mentions
    const hashtags = text.match(/#\w+/g) || []
    const mentions = text.match(/@\w+/g) || []
    
    // Update tagged users (remove @ symbol)
    setTaggedUsers(mentions.map(mention => mention.slice(1)))
  }

  const handleSubmit = () => {
    if (!caption.trim() && images.length === 0 && videos.length === 0) {
      alert('Please add some content before posting')
      return
    }

    const content: UserContent = {
      caption: caption.trim(),
      images,
      videos,
      taggedUsers,
      hashtags: caption.match(/#\w+/g) || []
    }

    onSubmit(content)
    
    // Reset form
    setCaption('')
    setImages([])
    setVideos([])
    setTaggedUsers([])
    onClose()
  }

  const addUserTag = (username: string) => {
    const newCaption = caption + `@${username} `
    setCaption(newCaption)
    setShowUserSearch(false)
    setUserSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-sm text-gray-500">Posting to your followers</p>
            </div>
          </div>

          {/* Caption Input */}
          <div className="mb-6">
            <textarea
              value={caption}
              onChange={handleCaptionChange}
              placeholder="What's on your mind? Use @username to tag people and #hashtags"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="flex items-center space-x-1 hover:text-purple-600"
                >
                  <AtSign className="w-4 h-4" />
                  <span>Tag users</span>
                </button>
                <span className="flex items-center space-x-1">
                  <Hash className="w-4 h-4" />
                  <span>Use hashtags</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {caption.length}/500
              </span>
            </div>
          </div>

          {/* Media Upload Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'image'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Image className="w-4 h-4" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'video'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Videos</span>
              </button>
            </div>

            {/* Image Upload */}
            {activeTab === 'image' && (
              <FileUpload
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={10}
                multiple={true}
                fileType="screenshot"
                onFilesChange={setImages}
                files={images}
              />
            )}

            {/* Video Upload - Simplified for now */}
            {activeTab === 'video' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Video upload functionality coming soon
                </p>
              </div>
            )}
          </div>

          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tagged Users:</p>
              <div className="flex flex-wrap gap-2">
                {taggedUsers.map((user, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    @{user}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User Search Modal */}
          {showUserSearch && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Tag Users</h4>
                <button
                  onClick={() => setShowUserSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users to tag..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="mt-3 space-y-2">
                {/* Mock user suggestions */}
                {['john_doe', 'sarah_dev', 'mike_ai'].map((username) => (
                  <button
                    key={username}
                    onClick={() => addUserTag(username)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">@{username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              icon={Send}
              disabled={!caption.trim() && images.length === 0 && videos.length === 0}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}