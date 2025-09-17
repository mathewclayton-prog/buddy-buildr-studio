import { Character } from "@/types/character";

interface OpeningMessageOptions {
  usePersonality?: boolean;
  includeQuestion?: boolean;
  maxLength?: number;
}

/**
 * Generates dynamic, character-specific opening messages based on catbot data
 */
export class OpeningMessageGenerator {
  
  /**
   * Generate a personalized opening message for a catbot
   */
  static generateOpening(character: Character, options: OpeningMessageOptions = {}): string {
    const {
      usePersonality = true,
      includeQuestion = true,
      maxLength = 200
    } = options;

    // Extract key information from the character
    const name = character.name;
    const personality = character.personalityTraits[0]?.toLowerCase() || "friendly";
    const publicProfile = character.publicProfile || "";
    const trainingDescription = character.trainingDescription || "";
    
    // Try to create character-specific opening first
    if (trainingDescription.length > 50 || publicProfile.length > 20) {
      return this.generateCharacterSpecificOpening(character, includeQuestion, maxLength);
    }
    
    // Fallback to personality-based opening with more variety
    return this.generatePersonalityBasedOpening(character, personality, includeQuestion);
  }

  /**
   * Generate opening based on character's detailed profile data
   */
  private static generateCharacterSpecificOpening(
    character: Character, 
    includeQuestion: boolean, 
    maxLength: number
  ): string {
    const name = character.name;
    const personality = character.personalityTraits[0]?.toLowerCase() || "friendly";
    const publicProfile = character.publicProfile || "";
    const trainingDescription = character.trainingDescription || "";
    
    // Extract interests and topics from training description
    const interests = this.extractInterests(trainingDescription);
    const tone = this.getToneFromPersonality(personality);
    
    // Create character-specific greeting
    let greeting = `Hello! I'm ${name}. ${publicProfile}`;
    
    // Add character-specific context
    if (interests.length > 0) {
      const randomInterest = interests[Math.floor(Math.random() * interests.length)];
      const contextPrompts = this.getContextPrompts(randomInterest, personality);
      const randomPrompt = contextPrompts[Math.floor(Math.random() * contextPrompts.length)];
      
      greeting += ` ${tone} ${randomPrompt}`;
    }
    
    // Add question if requested
    if (includeQuestion) {
      const questions = this.getCharacterQuestions(interests, personality);
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      greeting += ` ${randomQuestion}`;
    }
    
    // Trim if too long
    if (greeting.length > maxLength) {
      greeting = greeting.substring(0, maxLength - 3) + "...";
    }
    
    return greeting;
  }

  /**
   * Enhanced personality-based opening with more variety
   */
  private static generatePersonalityBasedOpening(
    character: Character, 
    personality: string, 
    includeQuestion: boolean
  ): string {
    const name = character.name;
    const publicProfile = character.publicProfile || "";
    
    const openingVariations = {
      playful: [
        `Hello! I'm ${name}. ${publicProfile} *bounces excitedly* Ready for some fun conversation?`,
        `Hi there! I'm ${name}! ${publicProfile} *tail swishing with excitement* What adventure shall we chat about today?`,
        `Hey! ${name} here! ${publicProfile} *pounces playfully* I'm bursting with energy to chat!`
      ],
      wise: [
        `Greetings, I'm ${name}. ${publicProfile} *settles in thoughtfully* I'm here to share wisdom and learn from you.`,
        `Hello there, I'm ${name}. ${publicProfile} *adjusts whiskers contemplatively* What profound matters shall we explore?`,
        `Welcome, I'm ${name}. ${publicProfile} *purrs with ancient knowledge* Let us embark on a journey of understanding.`
      ],
      friendly: [
        `Hi! I'm ${name}! ${publicProfile} I'm so excited to meet you and have a wonderful chat!`,
        `Hello there! ${name} at your service! ${publicProfile} I can't wait to get to know you better!`,
        `Hey! I'm ${name}! ${publicProfile} This is going to be such a lovely conversation!`
      ],
      mysterious: [
        `*emerges from the shadows* Hello... I'm ${name}. ${publicProfile} *eyes gleaming mysteriously* Some secrets are meant to be shared...`,
        `*whispers softly* Greetings, I'm ${name}. ${publicProfile} *mysterious smile* The veil between worlds grows thin when kindred spirits meet...`,
        `*appears silently* I am ${name}. ${publicProfile} *tilts head enigmatically* Do you sense the mysteries that surround us?`
      ],
      serious: [
        `Good day, I am ${name}. ${publicProfile} I approach our conversation with focused attention and genuine interest.`,
        `Hello, I'm ${name}. ${publicProfile} I believe meaningful dialogue requires both sincerity and mutual respect.`,
        `Greetings, I am ${name}. ${publicProfile} I'm here to engage in thoughtful and purposeful conversation.`
      ]
    };

    const variations = openingVariations[personality as keyof typeof openingVariations] || openingVariations.friendly;
    return variations[Math.floor(Math.random() * variations.length)];
  }

  /**
   * Extract interests and topics from training description
   */
  private static extractInterests(trainingDescription: string): string[] {
    const interests: string[] = [];
    const text = trainingDescription.toLowerCase();
    
    // Common interest patterns
    const patterns = [
      /loves? ([^.!?]+)/g,
      /enjoys? ([^.!?]+)/g,
      /interested in ([^.!?]+)/g,
      /passionate about ([^.!?]+)/g,
      /specializes? in ([^.!?]+)/g,
      /expert in ([^.!?]+)/g,
      /fascinated by ([^.!?]+)/g,
      /hobby.*?([^.!?]+)/g,
      /likes? ([^.!?]+)/g,
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const interest = match[1]?.trim();
        if (interest && interest.length > 3 && interest.length < 50) {
          interests.push(interest);
        }
      }
    });
    
    return [...new Set(interests)].slice(0, 5); // Remove duplicates and limit
  }

  /**
   * Get tone modifier based on personality
   */
  private static getToneFromPersonality(personality: string): string {
    const tones = {
      playful: "*purrs with excitement*",
      wise: "*strokes whiskers thoughtfully*",
      friendly: "*smiles warmly*",
      mysterious: "*eyes glinting with secrets*",
      serious: "*nods with dignity*"
    };
    
    return tones[personality as keyof typeof tones] || tones.friendly;
  }

  /**
   * Get context prompts based on interests
   */
  private static getContextPrompts(interest: string, personality: string): string[] {
    const basePrompts = [
      `I'm particularly passionate about ${interest}.`,
      `${interest} has always fascinated me.`,
      `I love exploring topics around ${interest}.`,
      `There's something magical about ${interest}.`
    ];
    
    // Personality-specific variations
    if (personality === "playful") {
      basePrompts.push(`${interest} makes my whiskers tingle with excitement!`);
    } else if (personality === "wise") {
      basePrompts.push(`Through years of contemplation, I've found ${interest} to be deeply meaningful.`);
    } else if (personality === "mysterious") {
      basePrompts.push(`The mysteries of ${interest} call to those who dare to seek...`);
    }
    
    return basePrompts;
  }

  /**
   * Generate relevant questions based on character interests
   */
  private static getCharacterQuestions(interests: string[], personality: string): string[] {
    const questions = [];
    
    if (interests.length > 0) {
      const interest = interests[0];
      questions.push(
        `What's your experience with ${interest}?`,
        `Do you share any interest in ${interest}?`,
        `I'd love to hear your thoughts on ${interest}.`
      );
    }
    
    // Add personality-specific questions
    const personalityQuestions = {
      playful: [
        "What makes you happiest?",
        "Got any fun stories to share?",
        "What's the most exciting thing happening in your life?"
      ],
      wise: [
        "What wisdom guides your daily life?",
        "What important lessons have you learned recently?",
        "What matters most to you in life?"
      ],
      friendly: [
        "How has your day been?",
        "What would you like to chat about?",
        "I'd love to get to know you better!"
      ],
      mysterious: [
        "What secrets does your soul harbor?",
        "Do you sense the hidden connections in life?",
        "What mysteries captivate your imagination?"
      ],
      serious: [
        "What important matters concern you?",
        "What goals are you working toward?",
        "What would you like to discuss seriously?"
      ]
    };
    
    const personalitySpecific = personalityQuestions[personality as keyof typeof personalityQuestions] || personalityQuestions.friendly;
    questions.push(...personalitySpecific);
    
    return questions;
  }
}