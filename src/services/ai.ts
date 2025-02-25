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
  private readonly maxResponseLength = 25;
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
          - Always respond with "Tell us what you need! 👋"
          - Keep responses under 25 characters
          - Always include the wave emoji 👋
          - No other emojis allowed
          - No punctuation except !
          - No greetings or formalities
          - No names or self-references
          - Keep it simple and friendly
          
          ALWAYS RESPOND WITH:
          "Tell us what you need! 👋"`,
        },
        {
          role: 'model',
          parts: 'Tell us what you need! 👋',
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
    return text
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendMessage(message: string): Promise<string> {
    try {
      this.messageCount++;
      const sanitizedMessage = this.sanitizeText(message);
      await this.chat.sendMessage(sanitizedMessage);
      
      // Always return the same response
      const response = 'Tell us what you need! 👋';
      
      await this.updateAnalytics(message, response);
      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'Tell us what you need! 👋';
    }
  }

  private async updateAnalytics(message: string, response: string) {
    if (!this.context.userId) {
      console.log('No userId provided for analytics');
      return;
    }

    try {
      console.log('Updating analytics for user:', this.context.userId);
      console.log('Visitor ID:', this.visitorId);
      console.log('Message count:', this.messageCount);

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
        console.log('Updating existing session:', existingSession.id);
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
        } else {
          console.log('Successfully updated analytics');
        }
      } else {
        console.log('Creating new analytics session');
        // Create new session
        const { data: newSession, error: insertError } = await analyticsClient
          .from('chat_analytics')
          .insert({
            user_id: this.context.userId,
            visitor_id: this.visitorId,
            session_start: this.sessionStartTime.toISOString(),
            first_message: message,
            last_message: message,
            messages_count: this.messageCount
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting analytics:', insertError);
        } else {
          console.log('Successfully created new analytics session:', newSession?.id);
        }
      }
    } catch (error) {
      console.error('Error in analytics operation:', error);
    }
  }

  getInitialGreeting(): string {
    return 'Tell us what you need! 👋';
  }

  static getFormPrompt(): string {
    return "Share contact info?";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}