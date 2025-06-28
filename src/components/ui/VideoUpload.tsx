import React, { useState, useRef } from 'react'
import { Upload, X, Play, Pause, Video, Camera, Image } from 'lucide-react'
import { Button } from './Button'

export interface UploadedVideo {
  id: string
  file: File
  preview: string
  thumbnail?: string
  duration?: number
  uploading?: boolean
  uploaded?: boolean
  error?: string
}

interface VideoUploadProps {
  onVideoChange: (videos: UploadedVideo[]) => void
  videos: UploadedVideo[]
  maxFiles?: number
  maxSize?: number // in bytes
  disabled?: boolean
  className?: string
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoChange,
  videos,
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const requestMediaAccess = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      return true
    } catch (error) {
      console.error('Media access denied:', error)
      alert('Camera and microphone access is required to record videos. Please allow access in your browser settings.')
      return false
    }
  }

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = 1 // Get frame at 1 second
      })
      
      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
      })
      
      video.src = URL.createObjectURL(file)
    })
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration)
      })
      video.src = URL.createObjectURL(file)
    })
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
    }

    if (!file.type.startsWith('video/')) {
      return 'Please select a valid video file'
    }

    return null
  }

  const handleFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validVideos: UploadedVideo[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      
      if (!error && videos.length + validVideos.length < maxFiles) {
        const uploadedVideo: UploadedVideo = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          error,
          uploading: false
        }

        try {
          // Generate thumbnail and get duration
          const [thumbnail, duration] = await Promise.all([
            generateVideoThumbnail(file),
            getVideoDuration(file)
          ])
          
          uploadedVideo.thumbnail = thumbnail
          uploadedVideo.duration = duration
        } catch (error) {
          console.error('Error processing video:', error)
        }

        validVideos.push(uploadedVideo)
      }
    }

    if (validVideos.length > 0) {
      onVideoChange([...videos, ...validVideos])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      handleFiles(droppedFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleCameraCapture = async () => {
    const hasAccess = await requestMediaAccess()
    if (hasAccess && videoInputRef.current) {
      videoInputRef.current.click()
    }
  }

  const removeVideo = (id: string) => {
    const updatedVideos = videos.filter(v => v.id !== id)
    onVideoChange(updatedVideos)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {/* Camera/Video input for mobile */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="user"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload videos or drag and drop
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Max size: {Math.round(maxSize / (1024 * 1024))}MB • Max files: {maxFiles}
        </p>
        
        <div className="flex justify-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Upload Video
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Camera}
            onClick={handleCameraCapture}
            disabled={disabled}
          >
            Record Video
          </Button>
        </div>
      </div>

      {/* Video List */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Videos ({videos.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoPreview
                key={video.id}
                video={video}
                onRemove={() => removeVideo(video.id)}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface VideoPreviewProps {
  video: UploadedVideo
  onRemove: () => void
  formatDuration: (seconds: number) => string
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onRemove, formatDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          src={video.preview}
          className="w-full h-full object-cover"
          muted
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Video Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {video.file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(video.file.size / (1024 * 1024)).toFixed(1)} MB
        </p>
        
        {video.error && (
          <p className="text-xs text-red-600 mt-1">{video.error}</p>
        )}
      </div>
    </div>
  )
}