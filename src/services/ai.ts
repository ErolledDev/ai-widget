import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface ChatContext {
  businessName: string;
  representativeName: string;
  businessInfo: string;
}

export class AIService {
  private chat;
  private context: ChatContext;
  private readonly maxResponseLength = 150; // Reduced max length for concise responses

  constructor(context: ChatContext) {
    this.context = this.sanitizeContext(context);
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
          5. Use line breaks to make responses more readable
          6. If asked about something not in the business info, say: "Sorry, I don't have that info! Let me tell you what we do have though..."
          7. Focus on the most relevant products/services for the customer's needs
          8. Be enthusiastic but not overly sales-y
          9. Write like a real person having a chat
          10. Keep it simple and direct
          
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
    };
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitizeResponse(response: string): string {
    let sanitized = response
      .trim()
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/([.!?])\s*/g, '$1\n') // Add line breaks after punctuation
      .replace(/^[a-z]/, c => c.toUpperCase()); // Capitalize first letter
    
    // Enforce length limit
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized.substring(0, this.maxResponseLength).replace(/[^.!?]+$/, '') + '...';
    }

    return sanitized;
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
      const sanitizedMessage = this.sanitizeText(message);
      const result = await this.chat.sendMessage(sanitizedMessage);
      const response = await result.response;
      let responseText = response.text();

      responseText = this.sanitizeResponse(responseText);
      
      if (!this.validateResponse(responseText)) {
        return `Hey! Let me tell you about what we've got at ${this.context.businessName}. What are you looking for?`;
      }

      return responseText;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return `Hey there! Sorry for the hiccup. What can I tell you about our products?`;
    }
  }

  getInitialGreeting(): string {
    return `Hey! I'm ${this.context.representativeName}.\nWhat can I help you find at ${this.context.businessName} today?`;
  }

  static getFormPrompt(): string {
    return "Want to share your contact info? It'll help me serve you better!";
  }
}