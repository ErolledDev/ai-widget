import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const widgetStyles = {
    '--chat-primary-color': settings.color,
  } as React.CSSProperties;

  return (
    <div 
      className={`fixed ${isTest ? 'right-[320px]' : 'right-6'} bottom-6 z-50 flex flex-col items-end`}
      style={widgetStyles}
    >
      {isOpen && (
        <div className="mb-4 w-[350px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 animate-slideUp overflow-hidden">
          {/* Header */}
          <div 
            className="p-4 flex justify-between items-center border-b relative"
            style={{ 
              background: `linear-gradient(135deg, ${settings.color}, ${settings.color}dd)`,
              boxShadow: isScrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-medium text-white block">{settings.businessName}</span>
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-messageIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[var(--chat-primary-color)] to-[var(--chat-primary-color)/90] text-white'
                      : 'bg-gray-100 text-gray-800'
                  } shadow-sm`}
                  style={{
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined
                  }}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-messageIn">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {isScrolled && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:border-[var(--chat-primary-color)] focus:ring-1 focus:ring-[var(--chat-primary-color)] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-2 rounded-xl text-white flex items-center justify-center w-12 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:scale-100 disabled:cursor-not-allowed"
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

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="relative rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 group"
          style={{ backgroundColor: settings.color }}
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
          {hasNewMessage && (
            <>
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full" />
            </>
          )}
        </button>
      )}
    </div>
  );
}