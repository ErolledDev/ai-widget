import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart2, Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatSession {
  id: string;
  visitor_id: string;
  ip_address: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  last_message: string;
  session_start: string;
  messages_count: number;
}

interface AnalyticsSummary {
  total_chats: number;
  total_messages: number;
  active_users: number;
  avg_messages_per_chat: number;
  trend_percentage: number;
}

export default function Analytics() {
  const { supabase, user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_chats: 0,
    total_messages: 0,
    active_users: 0,
    avg_messages_per_chat: 0,
    trend_percentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch recent chat sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('chat_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('session_start', { ascending: false })
          .limit(50);

        if (sessionsError) throw sessionsError;

        // Calculate summary statistics
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const { data: monthlyStats, error: statsError } = await supabase
          .from('chat_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_start', thirtyDaysAgo);

        if (statsError) throw statsError;

        // Process the data
        const uniqueVisitors = new Set(monthlyStats?.map(s => s.visitor_id) || []);
        const totalMessages = monthlyStats?.reduce((sum, s) => sum + (s.messages_count || 0), 0) || 0;
        const avgMessages = totalMessages / (monthlyStats?.length || 1);

        // Calculate trend (comparing last 30 days to previous 30 days)
        const sixtyDaysAgo = subDays(new Date(), 60).toISOString();
        const { data: previousStats, error: trendError } = await supabase
          .from('chat_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_start', sixtyDaysAgo)
          .lt('session_start', thirtyDaysAgo);

        if (trendError) throw trendError;

        const previousTotal = previousStats?.length || 0;
        const currentTotal = monthlyStats?.length || 0;
        const trendPercentage = previousTotal === 0 
          ? 100 
          : ((currentTotal - previousTotal) / previousTotal) * 100;

        setSummary({
          total_chats: monthlyStats?.length || 0,
          total_messages: totalMessages,
          active_users: uniqueVisitors.size,
          avg_messages_per_chat: Math.round(avgMessages * 10) / 10,
          trend_percentage: Math.round(trendPercentage)
        });

        setChatSessions(sessions || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chats</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {summary.total_chats.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className={summary.trend_percentage >= 0 ? 'text-green-500' : 'text-red-500'}>
              {summary.trend_percentage}%
            </span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {summary.active_users.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-gray-600">Last 30 days</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {summary.total_messages.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <BarChart2 className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-gray-600">
              Avg {summary.avg_messages_per_chat} per chat
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {Math.round((chatSessions.filter(s => s.visitor_email).length / chatSessions.length) * 100)}%
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-gray-600">Email captures</span>
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chatSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => setSelectedChat(session.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(session.session_start), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.visitor_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.messages_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.visitor_name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.visitor_email || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {session.last_message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedChat && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat Details</h2>
            <button
              onClick={() => setSelectedChat(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            {chatSessions.find(s => s.id === selectedChat)?.last_message}
          </div>
        </div>
      )}
    </div>
  );
}