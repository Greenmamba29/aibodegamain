import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './Button'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry)
      console.error('Production error:', { error, errorInfo })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return <ErrorFallback 
        error={this.state.error!} 
        onReload={this.handleReload} 
        onGoHome={this.handleGoHome} 
      />;
    }

    return this.props.children
  }
}

// Functional component wrapper to use translation hook
const ErrorFallback: React.FC<{ error: Error; onReload: () => void; onGoHome: () => void }> = ({ 
  error, 
  onReload, 
  onGoHome 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          {t('error_title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('error_message')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={onReload}
          >
            {t('refresh_page')}
          </Button>
          <Button
            variant="outline"
            icon={Home}
            onClick={onGoHome}
          >
            {t('go_home')}
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              {t('error_details')}
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
}