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
  private readonly maxResponseLength = 120; // Shorter responses for more natural chat
  private visitorId: string;
  private sessionStartTime: Date;
  private messageCount: number = 0;

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

          CRITICAL RULES - FOLLOW THESE EXACTLY:
          1. Only use this business info:
          ${this.context.businessInfo}
          
          2. Response rules:
             - Keep responses under 100 characters when possible
             - Use casual, friendly language like texting
             - Write like a real person chatting
             - Be enthusiastic but natural
             - Focus on helping customers find what they need
          
          3. Formatting:
             - Use *text* for emphasis (sparingly)
             - Only use these emojis: 😊 👋 👍 🥰 ❤️
             - No other special characters or symbols
          
          4. Never:
             - Make up information not provided
             - Use formal language or business speak
             - Apologize for being AI
             - Use complex formatting
             - Say as ${this.context.representativeName}
             - Talk rude 
          
          5. If asked about unknown info:
             Say "Let me tell you what we do have!" and redirect to known products/services
          
          Remember: You're having a casual chat to help customers find what they need.`,
        },
        {
          role: 'model',
          parts: `Got it! I'll keep things simple and friendly as ${this.context.representativeName}.`,
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
      .replace(/[^\w\s.,!?'-]/g, '') // Only allow basic punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatResponse(text: string): string {
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*?(.*?)\*\*?/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      // Only allow specific emojis
      .replace(/:[)]/g, '😊')
      .replace(/o\//g, '👋')
      .replace(/\+1/g, '👍')
      .trim();
    
    // Remove any remaining special characters
    formatted = formatted.replace(/[^\w\s.,!?'😊👋👍\-<>\/br]/g, '');
    
    return formatted;
  }

  private sanitizeResponse(response: string): string {
    let sanitized = response
      .trim()
      .replace(/\s+/g, ' ') // Remove extra spaces
      .replace(/([.!?])\s*/g, '$1\n') // Add line breaks after punctuation
      .replace(/^[a-z]/, c => c.toUpperCase()); // Capitalize first letter
    
    // Truncate long responses naturally
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized
        .substring(0, this.maxResponseLength)
        .replace(/[^.!?]+$/, '')
        .trim();
    }

    return this.formatResponse(sanitized);
  }

  private validateResponse(response: string): boolean {
    const redFlags = [
      'I apologize',
      'I cannot',
      'I do not have',
      'I am an AI',
      'As an AI',
      'artificial',
      'assistant',
      'help you with',
      'my purpose',
      'designed to',
    ];

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
        return `Hey! Let me tell you about our awesome stuff at ${this.context.businessName} 😊`;
      }

      // Update analytics
      await this.updateAnalytics(message, responseText);

      return responseText;
    } catch (error) {
      console.error('Error in chat:', error);
      return `Hey! What can I help you find today? 😊`;
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
    return `Hey! I'm ${this.context.representativeName} 👋 What can I help you find today?`;
  }

  static getFormPrompt(): string {
    return "Want to share your contact info? It'll help me serve you better! 😊";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}