// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes
}

// Form validation schemas
export interface AppSubmissionData {
  title: string
  description: string
  longDescription: string
  categoryId: string
  pricingType: 'free' | 'one_time' | 'subscription' | 'freemium'
  price: number
  appUrl: string
  githubUrl?: string
  demoUrl?: string
  repositoryUrl?: string
  documentationUrl?: string
  tags: string[]
}

export const validateAppSubmission = (data: AppSubmissionData): {
  isValid: boolean
  errors: Record<string, string>
} => {
  const errors: Record<string, string> = {}

  if (!data.title.trim()) {
    errors.title = 'Title is required'
  } else if (data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters'
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required'
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters'
  } else if (data.description.length > 160) {
    errors.description = 'Description must be less than 160 characters'
  }

  if (!data.longDescription.trim()) {
    errors.longDescription = 'Detailed description is required'
  } else if (data.longDescription.length < 50) {
    errors.longDescription = 'Detailed description must be at least 50 characters'
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required'
  }

  if (!data.appUrl.trim()) {
    errors.appUrl = 'App URL is required'
  } else if (!validateUrl(data.appUrl)) {
    errors.appUrl = 'Please enter a valid URL'
  }

  if (data.githubUrl && !validateUrl(data.githubUrl)) {
    errors.githubUrl = 'Please enter a valid GitHub URL'
  }

  if (data.demoUrl && !validateUrl(data.demoUrl)) {
    errors.demoUrl = 'Please enter a valid demo URL'
  }

  if (data.repositoryUrl && !validateUrl(data.repositoryUrl)) {
    errors.repositoryUrl = 'Please enter a valid repository URL'
  }

  if (data.documentationUrl && !validateUrl(data.documentationUrl)) {
    errors.documentationUrl = 'Please enter a valid documentation URL'
  }

  if (data.pricingType !== 'free' && data.price <= 0) {
    errors.price = 'Price must be greater than 0 for paid apps'
  }

  if (data.tags.length === 0) {
    errors.tags = 'At least one tag is required'
  } else if (data.tags.length > 10) {
    errors.tags = 'Maximum 10 tags allowed'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}