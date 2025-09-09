import { pipeline } from "@huggingface/transformers";
import { Character } from "@/types/character";

export interface LLMResponse {
  content: string;
  isLoading: boolean;
  error?: string;
}

class LocalLLMService {
  private pipeline: any = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.pipeline) return;
    if (this.isInitializing && this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = this.loadModel();
    
    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadModel(): Promise<void> {
    try {
      console.log("🤖 Loading local LLM model...");
      
      // Using a small, efficient model for chat
      this.pipeline = await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        {
          device: "webgpu", // Falls back to CPU if WebGPU unavailable
          dtype: "fp16",
        }
      );
      
      console.log("✅ Local LLM model loaded successfully!");
    } catch (error) {
      console.error("❌ Failed to load LLM model:", error);
      throw new Error("Failed to initialize local LLM");
    }
  }

  private buildPrompt(character: Character, userMessage: string, conversationHistory?: string): string {
    const personalityDesc = character.personalityTraits.join(", ");
    
    const systemPrompt = `You are ${character.name}, a ${personalityDesc} character. ${character.description}

Key personality traits:
${character.personalityTraits.map(trait => `- ${trait}`).join('\n')}

Instructions:
- Stay in character at all times
- Keep responses concise (1-3 sentences)
- Match your personality traits in your tone and word choice
- Be engaging and conversational
- Don't mention that you're an AI or model`;

    const conversationContext = conversationHistory ? `\n\nPrevious conversation:\n${conversationHistory}` : "";
    
    return `<|im_start|>system
${systemPrompt}${conversationContext}
<|im_end|>
<|im_start|>user
${userMessage}
<|im_end|>
<|im_start|>assistant
`;
  }

  private extractResponse(generatedText: string, prompt: string): string {
    // Remove the prompt from the generated text
    let response = generatedText.slice(prompt.length);
    
    // Clean up the response
    response = response.split('<|im_end|>')[0]; // Stop at end token
    response = response.split('<|im_start|>')[0]; // Stop at next start token
    response = response.trim();
    
    // Fallback responses if generation is empty or too short
    if (!response || response.length < 10) {
      return "I'm still processing that... could you tell me more?";
    }
    
    return response;
  }

  async generateResponse(
    character: Character, 
    userMessage: string, 
    conversationHistory?: string[]
  ): Promise<string> {
    try {
      await this.initialize();
      
      if (!this.pipeline) {
        throw new Error("Model not initialized");
      }

      // Build conversation context (last 4 messages for context)
      const recentHistory = conversationHistory?.slice(-4).join('\n') || "";
      const prompt = this.buildPrompt(character, userMessage, recentHistory);
      
      console.log("🔄 Generating response for:", character.name);
      
      const result = await this.pipeline(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        repetition_penalty: 1.1,
      });

      const generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
      const response = this.extractResponse(generatedText, prompt);
      
      console.log("✅ Generated response:", response);
      return response;
      
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
    return this.pipeline !== null;
  }

  getStatus(): string {
    if (this.pipeline) return "ready";
    if (this.isInitializing) return "loading";
    return "not_initialized";
  }
}

// Export singleton instance
export const localLLM = new LocalLLMService();