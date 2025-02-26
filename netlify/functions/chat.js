import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate environment variables early
const requiredEnvVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_API_KEY: process.env.VITE_API_KEY,
  VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
}

// Initialize Supabase client with environment variables
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

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

export async function handler(event) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check for missing environment variables
    if (missingEnvVars.length > 0) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Server configuration error',
          details: process.env.NODE_ENV === 'development' ? `Missing environment variables: ${missingEnvVars.join(', ')}` : undefined
        })
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    const { message, userId, settings } = parsedBody;

    // Enhanced request validation
    const validationErrors = [];
    if (!message) validationErrors.push('message is required');
    if (!userId) validationErrors.push('userId is required');
    if (!settings) validationErrors.push('settings is required');
    if (settings && (!settings.businessName || !settings.representativeName)) {
      validationErrors.push('settings must include businessName and representativeName');
    }

    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Validation failed',
          details: validationErrors 
        })
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: finalResponse })
      };
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to generate AI response',
          details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
        })
      };
    }
  } catch (error) {
    console.error('Unhandled error in chat function:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
}