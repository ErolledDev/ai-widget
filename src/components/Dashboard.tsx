import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { MessageCircle, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WidgetSettings from './WidgetSettings';
import Analytics from './Analytics';

export default function Dashboard() {
  const { supabase } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="w-64 bg-white shadow-lg">
        <div className="h-16 flex items-center justify-center border-b">
          <MessageCircle className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-lg font-semibold">Chat Widget</span>
        </div>
        
        <nav className="mt-6">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-gray-50 border-r-4 border-indigo-600' : ''
              }`
            }
          >
            <MessageCircle className="h-5 w-5" />
            <span className="ml-3">Widget Settings</span>
          </NavLink>
          
          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-gray-50 border-r-4 border-indigo-600' : ''
              }`
            }
          >
            <BarChart3 className="h-5 w-5" />
            <span className="ml-3">Analytics</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="settings" element={<WidgetSettings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="settings" replace />} />
        </Routes>
      </div>
    </div>
  );
}