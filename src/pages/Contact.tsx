import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us - ChatWidget AI</title>
        <meta name="description" content="Get in touch with ChatWidget AI support team for any questions or assistance" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center">
                <Mail className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Have questions? We'd love to hear from you.
                </p>
              </div>

              <div className="mt-8">
                <div className="text-center">
                  <p className="text-gray-600">Email us at:</p>
                  <a 
                    href="mailto:villarin_cedrick@yahoo.com"
                    className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    villarin_cedrick@yahoo.com
                  </a>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900">What we can help you with:</h3>
                  <ul className="mt-4 space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <span className="flex-shrink-0">•</span>
                      <span className="ml-3">Technical support and troubleshooting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0">•</span>
                      <span className="ml-3">Account management assistance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0">•</span>
                      <span className="ml-3">Feature requests and feedback</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0">•</span>
                      <span className="ml-3">Partnership opportunities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}