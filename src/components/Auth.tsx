import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Sparkles, BarChart2, Palette, Clock, Shield, Bot, Settings } from 'lucide-react';

export default function Auth() {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Sign Up - ChatWidget AI' : 'Sign In - ChatWidget AI'}</title>
        <meta name="description" content={isSignUp ? 
          "Create your ChatWidget AI account and start providing intelligent customer service today" : 
          "Sign in to ChatWidget AI to manage your AI-powered customer service widget"
        } />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Hero Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-xl mx-auto text-white">
            <div className="flex items-center space-x-3 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              <h1 className="text-3xl font-bold">ChatWidget AI</h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Transform Your Customer Service with AI Intelligence
            </h2>
            
            <p className="text-xl text-indigo-100 mb-12">
              Engage visitors 24/7, boost conversions, and provide instant support with our advanced AI-powered chat solution.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart AI Responses</h3>
                  <p className="text-indigo-200">Natural conversations that understand context and intent</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Live Analytics</h3>
                  <p className="text-indigo-200">Track engagement and conversion metrics in real-time</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Palette className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Custom Styling</h3>
                  <p className="text-indigo-200">Match your brand with customizable themes</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Support</h3>
                  <p className="text-indigo-200">Always-on automated customer service</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t border-indigo-500/30 pt-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-indigo-300 mr-2" />
                  <span className="text-indigo-200">Secure & Private</span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-indigo-300 mr-2" />
                  <span className="text-indigo-200">Easy Setup</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-indigo-300 mr-2" />
                  <span className="text-indigo-200">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-center">
                {isSignUp ? 'Get started today' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-center text-gray-600">
                {isSignUp
                  ? 'Create your account to start engaging customers'
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
                </button>
              </div>

              <div className="text-center space-y-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>

                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <Link to="/guide" className="hover:text-indigo-600">Guide</Link>
                  <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
                  <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
                  <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
                  <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}