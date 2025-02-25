import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, MessageCircle, Settings, Bot, BrainCircuit, Store, Palette } from 'lucide-react';

export default function Tutorial() {
  return (
    <>
      <Helmet>
        <title>Tutorial - ChatWidget AI</title>
        <meta name="description" content="Learn how to set up and customize your ChatWidget AI for maximum effectiveness" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Getting Started with ChatWidget AI</h1>
          <p className="text-lg opacity-90">
            Follow this comprehensive guide to set up and optimize your AI chat widget for maximum engagement and sales conversion.
          </p>
        </div>

        {/* Basic Setup */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Basic Setup</h2>
              <div className="prose prose-indigo">
                <ol className="space-y-4">
                  <li>
                    <strong>Widget Color:</strong> Choose a color that matches your brand but ensures good contrast for readability.
                  </li>
                  <li>
                    <strong>Business Name:</strong> Use your official business name or a friendly variation that customers will recognize.
                  </li>
                  <li>
                    <strong>Representative Name:</strong> Choose a professional name that reflects your brand's personality.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Writing Effective Business Information */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Writing Effective Business Information</h2>
              <div className="prose prose-indigo">
                <h3 className="text-lg font-medium mb-2">Structure your information in this order:</h3>
                <ol className="space-y-4">
                  <li>
                    <strong>Core Business Description:</strong>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <p className="text-sm text-gray-600">Example:</p>
                      <p className="text-sm">"We are a premium fitness equipment retailer specializing in home gym solutions, with 10 years of experience serving fitness enthusiasts."</p>
                    </div>
                  </li>
                  <li>
                    <strong>Products/Services:</strong>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <p className="text-sm text-gray-600">Example:</p>
                      <p className="text-sm">"Our products include: treadmills ($500-$2000), exercise bikes ($300-$1500), weight sets ($100-$1000), and yoga equipment ($20-$200)."</p>
                    </div>
                  </li>
                  <li>
                    <strong>Unique Selling Points:</strong>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <p className="text-sm text-gray-600">Example:</p>
                      <p className="text-sm">"Free delivery, 30-day returns, expert assembly service, and lifetime warranty on all equipment."</p>
                    </div>
                  </li>
                  <li>
                    <strong>Contact Information:</strong>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <p className="text-sm text-gray-600">Example:</p>
                      <p className="text-sm">"Hours: Mon-Sat 9AM-6PM EST, Phone: 1-800-FITNESS, Email: sales@example.com"</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Training Your AI */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Training Your AI Assistant</h2>
              <div className="prose prose-indigo">
                <h3 className="text-lg font-medium mb-2">Key Areas to Cover:</h3>
                <ul className="space-y-4">
                  <li>
                    <strong>Product Knowledge</strong>
                    <p className="text-gray-600">Include detailed specifications, pricing, and availability of your products/services.</p>
                  </li>
                  <li>
                    <strong>Common Questions</strong>
                    <p className="text-gray-600">Address frequently asked questions about shipping, returns, warranties, etc.</p>
                  </li>
                  <li>
                    <strong>Sales Process</strong>
                    <p className="text-gray-600">Outline your sales funnel, from inquiry to purchase completion.</p>
                  </li>
                  <li>
                    <strong>Special Offers</strong>
                    <p className="text-gray-600">Include current promotions, discounts, and special deals.</p>
                  </li>
                </ul>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Pro Tip:</strong> Update your business information regularly to keep the AI assistant current with your latest offerings and policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Best Practices</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Do's:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-green-700">
                      <span className="mr-2">✓</span>
                      Keep information concise and clear
                    </li>
                    <li className="flex items-center text-green-700">
                      <span className="mr-2">✓</span>
                      Update pricing regularly
                    </li>
                    <li className="flex items-center text-green-700">
                      <span className="mr-2">✓</span>
                      Include contact methods
                    </li>
                    <li className="flex items-center text-green-700">
                      <span className="mr-2">✓</span>
                      Specify business hours
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Don'ts:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-red-700">
                      <span className="mr-2">×</span>
                      Include sensitive information
                    </li>
                    <li className="flex items-center text-red-700">
                      <span className="mr-2">×</span>
                      Write overly long descriptions
                    </li>
                    <li className="flex items-center text-red-700">
                      <span className="mr-2">×</span>
                      Use technical jargon
                    </li>
                    <li className="flex items-center text-red-700">
                      <span className="mr-2">×</span>
                      Forget to update information
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing Your Widget */}
        <section className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Testing Your Widget</h2>
              <div className="prose prose-indigo">
                <ol className="space-y-4">
                  <li>
                    <strong>Preview Mode:</strong>
                    <p className="text-gray-600">Use the "Test Widget" button to preview how your widget appears and functions.</p>
                  </li>
                  <li>
                    <strong>Common Scenarios:</strong>
                    <p className="text-gray-600">Test different types of questions about your products, services, and policies.</p>
                  </li>
                  <li>
                    <strong>Mobile Testing:</strong>
                    <p className="text-gray-600">Check how the widget appears and functions on different devices.</p>
                  </li>
                  <li>
                    <strong>Response Quality:</strong>
                    <p className="text-gray-600">Verify that the AI provides accurate and helpful information.</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}