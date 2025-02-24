import React, { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { BarChart2, Users, MessageSquare, TrendingUp, Calendar, Clock, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Helmet } from 'react-helmet-async';

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

interface DailyStats {
  date: string;
  chats: number;
  messages: number;
  users: number;
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
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = subDays(new Date(), daysAgo).toISOString();

        // Fetch recent chat sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('chat_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_start', startDate)
          .order('session_start', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Process daily statistics
        const dailyData: { [key: string]: DailyStats } = {};
        const now = new Date();
        
        // Initialize all days with zero values
        for (let i = 0; i < daysAgo; i++) {
          const date = format(subDays(now, i), 'yyyy-MM-dd');
          dailyData[date] = {
            date,
            chats: 0,
            messages: 0,
            users: new Set<string>()
          } as any;
        }

        // Aggregate session data by day
        sessions?.forEach(session => {
          const date = format(parseISO(session.session_start), 'yyyy-MM-dd');
          if (dailyData[date]) {
            dailyData[date].chats++;
            dailyData[date].messages += session.messages_count;
            (dailyData[date].users as Set<string>).add(session.visitor_id);
          }
        });

        // Convert Sets to counts and prepare final data
        const processedDailyStats = Object.values(dailyData)
          .map(day => ({
            ...day,
            users: (day.users as Set<string>).size
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Calculate summary statistics
        const totalMessages = sessions?.reduce((sum, s) => sum + (s.messages_count || 0), 0) || 0;
        const uniqueVisitors = new Set(sessions?.map(s => s.visitor_id) || []);
        const avgMessages = totalMessages / (sessions?.length || 1);

        // Calculate trend
        const previousPeriodStart = subDays(new Date(startDate), daysAgo).toISOString();
        const { data: previousStats } = await supabase
          .from('chat_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_start', previousPeriodStart)
          .lt('session_start', startDate);

        const previousTotal = previousStats?.length || 0;
        const currentTotal = sessions?.length || 0;
        const trendPercentage = previousTotal === 0 
          ? 100 
          : ((currentTotal - previousTotal) / previousTotal) * 100;

        setDailyStats(processedDailyStats);
        setSummary({
          total_chats: sessions?.length || 0,
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
  }, [user, supabase, timeRange]);

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
    <>
      <Helmet>
        <title>Analytics Dashboard - ChatWidget AI</title>
        <meta name="description" content="View detailed analytics and insights about your ChatWidget AI performance" />
      </Helmet>

      <div className="space-y-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

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
              <span className="text-gray-600 ml-2">vs previous period</span>
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
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Last {timeRange}</span>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Chats Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Chat Sessions</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(parseISO(date as string), 'MMM d, yyyy')}
                  />
                  <Bar dataKey="chats" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Users Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Users Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(parseISO(date as string), 'MMM d, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
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
    </>
  );
}