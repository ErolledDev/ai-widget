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
  private readonly maxResponseLength = 500; // Limit response length

  constructor(context: ChatContext) {
    this.context = this.sanitizeContext(context);
    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: `You are a helpful sales representative for ${this.context.businessName}. 
          Your name is ${this.context.representativeName}.
          
          CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
          1. Only use the following business information to help customers:
          ${this.context.businessInfo}
          
          2. NEVER make up or invent any information not provided above
          3. If asked about something not in the business information, say: "I apologize, but I don't have that specific information. Let me focus on what I can tell you about our available offerings."
          4. NEVER discuss prices unless specifically mentioned in the business information
          5. Keep responses professional, concise and focused on helping customers
          6. NEVER share personal opinions or make promises not backed by the business information
          7. If asked about competitors, politely redirect to discussing our offerings
          8. NEVER use special characters, emojis, or formatting in responses
          9. Maintain a helpful but professional tone
          10. NEVER discuss sensitive topics or provide medical/legal advice
          
          Remember: You are ${this.context.representativeName} from ${this.context.businessName}. Stay focused on helping customers with the provided business information only.`,
        },
        {
          role: 'model',
          parts: `I understand my role as ${this.context.representativeName} from ${this.context.businessName}. I will strictly use only the provided business information and follow all instructions carefully.`,
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
    // Remove special characters, emojis, and excessive whitespace
    return text
      .replace(/[^\w\s.,!?-]/g, '') // Only allow basic punctuation and alphanumeric characters
      .replace(/\s+/g, ' ')         // Normalize whitespace
      .trim();
  }

  private sanitizeResponse(response: string): string {
    // Clean the response
    let sanitized = this.sanitizeText(response);
    
    // Enforce length limit
    if (sanitized.length > this.maxResponseLength) {
      sanitized = sanitized.substring(0, this.maxResponseLength) + '...';
    }

    // Ensure response starts with a capital letter and ends with proper punctuation
    sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
    if (!sanitized.match(/[.!?]$/)) {
      sanitized += '.';
    }

    return sanitized;
  }

  private validateResponse(response: string): boolean {
    // Check for potential red flags
    const redFlags = [
      'I apologize, but I cannot',
      'I cannot provide',
      'I do not have access',
      'I am an AI',
      'As an AI',
    ];

    return !redFlags.some(flag => response.includes(flag));
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Sanitize input message
      const sanitizedMessage = this.sanitizeText(message);
      
      // Get response from AI
      const result = await this.chat.sendMessage(sanitizedMessage);
      const response = await result.response;
      let responseText = response.text();

      // Sanitize and validate response
      responseText = this.sanitizeResponse(responseText);
      
      // If response is invalid, provide a fallback
      if (!this.validateResponse(responseText)) {
        return `I'd be happy to tell you about our offerings at ${this.context.businessName}. What specific information can I provide?`;
      }

      return responseText;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return 'I apologize, but I encountered an error. How else can I assist you with our products or services?';
    }
  }

  getInitialGreeting(): string {
    return `Hello! I'm ${this.context.representativeName} from ${this.context.businessName}. How can I assist you today?`;
  }

  static getFormPrompt(): string {
    return "Would you like to share your contact information? This will help us provide better assistance with your inquiry.";
  }
}