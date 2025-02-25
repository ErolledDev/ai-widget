import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase client with direct environment variables
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_API_KEY || '', // Use service role key for admin access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize Google AI with direct environment variable
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

export async function handler(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Validate environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_API_KEY || !process.env.VITE_GEMINI_API_KEY) {
      console.error('Missing required environment variables');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const { message, userId, settings } = parsedBody;

    // Validate required fields
    if (!message || !userId || !settings) {
      console.error('Missing required fields:', { message: !!message, userId: !!userId, settings: !!settings });
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Validate settings object
    if (!settings.businessName || !settings.representativeName) {
      console.error('Invalid settings object:', settings);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid settings configuration' }),
      };
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{text: `You are a helpful sales representative for ${settings.businessName}. 
            Your name is ${settings.representativeName}.
            Here is the business information you should use to help customers:
            ${settings.businessInfo || 'No additional business information provided.'}
            
            CRITICAL RULES:
            - Keep responses under 150 characters
            - Be helpful and friendly
            - Use natural, conversational language
            - Provide relevant information from the business info
            - Stay professional and on-topic
            - Avoid excessive emojis or informal language`}]
          },
          {
            role: 'model',
            parts: [{text: 'Hi! How can I help you today?'}]
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });

      const result = await chat.sendMessage([{text: message}]);
      const response = await result.response;
      const responseText = response.text();

      // Ensure response isn't too long
      const maxLength = 150;
      const finalResponse = responseText.length > maxLength 
        ? responseText.substring(0, maxLength) + '...'
        : responseText;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ response: finalResponse }),
      };
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Failed to generate AI response',
          details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
        }),
      };
    }
  } catch (error) {
    console.error('Unhandled error in chat function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
}