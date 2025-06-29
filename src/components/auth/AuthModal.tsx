import React, { useState } from 'react'
import { X, Mail, Lock, User, Github } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../hooks/useTranslation'
import { signInWithProvider } from '../../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { t } = useTranslation()
  const { signIn, signUp } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    setError('')

    try {
      const { error } = await signInWithProvider(provider)
      if (error) throw error
      // The redirect will handle the rest
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`)
    } finally {
      setSocialLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'signin' ? t('welcome_back') : t('join_vibe_store')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Social Authentication */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full"
              icon={Github}
              onClick={() => handleSocialAuth('github')}
              loading={socialLoading === 'github'}
              disabled={socialLoading !== null}
            >
              {t('continue_with')} GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialAuth('google')}
              loading={socialLoading === 'google'}
              disabled={socialLoading !== null}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('continue_with')} Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('or_continue_with_email')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label={t('full_name')}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
                required
                placeholder={t('enter_full_name')}
              />
            )}
            
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              placeholder={t('enter_email')}
            />
            
            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              placeholder={t('enter_password')}
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={socialLoading !== null}
            >
              {mode === 'signin' ? t('sign_in') : t('create_account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin' ? t('no_account') : t('have_account')}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                {mode === 'signin' ? t('sign_up') : t('sign_in')}
              </button>
            </p>
          </div>

          {mode === 'signup' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              {t('terms_agreement')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}