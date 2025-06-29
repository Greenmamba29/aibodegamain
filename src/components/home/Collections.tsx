import React, { useEffect } from 'react'
import { Star, ArrowRight, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { FollowButton } from '../ui/FollowButton'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from '../../hooks/useTranslation'

export const Collections: React.FC = () => {
  const { collections, loading, fetchCollections } = useAppStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('collections')}</h2>
            <p className="text-gray-600">{t('collection_description')}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Curated Collections</h2>
          <p className="text-gray-600">Handpicked app collections for specific use cases</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {collections.map((collection) => (
            <Card key={collection.id} hover className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {collection.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {collection.description}
                    </p>
                    
                    {/* Curator info with follow button */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {collection.curator?.avatar_url ? (
                          <img
                            src={collection.curator.avatar_url}
                            alt={collection.curator.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {collection.curator?.full_name?.charAt(0) || 'C'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {collection.curator?.full_name || 'Curator'}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{collection.apps?.length || 0} apps</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{collection.curator?.followers_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {collection.curator && (
                        <FollowButton
                          userId={collection.curator.id}
                          size="sm"
                          variant="outline"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {collection.apps?.slice(0, 4).map((app) => (
                    <div key={app.id} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        {app.logo_url ? (
                          <img
                            src={app.logo_url}
                            alt={app.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <span className="text-purple-600 font-semibold text-sm">
                            {app.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {app.title}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">
                          {app.rating_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" icon={ArrowRight}>
                  {t('view_collection')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            {t('browse_all')}
          </Button>
        </div>
      </div>
    </section>
  )
}