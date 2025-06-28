// Performance optimization utilities

// Image lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  })
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memory usage monitoring
export const getMemoryUsage = (): MemoryInfo | null => {
  if ('memory' in performance) {
    return (performance as any).memory
  }
  return null
}

// Bundle size analysis
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0

    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src && !src.startsWith('http')) {
        fetch(src)
          .then(response => response.blob())
          .then(blob => {
            totalSize += blob.size
            console.log(`Script ${src}: ${(blob.size / 1024).toFixed(2)} KB`)
          })
      }
    })

    setTimeout(() => {
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
    }, 1000)
  }
}

// Performance metrics
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
}

// Async performance measurement
export const measureAsyncPerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}