import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check } from 'lucide-react';
import ChatWidget from './ChatWidget';

interface WidgetSettings {
  color: string;
  businessName: string;
  representativeName: string;
  businessInfo: string;
}

const defaultSettings: WidgetSettings = {
  color: '#4F46E5',
  businessName: '',
  representativeName: '',
  businessInfo: ''
};

export default function WidgetSettings() {
  const { user, supabase } = useAuth();
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTestWidget, setShowTestWidget] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      if (!user?.id) return;

      try {
        setError(null);
        setIsLoading(true);

        const { data, error } = await supabase
          .from('widget_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Settings don't exist yet, create them with defaults
            const { error: insertError } = await supabase
              .from('widget_settings')
              .insert([{
                user_id: user.id,
                settings: defaultSettings
              }])
              .select()
              .single();

            if (insertError) throw insertError;

            if (isMounted) {
              setSettings(defaultSettings);
            }
          } else {
            throw error;
          }
        } else if (data?.settings && isMounted) {
          setSettings(data.settings);
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        if (isMounted) {
          setError('Failed to load settings. Please try refreshing the page.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [user?.id, supabase]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setSaveStatus('idle');
    setError(null);

    try {
      const { error } = await supabase
        .from('widget_settings')
        .upsert({
          user_id: user.id,
          settings
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveStatus('error');
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const scriptCode = `<script src="https://chatwidgetai.netlify.app/widget.js"></script>
<script>
  new BusinessChatPlugin({
    uid: '${user?.id}'
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Widget Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Color
            </label>
            <HexColorPicker
              color={settings.color}
              onChange={(color) => setSettings({ ...settings, color })}
              className="mb-2"
            />
            <input
              type="text"
              value={settings.color}
              onChange={(e) => setSettings({ ...settings, color: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                placeholder="e.g., Cedrick Online Store"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Representative Name
              </label>
              <input
                type="text"
                value={settings.representativeName}
                onChange={(e) => setSettings({ ...settings, representativeName: e.target.value })}
                placeholder="e.g., John Doe"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Detailed Business Information
            <span className="text-sm text-gray-500 font-normal ml-2">
              (Include locations, products, services, contact info)
            </span>
          </label>
          <textarea
            value={settings.businessInfo}
            onChange={(e) => setSettings({ ...settings, businessInfo: e.target.value })}
            rows={8}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Provide comprehensive information about your business..."
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={() => setShowTestWidget(!showTestWidget)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showTestWidget ? 'Hide Test Widget' : 'Test Widget'}
          </button>

          {saveStatus === 'success' && (
            <span className="text-green-600">Settings saved successfully!</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600">{error || 'Error saving settings'}</span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Widget Code'}
          </button>
        </div>
      </div>

      {showTestWidget && (
        <ChatWidget settings={settings} isTest={true} />
      )}
    </div>
  );
}