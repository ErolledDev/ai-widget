import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { MessageCircle, BarChart3, LogOut, Settings, Users, Bell, BookOpen, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WidgetSettings from './WidgetSettings';
import Analytics from './Analytics';
import Tutorial from './Tutorial';
import AccountModal from './AccountModal';

export default function Dashboard() {
  const { supabase } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-8 w-8 text-indigo-600"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
          </svg>
          <span className="ml-3 text-lg font-semibold text-gray-900">ChatWidget AI</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Settings className="h-5 w-5 mr-3" />
            Widget Settings
          </NavLink>
          
          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            Analytics
          </NavLink>

          <NavLink
            to="/dashboard/tutorial"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <BookOpen className="h-5 w-5 mr-3" />
            Tutorial
          </NavLink>

          <NavLink
            to="/guide"
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            Installation Guide
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="h-16 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsAccountModalOpen(true)}
                className="text-gray-500 hover:text-gray-600"
              >
                <Users className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="p-8">
          <Routes>
            <Route path="settings" element={<WidgetSettings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tutorial" element={<Tutorial />} />
            <Route path="*" element={<Navigate to="settings" replace />} />
          </Routes>
        </main>
      </div>

      {/* Account Modal */}
      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}