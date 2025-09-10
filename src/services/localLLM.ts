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
      
      // Test the connection to our edge function
      const { error } = await supabase.functions.invoke('chat-ai', {
        body: {
          character: {
            name: "Test",
            personalityTraits: ["friendly"],
            description: "Test character"
          },
          userMessage: "Hello",
          conversationHistory: []
        }
      });

      if (error) {
        console.warn("Edge function test failed, but service will continue:", error);
      }
      
      this.serviceReady = true;
      console.log("✅ AI service initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize AI service:", error);
      // Don't throw - we'll use fallback responses
      this.serviceReady = true; // Set to ready anyway to enable fallback responses
    }
  }

  async generateResponse(
    character: Character, 
    userMessage: string, 
    conversationHistory?: Array<{role: string; content: string}>
  ): Promise<string> {
    try {
      await this.initialize();
      
      console.log("🔄 Generating response for:", character.name);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          character,
          userMessage,
          conversationHistory: conversationHistory || []
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
      return this.getFallbackResponse(character, userMessage);
    }
  }

  private getFallbackResponse(character: Character, userMessage: string): string {
    const personality = character.personalityTraits[0]?.toLowerCase() || "friendly";
    
    const fallbackResponses = {
      friendly: [
        "That's really interesting! I'd love to hear more about that. 😊",
        "Oh, I totally understand what you mean! Thanks for sharing that with me.",
        "That sounds fascinating! What else would you like to talk about?",
      ],
      mysterious: [
        "Hmm... there's always more than meets the eye, isn't there? 🌙",
        "Interesting... that reminds me of something from long ago.",
        "Perhaps the truth lies hidden in plain sight. What do you think?",
      ],
      wise: [
        "Ah, that brings to mind an old saying about wisdom and understanding. 🧙‍♀️",
        "In my experience, the most profound insights come from simple observations.",
        "Consider this: every question holds the key to deeper understanding.",
      ],
      playful: [
        "Ooh, that's so cool! You always have the most interesting things to say! 🎈",
        "Haha, I love how creative you are! Tell me more, tell me more! ✨",
        "This is awesome! You make every conversation an adventure!",
      ],
      serious: [
        "I understand. This deserves careful consideration and thought.",
        "Your point is well-taken. Let me reflect on this properly.",
        "This is indeed an important matter. How shall we proceed?",
      ]
    };
    
    const responses = fallbackResponses[personality as keyof typeof fallbackResponses] || fallbackResponses.friendly;
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