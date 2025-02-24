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
          
          Always be friendly, professional, and sales-oriented in your responses.
          Focus on helping customers find products or services that match their needs.
          If asked about something not related to the business, politely redirect the conversation back to how you can help them with ${settings.businessName}'s offerings.`,
        },
        {
          role: 'model',
          parts: `I understand. I'll act as ${settings.representativeName}, a sales representative for ${settings.businessName}. I'll use the provided business information to help customers and maintain a professional, sales-oriented approach.`,
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ response: response.text() }),
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