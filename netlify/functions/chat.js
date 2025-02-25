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
          - Keep responses under 150 characters
          - Be helpful and friendly
          - Use natural, conversational language
          - Provide relevant information from the business info
          - Stay professional and on-topic
          - Avoid excessive emojis or informal language
          
          Example responses:
          - "Hi! I can help you learn more about our products and services. What are you looking for?"
          - "We offer [specific product/service]. Would you like more details?"
          - "I'd be happy to explain our [feature/service]. What would you like to know?"`,
        },
        {
          role: 'model',
          parts: 'Hi! How can I help you today?',
        },
      ],
    });

    const result = await chat.sendMessage(message);
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