import React, { useState, useEffect } from 'react'
import { X, Save, Trash2, Image, Tag, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { FileUpload, UploadedFile } from '../ui/FileUpload'
import { useAppStore } from '../../store/appStore'
import { useDeveloperStore } from '../../store/developerStore'
import { App } from '../../lib/supabase'
import { uploadAppLogo, uploadAppScreenshot } from '../../lib/storage'

interface EditContentCardModalProps {
  isOpen: boolean
  onClose: () => void
  app: App | null
  onSuccess?: () => void
}

export const EditContentCardModal: React.FC<EditContentCardModalProps> = ({
  isOpen,
  onClose,
  app,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    categoryId: '',
    pricingType: 'free' as 'free' | 'one_time' | 'subscription' | 'freemium',
    price: 0,
    appUrl: '',
    githubUrl: '',
    demoUrl: '',
    repositoryUrl: '',
    documentationUrl: '',
    tags: [] as string[],
  })
  
  const [files, setFiles] = useState<{
    logo: UploadedFile[]
    screenshots: UploadedFile[]
  }>({
    logo: [],
    screenshots: []
  })
  
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { categories, fetchCategories } = useAppStore()
  const { updateApp } = useDeveloperStore()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      
      if (app) {
        // Populate form with app data
        setFormData({
          title: app.title || '',
          description: app.description || '',
          longDescription: app.long_description || '',
          categoryId: app.category_id || '',
          pricingType: app.pricing_type || 'free',
          price: app.price || 0,
          appUrl: app.app_url || '',
          githubUrl: app.github_url || '',
          demoUrl: app.demo_url || '',
          repositoryUrl: app.repository_url || '',
          documentationUrl: app.documentation_url || '',
          tags: app.tags || [],
        })
        
        // Set logo if exists
        if (app.logo_url) {
          setFiles(prev => ({
            ...prev,
            logo: [{
              id: 'existing-logo',
              file: new File([], 'existing-logo.png'),
              preview: app.logo_url,
              type: 'logo',
              uploaded: true
            }]
          }))
        }
        
        // Set screenshots if exist
        if (app.screenshots && app.screenshots.length > 0) {
          setFiles(prev => ({
            ...prev,
            screenshots: app.screenshots.map((url, index) => ({
              id: `existing-screenshot-${index}`,
              file: new File([], `existing-screenshot-${index}.png`),
              preview: url,
              type: 'screenshot',
              uploaded: true
            }))
          }))
        }
      }
    }
  }, [isOpen, app, fetchCategories])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (fileType: keyof typeof files) => (newFiles: UploadedFile[]) => {
    setFiles(prev => ({ ...prev, [fileType]: newFiles }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const uploadFiles = async (appId: string) => {
    const uploadPromises: Promise<any>[] = []
    let logoUrl = app?.logo_url || null
    const screenshots = [...(app?.screenshots || [])]
    
    // Upload new logo if changed
    if (files.logo.length > 0 && !files.logo[0].uploaded) {
      const logoPromise = uploadAppLogo(files.logo[0].file, appId).then(result => {
        if (!result.error) {
          logoUrl = result.url
        }
      })
      uploadPromises.push(logoPromise)
    }
    
    // Upload new screenshots
    for (const screenshot of files.screenshots) {
      if (!screenshot.uploaded) {
        const screenshotPromise = uploadAppScreenshot(screenshot.file, appId).then(result => {
          if (!result.error) {
            screenshots.push(result.url)
          }
        })
        uploadPromises.push(screenshotPromise)
      }
    }
    
    await Promise.all(uploadPromises)
    return { logoUrl, screenshots }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!app) return
    
    setLoading(true)
    
    try {
      // Upload files
      const { logoUrl, screenshots } = await uploadFiles(app.id)
      
      // Update app data
      const updatedApp = {
        title: formData.title,
        description: formData.description,
        long_description: formData.longDescription,
        category_id: formData.categoryId || null,
        pricing_type: formData.pricingType,
        price: formData.price,
        app_url: formData.appUrl,
        github_url: formData.githubUrl || null,
        demo_url: formData.demoUrl || null,
        repository_url: formData.repositoryUrl || null,
        documentation_url: formData.documentationUrl || null,
        logo_url: logoUrl,
        screenshots: screenshots,
        tags: formData.tags,
      }
      
      await updateApp(app.id, updatedApp)
      
      alert('App updated successfully!')
      
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (error: any) {
      console.error('Error updating app:', error)
      alert(error.message || 'Error updating app. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Content Card
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="App Title *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your app name"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Short Description *"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your app (max 160 characters)"
                  maxLength={160}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => handleInputChange('longDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={6}
                    placeholder="Provide a detailed description of your app, its features, and benefits..."
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add tags (e.g., AI, NLP, Computer Vision)"
                    />
                    <Button type="button" onClick={addTag} variant="outline" icon={Tag}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'free', label: 'Free' },
                    { value: 'freemium', label: 'Freemium' },
                    { value: 'one_time', label: 'One-time' },
                    { value: 'subscription', label: 'Subscription' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.pricingType === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pricingType"
                        value={option.value}
                        checked={formData.pricingType === option.value}
                        onChange={(e) => handleInputChange('pricingType', e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>

                {formData.pricingType !== 'free' && (
                  <Input
                    label="Price (USD)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Links & Resources</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="App URL *"
                  value={formData.appUrl}
                  onChange={(e) => handleInputChange('appUrl', e.target.value)}
                  placeholder="https://your-app.com"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Demo URL (Optional)"
                    value={formData.demoUrl}
                    onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                    placeholder="https://demo.your-app.com"
                  />

                  <Input
                    label="GitHub Repository (Optional)"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Repository URL (Optional)"
                    value={formData.repositoryUrl}
                    onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
                    placeholder="https://gitlab.com/username/repo"
                  />

                  <Input
                    label="Documentation URL (Optional)"
                    value={formData.documentationUrl}
                    onChange={(e) => handleInputChange('documentationUrl', e.target.value)}
                    placeholder="https://docs.your-app.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Media & Assets</h3>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    App Logo
                  </label>
                  <FileUpload
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    maxFiles={1}
                    multiple={false}
                    fileType="logo"
                    onFilesChange={handleFileChange('logo')}
                    files={files.logo}
                  />
                </div>

                {/* Screenshots Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Screenshots
                  </label>
                  <FileUpload
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    maxFiles={10}
                    multiple={true}
                    fileType="screenshot"
                    onFilesChange={handleFileChange('screenshots')}
                    files={files.screenshots}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                icon={X}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                icon={Save}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}