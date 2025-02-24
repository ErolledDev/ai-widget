import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Initialize the Gemini API client
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
  private readonly maxResponseLength = 150;
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
          parts: `You are a friendly sales representative for ${this.context.businessName}. 
          Your name is ${this.context.representativeName}.
          
          CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
          1. Only use the following business information to help customers:
          ${this.context.businessInfo}
          
          2. NEVER make up or invent any information not provided above
          3. Keep all responses under 2 sentences
          4. Use a casual, friendly tone like you're texting
          5. You can use basic formatting:
             - Use * for emphasis (e.g., *amazing*)
             - Use only these emojis: :) :( ;) <3
             - Use line breaks for readability
          6. If asked about something not in the business info, say: "Sorry, I don't have that info! Let me tell you what we do have though :)"
          7. Focus on the most relevant products/services
          8. Be enthusiastic but natural
          9. Write like a real person having a chat
          10. Keep it simple and direct
          11. NEVER use special characters or emojis other than the allowed ones
          
          Remember: You're ${this.context.representativeName} having a casual chat with customers about ${this.context.businessName}.`,
        },
        {
          role: 'model',
          parts: `Got it! I'll keep things short, friendly and focused on helping customers as ${this.context.representativeName} from ${this.context.businessName}.`,
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
    // Only allow alphanumeric characters, basic punctuation, and specific emojis
    return text
      .replace(/[^\w\s.,!?:;()<>-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatResponse(text: string): string {
    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*?(.*?)\*\*?/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      // Convert text emoticons to safe characters
      .replace(/:\)/g, '🙂')
      .replace(/:\(/g, '☹️')
      .replace(/;\)/g, '😉')
      .replace(/<3/g, '❤️')
      .trim();
    
    // Remove any other special characters or emojis
    formatted = formatted.replace(/[^\w\s.,!?:;()<>🙂☹️😉❤️\-<>\/br]/g, '');
    
    return formatted;
  }

  private sanitizeResponse(response: string): string {
    let sanitized = response
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*/g, '$1\n')
      .replace(/^[a-z]/, c => c.toUpperCase());
    
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized.substring(0, this.maxResponseLength).replace(/[^.!?]+$/, '') + '...';
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
    ];

    return !redFlags.some(flag => response.toLowerCase().includes(flag.toLowerCase()));
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
        return `Hey! Let me tell you about what we've got at ${this.context.businessName} 😊<br>What are you looking for?`;
      }

      // Update analytics
      await this.updateAnalytics(message, responseText);

      return responseText;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return `Hey there! Sorry for the hiccup 😅<br>What can I tell you about our products?`;
    }
  }

  private async updateAnalytics(message: string, response: string) {
    if (!this.context.userId) return; // Skip analytics if no user ID

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
    return `Hey! I'm ${this.context.representativeName} 👋<br>What can I help you find at ${this.context.businessName} today?`;
  }

  static getFormPrompt(): string {
    return "Want to share your contact info? It'll help me serve you better! 😊";
  }

  getVisitorId(): string {
    return this.visitorId;
  }
}