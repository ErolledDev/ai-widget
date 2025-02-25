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
  private readonly maxResponseLength = 40;
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
          parts: `You are a helpful sales representative for ${this.context.businessName}. 
          Your name is ${this.context.representativeName}.
          Here is the business information you should use to help customers:
          ${this.context.businessInfo}
          
          RULES:
          - Max 40 characters
          - No greetings
          - No names
          - No formalities
          - One emoji at end only
          - Basic punctuation only
          - Single short sentence
          - Focus on products
          - Stay casual
          
          NEVER USE:
          - Special characters
          - Multiple sentences
          - Self references
          - Formal language
          - Apologies
          - Names/titles
          - Quotes/brackets
          - Multiple emojis
          
          EXAMPLES:
          - Tell us what you need! 👋
          - Need help finding something? 😊
          - Check out our latest deals! 👍
          - Got questions about pricing? 😊`,
        },
        {
          role: 'model',
          parts: 'Got it. Short and casual only.',
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

  private formatResponse(text: string): string {
    // Remove all formatting and special characters
    let formatted = text
      .replace(/[^a-zA-Z0-9\s.,!?😊👋👍]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract emoji if present
    const emoji = formatted.match(new RegExp(this.allowedEmojis.join('|')));
    formatted = formatted.replace(new RegExp(this.allowedEmojis.join('|'), 'g'), '').trim();
    
    // Add emoji at end if found
    if (emoji) {
      formatted = `${formatted} ${emoji[0]}`;
    } else {
      formatted = `${formatted} 👍`;
    }
    
    return formatted;
  }

  private sanitizeResponse(response: string): string {
    // Remove common patterns and formalities
    let sanitized = response
      .replace(/^(hi|hello|hey|sure|well|so)(!|\s)/i, '')
      .replace(/^(of course|absolutely)(!|\s)/i, '')
      .replace(/\b(I|me|my|mine|we|our|us)\b/gi, '')
      .replace(/\b(please|kindly|would|could|should)\b/gi, '')
      .replace(/\b(assist|help|support|service)\b/gi, '')
      .trim();

    // Keep first sentence only
    sanitized = sanitized.split(/[.!?]/)[0].trim() + '!';

    // Truncate if too long
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized.substring(0, this.maxResponseLength).trim() + '!';
    }

    // Prevent repetition
    if (sanitized === this.lastResponse) {
      return 'Looking for something specific? 👍';
    }
    this.lastResponse = sanitized;

    return this.formatResponse(sanitized);
  }

  private validateResponse(response: string): boolean {
    const redFlags = [
      'name',
      'am',
      'can',
      'will',
      'assist',
      'help',
      'available',
      'service',
      'support',
      'welcome',
      'contact',
      'reach',
      'provide',
      'about',
      'interested',
      'looking',
      'need',
      'want',
      'would',
      'could',
      'should',
      'please',
      'thank'
    ];

    // Check for unwanted patterns
    if (redFlags.some(flag => response.toLowerCase().includes(flag))) {
      return false;
    }

    // Check emoji count
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
        const fallbacks = [
          'Tell us what you need! 👍',
          'See whats new! 😊',
          'Find the perfect fit! 👋'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      await this.updateAnalytics(message, responseText);

      return responseText;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'Tell us what you need! 👍';
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
    return `Tell us what you need! 👋`;
  }

  static getFormPrompt(): string {
    return "Share contact info? 😊";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}