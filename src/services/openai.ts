import { OpenAIResponse } from '../types/journal';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const analyzeJournalEntry = async (text: string): Promise<OpenAIResponse> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY');
  }

  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Journal entry text cannot be empty');
  }

  if (text.trim().length < 10) {
    throw new Error('Journal entry must be at least 10 characters long');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that analyzes journal entries. 
            Provide a brief summary (2-3 sentences) and determine the sentiment (positive, negative, or neutral).
            Respond with JSON format: {"summary": "your summary", "sentiment": "positive|negative|neutral"}`
          },
          {
            role: 'user',
            content: `Please analyze this journal entry: "${text.trim()}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (response.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(content) as OpenAIResponse;
      
      if (!parsedResponse.summary || !parsedResponse.sentiment) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      return {
        summary: parsedResponse.summary,
        sentiment: parsedResponse.sentiment,
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}; 