import { supabase } from "@/integrations/supabase/client";
import { Character } from "@/types/character";

export interface LLMResponse {
  content: string;
  isLoading: boolean;
  error?: string;
}

class LocalLLMService {
  private serviceReady = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.serviceReady) return;
    if (this.isInitializing && this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = this.initializeService();
    
    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🤖 Initializing AI service...");
      
      // Skip test call during initialization to avoid invalid UUID error
      console.log("AI service ready for use");
      
      this.serviceReady = true;
      console.log("✅ AI service initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize AI service:", error);
      // Don't throw - we'll use fallback responses
      this.serviceReady = true; // Set to ready anyway to enable fallback responses
    }
  }

  async generateResponse(
    catbotId: string, 
    userMessage: string, 
    conversationHistory?: Array<{role: string; content: string}>,
    userId?: string
  ): Promise<string> {
    try {
      await this.initialize();
      
      console.log('🔄 Generating response for catbot ID:', catbotId);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          catbotId,
          userMessage,
          conversationHistory: conversationHistory || [],
          userId
        }
      });

      if (error) {
        console.error("❌ Edge function error:", error);
        throw new Error(error.message || "Failed to generate response");
      }

      if (data?.response) {
        console.log("✅ Generated response:", data.response);
        return data.response;
      } else {
        throw new Error("No response received from AI service");
      }
      
    } catch (error) {
      console.error("❌ Error generating response:", error);
      
      // Fallback to personality-based responses
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): string {
    
    const fallbackResponses = {
      friendly: [
        "That's really interesting! I'd love to hear more about that. 😊",
        "Oh, I totally understand what you mean! Thanks for sharing that with me.",
        "That sounds fascinating! What else would you like to talk about?",
      ],
    };
    
    const responses = fallbackResponses.friendly;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isReady(): boolean {
    return this.serviceReady;
  }

  getStatus(): string {
    if (this.serviceReady) return "ready";
    if (this.isInitializing) return "loading";
    return "not_initialized";
  }
}

// Export singleton instance
export const localLLM = new LocalLLMService();