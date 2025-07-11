import React, { useState } from 'react'
import { Upload, X, Plus, Link, Github, Globe, FileText, Image, Video, Package, Save, Send, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useTranslation } from '../../hooks/useTranslation'
import { FileUpload, UploadedFile } from '../ui/FileUpload'
import { useAppStore } from '../../store/appStore'
import { useDeveloperStore } from '../../store/developerStore'
import { uploadAppLogo, uploadAppScreenshot, uploadAppVideo, uploadAppDocumentation, uploadAppPackage } from '../../lib/storage'

interface AppSubmissionFormProps {
  onSuccess?: () => void
}

export const AppSubmissionForm: React.FC<AppSubmissionFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
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
    videos: UploadedFile[]
    documentation: UploadedFile[]
    packages: UploadedFile[]
  }>({
    logo: [],
    screenshots: [],
    videos: [],
    documentation: [],
    packages: []
  })
  
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { categories } = useAppStore()
  const { submitApp, saveDraft } = useDeveloperStore()

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
    const uploadedFiles: any[] = []

    // Upload logo
    for (const logoFile of files.logo) {
      const promise = uploadAppLogo(logoFile.file, appId).then(result => {
        if (!result.error) {
          uploadedFiles.push({
            type: 'logo',
            url: result.url,
            path: result.path,
            name: logoFile.file.name,
            size: logoFile.file.size,
            mimeType: logoFile.file.type
          })
        }
      })
      uploadPromises.push(promise)
    }

    // Upload screenshots
    for (const screenshot of files.screenshots) {
      const promise = uploadAppScreenshot(screenshot.file, appId).then(result => {
        if (!result.error) {
          uploadedFiles.push({
            type: 'screenshot',
            url: result.url,
            path: result.path,
            name: screenshot.file.name,
            size: screenshot.file.size,
            mimeType: screenshot.file.type
          })
        }
      })
      uploadPromises.push(promise)
    }

    // Upload videos
    for (const video of files.videos) {
      const promise = uploadAppVideo(video.file, appId).then(result => {
        if (!result.error) {
          uploadedFiles.push({
            type: 'video',
            url: result.url,
            path: result.path,
            name: video.file.name,
            size: video.file.size,
            mimeType: video.file.type
          })
        }
      })
      uploadPromises.push(promise)
    }

    // Upload documentation
    for (const doc of files.documentation) {
      const promise = uploadAppDocumentation(doc.file, appId).then(result => {
        if (!result.error) {
          uploadedFiles.push({
            type: 'documentation',
            url: result.url,
            path: result.path,
            name: doc.file.name,
            size: doc.file.size,
            mimeType: doc.file.type
          })
        }
      })
      uploadPromises.push(promise)
    }

    // Upload packages
    for (const pkg of files.packages) {
      const promise = uploadAppPackage(pkg.file, appId).then(result => {
        if (!result.error) {
          uploadedFiles.push({
            type: 'package',
            url: result.url,
            path: result.path,
            name: pkg.file.name,
            size: pkg.file.size,
            mimeType: pkg.file.type
          })
        }
      })
      uploadPromises.push(promise)
    }

    await Promise.all(uploadPromises)
    return uploadedFiles
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await saveDraft(formData, files)
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Error saving draft. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.appUrl) {
        throw new Error('Please fill in all required fields')
      }

      // Submit app data
      const appData = {
        ...formData,
        logo_url: files.logo[0]?.preview || null,
        screenshots: files.screenshots.map(f => f.preview).filter(Boolean),
      }

      const submittedApp = await submitApp(appData, [])

      // Upload files if app was created successfully
      if (submittedApp?.id) {
        await uploadFiles(submittedApp.id)
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        longDescription: '',
        categoryId: '',
        pricingType: 'free',
        price: 0,
        appUrl: '',
        githubUrl: '',
        demoUrl: '',
        repositoryUrl: '',
        documentationUrl: '',
        tags: [],
      })
      setFiles({
        logo: [],
        screenshots: [],
        videos: [],
        documentation: [],
        packages: []
      })
      
      alert(t('app_submission_success_message'))
      
      // Navigate to My Apps page
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error submitting app:', error)
      alert(error.message || t('app_submission_error'))
    } finally {
      setLoading(false)
    }
  }

  // Load draft on component mount
  React.useEffect(() => {
    const draft = localStorage.getItem('app-draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        setFormData(draftData)
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('submit_new_app')}</h2>
        <p className="text-gray-600">{t('share_innovation')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{t('basic_information')}</h3>
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
                  {t('category')} *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('select_category')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label={`${t('short_description')} *`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('short_description_placeholder')}
              maxLength={160}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {`${t('detailed_description')} *`}
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => handleInputChange('longDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
                placeholder={t('detailed_description_placeholder')}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tags')}
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
                  placeholder={t('tags_placeholder')}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  {t('add')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{t('pricing')}</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'free', label: t('free') },
                { value: 'freemium', label: t('freemium') },
                { value: 'one_time', label: t('one_time') },
                { value: 'subscription', label: t('subscription') },
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
                label={t('price_usd')}
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
            <h3 className="text-lg font-semibold text-gray-900">{t('links_resources')}</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label={`${t('app_url')} *`}
              icon={Link}
              value={formData.appUrl}
              onChange={(e) => handleInputChange('appUrl', e.target.value)}
              placeholder="https://your-app.com"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={`${t('demo_url')} (${t('optional')})`}
                icon={Globe}
                value={formData.demoUrl}
                onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                placeholder="https://demo.your-app.com"
              />

              <Input
                label={`${t('github_repo')} (${t('optional')})`}
                icon={Github}
                value={formData.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={`${t('repository_url')} (${t('optional')})`}
                icon={Link}
                value={formData.repositoryUrl}
                onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
                placeholder="https://gitlab.com/username/repo"
              />

              <Input
                label={`${t('documentation_url')} (${t('optional')})`}
                icon={FileText}
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
            <h3 className="text-lg font-semibold text-gray-900">{t('media_assets')}</h3>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {`${t('app_logo')} *`}
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
                {`${t('screenshots')} *`}
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

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {`${t('demo_videos')} (${t('optional')})`}
              </label>
              <FileUpload
                accept="video/*"
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={3}
                multiple={true}
                fileType="video"
                onFilesChange={handleFileChange('videos')}
                files={files.videos}
              />
            </div>

            {/* Documentation Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {`${t('documentation')} (${t('optional')})`}
              </label>
              <FileUpload
                accept=".pdf,.md,.txt"
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={5}
                multiple={true}
                fileType="documentation"
                onFilesChange={handleFileChange('documentation')}
                files={files.documentation}
              />
            </div>

            {/* Package Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {`${t('app_packages')} (${t('optional')})`}
              </label>
              <FileUpload
                accept=".zip,.tar,.gz"
                maxSize={100 * 1024 * 1024} // 100MB
                maxFiles={3}
                multiple={true}
                fileType="package"
                onFilesChange={handleFileChange('packages')}
                files={files.packages}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSaveDraft}
            loading={saving}
            icon={Save}
          >
            {t('save_draft')}
          </Button>
          <Button 
            type="submit" 
            loading={loading}
            icon={Send}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
          >
            {t('submit_for_review')}
          </Button>
        </div>
      </form>
    </div>
  )
}