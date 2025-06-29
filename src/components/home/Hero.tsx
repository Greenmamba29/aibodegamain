import React from 'react'
import { Search, Sparkles, Zap, Users, ArrowRight, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'

export const Hero: React.FC = () => {
  const { searchQuery, setSearchQuery, searchApps } = useAppStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchApps(searchQuery)
    // Scroll to apps section
    const appsSection = document.getElementById('apps-section')
    if (appsSection) {
      appsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleExploreApps = () => {
    const appsSection = document.getElementById('apps-section')
    if (appsSection) {
      appsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Don't show hero for authenticated users - they should see apps directly
  if (user) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">
                Discover the Future of AI Apps
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            The Premier{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              {t('welcome')}
            </span>
            <br />
            for Indie Developers
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            {t('app_store_description')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="h-16 text-lg pr-32 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-2 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="sm"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 font-medium">{t('ai_apps')}</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div> 
              <div className="text-gray-600 font-medium">{t('active_users')}</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50+</div> 
              <div className="text-gray-600 font-medium">{t('categories_count')}</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg" 
              onClick={handleExploreApps}
              icon={ArrowRight}
            >
              {t('explore_apps')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
              icon={Play}
            >
              {t('watch_demo')}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-4">{t('trusted_by')}</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">GitHub</div>
              <div className="text-2xl font-bold text-gray-400">OpenAI</div>
              <div className="text-2xl font-bold text-gray-400">Hugging Face</div>
              <div className="text-2xl font-bold text-gray-400">Stripe</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}