import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HelpCircle } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - ChatWidget AI</title>
        <meta name="description" content="Get answers to common questions about ChatWidget AI - Setup, customization, pricing, and technical support for your AI-powered customer service solution" />
        <meta name="keywords" content="ChatWidget AI FAQ, AI chat widget help, customer service automation FAQ, chatbot setup help" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <HelpCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <p className="mt-4 text-lg text-gray-600">
                  Find answers to common questions about ChatWidget AI
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">General Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">What is ChatWidget AI?</h3>
                      <p className="mt-2 text-gray-600">
                        ChatWidget AI is an intelligent chat solution that provides 24/7 customer service using advanced AI technology. It helps businesses automate customer support while maintaining a personal touch.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How does it work?</h3>
                      <p className="mt-2 text-gray-600">
                        Our widget uses AI to understand customer queries and provide relevant responses based on your business information. It learns from interactions to improve responses over time.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Is it compatible with my website?</h3>
                      <p className="mt-2 text-gray-600">
                        Yes! ChatWidget AI works with any website platform including WordPress, Shopify, Wix, custom sites, and more. Simply add our script to your site.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How do I customize the widget?</h3>
                      <p className="mt-2 text-gray-600">
                        You can customize colors, business information, and chat behavior through your dashboard. Changes are applied instantly.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Is my data secure?</h3>
                      <p className="mt-2 text-gray-600">
                        Yes, we use industry-standard encryption and security measures. Your data is stored securely and never shared with third parties.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">What about GDPR compliance?</h3>
                      <p className="mt-2 text-gray-600">
                        ChatWidget AI is fully GDPR compliant. We only collect necessary data and provide tools for data management and deletion.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Support</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How can I get help?</h3>
                      <p className="mt-2 text-gray-600">
                        We offer email support and detailed documentation. Check our <a href="/guide" className="text-indigo-600 hover:text-indigo-500">installation guide</a> or <a href="/contact" className="text-indigo-600 hover:text-indigo-500">contact us</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}