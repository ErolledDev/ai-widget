import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check, Download, Upload } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch settings only once on component mount
  useEffect(() => {
    async function fetchSettings() {
      if (!user?.id || initialized) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('widget_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no data found
          throw error;
        }
        
        if (data?.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    }

    fetchSettings();
  }, [user, supabase, initialized]);

  const handleSave = async () => {
    if (!user?.id) {
      setError('You must be logged in to save settings');
      return;
    }

    // Validate settings
    if (!settings.businessName.trim()) {
      setError('Business name is required');
      return;
    }

    if (!settings.representativeName.trim()) {
      setError('Representative name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: upsertError } = await supabase
        .from('widget_settings')
        .upsert({
          user_id: user.id,
          settings: {
            color: settings.color,
            businessName: settings.businessName.trim(),
            representativeName: settings.representativeName.trim(),
            businessInfo: settings.businessInfo.trim()
          }
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      setError('Settings saved successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
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

  const handleExport = () => {
    const blob = new Blob([settings.businessInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-info.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSettings(prev => ({
        ...prev,
        businessInfo: content
      }));
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Widget Settings</h1>
      
      {error && (
        <div 
          className={`mb-4 p-4 rounded ${
            error.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {error}
        </div>
      )}

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
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                placeholder="e.g., Acme Corp"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Representative Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.representativeName}
                onChange={(e) => setSettings({ ...settings, representativeName: e.target.value })}
                placeholder="e.g., John Smith"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt"
              className="hidden"
            />
            <button
              onClick={handleImport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Detailed Business Information
            <span className="text-sm text-gray-500 font-normal ml-2">
              (Include products, services, contact info)
            </span>
          </label>
          <textarea
            value={settings.businessInfo}
            onChange={(e) => setSettings({ ...settings, businessInfo: e.target.value })}
            rows={8}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe your business, products, and services..."
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
        </div>

        <button
          onClick={copyToClipboard}
          className="inline-flex items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Widget Code'}
        </button>
      </div>

      {showTestWidget && (
        <ChatWidget settings={settings} isTest={true} />
      )}
    </div>
  );
}