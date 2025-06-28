import React, { useCallback, useState } from 'react'
import { Upload, X, File, Image, Video, FileText, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { formatFileSize, isValidFileType } from '../../lib/storage'

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  url?: string
  uploading?: boolean
  uploaded?: boolean
  error?: string
  type: 'logo' | 'screenshot' | 'video' | 'documentation' | 'package'
}

interface FileUploadProps {
  accept: string
  maxSize: number
  maxFiles?: number
  multiple?: boolean
  fileType: UploadedFile['type']
  onFilesChange: (files: UploadedFile[]) => void
  files: UploadedFile[]
  disabled?: boolean
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  maxFiles = 10,
  multiple = true,
  fileType,
  onFilesChange,
  files,
  disabled = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    if (file.type.includes('pdf') || file.type.includes('text')) return FileText
    if (file.type.includes('zip') || file.type.includes('tar')) return Package
    return File
  }

  const getFileTypeLabel = (type: UploadedFile['type']) => {
    switch (type) {
      case 'logo': return 'Logo'
      case 'screenshot': return 'Screenshot'
      case 'video': return 'Video'
      case 'documentation': return 'Documentation'
      case 'package': return 'Package'
      default: return 'File'
    }
  }

  const getAllowedTypes = () => {
    switch (fileType) {
      case 'logo':
        return ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      case 'screenshot':
        return ['image/jpeg', 'image/png', 'image/webp']
      case 'video':
        return ['video/mp4', 'video/webm', 'video/quicktime']
      case 'documentation':
        return ['application/pdf', 'text/markdown', 'text/plain']
      case 'package':
        return ['application/zip', 'application/x-tar', 'application/gzip']
      default:
        return []
    }
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }

    const allowedTypes = getAllowedTypes()
    if (!isValidFileType(file, allowedTypes)) {
      return `File type not allowed for ${getFileTypeLabel(fileType)}`
    }

    return null
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: UploadedFile[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      
      if (!error && (multiple || files.length === 0)) {
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: fileType,
          error
        }

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            uploadedFile.preview = e.target?.result as string
            onFilesChange([...files, ...validFiles.filter(f => f.id === uploadedFile.id ? { ...f, preview: uploadedFile.preview } : f)])
          }
          reader.readAsDataURL(file)
        }

        validFiles.push(uploadedFile)
      }
    })

    if (validFiles.length > 0) {
      const newFileList = multiple ? [...files, ...validFiles] : validFiles
      onFilesChange(newFileList.slice(0, maxFiles))
    }
  }, [files, multiple, maxFiles, fileType, maxSize, onFilesChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      handleFiles(droppedFiles)
    }
  }, [disabled, handleFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id))
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
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Click to upload or drag and drop {getFileTypeLabel(fileType).toLowerCase()}
        </p>
        <p className="text-xs text-gray-500">
          Max size: {formatFileSize(maxSize)}
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded {getFileTypeLabel(fileType)}s ({files.length})
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file)
              
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {/* Status */}
                    {uploadedFile.uploading && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 mt-1">
                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    )}
                    
                    {uploadedFile.uploaded && (
                      <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Uploaded</span>
                      </div>
                    )}
                    
                    {uploadedFile.error && (
                      <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{uploadedFile.error}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}