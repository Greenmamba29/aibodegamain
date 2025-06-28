import { supabase } from './supabase'

export interface FileUploadResult {
  url: string
  path: string
  error?: string
}

export interface FileUploadOptions {
  bucket: string
  folder?: string
  maxSize?: number // in bytes
  allowedTypes?: string[]
}

// File upload utility
export const uploadFile = async (
  file: File,
  options: FileUploadOptions
): Promise<FileUploadResult> => {
  try {
    // Validate file size
    if (options.maxSize && file.size > options.maxSize) {
      throw new Error(`File size exceeds ${options.maxSize / (1024 * 1024)}MB limit`)
    }

    // Validate file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = options.folder ? `${options.folder}/${fileName}` : fileName

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath
    }
  } catch (error: any) {
    return {
      url: '',
      path: '',
      error: error.message
    }
  }
}

// Delete file from storage
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return !error
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Upload app logo
export const uploadAppLogo = async (file: File, appId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'app-assets',
    folder: `${appId}/logo`,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  })
}

// Upload app screenshots
export const uploadAppScreenshot = async (file: File, appId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'app-assets',
    folder: `${appId}/screenshots`,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  })
}

// Upload app video
export const uploadAppVideo = async (file: File, appId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'app-assets',
    folder: `${appId}/videos`,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov']
  })
}

// Upload user content video
export const uploadUserVideo = async (file: File, userId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'user-content',
    folder: `${userId}/videos`,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov']
  })
}

// Upload user content image
export const uploadUserImage = async (file: File, userId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'user-content',
    folder: `${userId}/images`,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  })
}

// Upload documentation
export const uploadAppDocumentation = async (file: File, appId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'app-assets',
    folder: `${appId}/docs`,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/markdown', 'text/plain']
  })
}

// Upload app package
export const uploadAppPackage = async (file: File, appId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'app-packages',
    folder: `${appId}/packages`,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['application/zip', 'application/x-tar', 'application/gzip']
  })
}

// Upload user avatar
export const uploadUserAvatar = async (file: File, userId: string): Promise<FileUploadResult> => {
  return uploadFile(file, {
    bucket: 'user-avatars',
    folder: userId,
    maxSize: 5 * 1024 * 1024, // 5MB (increased from 2MB)
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  })
}

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file type
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Request media permissions
export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    
    // Stop the stream immediately as we just needed permission
    stream.getTracks().forEach(track => track.stop())
    
    return true
  } catch (error) {
    console.error('Media access denied:', error)
    return false
  }
}

// Check if device supports media capture
export const supportsMediaCapture = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}