import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check } from 'lucide-react';

interface WidgetSettings {
  color: string;
  businessName: string;
  representativeName: string;
  businessInfo: string;
}

export default function WidgetSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WidgetSettings>({
    color: '#4F46E5',
    businessName: '',
    representativeName: '',
    businessInfo: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const scriptCode = `<script src="https://widegetai.netlify.app/${user?.id}/chat.js"></script>
<script>
  new BusinessChatPlugin({
    uid: '${user?.id}'
  });
</script>`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save settings to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated save
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

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

      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Widget Preview</h3>
        <div
          className="border-2 rounded-lg p-4"
          style={{ borderColor: settings.color }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: settings.color }}
            />
            <span className="font-medium">{settings.businessName || 'Your Business'}</span>
          </div>
          <div className="text-sm text-gray-600">
            Preview of how your chat widget will appear on your website
          </div>
        </div>
      </div>
    </div>
  );
}