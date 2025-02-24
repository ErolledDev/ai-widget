import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackButton from '../components/BackButton';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - ChatWidget AI</title>
        <meta name="description" content="Terms of service and usage conditions for ChatWidget AI - Your AI-powered customer service solution" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-indigo">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using ChatWidget AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-6">
              Permission is granted to temporarily use ChatWidget AI for personal or business use, subject to these Terms of Service.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Service Description</h2>
            <p className="mb-6">
              ChatWidget AI provides an AI-powered chat widget for customer service. The service is provided "as is" and we make no warranties about its availability or performance.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Fair Usage</h2>
            <p className="mb-6">
              Users must not misuse the service or attempt to access it using unauthorized methods. We reserve the right to terminate access for violations.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Privacy</h2>
            <p className="mb-6">
              Your use of ChatWidget AI is also governed by our Privacy Policy. Please review it to understand our practices.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Modifications</h2>
            <p className="mb-6">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}