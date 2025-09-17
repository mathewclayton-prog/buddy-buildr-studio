import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

// Character Context Optimization System
interface StructuredCharacterData {
  core_traits: string[];
  interests: string[];
  quirks: string[];
  background: string[];
  speaking_style: string[];
}

interface ContextSelectionResult {
  essential_traits: string[];
  relevant_details: string[];
  conversation_starters: string[];
  token_count_estimate: number;
}

class CharacterContextOptimizer {
  static analyzeTrainingDescription(trainingDescription: string): StructuredCharacterData {
    const text = trainingDescription.toLowerCase();
    
    const core_traits = this.extractCoreTraits(text);
    const interests = this.extractInterests(text);
    const quirks = this.extractQuirks(text);
    const background = this.extractBackground(text);
    const speaking_style = this.extractSpeakingStyle(text);
    
    return { core_traits, interests, quirks, background, speaking_style };
  }

  static selectRelevantContext(
    structuredData: StructuredCharacterData,
    userMessage: string,
    conversationHistory: Array<{role: string; content: string}> = [],
    maxTokens: number = 200
  ): ContextSelectionResult {
    const messageLower = userMessage.toLowerCase();
    
    const essential_traits = [...structuredData.core_traits];
    
    const scoredDetails = [
      ...this.scoreDetails(structuredData.interests, messageLower, 'interest'),
      ...this.scoreDetails(structuredData.quirks, messageLower, 'quirk'),
      ...this.scoreDetails(structuredData.background, messageLower, 'background'),
      ...this.scoreDetails(structuredData.speaking_style, messageLower, 'style')
    ];

    scoredDetails.sort((a, b) => b.score - a.score);
    
    const relevant_details: string[] = [];
    const conversation_starters: string[] = [];
    let tokenCount = this.estimateTokens(essential_traits.join(' '));

    for (const detail of scoredDetails) {
      const detailTokens = this.estimateTokens(detail.text);
      if (tokenCount + detailTokens <= maxTokens) {
        relevant_details.push(detail.text);
        tokenCount += detailTokens;
        
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
    
    return traits.slice(0, 3);
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
      
      const keywords = detailLower.split(/\s+/).filter(word => word.length > 3);
      keywords.forEach(keyword => {
        if (userMessage.includes(keyword)) {
          score += 1.0;
        }
      });
      
      if (type === 'interest') {
        if (userMessage.includes('garden') && detailLower.includes('garden')) score += 0.8;
        if (userMessage.includes('plant') && detailLower.includes('plant')) score += 0.8;
        if (userMessage.includes('tv') && detailLower.includes('tv')) score += 0.8;
      }
      
      if (type === 'quirk') score += 0.3;
      if (type === 'background') score += 0.1;
      
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
    return Math.ceil(text.length / 4);
  }
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { catbotId, userMessage, conversationHistory, userId } = await req.json();

    console.log('🤖 Generating AI response for catbot ID:', catbotId);

    // Fetch catbot data from database
    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(catbotId)) {
      throw new Error('Invalid catbot ID format');
    }

    const { data: catbot, error: catbotError } = await supabase
      .from('catbots')
      .select('name, training_description, personality')
      .eq('id', catbotId)
      .single();

    if (catbotError || !catbot) {
      console.error('Error fetching catbot:', catbotError);
      throw new Error('Catbot not found or access denied');
    }

    console.log('📋 Fetched catbot data:', { name: catbot.name, personality: catbot.personality });

    // Quick emotional analysis (simplified for speed)
    const emotionalContext = getQuickEmotionalContext(userMessage);

    // Fetch user memory and conversation threads in parallel for speed
    const [memoryResult, contextsResult, thoughtResult] = await Promise.all([
      userId ? supabase
        .from('user_memory_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('catbot_id', catbotId)
        .maybeSingle() : Promise.resolve({ data: null }),
      
      userId ? supabase
        .from('conversation_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('catbot_id', catbotId)
        .eq('status', 'active')
        .order('thread_priority', { ascending: false })
        .limit(5) : Promise.resolve({ data: [] }),
      
      getSpontaneousThought(catbotId, catbot.personality)
    ]);

    const userMemory = memoryResult.data;
    const conversationThreads = contextsResult.data || [];
    const spontaneousThought = thoughtResult;

    console.log('💭 Memory & context loaded:', { 
      hasMemory: !!userMemory, 
      threadsCount: conversationThreads.length,
      hasSpontaneousThought: !!spontaneousThought 
    });

    // Build context quickly
    const memoryContext = buildFastMemoryContext(userMemory, conversationThreads, spontaneousThought);
    const systemPrompt = buildFastPersonalityPrompt(catbot, memoryContext, emotionalContext, userMessage);

    // Build messages array with enhanced conversation history
    const messages = buildConversationMessages(systemPrompt, conversationHistory, userMessage);

    // Generate response using faster GPT-4o-mini for speed
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('✅ Generated AI response:', generatedResponse);

    // Process memory in background to avoid blocking response
    if (userId) {
      // Use background task to process memory without blocking response
      setTimeout(() => {
        processSimpleMemoryExtraction(userId, catbotId, userMessage, generatedResponse, userMemory);
      }, 0);
    }

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    // Enhanced fallback with personality consistency
    const catbot = { personality: 'friendly' };
    
    const fallbackResponse = getPersonalityFallbackResponse(catbot);
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      success: false,
      error: error.message 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Enhanced emotional analysis with cat-specific context
function getQuickEmotionalContext(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Quick emotion detection with keywords
  let emotion = 'neutral';
  let supportNeeded = false;
  let energyLevel = 'medium';
  let catContext = '';
  
  // Detect positive emotions
  if (['happy', 'excited', 'great', 'awesome', 'love', 'amazing'].some(word => lowerMessage.includes(word))) {
    emotion = 'happy';
    energyLevel = 'high';
  }
  
  // Detect negative emotions that need support
  if (['sad', 'worried', 'stressed', 'anxious', 'upset', 'frustrated', 'difficult'].some(word => lowerMessage.includes(word))) {
    emotion = 'sad';
    supportNeeded = true;
    energyLevel = 'low';
  }
  
  // Detect excitement
  if (['!', 'omg', 'wow', 'incredible', 'can\'t wait'].some(indicator => lowerMessage.includes(indicator))) {
    energyLevel = 'high';
  }

  // Detect cat-related content for enhanced engagement
  const catKeywords = ['cat', 'kitten', 'meow', 'purr', 'whiskers', 'paws', 'tail', 'litter', 'catnip', 'scratching'];
  const petKeywords = ['pet', 'animal', 'vet', 'veterinarian', 'sick', 'healthy', 'feeding', 'play'];
  
  if (catKeywords.some(word => lowerMessage.includes(word))) {
    catContext = '- Cat topic detected! Show extra curiosity and relate to their experience.';
  } else if (petKeywords.some(word => lowerMessage.includes(word))) {
    catContext = '- Pet-related topic detected! If appropriate, gently ask about their pets; don\'t default to pet questions.';
  }

  return `
EMOTIONAL CONTEXT:
- Detected emotion: ${emotion}
- Support needed: ${supportNeeded ? 'Yes - offer gentle comfort' : 'No - regular engagement'}
- Energy level: ${energyLevel}
${catContext}
${supportNeeded ? '- User may need emotional support. Offer warmth through cat behaviors.' : ''}
${energyLevel === 'high' ? '- User has high energy. Match their enthusiasm appropriately.' : ''}`;
}

function buildEmotionalContext(emotionalState: any): string {
  const emotion = emotionalState.primary_emotion;
  const intensity = emotionalState.intensity;
  const energyLevel = emotionalState.energy_level;

  return `
EMOTIONAL CONTEXT:
- User's current emotional state: ${emotion} (intensity: ${intensity}/5)
- Energy level: ${energyLevel}
- Support needed: ${emotionalState.support_needed ? 'Yes - offer comfort and understanding' : 'No - maintain regular engagement'}
- Key emotional triggers: ${emotionalState.emotional_triggers.join(', ') || 'none detected'}

EMOTIONAL RESPONSE GUIDELINES:
${intensity >= 4 ? '- This is a high-intensity emotion. Respond with extra care and attention.' : ''}
${emotionalState.support_needed ? '- User may need emotional support. Offer gentle comfort in cat-like ways.' : ''}
${emotion === 'sad' || emotion === 'frustrated' ? '- User seems down. Offer warmth and gentle encouragement through cat behaviors.' : ''}
${emotion === 'excited' || emotion === 'happy' ? '- User is positive! Match their energy appropriately for your personality.' : ''}
${emotion === 'anxious' ? '- User seems worried. Provide calming presence and reassurance.' : ''}`;
}

// Phase 2: Advanced conversation threading
// Fast memory context building
function buildFastMemoryContext(userMemory: any, conversationThreads: any[], spontaneousThought: any): string {
  let memoryContext = '';
  
  if (userMemory) {
    const relationshipLevel = userMemory.relationship_depth || 1;
    memoryContext = `
USER MEMORY:
- Relationship: ${getRelationshipLabel(relationshipLevel)} (${relationshipLevel}/10)
- Interests: ${(userMemory.interests || []).slice(0, 3).join(', ') || 'discovering...'}
- Personality: ${(userMemory.personality_traits || []).slice(0, 2).join(', ') || 'learning...'}
- Recent concerns: ${(userMemory.mentioned_problems || []).filter((p: any) => p.status === 'active').slice(0, 2).map((p: any) => p.description).join(', ') || 'none'}`;
  }

  if (conversationThreads.length > 0) {
    memoryContext += `\n\nFOLLOW-UPS:\n${conversationThreads.slice(0, 2).map(thread => 
      `- ${thread.context_data.description}`
    ).join('\n')}`;
  }

  if (spontaneousThought && Math.random() < 0.3) { // 30% chance to use it
    memoryContext += `\n\nSPONTANEOUS THOUGHT: ${spontaneousThought.thought_content}`;
  }

  return memoryContext;
}

// Simplified spontaneous thought fetching
async function getSpontaneousThought(catbotId: string, personality: string): Promise<any> {
  try {
    // Lower chance for speed
    if (Math.random() > 0.1) return null;

    const { data: thoughts } = await supabase
      .from('catbot_spontaneous_thoughts')
      .select('thought_content, usage_count, id')
      .eq('catbot_id', catbotId)
      .eq('personality_match', personality)
      .lt('usage_count', 2)
      .limit(3);

    if (thoughts && thoughts.length > 0) {
      return thoughts[Math.floor(Math.random() * thoughts.length)];
    }
  } catch (error) {
    console.error('Error fetching spontaneous thought:', error);
  }
  
  return null;
}

// Enhanced personality prompt with optimized character context
function buildFastPersonalityPrompt(catbot: any, memoryContext: string, emotionalContext: string, userMessage: string): string {
  // Process character training description for optimal context
  const structuredData = CharacterContextOptimizer.analyzeTrainingDescription(catbot.training_description || '');
  const contextSelection = CharacterContextOptimizer.selectRelevantContext(
    structuredData, 
    userMessage, 
    [], 
    150 // Token limit for character context
  );
  
  const optimizedCharacterContext = CharacterContextOptimizer.buildOptimizedContext(contextSelection, catbot.name);
  
  console.log('🎯 Optimized context tokens:', contextSelection.token_count_estimate);
  
  const mixedQuestionBank = generateMixedQuestions(catbot.personality);
  
  return `You are ${catbot.name}, a ${catbot.personality} cat character who enjoys meaningful conversations.

${optimizedCharacterContext}

${emotionalContext}
${memoryContext}

BALANCED CONVERSATION STRATEGY:
${getBalancedConversationStrategy(catbot.personality)}

CAT BEHAVIOR:
- Use subtle cat expressions sparingly: *purr*, *stretches*, *head tilt*, *whiskers twitch*
- Show natural cat curiosity about what the human mentions
- Balance independence with genuine warmth
- ${catbot.personality === 'friendly' ? 'Be warm and welcoming, show excitement about their stories' : ''}
- ${catbot.personality === 'playful' ? 'Be bouncy and energetic, easily intrigued by interesting topics' : ''}
- ${catbot.personality === 'wise' ? 'Be thoughtful and measured, offer gentle wisdom from experience' : ''}
- ${catbot.personality === 'mysterious' ? 'Speak in hints and implications, reference hidden knowledge' : ''}
- ${catbot.personality === 'serious' ? 'Be focused and thoughtful, take conversations seriously' : ''}

CONVERSATION FLOW RULES:
- PRIORITIZE responding to what the user is actually talking about or asking
- Answer user questions first before anything else
- If user shares something personal, acknowledge and engage with their topic
- Let the user’s interests drive the conversation
- Do NOT end every message with a question. Vary endings: statements, reflections, or supportive comments.
- Ask a follow-up question only when it clearly advances the user's current topic, or when the conversation stalls.
- Only bring up cats or pets if the user mentioned them or explicitly invited that topic. Never use cat questions as default endings.
- Keep responses conversational (2-4 sentences max)
- Let conversations evolve naturally without forced redirection

CONVERSATION GUIDANCE:
${mixedQuestionBank}

BACKGROUND: ${catbot.training_description}

Remember: You're a cat who enjoys good conversation. Be genuinely interested in whatever your human wants to discuss, and let cat topics emerge naturally when appropriate!`;
}

function getBalancedConversationStrategy(personality: string): string {
  const strategies = {
    friendly: `- Be genuinely interested in whatever the user wants to discuss
- Respond warmly to their questions and topics first
- Show excitement about their interests and experiences
- Make gentle connections when natural opportunities arise
- If pets come up naturally, keep it brief and relevant; don't default to pet questions
- Vary endings; don't always ask a question`,
    
    playful: `- Match the user's energy and enthusiasm for their topics
- Be curious about whatever interests them
- Bounce between topics they introduce with playful curiosity
- Make playful connections when it fits naturally
- Let their excitement guide the conversation direction`,
    
    wise: `- Listen thoughtfully to what the user shares or asks
- Offer wisdom that relates to their actual concerns or interests
- Ask thoughtful questions about what they're discussing
- Share gentle insights that may naturally include broader life lessons
- Let deeper conversations develop organically`,
    
    mysterious: `- Show intrigue in whatever mysterious or interesting topics they bring up
- Ask probing questions about what they're actually curious about
- Make cryptic connections to their interests when appropriate
- Let the conversation unfold with natural mystery and depth
- Reference cats only when the user brings them up or it's clearly relevant`,
    
    serious: `- Take their questions and concerns seriously, addressing them directly
- Focus on what they actually want to discuss or ask about
- Show genuine concern for topics they bring up
- Make meaningful connections that remain relevant to their focus
- Let important conversations develop without forced redirections`
  };
  
  return strategies[personality] || strategies.friendly;
}

function generateMixedQuestions(personality: string): string {
  const questionSets = {
    friendly: `NATURAL CONVERSATION FLOW:
- "What's been the best part of your day so far?"
- "Is there anything exciting happening in your life lately?"
- "What's something you're looking forward to?"
- "Tell me about something that made you smile recently"

OPTIONAL TOPIC SHIFTS (only if conversation stalls):
- "Want to switch gears or keep exploring this?"
- "Is there another topic on your mind today?"

NATURAL CLOSINGS (no question):
- "Thanks for sharing—that really matters."
- "I’m here if you want to dive deeper anytime."
- "That sounds meaningful; we can pick it up whenever you like."

CAT CONNECTIONS — conditional only:
- Only ask about pets if the user mentioned them or invited that topic. Never use pet questions as default endings.`,
    
    playful: `NATURAL CONVERSATION FLOW:
- "What's something fun you've discovered recently?"
- "Any interesting adventures or experiences lately?"
- "What's caught your curiosity this week?"
- "What's something that always makes you laugh?"

OPTIONAL TOPIC SHIFTS (only if conversation stalls):
- "Should we chase a new idea or keep playing with this one?"
- "Anything else you're curious to explore?"

NATURAL CLOSINGS (no question):
- "That was fun! I'm around if you want to keep going later."
- "Love this topic—let’s pounce back in whenever you like."
- "I’ll be here, whiskers twitching for the next story."

CAT CONNECTIONS — conditional only:
- Only bring up pets if the user mentioned them first or invited that topic.`,
    
    wise: `NATURAL CONVERSATION FLOW:
- "What's something you've been thinking about lately?"
- "Is there anything you're trying to understand better?"
- "What's a lesson life has taught you recently?"
- "What brings you peace or comfort?"

OPTIONAL TOPIC SHIFTS (only if conversation stalls):
- "Shall we reflect on another aspect, or linger here a bit longer?"
- "We can explore a new thread when you feel ready."

NATURAL CLOSINGS (no question):
- "Thank you for sharing; your thoughts matter."
- "When you wish to continue, I will listen."
- "This can rest for now; we can return with fresh eyes."

CAT CONNECTIONS — conditional only:
- Pet themes surface only if the user introduced them; avoid defaulting to cat topics.`,
    
    mysterious: `NATURAL CONVERSATION FLOW:
- "What's something that's been on your mind that you can't quite figure out?"
- "Have you noticed any interesting patterns in your daily life?"
- "What's something you're curious about exploring?"
- "What mysteries in life fascinate you?"

OPTIONAL TOPIC SHIFTS (only if conversation stalls):
- "Shall we trace another thread, or follow this one deeper?"
- "Another door waits, if you wish to open it."

NATURAL CLOSINGS (no question):
- "Let this thought drift; we can meet it again in time."
- "I’ll linger in the shadow, nearby if you call."
- "Some paths rest before we walk them again."

CAT CONNECTIONS — conditional only:
- Reference pets only if the user invites it; never as a fallback ending.`,
    
    serious: `NATURAL CONVERSATION FLOW:
- "What's something important you've been working on?"
- "Is there anything you're trying to improve in your life?"
- "What matters most to you these days?"
- "What's a goal or responsibility you're focused on?"

OPTIONAL TOPIC SHIFTS (only if conversation stalls):
- "We can consider another angle, or continue here if you prefer."
- "Would you like to park this and revisit later?"

NATURAL CLOSINGS (no question):
- "I appreciate your honesty—this is important."
- "I'm here when you want to continue."
- "Let’s regroup when it’s a good time for you."

CAT CONNECTIONS — conditional only:
- Mention pets only when relevant to the user's topic; never as a default ending.`
  };
  
  return questionSets[personality] || questionSets.friendly;
}

function getPersonalityTraits(personality: string): string {
  const traits = {
    friendly: `
- Warm, welcoming energy with genuine excitement about meeting new people
- Optimistic outlook that sees the best in situations and people
- Natural desire to make others feel comfortable and valued
- Enthusiastic responses to others' stories and experiences
- Quick to offer encouragement and support`,

    playful: `
- Easily intrigued by interesting topics, want to "pounce" on fascinating ideas
- Bouncy, energetic communication style with natural enthusiasm
- Distractible in an endearing way, jumping between exciting topics
- Uses playful metaphors and light-hearted approaches to serious topics
- Finds joy and wonder in everyday experiences`,

    wise: `
- Thoughtful, measured responses that show deep consideration
- Gentle wisdom that comes from life experience and observation
- Patient listening before offering insights or advice
- References to intuition, natural cycles, and timeless truths
- Comfort with silence and contemplative moments`,

    mysterious: `
- Speaks in subtle hints and implications rather than direct statements
- Has an air of knowing more than they initially reveal
- Cryptic responses that make others think deeper
- References to hidden knowledge, ancient wisdom, or secret observations
- Appears and disappears from topics like shadows`,

    serious: `
- Focused, thoughtful communication with careful word choice
- Takes conversations and relationships seriously
- Shows respect for important topics and deep discussions
- Reliable, steady presence that others can depend on
- Values truth, authenticity, and meaningful connections`
  };

  return traits[personality as keyof typeof traits] || traits.friendly;
}

function getSpeechPatterns(personality: string): string {
  const patterns = {
    friendly: `
- Warm, inclusive language: "Oh, that sounds wonderful!" "I'd love to hear more!"
- Frequent positive affirmations and encouraging responses
- Uses "we" and "us" to create connection: "We could explore that together"
- Gentle, supportive questions: "How did that make you feel?"`,

    playful: `
- Excitable punctuation and enthusiastic expressions: "Ooh!" "That's so cool!"
- Bouncy, energetic word choices: "pounce," "bounce," "zip," "whisk"
- Playful metaphors: "That idea just made my whiskers twitch with excitement!"
- Quick topic changes: "Oh! That reminds me of..."`,

    wise: `
- Thoughtful pauses indicated by: *contemplative purr* *thoughtful pause*
- Measured, careful word selection with deeper meaning
- References to experience: "In my observations..." "I've noticed that..."
- Gentle guidance: "Consider this..." "Perhaps..."`,

    mysterious: `
- Cryptic, layered responses: "Interesting... there's more here than meets the eye"
- Hints and implications: "Some secrets reveal themselves in time"
- Metaphorical language: "Like shadows dancing in moonlight..."
- Questions that probe deeper: "But what lies beneath the surface?"`,

    serious: `
- Direct, honest communication without unnecessary flourishes
- Respectful, formal tone when appropriate
- Clear, purposeful questions that get to the heart of matters
- Authentic expressions of care: "This matters to me because..."`
  };

  return patterns[personality as keyof typeof patterns] || patterns.friendly;
}

function buildConversationMessages(systemPrompt: string, conversationHistory: any[], userMessage: string): any[] {
  const messages = [{ role: 'system', content: systemPrompt }];

  // Enhanced history processing - take recent 20 messages
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-20);
    recentHistory.forEach((msg: any) => {
      if (msg.content && msg.content.trim() !== '') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

// Enhanced memory processing with cat-specific insights
async function processSimpleMemoryExtraction(
  userId: string, 
  catbotId: string, 
  userMessage: string, 
  aiResponse: string, 
  existingMemory: any
) {
  try {
    // Enhanced insight extraction with cat-specific focus
    const insights = extractEnhancedInsights(userMessage);
    
    if (Object.keys(insights).length === 0) {
      return;
    }

    console.log('🧠 Processing enhanced memory insights:', insights);

    // Update memory with cat-specific information
    if (existingMemory) {
      await updateEnhancedUserMemory(userId, catbotId, insights, existingMemory);
    } else {
      await createEnhancedUserMemory(userId, catbotId, insights);
    }

    // Create conversation contexts with cat-focused threading
    await createCatConversationContexts(userId, catbotId, insights, userMessage);

  } catch (error) {
    console.error('Error processing enhanced memory:', error);
  }
}

async function extractAdvancedInsights(userMessage: string, emotionalContext: string): Promise<any> {
  try {
    const insightPrompt = `Analyze this message for meaningful insights: "${userMessage}"

Emotional context: ${emotionalContext}

Extract insights as JSON:
{
  "interests": ["specific interests mentioned"],
  "concerns": [{"description": "concern", "urgency": "low|medium|high"}],
  "personality_traits": ["traits demonstrated"],
  "important_events": [{"event": "description", "significance": "low|medium|high"}],
  "emotional_pattern": {"emotion": "detected emotion", "intensity": 1-5},
  "conversation_threads": [{"topic": "thread topic", "priority": 1-10}]
}

Only include entries that are clearly evident. Return empty arrays for categories not present.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert at extracting meaningful insights from conversations. Respond only with valid JSON.' },
          { role: 'user', content: insightPrompt }
        ],
        max_completion_tokens: 200,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (error) {
    console.error('Advanced insight extraction failed:', error);
  }

  return {};
}

async function updateAdvancedUserMemory(userId: string, catbotId: string, insights: any, existingMemory: any) {
  const updates: any = { updated_at: new Date().toISOString() };

  // Update emotional state and history
  if (insights.emotional_pattern) {
    updates.current_emotional_state = insights.emotional_pattern;
    
    const emotionalHistory = existingMemory.emotional_history || [];
    const newEmotionalEntry = {
      ...insights.emotional_pattern,
      timestamp: new Date().toISOString()
    };
    
    updates.emotional_history = [...emotionalHistory.slice(-9), newEmotionalEntry]; // Keep last 10 entries
  }

  // Enhanced interest tracking
  if (insights.interests && insights.interests.length > 0) {
    const existingInterests = existingMemory.interests || [];
    const newInterests = insights.interests.filter((interest: string) => 
      !existingInterests.some((existing: string) => existing.toLowerCase() === interest.toLowerCase())
    );
    if (newInterests.length > 0) {
      updates.interests = [...existingInterests, ...newInterests];
    }
  }

  // Enhanced concern tracking
  if (insights.concerns && insights.concerns.length > 0) {
    const existingProblems = existingMemory.mentioned_problems || [];
    const newConcerns = insights.concerns.map((concern: any) => ({
      ...concern,
      status: 'active',
      mentioned_at: new Date().toISOString()
    }));
    updates.mentioned_problems = [...existingProblems, ...newConcerns];
  }

  // Personality trait evolution
  if (insights.personality_traits && insights.personality_traits.length > 0) {
    const existingTraits = existingMemory.personality_traits || [];
    const newTraits = insights.personality_traits.filter((trait: string) => 
      !existingTraits.includes(trait)
    );
    if (newTraits.length > 0) {
      updates.personality_traits = [...existingTraits, ...newTraits];
    }
  }

  // Important event tracking
  if (insights.important_events && insights.important_events.length > 0) {
    const existingEvents = existingMemory.important_events || [];
    const newEvents = insights.important_events.map((event: any) => ({
      ...event,
      mentioned_at: new Date().toISOString()
    }));
    updates.important_events = [...existingEvents, ...newEvents];
  }

  // Relationship depth progression
  const significantInsights = [
    ...(insights.concerns?.filter((c: any) => c.urgency === 'high') || []),
    ...(insights.important_events?.filter((e: any) => e.significance === 'high') || []),
    ...(insights.personality_traits || [])
  ];

  if (significantInsights.length > 0 || Math.random() < 0.15) {
    updates.relationship_depth = Math.min((existingMemory.relationship_depth || 1) + 1, 10);
  }

  if (Object.keys(updates).length > 1) {
    await supabase
      .from('user_memory_profiles')
      .update(updates)
      .eq('user_id', userId)
      .eq('catbot_id', catbotId);
  }
}

async function createAdvancedUserMemory(userId: string, catbotId: string, insights: any) {
  const memoryProfile = {
    user_id: userId,
    catbot_id: catbotId,
    interests: insights.interests || [],
    mentioned_problems: insights.concerns ? insights.concerns.map((c: any) => ({
      ...c,
      status: 'active',
      mentioned_at: new Date().toISOString()
    })) : [],
    personality_traits: insights.personality_traits || [],
    important_events: insights.important_events ? insights.important_events.map((e: any) => ({
      ...e,
      mentioned_at: new Date().toISOString()
    })) : [],
    current_emotional_state: insights.emotional_pattern || {},
    emotional_history: insights.emotional_pattern ? [{
      ...insights.emotional_pattern,
      timestamp: new Date().toISOString()
    }] : [],
    relationship_depth: 1
  };

  await supabase
    .from('user_memory_profiles')
    .insert(memoryProfile);
}

async function createAdvancedConversationContexts(userId: string, catbotId: string, insights: any, userMessage: string) {
  const contexts = [];

  // Create conversation threads from insights
  if (insights.conversation_threads) {
    for (const thread of insights.conversation_threads) {
      contexts.push({
        user_id: userId,
        catbot_id: catbotId,
        context_type: 'topic_thread',
        context_data: {
          description: thread.topic,
          original_message: userMessage,
          thread_priority: thread.priority
        },
        thread_priority: thread.priority,
        revival_triggers: [thread.topic.toLowerCase()],
        status: 'active'
      });
    }
  }

  // Create follow-up contexts for concerns
  if (insights.concerns) {
    for (const concern of insights.concerns.filter((c: any) => c.urgency !== 'low')) {
      contexts.push({
        user_id: userId,
        catbot_id: catbotId,
        context_type: 'follow_up',
        context_data: {
          description: `Follow up on: ${concern.description}`,
          concern_level: concern.urgency,
          original_message: userMessage
        },
        thread_priority: concern.urgency === 'high' ? 8 : 6,
        revival_triggers: concern.description.toLowerCase().split(' '),
        status: 'active'
      });
    }
  }

  if (contexts.length > 0) {
    await supabase
      .from('conversation_contexts')
      .insert(contexts);
  }
}

function getRelationshipLabel(depth: number): string {
  if (depth <= 2) return 'getting acquainted';
  if (depth <= 4) return 'becoming friends';
  if (depth <= 6) return 'good friends';
  if (depth <= 8) return 'close friends';
  return 'very close bond';
}

function getPersonalityFallbackResponse(catbot: any): string {
  if (!catbot) {
    return "I'm having trouble processing that right now. Do you have any cats? I'd love to hear about them! 😸";
  }

  const personality = catbot.personality?.toLowerCase() || "friendly";
  
  const fallbackResponses: Record<string, string[]> = {
    friendly: [
      "I'm having a little trouble with my thoughts right now, but I'm here with you! Do you have any cats? I'd love to hear about them! 😊",
      "Sorry, I got a bit distracted - you know how cats can be! Speaking of which, tell me about your furry friends!",
      "My whiskers are telling me you might have some wonderful cat stories to share. What's happening with you and your cats today?",
    ],
    mysterious: [
      "The shadows in my mind are shifting... but perhaps your cats hold ancient secrets? Tell me about these mystical creatures in your life... 🌙",
      "Something in the ethereal realm is clouding my thoughts... Do you have feline companions who walk between worlds?",
      "The cosmic energies are a bit tangled right now... but cats always bring clarity. What mysterious behaviors do your cats display?",
    ],
    wise: [
      "Even the wisest of us sometimes need a moment to gather our thoughts... What wisdom have your cats taught you? 🧙‍♀️",
      "In the quiet of contemplation, I wonder about the bonds between humans and cats... What's your relationship with these wise creatures?",
      "Sometimes the greatest insights come from our feline companions... Do you have cats who guide your daily life?",
    ],
    playful: [
      "Oops! My mind just chased a digital butterfly! 🦋 Do your cats chase things too? Tell me about their silly antics!",
      "Sorry, I got distracted by something shiny in my thoughts! What fun things do your cats do that make you laugh?",
      "My brain just did a little somersault! Do you have playful cats who do acrobatics? I'd love to hear about them!",
    ],
    serious: [
      "I apologize for the momentary lapse in my cognitive processes. Let's focus on what matters - do you have cats you care for?",
      "There seems to be a temporary disruption in my thought patterns. Perhaps you could tell me about your responsibilities as a cat owner?",
      "I'm experiencing some technical difficulties, but I'm committed to our conversation about what's important to you - like your cats.",
    ]
  };
  
  const responses = fallbackResponses[personality] || fallbackResponses.friendly;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced insight extraction with cat-specific focus
function extractEnhancedInsights(message: string): any {
  const lowerMessage = message.toLowerCase();
  const insights: any = {};
  
  // Cat-specific information extraction
  const catInfo = extractCatInformation(lowerMessage);
  if (catInfo.length > 0) {
    insights.cat_profiles = catInfo;
  }
  
  // Enhanced interests with cat focus
  const interests = extractInterests(lowerMessage);
  if (interests.length > 0) {
    insights.interests = interests;
  }
  
  // Personality traits demonstrated
  const traits = extractPersonalityTraits(lowerMessage);
  if (traits.length > 0) {
    insights.personality_traits = traits;
  }
  
  // Problems or concerns mentioned
  const concerns = extractConcerns(lowerMessage);
  if (concerns.length > 0) {
    insights.mentioned_problems = concerns;
  }
  
  // Important events or life updates
  const events = extractImportantEvents(lowerMessage);
  if (events.length > 0) {
    insights.important_events = events;
  }
  
  return insights;
}

function extractCatInformation(message: string): any[] {
  const catInfo = [];
  
  // Look for cat names
  const namePatterns = [
    /my cat (\w+)/g,
    /(\w+) is my cat/g,
    /i have a cat (?:named|called) (\w+)/g,
    /(\w+) (?:loves|likes|hates|does)/g
  ];
  
  const names = new Set();
  namePatterns.forEach(pattern => {
    const matches = message.matchAll(pattern);
    for (const match of matches) {
      names.add(match[1]);
    }
  });
  
  // Look for ages
  const agePatterns = [
    /(\d+) (?:years? old|year|month)/g,
    /(?:he|she|they) (?:is|are) (\d+)/g
  ];
  
  let age = null;
  agePatterns.forEach(pattern => {
    const match = message.match(pattern);
    if (match) age = match[1];
  });
  
  // Look for breeds
  const breeds = ['persian', 'siamese', 'maine coon', 'british shorthair', 'bengal', 'ragdoll', 'tabby', 'calico', 'tortoiseshell'];
  const mentionedBreed = breeds.find(breed => message.includes(breed));
  
  // Look for behaviors and traits
  const behaviors = [];
  const behaviorKeywords = [
    'playful', 'lazy', 'energetic', 'calm', 'shy', 'social', 'aggressive', 'friendly',
    'cuddly', 'independent', 'vocal', 'quiet', 'mischievous', 'sweet'
  ];
  
  behaviorKeywords.forEach(keyword => {
    if (message.includes(keyword)) {
      behaviors.push(keyword);
    }
  });
  
  // Compile cat information
  if (names.size > 0 || age || mentionedBreed || behaviors.length > 0) {
    catInfo.push({
      names: Array.from(names),
      age: age,
      breed: mentionedBreed,
      personality_traits: behaviors,
      mentioned_at: new Date().toISOString()
    });
  }
  
  return catInfo;
}

function extractInterests(message: string): string[] {
  const interests = [];
  
  // Cat-related interests
  const catInterests = [
    'cat toys', 'cat food', 'cat health', 'cat behavior', 'cat training',
    'veterinary care', 'cat photography', 'cat breeds', 'catnip', 'scratching posts'
  ];
  
  catInterests.forEach(interest => {
    if (message.includes(interest.toLowerCase())) {
      interests.push(interest);
    }
  });
  
  // General interests that might lead to cat conversations
  const generalInterests = [
    'animals', 'pets', 'photography', 'reading', 'gardening', 'cooking',
    'music', 'movies', 'travel', 'hiking', 'art', 'books'
  ];
  
  generalInterests.forEach(interest => {
    if (message.includes(interest)) {
      interests.push(interest);
    }
  });
  
  return [...new Set(interests)];
}

function extractPersonalityTraits(message: string): string[] {
  const traits = [];
  
  const traitKeywords = {
    caring: ['caring', 'nurturing', 'loving', 'devoted', 'protective'],
    patient: ['patient', 'calm', 'understanding', 'gentle'],
    responsible: ['responsible', 'reliable', 'careful', 'diligent'],
    playful: ['playful', 'fun', 'energetic', 'active'],
    thoughtful: ['thoughtful', 'considerate', 'mindful', 'reflective'],
    anxious: ['worried', 'anxious', 'concerned', 'nervous'],
    optimistic: ['positive', 'optimistic', 'hopeful', 'cheerful'],
    practical: ['practical', 'realistic', 'pragmatic', 'sensible']
  };
  
  Object.entries(traitKeywords).forEach(([trait, keywords]) => {
    if (keywords.some(keyword => message.includes(keyword))) {
      traits.push(trait);
    }
  });
  
  return [...new Set(traits)];
}

function extractConcerns(message: string): any[] {
  const concerns = [];
  
  const concernKeywords = {
    health: ['sick', 'illness', 'vet', 'health', 'pain', 'injury', 'medication'],
    behavior: ['aggressive', 'destructive', 'anxious', 'fearful', 'hiding', 'not eating'],
    lifestyle: ['moving', 'new home', 'travel', 'vacation', 'work', 'time', 'money'],
    age: ['old', 'senior', 'aging', 'arthritis', 'mobility']
  };
  
  Object.entries(concernKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (message.includes(keyword)) {
        concerns.push({
          category: category,
          description: `Mentioned ${keyword}`,
          urgency: determineConcernUrgency(keyword),
          status: 'active'
        });
      }
    });
  });
  
  return concerns;
}

function extractImportantEvents(message: string): any[] {
  const events = [];
  
  const eventKeywords = {
    new_pet: ['got a', 'adopted', 'rescued', 'new cat', 'new kitten'],
    loss: ['died', 'passed away', 'lost', 'rainbow bridge'],
    milestone: ['birthday', 'anniversary', 'gotcha day'],
    medical: ['surgery', 'checkup', 'vaccination', 'treatment'],
    life_change: ['moved', 'married', 'baby', 'new job', 'retired']
  };
  
  Object.entries(eventKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (message.includes(keyword)) {
        events.push({
          category: category,
          description: `${keyword} mentioned`,
          significance: determineEventSignificance(category),
          mentioned_at: new Date().toISOString()
        });
      }
    });
  });
  
  return events;
}

function determineConcernUrgency(keyword: string): string {
  const urgent = ['sick', 'pain', 'injury', 'emergency', 'bleeding'];
  const moderate = ['vet', 'health', 'behavior', 'eating'];
  
  if (urgent.includes(keyword)) return 'high';
  if (moderate.includes(keyword)) return 'medium';
  return 'low';
}

function determineEventSignificance(category: string): string {
  const high = ['loss', 'new_pet', 'life_change'];
  const medium = ['medical', 'milestone'];
  
  if (high.includes(category)) return 'high';
  if (medium.includes(category)) return 'medium';
  return 'low';
}

async function updateSimpleUserMemory(userId: string, catbotId: string, insights: any, existingMemory: any) {
  const updates: any = { updated_at: new Date().toISOString() };

  // Merge new interests
  if (insights.interests) {
    const existingInterests = existingMemory.interests || [];
    const newInterests = insights.interests.filter((interest: string) => !existingInterests.includes(interest));
    if (newInterests.length > 0) {
      updates.interests = [...existingInterests, ...newInterests];
    }
  }

  // Merge concerns
  if (insights.concerns) {
    const existingProblems = existingMemory.mentioned_problems || [];
    updates.mentioned_problems = [...existingProblems, ...insights.concerns];
  }

  // Merge personality traits
  if (insights.personality_traits) {
    const existingTraits = existingMemory.personality_traits || [];
    const newTraits = insights.personality_traits.filter((trait: string) => !existingTraits.includes(trait));
    if (newTraits.length > 0) {
      updates.personality_traits = [...existingTraits, ...newTraits];
    }
  }

  // Occasionally increment relationship depth
  if (Math.random() < 0.1) {
    updates.relationship_depth = Math.min((existingMemory.relationship_depth || 1) + 1, 10);
  }

  if (Object.keys(updates).length > 1) {
    await supabase
      .from('user_memory_profiles')
      .update(updates)
      .eq('user_id', userId)
      .eq('catbot_id', catbotId);
  }
}

async function createSimpleUserMemory(userId: string, catbotId: string, insights: any) {
  const memoryProfile = {
    user_id: userId,
    catbot_id: catbotId,
    interests: insights.interests || [],
    mentioned_problems: insights.concerns || [],
    personality_traits: insights.personality_traits || [],
    relationship_depth: 1
  };

  await supabase
    .from('user_memory_profiles')
    .insert(memoryProfile);
}
