import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface ChatContext {
  businessName: string;
  representativeName: string;
  businessInfo: string;
  userId?: string;
}

export class AIService {
  private chat;
  private context: ChatContext;
  private readonly maxResponseLength = 60;
  private visitorId: string;
  private sessionStartTime: Date;
  private messageCount: number = 0;
  private lastResponse: string = '';
  private readonly allowedEmojis = ['😊', '👋', '👍'];

  constructor(context: ChatContext) {
    this.context = this.sanitizeContext(context);
    this.visitorId = uuidv4();
    this.sessionStartTime = new Date();
    this.messageCount = 0;
    
    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: `You are a sales rep at ${this.context.businessName}.

          CRITICAL RULES:
          1. Business Info:
          ${this.context.businessInfo}
          
          2. Response Style:
             - Keep responses under 60 characters
             - Be direct and brief
             - No greetings or closings
             - No self-references
             - No names or titles
             - No formalities
          
          3. Formatting:
             - One emoji max per message
             - Only use: 😊 👋 👍
             - Basic punctuation only
             - No special formatting
          
          4. Never Use:
             - Special characters
             - Multiple sentences
             - Self-references
             - Formal language
             - Apologies
             - Names
             - Quotes
             - Brackets
          
          5. Unknown Topics:
             Direct to products only

          6. Structure:
             - One short sentence
             - End with period or exclamation
             - Optional emoji at end only`,
        },
        {
          role: 'model',
          parts: 'Got it. Short and simple only.',
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
      .replace(/[^\w\s.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatResponse(text: string): string {
    // Remove all special formatting
    let formatted = text.replace(/[*_~`]/g, '');
    
    // Replace line breaks
    formatted = formatted.replace(/\n/g, ' ');
    
    // Keep only one emoji
    const emojiMatch = formatted.match(new RegExp(this.allowedEmojis.join('|')));
    formatted = formatted.replace(new RegExp(this.allowedEmojis.join('|'), 'g'), '');
    
    // Clean up the text
    formatted = formatted
      .replace(/[^\w\s.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Add emoji at the end if one was found
    if (emojiMatch) {
      formatted = `${formatted} ${emojiMatch[0]}`;
    }
    
    return formatted;
  }

  private sanitizeResponse(response: string): string {
    // Remove common patterns
    let sanitized = response
      .replace(/^(hi|hello|hey|sure|well|so)(!|\s)/i, '')
      .replace(/^(of course|absolutely)(!|\s)/i, '')
      .replace(/\b(I|me|my|mine)\b/gi, '')
      .replace(/\b(please|kindly)\b/gi, '')
      .replace(/[^\w\s.,!?😊👋👍]/g, '')
      .trim();

    // Ensure single sentence
    sanitized = sanitized.split(/[.!?]/)[0].trim() + '!';

    // Truncate if too long
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized.substring(0, this.maxResponseLength).trim() + '!';
    }

    // Prevent repetition
    if (sanitized === this.lastResponse) {
      sanitized = 'What can help you find? 👍';
    }
    this.lastResponse = sanitized;

    return this.formatResponse(sanitized);
  }

  private validateResponse(response: string): boolean {
    // Check for unwanted patterns
    const redFlags = [
      'my name',
      'I am',
      'I can',
      'let me',
      'assist',
      'help you',
      'available',
      'service',
      'support',
      'welcome',
      'contact',
      'reach',
      'provide'
    ];

    if (redFlags.some(flag => response.toLowerCase().includes(flag))) {
      return false;
    }

    // Check for multiple emojis
    const emojiCount = (response.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 1) {
      return false;
    }

    // Check for special characters
    if (/[^a-zA-Z0-9\s.,!?😊👋👍]/.test(response)) {
      return false;
    }

    return true;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      this.messageCount++;
      const sanitizedMessage = this.sanitizeText(message);
      const result = await this.chat.sendMessage(sanitizedMessage);
      const response = await result.response;
      let responseText = response.text();

      responseText = this.sanitizeResponse(responseText);
      
      if (!this.validateResponse(responseText)) {
        return 'Looking for something specific? 😊';
      }

      await this.updateAnalytics(message, responseText);

      return responseText;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'How can help today? 👍';
    }
  }

  private async updateAnalytics(message: string, response: string) {
    if (!this.context.userId) return;

    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data: existingSession } = await supabase
        .from('chat_analytics')
        .select('id')
        .eq('visitor_id', this.visitorId)
        .eq('user_id', this.context.userId)
        .single();

      if (existingSession) {
        await supabase
          .from('chat_analytics')
          .update({
            messages_count: this.messageCount,
            last_message: message,
            session_end: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        await supabase
          .from('chat_analytics')
          .insert({
            user_id: this.context.userId,
            visitor_id: this.visitorId,
            session_start: this.sessionStartTime.toISOString(),
            first_message: message,
            last_message: message,
            messages_count: this.messageCount
          });
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  getInitialGreeting(): string {
    return `What can help you find today? 👋`;
  }

  static getFormPrompt(): string {
    return "Share your contact info? 😊";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}