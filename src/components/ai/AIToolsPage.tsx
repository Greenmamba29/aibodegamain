import React, { useState } from 'react';
import { TextAnalyzer } from './TextAnalyzer';
import { TranslationTool } from './TranslationTool';
import { Button } from '../ui/Button';
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tools Powered by LINGO.dev
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of AI with our suite of tools built using the LINGO.dev compiler
          </p>
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
            How It Works
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            These tools are powered by LINGO.dev, a TypeScript-first AI compiler that enables seamless integration of AI capabilities into web applications. The compiler optimizes AI function calls and provides type safety for AI operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Define AI Functions</h3>
              <p className="text-sm text-gray-600">
                AI functions are defined with TypeScript types for inputs and outputs
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compile with LINGO</h3>
              <p className="text-sm text-gray-600">
                LINGO.dev compiles the functions for optimal performance
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Use in React Components</h3>
              <p className="text-sm text-gray-600">
                Call AI functions directly from React components with type safety
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};