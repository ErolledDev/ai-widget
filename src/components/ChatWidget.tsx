import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';

interface ChatWidgetProps {
  settings: {
    color: string;
    businessName: string;
    representativeName: string;
    businessInfo: string;
  };
  isTest?: boolean;
}

export default function ChatWidget({ settings, isTest = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, startChat, isLoading } = useAIChat(settings);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startChat();
    }
  }, [isOpen, startChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');
    await sendMessage(currentMessage);
  };

  const widgetStyles = {
    '--chat-primary-color': settings.color,
  } as React.CSSProperties;

  return (
    <div 
      className={`fixed ${isTest ? 'right-[320px]' : 'right-4'} bottom-4 z-50 flex flex-col`}
      style={widgetStyles}
    >
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          <div 
            className="p-4 flex justify-between items-center border-b"
            style={{ backgroundColor: settings.color }}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-white" />
              <span className="font-medium text-white">{settings.businessName}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-75"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-white flex items-center justify-center w-12"
                style={{ backgroundColor: settings.color }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full p-4 text-white shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: settings.color }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}