import { useState, useCallback } from 'react';
import { AIService } from '../services/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useAIChat(context: {
  businessName: string;
  representativeName: string;
  businessInfo: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiService] = useState(() => new AIService(context));
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const response = await aiService.sendMessage(content);
      
      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  const startChat = useCallback(() => {
    const greeting = aiService.getInitialGreeting();
    setMessages([
      {
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [aiService]);

  return {
    messages,
    sendMessage,
    startChat,
    isLoading,
    getFormPrompt: AIService.getFormPrompt,
  };
}