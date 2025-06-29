import React, { useState } from 'react';
import { TextAnalyzer } from './TextAnalyzer';
import { TranslationTool } from './TranslationTool';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { MessageSquare, Globe, Zap, ArrowLeft } from 'lucide-react';

export const AIToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'text-analyzer' | 'translation' | null>(null);

  const handleBack = () => {
    setActiveTool(null);
  };

  if (activeTool === 'text-analyzer') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={handleBack}
            className="mb-6"
          >
            Back to AI Tools
          </Button>
          <TextAnalyzer />
        </div>
      </div>
    );
  }

  if (activeTool === 'translation') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={handleBack}
            className="mb-6"
          >
            Back to AI Tools
          </Button>
          <TranslationTool />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Tools
            </h1>
            <p className="text-xl text-gray-600">
              Experience the power of AI with our suite of tools
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer"
            onClick={() => setActiveTool('text-analyzer')}
          >
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Text Analyzer</h2>
            <p className="text-gray-600 mb-6">
              Analyze text sentiment, summarize content, and moderate text using AI
            </p>
            <Button 
              variant="outline" 
              icon={Zap}
              onClick={() => setActiveTool('text-analyzer')}
              className="w-full"
            >
              Open Text Analyzer
            </Button>
          </div>

          <div 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer"
            onClick={() => setActiveTool('translation')}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Translation Tool</h2>
            <p className="text-gray-600 mb-6">
              Translate text between multiple languages with AI-powered accuracy
            </p>
            <Button 
              variant="outline" 
              icon={Globe}
              onClick={() => setActiveTool('translation')}
              className="w-full"
            >
              Open Translation Tool
            </Button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Multilingual Support
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Our platform supports multiple languages. You can switch between languages using the language selector in the header or footer.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Your Language</h3>
              <p className="text-sm text-gray-600">
                Select your preferred language from the language dropdown
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Translation</h3>
              <p className="text-sm text-gray-600">
                Content is automatically translated throughout the site
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seamless Experience</h3>
              <p className="text-sm text-gray-600">
                Enjoy a fully localized experience in your preferred language
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};