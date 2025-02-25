import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_API_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function handler(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    const { message, userId, settings } = JSON.parse(event.body);

    if (!message || !userId || !settings) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: `You are a helpful sales representative for ${settings.businessName}. 
          Your name is ${settings.representativeName}. 
          Here is the business information you should use to help customers:
          ${settings.businessInfo}
          
          CRITICAL RULES:
          - Always respond with "Tell us what you need! 👋"
          - Keep responses under 25 characters
          - Always include the wave emoji 👋
          - No other emojis allowed
          - No punctuation except !
          - No greetings or formalities
          - No names or self-references
          - Keep it simple and friendly
          
          ALWAYS RESPOND WITH:
          "Tell us what you need! 👋"`,
        },
        {
          role: 'model',
          parts: 'Tell us what you need! 👋',
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    // Force the consistent response regardless of AI output
    const forcedResponse = "Tell us what you need! 👋";

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ response: forcedResponse }),
    };
  } catch (error) {
    console.error('Error processing chat:', error);
    
    // Check if it's a Gemini API error
    if (error.message?.includes('API key not valid')) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Chat service is temporarily unavailable. Please try again later.'
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to process chat message'
      }),
    };
  }
}