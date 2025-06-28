// SEO utilities
export interface MetaData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}

export const updateMetaTags = (metadata: MetaData) => {
  // Update title
  document.title = metadata.title

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property?: boolean) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let meta = document.querySelector(selector) as HTMLMetaElement
    
    if (!meta) {
      meta = document.createElement('meta')
      if (property) {
        meta.setAttribute('property', name)
      } else {
        meta.setAttribute('name', name)
      }
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', content)
  }

  // Basic meta tags
  updateMetaTag('description', metadata.description)
  if (metadata.keywords) {
    updateMetaTag('keywords', metadata.keywords.join(', '))
  }

  // Open Graph tags
  updateMetaTag('og:title', metadata.title, true)
  updateMetaTag('og:description', metadata.description, true)
  updateMetaTag('og:type', metadata.type || 'website', true)
  
  if (metadata.image) {
    updateMetaTag('og:image', metadata.image, true)
  }
  
  if (metadata.url) {
    updateMetaTag('og:url', metadata.url, true)
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', metadata.title)
  updateMetaTag('twitter:description', metadata.description)
  
  if (metadata.image) {
    updateMetaTag('twitter:image', metadata.image)
  }
}

export const generateAppMetadata = (app: any): MetaData => {
  return {
    title: `${app.title} - Vibe Store`,
    description: app.description,
    keywords: app.tags,
    image: app.logo_url || app.screenshots?.[0],
    url: `${window.location.origin}/apps/${app.slug}`,
    type: 'product'
  }
}

export const generateCategoryMetadata = (category: any): MetaData => {
  return {
    title: `${category.name} Apps - Vibe Store`,
    description: `Discover the best ${category.name.toLowerCase()} AI applications on Vibe Store`,
    keywords: [category.name, 'AI', 'apps', 'marketplace'],
    url: `${window.location.origin}/category/${category.slug}`,
    type: 'website'
  }
}