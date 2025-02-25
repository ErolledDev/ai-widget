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
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Account information (email, password)</li>
              <li>Chat interactions and messages</li>
              <li>Contact information when provided (name, email)</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">2. Use of Information</h2>
            <p className="mb-6">
              We use collected information to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide and improve our chat service</li>
              <li>Analyze and enhance user experience</li>
              <li>Communicate with users about their accounts</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Secure access controls and authentication</li>
              <li>Limited employee access to personal data</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. User Rights</h2>
            <p className="mb-6">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">5. Chat Widget Privacy</h2>
            <p className="mb-6">
              When using our chat widget on websites:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Messages are processed to provide AI responses</li>
              <li>Contact information is only collected with explicit consent</li>
              <li>Data is used to improve response accuracy</li>
              <li>Website owners can access chat analytics</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="mb-6">
              We use trusted third-party services for:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Database hosting (Supabase)</li>
              <li>AI processing (Google AI)</li>
              <li>Analytics and monitoring</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
            <p className="mb-6">
              We retain data for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">8. Updates to Privacy Policy</h2>
            <p className="mb-6">
              We may update this policy periodically. Users will be notified of significant changes via email or service notifications.
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
            <p className="mb-6">
              For privacy-related inquiries, contact us at:
              <br />
              Email: <a href="mailto:privacy@chatwidgetai.com" className="text-indigo-600 hover:text-indigo-500">privacy@chatwidgetai.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}