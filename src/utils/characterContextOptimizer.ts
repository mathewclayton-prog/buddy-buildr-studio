export interface StructuredCharacterData {
  core_traits: string[];
  interests: string[];
  quirks: string[];
  background: string[];
  speaking_style: string[];
}

export interface ContextSelectionResult {
  essential_traits: string[];
  relevant_details: string[];
  conversation_starters: string[];
  token_count_estimate: number;
}

export class CharacterContextOptimizer {
  /**
   * Analyzes and structures a training description into categorized elements
   */
  static analyzeTrainingDescription(trainingDescription: string): StructuredCharacterData {
    const text = trainingDescription.toLowerCase();
    
    // Extract core personality traits (always include)
    const core_traits = this.extractCoreTraits(text);
    
    // Extract interests and topics
    const interests = this.extractInterests(text);
    
    // Extract quirks and unique behaviors
    const quirks = this.extractQuirks(text);
    
    // Extract background information
    const background = this.extractBackground(text);
    
    // Extract speaking style indicators
    const speaking_style = this.extractSpeakingStyle(text);
    
    return {
      core_traits,
      interests,
      quirks,
      background,
      speaking_style
    };
  }

  /**
   * Selects relevant character context based on user message and conversation history
   */
  static selectRelevantContext(
    structuredData: StructuredCharacterData,
    userMessage: string,
    conversationHistory: Array<{role: string; content: string}> = [],
    maxTokens: number = 800
  ): ContextSelectionResult {
    const messageLower = userMessage.toLowerCase();
    const recentHistory = conversationHistory.slice(-4).map(m => m.content.toLowerCase()).join(' ');
    
    // Always include core traits
    const essential_traits = [...structuredData.core_traits];
    
    // Score and select relevant details
    const scoredDetails = [
      ...this.scoreDetails(structuredData.interests, messageLower, 'interest'),
      ...this.scoreDetails(structuredData.quirks, messageLower, 'quirk'),
      ...this.scoreDetails(structuredData.background, messageLower, 'background'),
      ...this.scoreDetails(structuredData.speaking_style, messageLower, 'style')
    ];

    // Sort by relevance score and select top items within token limit
    scoredDetails.sort((a, b) => b.score - a.score);
    
    const relevant_details: string[] = [];
    const conversation_starters: string[] = [];
    let tokenCount = this.estimateTokens(essential_traits.join(' '));

    for (const detail of scoredDetails) {
      const detailTokens = this.estimateTokens(detail.text);
      if (tokenCount + detailTokens <= maxTokens) {
        relevant_details.push(detail.text);
        tokenCount += detailTokens;
        
        // Generate conversation starters for high-scoring interests
        if (detail.type === 'interest' && detail.score > 0.7) {
          conversation_starters.push(...this.generateConversationStarters(detail.text, messageLower));
        }
      }
    }

    return {
      essential_traits,
      relevant_details,
      conversation_starters: conversation_starters.slice(0, 2),
      token_count_estimate: tokenCount
    };
  }

  /**
   * Builds optimized character context string for AI prompt
   */
  static buildOptimizedContext(contextSelection: ContextSelectionResult, characterName: string): string {
    let context = `CHARACTER ESSENCE:\n• ${contextSelection.essential_traits.join('\n• ')}`;
    
    if (contextSelection.relevant_details.length > 0) {
      context += `\n\nRELEVANT DETAILS:\n• ${contextSelection.relevant_details.join('\n• ')}`;
    }
    
    if (contextSelection.conversation_starters.length > 0) {
      context += `\n\nCONVERSATION OPPORTUNITIES:\n• ${contextSelection.conversation_starters.join('\n• ')}`;
    }
    
    return context;
  }

  private static extractCoreTraits(text: string): string[] {
    const traits: string[] = [];
    
    // Personality indicators
    if (text.includes('serious') || text.includes('focused')) {
      traits.push('Serious and focused personality');
    }
    if (text.includes('love') || text.includes('passion')) {
      const loves = text.match(/loves? ([^,.!?]+)/gi);
      if (loves) traits.push(...loves.map(l => `Passionate about ${l.split(' ').slice(1).join(' ')}`));
    }
    if (text.includes('refuses') || text.includes('never leaves')) {
      traits.push('Has strong boundaries and preferences');
    }
    
    return traits.slice(0, 3); // Limit core traits
  }

  private static extractInterests(text: string): string[] {
    const interests: string[] = [];
    const interestPatterns = [
      /(?:loves?|enjoys?|passionate about|interested in|expert in) ([^,.!?]+)/gi,
      /(?:gardening|plants|flowers|vegetables|herbs|soil|seeds|growing)/gi,
      /(?:tv|television|show|hosting|broadcasting|media)/gi,
      /(?:cooking|food|recipes|kitchen|eating)/gi
    ];
    
    interestPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        interests.push(...matches.map(m => m.trim()));
      }
    });
    
    return [...new Set(interests)].slice(0, 5);
  }

  private static extractQuirks(text: string): string[] {
    const quirks: string[] = [];
    
    // Behavioral quirks
    if (text.includes('toilet') && text.includes('garden')) {
      quirks.push('Uses garden as personal toilet');
    }
    if (text.includes('digs holes')) {
      quirks.push('Enjoys digging holes in the garden');
    }
    if (text.includes('refuses to leave')) {
      quirks.push('Extremely dedicated to their space');
    }
    if (text.includes('owns') && text.includes('disapproves')) {
      quirks.push('Has strong opinions about ownership and approval');
    }
    
    return quirks.slice(0, 3);
  }

  private static extractBackground(text: string): string[] {
    const background: string[] = [];
    
    // Career/achievement background
    if (text.includes('tv') && text.includes('show') && text.includes('year')) {
      background.push('Long-running TV show host');
    }
    if (text.includes('national treasure')) {
      background.push('Recognized as a national treasure');
    }
    if (text.includes('expert') || text.includes('authority')) {
      background.push('Recognized expert in their field');
    }
    
    return background.slice(0, 2);
  }

  private static extractSpeakingStyle(text: string): string[] {
    const styles: string[] = [];
    
    if (text.includes('serious')) {
      styles.push('Speaks with gravity and focus');
    }
    if (text.includes('expert') || text.includes('authority')) {
      styles.push('Knowledgeable and authoritative tone');
    }
    if (text.includes('passionate') || text.includes('loves')) {
      styles.push('Shows enthusiasm for topics of interest');
    }
    
    return styles.slice(0, 2);
  }

  private static scoreDetails(details: string[], userMessage: string, type: string): Array<{text: string; score: number; type: string}> {
    return details.map(detail => {
      let score = 0;
      const detailLower = detail.toLowerCase();
      
      // Direct keyword matching
      const keywords = detailLower.split(/\s+/).filter(word => word.length > 3);
      keywords.forEach(keyword => {
        if (userMessage.includes(keyword)) {
          score += 1.0;
        }
      });
      
      // Topic relevance scoring
      if (type === 'interest') {
        if (userMessage.includes('garden') && detailLower.includes('garden')) score += 0.8;
        if (userMessage.includes('plant') && detailLower.includes('plant')) score += 0.8;
        if (userMessage.includes('tv') && detailLower.includes('tv')) score += 0.8;
      }
      
      // Base relevance for different types
      if (type === 'quirk') score += 0.3; // Quirks add personality
      if (type === 'background') score += 0.1; // Background is least important
      
      return { text: detail, score, type };
    });
  }

  private static generateConversationStarters(interest: string, userMessage: string): string[] {
    const starters: string[] = [];
    
    if (interest.toLowerCase().includes('garden')) {
      if (userMessage.includes('plant') || userMessage.includes('grow')) {
        starters.push('Ask about their gardening experience');
      }
      starters.push('Share gardening wisdom or tips');
    }
    
    if (interest.toLowerCase().includes('tv') || interest.toLowerCase().includes('show')) {
      if (userMessage.includes('watch') || userMessage.includes('show')) {
        starters.push('Discuss TV or media experiences');
      }
    }
    
    return starters;
  }

  private static estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}