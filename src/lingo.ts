// Mock implementation of AI functions for the Vibe Store app

// Simple client implementation
const createClient = () => ({
  function: () => ({
    input: (schema: any) => ({
      output: (outputType: any) => ({
        implement: (fn: Function) => fn
      })
    })
  })
});

// Initialize the client
export const lingo = createClient();

// Example of a simple translation function
export const translate = async ({ text, targetLanguage }: { text: string; targetLanguage: string }): Promise<string> => {
  console.log(`Translating to ${targetLanguage}: ${text}`);
  return `[Translated to ${targetLanguage}] ${text}`;
};

// Example of a text summarization function
export const summarizeText = async ({ text, maxLength = 100 }: { text: string; maxLength?: number }): Promise<string> => {
  console.log(`Summarizing text with max length ${maxLength}`);
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Simple summarization by truncating and adding ellipsis
  return text.substring(0, maxLength - 3) + '...';
};

// Example of a sentiment analysis function
export const analyzeSentiment = async ({ text }: { text: string }): Promise<{ sentiment: string; score: number }> => {
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
};

// Example of a content moderation function
export const moderateContent = async ({ text }: { text: string }): Promise<{ isAppropriate: boolean; reason?: string }> => {
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
};