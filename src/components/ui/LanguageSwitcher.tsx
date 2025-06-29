import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onLanguageChange?: (language: string) => void;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  className = '',
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const { language: currentLang, setLanguage } = useTranslation();

  useEffect(() => {
    // Check if there's a language preference in localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
        setLanguage(language.code);
      }
    } else {
      // Check if there's a language in the URL (e.g., ?lang=es)
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam) {
        const language = languages.find(lang => lang.code === langParam);
        if (language) {
          setCurrentLanguage(language);
          localStorage.setItem('preferredLanguage', language.code);
          setLanguage(language.code);
        }
      }
    }
  }, [setLanguage]);
  
  // Update current language when it changes in the context
  useEffect(() => {
    const language = languages.find(lang => lang.code === currentLang);
    if (language && language.code !== currentLanguage.code) {
      setCurrentLanguage(language);
    }
  }, [currentLang, currentLanguage.code]);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
    setLanguage(language.code);
    localStorage.setItem('preferredLanguage', language.code);
    
    // Update URL with language parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language.code);
    window.history.replaceState({}, '', url);
    
    // Call the callback if provided
    if (onLanguageChange) {
      onLanguageChange(language.code);
    }
    
    toast.success(`Language changed to ${language.name}`);
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={`
              px-2 py-1 rounded-md transition-colors
              ${currentLanguage.code === language.code 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100 text-gray-700'}
              ${sizeClasses[size]}
            `}
          >
            <span>{language.flag}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-md
          hover:bg-gray-100 transition-colors
          ${sizeClasses[size]}
        `}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {currentLanguage.code === language.code && (
                  <Check className="w-4 h-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};