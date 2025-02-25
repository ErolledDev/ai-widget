import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChatWidget from '../components/ChatWidget';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Widget() {
  const { userId } = useParams();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      if (!userId) {
        setError('User ID is required');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('widget_settings')
          .select('settings')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        if (data) {
          setSettings({
            ...data.settings,
            userId // Add userId to settings for analytics
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load chat widget');
      }
    }

    fetchSettings();
  }, [userId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <ChatWidget settings={settings} />
    </div>
  );
}