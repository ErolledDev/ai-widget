import React, { useState } from 'react';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  ip: string;
  name: string | null;
  email: string | null;
  lastMessage: string;
  timestamp: string;
}

export default function Analytics() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // Dummy data for demonstration
  const chatSessions: ChatSession[] = [
    {
      id: '1',
      ip: '192.168.1.1',
      name: 'John Doe',
      email: 'john@example.com',
      lastMessage: "I want to learn more about your products",
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      ip: '192.168.1.2',
      name: null,
      email: null,
      lastMessage: "What are your shipping rates?",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
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
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(session.timestamp), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.name || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.email || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {session.lastMessage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedChat && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h2>
          <div className="space-y-4">
            {/* Chat history will be loaded here */}
            <p className="text-gray-500 text-sm">
              Full chat history will be displayed here when integrated with the backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}