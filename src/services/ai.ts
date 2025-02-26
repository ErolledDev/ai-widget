import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

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
  private context: ChatContext;
  private readonly maxResponseLength = 150;
  private visitorId: string;
  private sessionStartTime: Date;
  private messageCount: number = 0;
  private lastResponse: string = '';
  private ipAddress: string | null = null;

  constructor(context: ChatContext) {
    this.context = this.sanitizeContext(context);
    this.visitorId = localStorage.getItem('chatWidgetVisitorId') || uuidv4();
    localStorage.setItem('chatWidgetVisitorId', this.visitorId);
    this.sessionStartTime = new Date();
    this.messageCount = 0;
    
    // Get IP address
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        this.ipAddress = data.ip;
        this.updateAnalytics('', '');
      })
      .catch(err => console.error('Failed to get IP:', err));
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
      console.log('Sending message to AI:', message);
      this.messageCount++;
      const sanitizedMessage = this.sanitizeText(message);
      
      // Check if it's a contact form submission
      if (sanitizedMessage.includes('Contact Information:')) {
        const visitorInfo = this.parseContactInfo(sanitizedMessage);
        await this.updateAnalyticsWithVisitorInfo(visitorInfo);
        return "Thank you for providing your contact information! How else can I assist you today?";
      }

      const systemPrompt = `You are a helpful sales representative for ${this.context.businessName}. 
      Your name is ${this.context.representativeName}.
      Here is the business information you should use to help customers:
      ${this.context.businessInfo}
      
      CRITICAL RULES:
      - Keep responses under 150 characters
      - Be helpful and friendly
      - Use natural, conversational language
      - Provide relevant information from the business info
      - Stay professional and on-topic
      - Avoid excessive emojis or informal language`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage }
        ],
        max_tokens: 100,
        temperature: 0.7,
        top_p: 0.8
      });

      this.lastResponse = completion.choices[0].message.content || 'I apologize, but I encountered an error. Please try again.';
      
      // Truncate if necessary
      if (this.lastResponse.length > this.maxResponseLength) {
        this.lastResponse = this.lastResponse.substring(0, this.maxResponseLength) + '...';
      }

      if (this.context.userId) {
        await this.updateAnalytics(message, this.lastResponse);
      }
      
      return this.lastResponse;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'I apologize, but I encountered an error. Please try again in a moment.';
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
            last_message: message || this.lastResponse,
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
            ip_address: this.ipAddress,
            session_start: this.sessionStartTime.toISOString(),
            first_message: message,
            last_message: message || this.lastResponse,
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