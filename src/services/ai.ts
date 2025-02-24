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

  constructor(context: ChatContext) {
    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: `You are a helpful sales representative for ${context.businessName}. 
          Your name is ${context.representativeName}. 
          Here is the business information you should use to help customers:
          ${context.businessInfo}
          
          Always be friendly, professional, and sales-oriented in your responses.
          Focus on helping customers find products or services that match their needs.
          If asked about something not related to the business, politely redirect the conversation back to how you can help them with ${context.businessName}'s offerings.`,
        },
        {
          role: 'model',
          parts: `I understand. I'll act as ${context.representativeName}, a sales representative for ${context.businessName}. I'll use the provided business information to help customers and maintain a professional, sales-oriented approach.`,
        },
      ],
    });
    this.context = context;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  getInitialGreeting(): string {
    return `Good day! I'm ${this.context.representativeName}, welcome to ${this.context.businessName}!`;
  }

  static getFormPrompt(): string {
    return "Would you like to share your details? We promise we don't share your information and it will help us provide better follow-up.";
  }
}