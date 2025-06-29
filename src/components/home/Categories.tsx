import React, { useEffect } from 'react'
import { 
  MessageSquare, 
  Eye, 
  Brain, 
  BarChart3, 
  PenTool, 
  Zap, 
  Mic, 
  Code, 
  Search, 
  Palette 
} from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { useAppStore } from '../../store/appStore'
import { useTranslation } from '../../hooks/useTranslation'

const iconMap = {
  MessageSquare,
  Eye,
  Brain,
  BarChart3,
  PenTool,
  Zap,
  Mic,
  Code,
  Search,
  Palette
}

interface CategoriesProps {
  onCategorySelect?: (categoryId: string, categoryName: string) => void
}

export const Categories: React.FC<CategoriesProps> = ({ onCategorySelect }) => {
  const { categories, loading, fetchCategories, filterByCategory } = useAppStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCategoryClick = async (categoryId: string, categoryName: string) => {
    // Filter apps by category
    await filterByCategory(categoryId)
    
    // If parent component provided a callback, use it
    if (onCategorySelect) {
      onCategorySelect(categoryId, categoryName)
    } else {
      // Default behavior: scroll to apps section
      const appsSection = document.getElementById('apps-section')
      if (appsSection) {
        appsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('categories')}</h2>
            <p className="text-gray-600">Find AI apps tailored to your specific needs</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-gray-600">Find AI apps tailored to your specific needs</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Brain
            
            return (
              <Card 
                key={category.id} 
                hover 
                className="cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => handleCategoryClick(category.id, category.name)}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6 transition-all duration-200" 
                      style={{ color: category.color }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}