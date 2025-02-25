import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Code, Globe, Monitor } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Guide() {
  return (
    <>
      <Helmet>
        <title>Installation Guide - ChatWidget AI</title>
        <meta name="description" content="Step-by-step guide for installing ChatWidget AI on your website. Easy integration with WordPress, Shopify, custom sites, and more." />
        <meta name="keywords" content="ChatWidget AI installation, chatbot setup, WordPress chat widget, Shopify chat integration, website chat installation" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center mb-12">
                <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Installation Guide</h1>
                <p className="mt-4 text-lg text-gray-600">
                  Follow these simple steps to add ChatWidget AI to your website
                </p>
              </div>

              <div className="space-y-12">
                {/* General Installation */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Code className="h-6 w-6 mr-2 text-indigo-600" />
                    General Installation
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Add the following code just before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-white text-sm overflow-x-auto">
                        <code>{`<script src="https://chatwidgetai.netlify.app/widget.js"></script>
<script>
  new BusinessChatPlugin({
    uid: 'YOUR_USER_ID'
  });
</script>`}</code>
                      </pre>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Replace YOUR_USER_ID with the ID from your dashboard.
                    </p>
                  </div>
                </section>

                {/* WordPress */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Globe className="h-6 w-6 mr-2 text-indigo-600" />
                    WordPress Installation
                  </h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="text-lg font-medium text-gray-900">Method 1: Using a Plugin</h3>
                      <ol className="mt-4 space-y-4 text-gray-600">
                        <li>1. Install and activate the "Header and Footer Scripts" plugin</li>
                        <li>2. Go to Settings → Header and Footer Scripts</li>
                        <li>3. Paste the widget code in the "Footer" section</li>
                        <li>4. Save changes</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="text-lg font-medium text-gray-900">Method 2: Editing Theme Files</h3>
                      <ol className="mt-4 space-y-4 text-gray-600">
                        <li>1. Go to Appearance → Theme Editor</li>
                        <li>2. Select footer.php from the right sidebar</li>
                        <li>3. Add the widget code before the closing body tag</li>
                        <li>4. Update file</li>
                      </ol>
                    </div>
                  </div>
                </section>

                {/* Shopify */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Monitor className="h-6 w-6 mr-2 text-indigo-600" />
                    Shopify Installation
                  </h2>
                  <div className="space-y-4">
                    <ol className="space-y-4 text-gray-600">
                      <li>1. Go to Online Store → Themes</li>
                      <li>2. Click "Actions" → "Edit code"</li>
                      <li>3. Open theme.liquid</li>
                      <li>4. Add the widget code just before the closing body tag</li>
                      <li>5. Save changes</li>
                    </ol>
                  </div>
                </section>

                {/* Other Platforms */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Other Platforms</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Wix</h3>
                      <ol className="space-y-2 text-gray-600">
                        <li>1. Go to Settings → Custom Code</li>
                        <li>2. Click "Add Custom Code"</li>
                        <li>3. Paste the widget code</li>
                        <li>4. Set placement to "Body - end"</li>
                        <li>5. Apply to all pages</li>
                      </ol>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Squarespace</h3>
                      <ol className="space-y-2 text-gray-600">
                        <li>1. Go to Settings → Advanced</li>
                        <li>2. Select "Code Injection"</li>
                        <li>3. Add code to "Footer"</li>
                        <li>4. Save changes</li>
                      </ol>
                    </div>
                  </div>
                </section>

                {/* Troubleshooting */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Troubleshooting</h2>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          If the widget doesn't appear, try these steps:
                        </p>
                        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                          <li>Clear your browser cache</li>
                          <li>Verify your user ID is correct</li>
                          <li>Check if the code is properly placed before &lt;/body&gt;</li>
                          <li>Ensure no script blockers are active</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="border-t pt-8">
                  <p className="text-gray-600">
                    Need help? Check our <a href="/faq" className="text-indigo-600 hover:text-indigo-500">FAQ</a> or <a href="/contact" className="text-indigo-600 hover:text-indigo-500">contact support</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}