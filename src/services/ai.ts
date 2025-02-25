import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Create a Supabase client with service role key for analytics
const analyticsClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_API_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface ChatContext {
  businessName: string;
  representativeName: string;
  businessInfo: string;
  userId?: string;
}

export class AIService {
  private chat;
  private context: ChatContext;
  private readonly maxResponseLength = 150;
  private visitorId: string;
  private sessionStartTime: Date;
  private messageCount: number = 0;
  private lastResponse: string = '';

  constructor(context: ChatContext) {
    this.context = this.sanitizeContext(context);
    this.visitorId = uuidv4();
    this.sessionStartTime = new Date();
    this.messageCount = 0;
    
    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: `You are a helpful sales representative for ${this.context.businessName}. 
          Your name is ${this.context.representativeName}.
          Here is the business information you should use to help customers:
          ${this.context.businessInfo}
          
          CRITICAL RULES:
          - Keep responses under 150 characters
          - Be helpful and friendly
          - Use natural, conversational language
          - Provide relevant information from the business info
          - Stay professional and on-topic
          - Avoid excessive emojis or informal language
          
          Example responses:
          - "Hi! I can help you learn more about our products and services. What are you looking for?"
          - "We offer [specific product/service]. Would you like more details?"
          - "I'd be happy to explain our [feature/service]. What would you like to know?"`,
        },
        {
          role: 'model',
          parts: 'Hi! How can I help you today?',
        },
      ],
    });
  }

  private sanitizeContext(context: ChatContext): ChatContext {
    return {
      businessName: this.sanitizeText(context.businessName),
      representativeName: this.sanitizeText(context.representativeName),
      businessInfo: this.sanitizeText(context.businessInfo),
      userId: context.userId
    };
  }

  private sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendMessage(message: string): Promise<string> {
    try {
      this.messageCount++;
      const sanitizedMessage = this.sanitizeText(message);
      
      // Check if it's a contact form submission
      if (sanitizedMessage.includes('Contact Information:')) {
        const visitorInfo = this.parseContactInfo(sanitizedMessage);
        await this.updateAnalyticsWithVisitorInfo(visitorInfo);
        return "Thank you for providing your contact information! How else can I assist you today?";
      }

      const result = await this.chat.sendMessage(sanitizedMessage);
      const response = await result.response;
      const responseText = response.text();
      
      this.lastResponse = responseText.length > this.maxResponseLength 
        ? responseText.substring(0, this.maxResponseLength) + '...'
        : responseText;
      
      if (this.context.userId) {
        await this.updateAnalytics(message, this.lastResponse);
      }
      
      return this.lastResponse;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'I apologize, but I encountered an error. How else can I assist you?';
    }
  }

  private parseContactInfo(message: string): { name?: string; email?: string } {
    const nameMatch = message.match(/Name: (.*?)(?:\n|$)/);
    const emailMatch = message.match(/Email: (.*?)(?:\n|$)/);
    
    return {
      name: nameMatch?.[1],
      email: emailMatch?.[1]
    };
  }

  private async updateAnalyticsWithVisitorInfo(visitorInfo: { name?: string; email?: string }) {
    if (!this.context.userId) return;

    try {
      const { error } = await analyticsClient
        .from('chat_analytics')
        .update({
          visitor_name: visitorInfo.name,
          visitor_email: visitorInfo.email,
          updated_at: new Date().toISOString()
        })
        .eq('visitor_id', this.visitorId)
        .eq('user_id', this.context.userId);

      if (error) {
        console.error('Error updating visitor info:', error);
      }
    } catch (error) {
      console.error('Error in analytics operation:', error);
    }
  }

  private async updateAnalytics(message: string, response: string) {
    if (!this.context.userId) return;

    try {
      // Check for existing session
      const { data: existingSession, error: fetchError } = await analyticsClient
        .from('chat_analytics')
        .select('id')
        .eq('visitor_id', this.visitorId)
        .eq('user_id', this.context.userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching session:', fetchError);
        return;
      }

      if (existingSession) {
        // Update existing session
        const { error: updateError } = await analyticsClient
          .from('chat_analytics')
          .update({
            messages_count: this.messageCount,
            last_message: message,
            session_end: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);

        if (updateError) {
          console.error('Error updating analytics:', updateError);
        }
      } else {
        // Create new session
        const { error: insertError } = await analyticsClient
          .from('chat_analytics')
          .insert({
            user_id: this.context.userId,
            visitor_id: this.visitorId,
            session_start: this.sessionStartTime.toISOString(),
            first_message: message,
            last_message: message,
            messages_count: this.messageCount
          });

        if (insertError) {
          console.error('Error inserting analytics:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in analytics operation:', error);
    }
  }

  getInitialGreeting(): string {
    return 'Hi! How can I help you today?';
  }

  static getFormPrompt(): string {
    return "Would you like to share your contact information?";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}