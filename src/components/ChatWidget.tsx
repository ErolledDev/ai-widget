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
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, startChat, isLoading } = useAIChat(settings);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startChat();
    }
  }, [isOpen, startChat]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isOpen && messages.length > 0) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      setIsScrolled(scrollTop > 20);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');
    await sendMessage(currentMessage);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  return (
    <div 
      className={`fixed bottom-6 ${isTest ? 'right-[320px]' : 'right-6'} z-[999999] flex flex-col items-end font-sans`}
      style={{ '--chat-primary-color': settings.color } as React.CSSProperties}
    >
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 animate-slideUp overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            style={{ background: settings.color }}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
              <h3 className="text-white font-medium">{settings.businessName}</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-messageIn`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[var(--chat-primary-color)] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-messageIn">
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full px-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-[var(--chat-primary-color)] focus:ring-1 focus:ring-[var(--chat-primary-color)]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-all transform hover:scale-105 disabled:opacity-75 disabled:scale-100 disabled:cursor-not-allowed"
                style={{ backgroundColor: settings.color }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Send className="h-5 w-5" strokeWidth={2.5} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="relative w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-full flex items-center justify-center"
          style={{ backgroundColor: settings.color }}
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
          {hasNewMessage && (
            <>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
            </>
          )}
        </button>
      )}
    </div>
  );
}