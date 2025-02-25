import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_API_KEY, // This is the service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const userId = event.path.split('/').pop();

  if (!userId) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'User ID is required' })
    };
  }

  try {
    const { data, error } = await supabase
      .from('widget_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: error.code === 'PGRST116' ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: error.code === 'PGRST116' ? 'Settings not found' : 'Failed to fetch settings'
        })
      };
    }

    if (!data) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Settings not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data.settings)
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}