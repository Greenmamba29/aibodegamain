import React, { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { toast } from 'react-hot-toast';

export const TranslationTool: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [loading, setLoading] = useState(false);

  const languages = [
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Japanese',
    'Chinese',
    'Korean',
    'Arabic'
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setLoading(true);
    try {
      // Mock translation function
      const mockTranslate = (text: string, language: string) => {
        const translations: Record<string, string> = {
          'Spanish': `[Traducido al español] ${text}`,
          'French': `[Traduit en français] ${text}`,
          'German': `[Auf Deutsch übersetzt] ${text}`,
          'Italian': `[Tradotto in italiano] ${text}`,
          'Portuguese': `[Traduzido para português] ${text}`,
          'Russian': `[Переведено на русский] ${text}`,
          'Japanese': `[日本語に翻訳] ${text}`,
          'Chinese': `[翻译成中文] ${text}`,
          'Korean': `[한국어로 번역] ${text}`,
          'Arabic': `[مترجم إلى العربية] ${text}`
        };
        
        return translations[language] || `[Translated to ${language}] ${text}`;
      };
      
      const result = mockTranslate(sourceText, targetLanguage);
      
      setTranslatedText(result);
      toast.success(`Translated to ${targetLanguage} successfully`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Translation Tool</h2>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-gray-600">Translate text between languages using AI</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Text
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={8}
                placeholder="Enter text to translate..."
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Translation
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <textarea
                  value={translatedText}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={8}
                  placeholder="Translation will appear here..."
                />
                {loading && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleTranslate}
              loading={loading}
              icon={ArrowRight}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Translate
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Powered by AI translation engine
          </div>
        </CardContent>
      </Card>
    </div>
  );
};