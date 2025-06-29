import React, { useState } from 'react';
import { MessageSquare, Zap, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { toast } from 'react-hot-toast';

// Mock AI functions
const analyzeSentiment = async ({ text }: { text: string }) => {
  // Simple mock implementation
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: 0.5 + (positiveCount * 0.1) };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: 0.5 - (negativeCount * 0.1) };
  } else {
    return { sentiment: 'neutral', score: 0.5 };
  }
};

const moderateContent = async ({ text }: { text: string }) => {
  const inappropriateWords = ['offensive', 'inappropriate', 'vulgar'];
  const lowerText = text.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (lowerText.includes(word)) {
      return {
        isAppropriate: false,
        reason: `Contains inappropriate content: "${word}"`,
      };
    }
  }
  
  return {
    isAppropriate: true,
  };
};

const summarizeText = async ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Simple summarization by truncating and adding ellipsis
  return text.substring(0, maxLength - 3) + '...';
};

export const TextAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [sentiment, setSentiment] = useState<{ sentiment: string; score: number } | null>(null);
  const [moderation, setModeration] = useState<{ isAppropriate: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState({
    summarize: false,
    sentiment: false,
    moderation: false
  });

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setLoading(prev => ({ ...prev, summarize: true }));
    try {
      const result = await summarizeText({ text, maxLength: 150 });
      setSummary(result);
      toast.success('Text summarized successfully');
    } catch (error) {
      console.error('Error summarizing text:', error);
      toast.error('Failed to summarize text');
    } finally {
      setLoading(prev => ({ ...prev, summarize: false }));
    }
  };

  const handleSentimentAnalysis = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setLoading(prev => ({ ...prev, sentiment: true }));
    try {
      const result = await analyzeSentiment({ text });
      setSentiment(result);
      toast.success('Sentiment analysis complete');
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Failed to analyze sentiment');
    } finally {
      setLoading(prev => ({ ...prev, sentiment: false }));
    }
  };

  const handleContentModeration = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to moderate');
      return;
    }

    setLoading(prev => ({ ...prev, moderation: true }));
    try {
      const result = await moderateContent({ text });
      setModeration(result);
      toast.success('Content moderation complete');
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
    } finally {
      setLoading(prev => ({ ...prev, moderation: false }));
    }
  };

  const getSentimentColor = () => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    
    switch (sentiment.sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = () => {
    if (!sentiment) return null;
    
    switch (sentiment.sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 mr-1" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Text Analysis</h2>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-gray-600">Analyze, summarize, and moderate text using AI</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={6}
              placeholder="Enter text to analyze..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSummarize}
              loading={loading.summarize}
              icon={MessageSquare}
            >
              Summarize
            </Button>
            <Button
              onClick={handleSentimentAnalysis}
              loading={loading.sentiment}
              icon={Zap}
              variant="secondary"
            >
              Analyze Sentiment
            </Button>
            <Button
              onClick={handleContentModeration}
              loading={loading.moderation}
              icon={AlertTriangle}
              variant="outline"
            >
              Moderate Content
            </Button>
          </div>

          {summary && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                Summary
              </h3>
              <p className="text-gray-700">{summary}</p>
            </div>
          )}

          {sentiment && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                Sentiment Analysis
              </h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getSentimentColor()}`}>
                  {getSentimentIcon()}
                  {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)}
                </span>
                <span className="text-gray-700">
                  Score: {(sentiment.score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {moderation && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Content Moderation
              </h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${moderation.isAppropriate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {moderation.isAppropriate ? 'Appropriate' : 'Inappropriate'}
                </span>
                {moderation.reason && (
                  <span className="text-gray-700">{moderation.reason}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};