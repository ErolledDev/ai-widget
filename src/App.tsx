import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Widget from './pages/Widget';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>ChatWidget AI - Intelligent Customer Service Solution</title>
          <meta name="description" content="Transform your customer service with AI-powered chat solutions. Engage visitors 24/7, boost conversions, and provide instant support." />
          <meta name="keywords" content="chat widget, AI customer service, business automation, customer support, conversational AI" />
          <meta property="og:title" content="ChatWidget AI - Intelligent Customer Service Solution" />
          <meta property="og:description" content="Transform your customer service with AI-powered chat solutions" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://chatwidgetai.netlify.app" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ChatWidget AI" />
          <meta name="twitter:description" content="Transform your customer service with AI-powered chat solutions" />
          <link rel="canonical" href="https://chatwidgetai.netlify.app" />
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/widget/:userId" element={<Widget />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;