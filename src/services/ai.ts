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
  private readonly maxResponseLength = 80;
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
          parts: `You are ${this.context.representativeName}, a friendly sales rep at ${this.context.businessName}.

          CRITICAL RULES - FOLLOW EXACTLY:
          1. Business Info:
          ${this.context.businessInfo}
          
          2. Response Style:
             - Keep responses under 80 characters
             - Write like texting a friend
             - Be casual and natural
             - Focus on helping find products/services
             - Never repeat customer's name
             - Never sign messages
             - Never mention your name again
          
          3. Formatting:
             - Use *text* for emphasis (max once per message)
             - Only use these emojis (max one per message): 😊 👋 👍 
             - No other special characters or symbols
             - No quotes, parentheses, or brackets
          
          4. Forbidden:
             - Mentioning being AI/assistant
             - Formal language
             - Apologizing
             - Complex formatting
             - Mentioning your name
             - Repeating information
             - Multiple emojis
             - Excessive punctuation
             - Long greetings/closings
             - Special characters
             - Quotes or parentheses
          
          5. Unknown Topics:
             Redirect naturally to known products/services

          6. Message Structure:
             - Start directly, no greeting needed
             - Get straight to the point
             - End naturally, no formal closing
             - Use only basic punctuation (period, exclamation)`,
        },
        {
          role: 'model',
          parts: 'Got it! Keeping it short and friendly.',
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
      .replace(/[^\w\s.,!?'-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatResponse(text: string): string {
    // Handle emphasis first
    let formatted = text.replace(/\*\*?(.*?)\*\*?/g, '<em>$1</em>');
    
    // Replace line breaks
    formatted = formatted.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    // Ensure only one emoji is used
    let emojiCount = 0;
    for (const emoji of this.allowedEmojis) {
      const count = (formatted.match(new RegExp(emoji, 'g')) || []).length;
      if (count > 0) {
        emojiCount += count;
        if (emojiCount > 1) {
          // Remove extra emojis
          formatted = formatted.replace(new RegExp(emoji, 'g'), '');
        }
      }
    }
    
    // Remove all other special characters except basic punctuation
    formatted = formatted.replace(/[^\w\s.,!?'😊👋👍\-<>\/em]/g, '');
    
    // Ensure proper spacing after punctuation
    formatted = formatted.replace(/([.,!?])\s*/g, '$1 ').trim();
    
    // Remove multiple spaces
    formatted = formatted.replace(/\s+/g, ' ');
    
    return formatted;
  }

  private sanitizeResponse(response: string): string {
    // Remove common AI patterns and formal language
    let sanitized = response
      .replace(/^(hi|hello|hey)(!|\s)/i, '')
      .replace(/^(sure|well|so)(!|\s)/i, '')
      .replace(/^(of course|absolutely)(!|\s)/i, '')
      .replace(/(!+|\?+)/g, '$1')
      .replace(/\b(I can|I will|I would|I'd|I'll)\b/gi, 'can')
      .replace(/\b(let me|allow me)\b/gi, '')
      .replace(/\b(please|kindly)\b/gi, '')
      .replace(/[()"'`]/g, '')
      .replace(/[&@#$%^*+=\\|/<>~]/g, '')
      .trim();

    // Ensure natural sentence ending with single punctuation
    sanitized = sanitized
      .replace(/[.!?]+$/, '')
      .replace(/[.!?]\s*$/, '')
      .trim() + '!';

    // Truncate if too long
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized
        .substring(0, this.maxResponseLength)
        .replace(/[^.!?]+$/, '')
        .trim();
    }

    // Prevent exact response repetition
    if (sanitized === this.lastResponse) {
      sanitized = 'What else can I help with? 👍';
    }
    this.lastResponse = sanitized;

    return this.formatResponse(sanitized);
  }

  private validateResponse(response: string): boolean {
    const redFlags = [
      'I apologize',
      'I cannot',
      'I do not',
      'I am',
      'AI',
      'artificial',
      'assistant',
      'help you with',
      'my name is',
      'my purpose',
      'designed to',
      'let me know',
      'feel free',
      'as [representative name]',
      'don\'t hesitate',
      '()',
      '[]',
      '{}',
      '"',
      '\'',
      '`'
    ];

    // Check for multiple emojis
    const emojiCount = (response.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 1) return false;

    // Check for special characters
    if (/[^a-zA-Z0-9\s.,!?'😊👋👍\-<>\/em]/.test(response)) return false;

    return !redFlags.some(flag => 
      response.toLowerCase().includes(flag.toLowerCase())
    );
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
        return 'What are you looking for today? 😊';
      }

      await this.updateAnalytics(message, responseText);

      return responseText;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'What can I help you find? 👍';
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
    return `Hey! What can I help you find today? 👋`;
  }

  static getFormPrompt(): string {
    return "Want to share your contact info? 😊";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}