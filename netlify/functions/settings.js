import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_API_KEY
);

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const userId = event.path.split('/').pop();

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User ID is required' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('widget_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data.settings),
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch settings' }),
    };
  }
}