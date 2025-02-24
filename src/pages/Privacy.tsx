import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackButton from '../components/BackButton';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - ChatWidget AI</title>
        <meta name="description" content="Privacy policy and data handling practices for ChatWidget AI - Secure and transparent AI chat solutions" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-indigo">
            <h2 className="text-xl font-semibold mb-4">1. Data Collection</h2>
            <p className="mb-6">
              We collect information that you provide directly to us, including account information and chat interactions.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Use of Information</h2>
            <p className="mb-6">
              We use collected information to provide and improve our services, communicate with you, and ensure security.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="mb-6">
              We may use third-party services to process data. These services are bound by confidentiality agreements.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-6">
              You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Updates</h2>
            <p className="mb-6">
              We may update this policy periodically. Check back regularly for any changes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}