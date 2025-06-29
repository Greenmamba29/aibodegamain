import { createClient } from 'lingo.dev';

// Initialize the Lingo client
export const lingo = createClient({
  // The API key is optional for local development
  // but required for production deployments
  apiKey: import.meta.env.VITE_LINGO_API_KEY,
});

// Example of a simple Lingo function
export const translate = lingo.function()
  .input({
    text: 'string',
    targetLanguage: 'string',
  })
  .output('string')
  .implement(async ({ text, targetLanguage }) => {
    // This is a placeholder implementation
    // In a real app, you would call a translation API
    console.log(`Translating to ${targetLanguage}: ${text}`);
    return `[Translated to ${targetLanguage}] ${text}`;
  });

// Example of a Lingo function for AI-powered text summarization
export const summarizeText = lingo.function()
  .input({
    text: 'string',
    maxLength: 'number?',
  })
  .output('string')
  .implement(async ({ text, maxLength = 100 }) => {
    // This is a placeholder implementation
    // In a real app, you would call an AI API for summarization
    console.log(`Summarizing text with max length ${maxLength}`);
    
    if (text.length <= maxLength) {
      return text;
    }
    
    // Simple summarization by truncating and adding ellipsis
    return text.substring(0, maxLength - 3) + '...';
  });

// Example of a Lingo function for sentiment analysis
export const analyzeSentiment = lingo.function()
  .input({
    text: 'string',
  })
  .output({
    sentiment: 'string',
    score: 'number',
  })
  .implement(async ({ text }) => {
    // This is a placeholder implementation
    // In a real app, you would call an AI API for sentiment analysis
    console.log(`Analyzing sentiment for: ${text}`);
    
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
  });

// Example of a Lingo function for content moderation
export const moderateContent = lingo.function()
  .input({
    text: 'string',
  })
  .output({
    isAppropriate: 'boolean',
    reason: 'string?',
  })
  .implement(async ({ text }) => {
    // This is a placeholder implementation
    // In a real app, you would call a content moderation API
    console.log(`Moderating content: ${text}`);
    
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
  });