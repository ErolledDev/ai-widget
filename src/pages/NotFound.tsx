import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, MessageCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - ChatWidget AI</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to ChatWidget AI's homepage." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <MessageCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}