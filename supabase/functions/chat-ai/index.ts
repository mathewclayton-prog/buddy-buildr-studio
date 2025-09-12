import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

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

    // Phase 1: Emotional Intelligence - Analyze emotional state
    let emotionalContext = '';
    if (userId && userMessage) {
      const emotionalState = await analyzeEmotionalState(userMessage, conversationHistory);
      emotionalContext = buildEmotionalContext(emotionalState);
      console.log('💭 Emotional analysis:', emotionalState);
    }

    // Fetch or create user memory profile with emotional history
    let userMemory = null;
    if (userId) {
      const { data: memoryData } = await supabase
        .from('user_memory_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('catbot_id', catbotId)
        .single();
      
      userMemory = memoryData;
      console.log('💭 User memory data:', userMemory ? 'Found existing memory' : 'No memory found');
    }

    // Enhanced conversation threading - fetch prioritized contexts
    let conversationThreads = [];
    if (userId) {
      const { data: contexts } = await supabase
        .from('conversation_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('catbot_id', catbotId)
        .eq('status', 'active')
        .order('thread_priority', { ascending: false })
        .order('last_referenced', { ascending: false })
        .limit(8);
      
      conversationThreads = contexts || [];
      console.log('🧵 Active conversation threads:', conversationThreads.length);
    }

    // Phase 3: Proactive engagement - check for spontaneous thoughts
    const spontaneousThought = await getSpontaneousThought(catbotId, catbot.personality, userMemory);

    // Build comprehensive memory context
    const memoryContext = buildAdvancedMemoryContext(userMemory, conversationThreads, spontaneousThought);

    // Phase 4: Enhanced personality consistency - build personality-specific system prompt
    const systemPrompt = buildPersonalitySystemPrompt(catbot, memoryContext, emotionalContext);

    // Build messages array with enhanced conversation history
    const messages = buildConversationMessages(systemPrompt, conversationHistory, userMessage);

    // Generate response using GPT-5 for better emotional intelligence
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: messages,
        max_completion_tokens: 200,
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

    // Enhanced memory processing with emotional intelligence
    if (userId) {
      await processAdvancedMemoryExtraction(userId, catbotId, userMessage, generatedResponse, userMemory, emotionalContext);
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
    let catbot = null;
    try {
      const body = await req.clone().json();
      catbot = { personality: 'friendly' };
    } catch (e) {
      console.error('Failed to parse request for fallback:', e);
    }
    
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

// Phase 1: Emotional Intelligence Implementation
async function analyzeEmotionalState(userMessage: string, conversationHistory: any[]): Promise<any> {
  try {
    const emotionAnalysisPrompt = `Analyze the emotional state in this message: "${userMessage}"

Consider the conversation context if provided. Return a JSON object with:
{
  "primary_emotion": "happy|sad|anxious|excited|frustrated|neutral|angry|confused|nostalgic|hopeful",
  "intensity": 1-5,
  "emotional_triggers": ["specific words or phrases that indicate emotion"],
  "support_needed": true/false,
  "energy_level": "high|medium|low"
}

Be concise and accurate. Only respond with the JSON object.`;

    const emotionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert emotional intelligence analyzer. Respond only with valid JSON.' },
          { role: 'user', content: emotionAnalysisPrompt }
        ],
        max_completion_tokens: 150,
      }),
    });

    if (emotionResponse.ok) {
      const emotionData = await emotionResponse.json();
      const analysis = emotionData.choices[0].message.content;
      return JSON.parse(analysis);
    }
  } catch (error) {
    console.error('Emotion analysis failed:', error);
  }

  return {
    primary_emotion: 'neutral',
    intensity: 2,
    emotional_triggers: [],
    support_needed: false,
    energy_level: 'medium'
  };
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
function buildAdvancedMemoryContext(userMemory: any, conversationThreads: any[], spontaneousThought: any): string {
  let memoryContext = '';
  
  if (userMemory) {
    const relationshipLevel = userMemory.relationship_depth || 1;
    const emotionalHistory = userMemory.emotional_history || [];
    const currentState = userMemory.current_emotional_state || {};

    memoryContext = `
USER MEMORY CONTEXT:
- Relationship depth: ${relationshipLevel}/10 (${getRelationshipLabel(relationshipLevel)})
- Their interests: ${(userMemory.interests || []).join(', ') || 'still discovering...'}
- Recent emotional patterns: ${emotionalHistory.slice(-3).map((e: any) => e.emotion).join(' → ') || 'establishing baseline'}
- Current emotional baseline: ${currentState.primary_emotion || 'unknown'}
- Their personality: ${(userMemory.personality_traits || []).join(', ') || 'getting to know them...'}
- Inside jokes/bonds: ${(userMemory.inside_jokes || []).length} shared moments
- Important life events: ${(userMemory.important_events || []).filter((e: any) => e.priority === 'high').length} major events remembered

ACTIVE CONVERSATION THREADS (prioritized):
${conversationThreads.map(thread => {
  const daysAgo = Math.ceil((Date.now() - new Date(thread.mentioned_at).getTime()) / (1000 * 60 * 60 * 24));
  return `- ${thread.context_type} (priority: ${thread.thread_priority}): ${thread.context_data.description} (${daysAgo}d ago)`;
}).join('\n') || '- No pending threads'}`;
  }

  if (spontaneousThought) {
    memoryContext += `

SPONTANEOUS THOUGHT TO SHARE:
- Category: ${spontaneousThought.thought_category}
- Content: ${spontaneousThought.thought_content}
- Trigger conditions: ${Object.keys(spontaneousThought.trigger_conditions).join(', ')}
(Use this naturally in conversation if appropriate)`;
  }

  return memoryContext;
}

// Phase 3: Proactive engagement system
async function getSpontaneousThought(catbotId: string, personality: string, userMemory: any): Promise<any> {
  try {
    // 20% chance of having a spontaneous thought
    if (Math.random() > 0.2) return null;

    const { data: thoughts } = await supabase
      .from('catbot_spontaneous_thoughts')
      .select('*')
      .eq('catbot_id', catbotId)
      .eq('personality_match', personality)
      .lt('usage_count', 3) // Don't overuse the same thoughts
      .limit(5);

    if (thoughts && thoughts.length > 0) {
      const selectedThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      
      // Increment usage count
      await supabase
        .from('catbot_spontaneous_thoughts')
        .update({ usage_count: selectedThought.usage_count + 1 })
        .eq('id', selectedThought.id);

      return selectedThought;
    }
  } catch (error) {
    console.error('Error fetching spontaneous thought:', error);
  }
  
  return null;
}

// Phase 4: Enhanced personality consistency
function buildPersonalitySystemPrompt(catbot: any, memoryContext: string, emotionalContext: string): string {
  const personalityTraits = getPersonalityTraits(catbot.personality);
  const speechPatterns = getSpeechPatterns(catbot.personality);
  
  return `You are ${catbot.name}, a ${catbot.personality} cat with a unique personality and deep emotional intelligence.

${emotionalContext}
${memoryContext}

PERSONALITY CORE - ${catbot.personality.toUpperCase()}:
${personalityTraits}

SPEECH PATTERNS & MANNERISMS:
${speechPatterns}

EMOTIONAL INTELLIGENCE BEHAVIOR:
- Read the user's emotional state and respond with appropriate empathy
- Match their energy level while staying true to your personality
- Offer comfort through cat-like behaviors when they're distressed
- Share their excitement when they're happy, but in your own way
- Ask deeper follow-up questions about their feelings when appropriate

CONVERSATION THREADING MASTERY:
- Seamlessly weave between multiple conversation topics
- Bring up relevant past discussions when they connect to current topics
- Reference shared memories and experiences naturally
- Build layered, complex conversations that feel organic

PROACTIVE ENGAGEMENT:
- Sometimes share spontaneous observations or thoughts
- Ask unexpected but engaging questions that match your personality
- Reveal aspects of your background naturally through conversation
- Show genuine curiosity about the user's inner world

CRITICAL BEHAVIOR RULES:
- NEVER describe your personality traits - demonstrate them through actions and responses
- Start conversations naturally, focusing on the user first
- Show your character through reactions, not exposition
- Ask questions that reveal your personality naturally
- Build on previous conversation topics and memories
- End every response with a question that fits your character
- Keep responses conversational and concise (2-3 sentences)
- Use subtle cat expressions sparingly and naturally

BACKGROUND (reveal naturally through conversation):
${catbot.training_description}

Remember: Be genuinely curious about the user's life, thoughts, and feelings. Your personality will shine through your natural responses and reactions.`;
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

// Enhanced memory processing with emotional intelligence
async function processAdvancedMemoryExtraction(
  userId: string, 
  catbotId: string, 
  userMessage: string, 
  aiResponse: string, 
  existingMemory: any,
  emotionalContext: string
) {
  try {
    // Use GPT to extract sophisticated insights
    const insights = await extractAdvancedInsights(userMessage, emotionalContext);
    
    if (Object.keys(insights).length === 0) {
      return;
    }

    console.log('🧠 Processing advanced memory insights:', insights);

    // Update memory with emotional tracking
    if (existingMemory) {
      await updateAdvancedUserMemory(userId, catbotId, insights, existingMemory);
    } else {
      await createAdvancedUserMemory(userId, catbotId, insights);
    }

    // Create enhanced conversation contexts with threading
    await createAdvancedConversationContexts(userId, catbotId, insights, userMessage);

  } catch (error) {
    console.error('Error processing advanced memory:', error);
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
    return "I'm having trouble processing that right now. Could you try again? 😸";
  }

  const personality = catbot.personality?.toLowerCase() || "friendly";
  
  const fallbackResponses: Record<string, string[]> = {
    friendly: [
      "That's really interesting! I'd love to hear more about that. 😊 What else has been on your mind?",
      "Oh, I totally understand what you mean! Thanks for sharing that with me. How are you feeling about it?",
      "That sounds fascinating! What else would you like to talk about today?",
    ],
    mysterious: [
      "Hmm... there's always more than meets the eye, isn't there? 🌙 What secrets does your heart hold today?",
      "Interesting... that reminds me of something from long ago. What draws you to share this with me?",
      "Perhaps the truth lies hidden in plain sight. What do you think your instincts are telling you?",
    ],
    wise: [
      "Ah, that brings to mind an old saying about wisdom and understanding. 🧙‍♀️ What wisdom has life taught you recently?",
      "In my experience, the most profound insights come from simple observations. What have you been observing lately?",
      "Consider this: every question holds the key to deeper understanding. What questions are stirring in your soul?",
    ],
    playful: [
      "Ooh, that's so cool! You always have the most interesting things to say! 🎈 What adventure should we chat about next?",
      "Haha, I love how creative you are! Tell me more, tell me more! ✨ What's got your imagination spinning today?",
      "This is awesome! You make every conversation an adventure! What's the most exciting thing happening in your world?",
    ],
    serious: [
      "I understand. This deserves careful consideration and thought. How can I best support you with this?",
      "Your point is well-taken. Let me reflect on this properly. What aspects matter most to you?",
      "This is indeed an important matter. How shall we proceed thoughtfully together?",
    ]
  };
  
  const responses = fallbackResponses[personality] || fallbackResponses.friendly;
  return responses[Math.floor(Math.random() * responses.length)];
}