import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { MessageCircle } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Widget from './pages/Widget';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
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
          <meta name="keywords" content="chat widget, AI customer service, business automation, customer support, conversational AI, live chat, customer engagement" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://chatwidgetai.netlify.app" />
          <meta property="og:title" content="ChatWidget AI - Intelligent Customer Service Solution" />
          <meta property="og:description" content="Transform your customer service with AI-powered chat solutions. Engage visitors 24/7 and boost conversions." />
          <meta property="og:image" content="https://chatwidgetai.netlify.app/og-image.jpg" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://chatwidgetai.netlify.app" />
          <meta name="twitter:title" content="ChatWidget AI" />
          <meta name="twitter:description" content="Transform your customer service with AI-powered chat solutions" />
          <meta name="twitter:image" content="https://chatwidgetai.netlify.app/twitter-image.jpg" />

          {/* Additional SEO */}
          <link rel="canonical" href="https://chatwidgetai.netlify.app" />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="ChatWidget AI" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;