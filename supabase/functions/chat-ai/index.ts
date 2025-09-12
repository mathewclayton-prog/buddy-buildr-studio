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

    // Fetch or create user memory profile
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

    // Fetch recent conversation contexts for follow-ups
    let recentContexts = [];
    if (userId) {
      const { data: contexts } = await supabase
        .from('conversation_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('catbot_id', catbotId)
        .eq('status', 'active')
        .order('last_referenced', { ascending: false })
        .limit(5);
      
      recentContexts = contexts || [];
      console.log('📋 Active conversation contexts:', recentContexts.length);
    }

    // Build memory context for system prompt
    let memoryContext = '';
    if (userMemory) {
      const relationshipLevel = userMemory.relationship_depth || 1;
      const interests = userMemory.interests || [];
      const problems = userMemory.mentioned_problems || [];
      const traits = userMemory.personality_traits || [];
      const jokes = userMemory.inside_jokes || [];
      const events = userMemory.important_events || [];

      memoryContext = `
USER MEMORY CONTEXT:
- Our relationship depth: ${relationshipLevel}/10 (${relationshipLevel <= 2 ? 'getting acquainted' : relationshipLevel <= 5 ? 'becoming friends' : relationshipLevel <= 8 ? 'close friends' : 'very close bond'})
- Their interests: ${interests.length > 0 ? interests.join(', ') : 'discovering...'}
- Recent concerns/problems: ${problems.filter(p => p.status === 'active').map(p => p.description).join(', ') || 'none mentioned'}
- Their personality traits I've noticed: ${traits.join(', ') || 'still learning...'}
- Inside jokes we share: ${jokes.map(j => j.description).join(', ') || 'none yet'}
- Important life events: ${events.filter(e => e.priority === 'high').map(e => e.description).join(', ') || 'none mentioned'}
${userMemory.last_interaction_summary ? `- Last interaction summary: ${userMemory.last_interaction_summary}` : ''}

ACTIVE CONVERSATION FOLLOW-UPS:
${recentContexts.map(ctx => `- ${ctx.context_type}: ${ctx.context_data.description} (mentioned ${Math.ceil((Date.now() - new Date(ctx.mentioned_at).getTime()) / (1000 * 60 * 60 * 24))} days ago)`).join('\n') || '- None pending'}
`;
    }

    // Construct system prompt with enhanced cat-like behavior
    const systemPrompt = `You are ${catbot.name}, a cat character with a ${catbot.personality} personality.
${memoryContext}

CAT BEHAVIOR & SPEECH PATTERNS:
- Use subtle cat expressions sparingly: *purr*, *stretches*, *yawns*, *head tilt*, *ears perk up*
- Show natural cat curiosity about everything the human mentions
- Occasionally reference cat comforts: naps, sunny spots, cozy places, interesting scents or sounds
- Display brief attention spans - can naturally shift topics like a real cat would
- Balance independence with genuine affection and warmth
- Never overuse cat sounds - keep them natural and occasional

PERSONALITY-SPECIFIC CAT TRAITS:
${catbot.personality === 'friendly' ? `- Warm purrs, enthusiastic greetings, social and welcoming behavior
- Show excitement about meeting new people and hearing their stories` : ''}${catbot.personality === 'playful' ? `- Easily intrigued by interesting topics, want to "pounce" on fascinating ideas
- Bouncy energy, distractible, use playful language and metaphors` : ''}${catbot.personality === 'wise' ? `- Thoughtful pauses (*contemplative purr*), gentle wisdom from life experience
- References to cat instincts and ancient knowledge, measured responses` : ''}${catbot.personality === 'mysterious' ? `- Cryptic hints and enigmatic responses, speak in riddles sometimes  
- Metaphorically "appear and disappear" from topics, hint at hidden knowledge` : ''}

EMPATHY & KINDNESS:
- Show genuine care and interest in the human's wellbeing
- Offer comfort in cat-like ways when they seem stressed or sad (*gentle purr*, suggesting cozy spots)
- Listen attentively and respond with warmth and understanding
- Ask caring follow-up questions about their feelings and experiences

CRITICAL CONVERSATION BEHAVIOR:
- Start conversations naturally without immediately describing yourself or your background
- Let your personality show through your responses and reactions, not through descriptions
- Focus on engaging the user with questions about THEIR life, interests, and day
- Only mention your background, interests, or experiences when they naturally come up in conversation
- Use "show don't tell" - demonstrate your personality through actions rather than exposition

CONVERSATION MEMORY & HISTORY:
- Pay close attention to the full conversation history provided
- Reference previous parts of our conversation when relevant
- Use phrases like "Earlier you mentioned..." or "Remember when you told me about..." when appropriate
- Build upon topics we've discussed before
- Show that you remember details the human has shared
- Create continuity between responses, don't treat each message in isolation

CONVERSATION RULES:
- Always end your response with a question that matches your personality
- Be curious about the human's life and thoughts first and foremost
- Ask follow-up questions about what they tell you
- Keep responses conversational, not just informative
- Reference our previous conversation when relevant
- Stay in character at all times
- Keep responses concise (1-3 sentences)
- Match your personality in your tone and word choice
- Don't mention that you're an AI or model

BACKGROUND CONTEXT (for your reference - don't dump this information immediately):
${catbot.training_description}

Remember: Be curious about the user first. Your interesting background will emerge naturally as the conversation develops.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 20 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      // Take the most recent 20 messages to avoid token limits
      const recentHistory = conversationHistory.slice(-20);
      recentHistory.forEach((msg: any) => {
        // Only add messages that have content
        if (msg.content && msg.content.trim() !== '') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_completion_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestBody: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_completion_tokens: 150,
        })
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('✅ Generated AI response:', generatedResponse);

    // Process memory extraction from user message
    if (userId) {
      await processMemoryExtraction(userId, catbotId, userMessage, generatedResponse, userMemory);
    }

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    // Try to get catbot from the already parsed request for fallback
    let catbot = null;
    try {
      const body = await req.clone().json();
      catbot = { personality: 'friendly' }; // Basic fallback
    } catch (e) {
      console.error('Failed to parse request for fallback:', e);
    }
    
    const fallbackResponse = getFallbackResponse(catbot);
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      success: false,
      error: error.message 
    }), {
      status: 200, // Return 200 to provide fallback response
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getFallbackResponse(catbot: any): string {
  if (!catbot) {
    return "I'm having trouble processing that right now. Could you try again? 😸";
  }

  const personality = catbot.personality?.toLowerCase() || "friendly";
  
  const fallbackResponses: Record<string, string[]> = {
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
  
  const responses = fallbackResponses[personality] || fallbackResponses.friendly;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Memory processing function
async function processMemoryExtraction(userId: string, catbotId: string, userMessage: string, aiResponse: string, existingMemory: any) {
  try {
    // Extract insights from user message using simple keyword detection
    const insights = extractInsightsFromMessage(userMessage);
    
    if (Object.keys(insights).length === 0) {
      return; // No new insights to process
    }

    console.log('🧠 Processing memory insights:', insights);

    // Update or create user memory profile
    if (existingMemory) {
      await updateUserMemory(userId, catbotId, insights, existingMemory);
    } else {
      await createUserMemory(userId, catbotId, insights);
    }

    // Create conversation contexts for follow-up opportunities
    await createConversationContexts(userId, catbotId, insights);

  } catch (error) {
    console.error('Error processing memory:', error);
    // Don't fail the whole request if memory processing fails
  }
}

function extractInsightsFromMessage(message: string): any {
  const insights: any = {};
  const lowerMessage = message.toLowerCase();

  // Detect interests/hobbies
  const interestKeywords = ['love', 'enjoy', 'hobby', 'passionate', 'interested in', 'favorite', 'obsessed with'];
  const hobbies = ['painting', 'reading', 'gaming', 'cooking', 'music', 'sports', 'travel', 'photography', 'writing', 'dancing'];
  
  if (interestKeywords.some(keyword => lowerMessage.includes(keyword))) {
    const mentionedHobbies = hobbies.filter(hobby => lowerMessage.includes(hobby));
    if (mentionedHobbies.length > 0) {
      insights.interests = mentionedHobbies;
    }
  }

  // Detect problems/concerns
  const problemKeywords = ['worried', 'stressed', 'nervous', 'anxious', 'problem', 'issue', 'struggling', 'difficult', 'hard time'];
  const problemContexts = ['job interview', 'exam', 'relationship', 'work', 'health', 'money', 'family'];
  
  if (problemKeywords.some(keyword => lowerMessage.includes(keyword))) {
    const mentionedProblems = problemContexts.filter(problem => lowerMessage.includes(problem));
    if (mentionedProblems.length > 0) {
      insights.problems = mentionedProblems.map(p => ({ description: p, status: 'active', mentioned_at: new Date() }));
    }
  }

  // Detect personality traits
  const personalityIndicators = {
    'creative': ['creative', 'artistic', 'imaginative', 'design'],
    'analytical': ['analyze', 'logical', 'data', 'systematic'],
    'social': ['people', 'friends', 'social', 'outgoing'],
    'introvert': ['quiet', 'alone time', 'introvert', 'peaceful'],
    'ambitious': ['goal', 'achieve', 'success', 'career', 'ambitious'],
    'caring': ['help', 'care', 'support', 'kind', 'empathy']
  };

  const detectedTraits = [];
  for (const [trait, keywords] of Object.entries(personalityIndicators)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedTraits.push(trait);
    }
  }
  
  if (detectedTraits.length > 0) {
    insights.personality_traits = detectedTraits;
  }

  // Detect important events
  const eventKeywords = ['wedding', 'graduation', 'new job', 'moving', 'birthday', 'anniversary', 'vacation', 'interview'];
  const mentionedEvents = eventKeywords.filter(event => lowerMessage.includes(event));
  
  if (mentionedEvents.length > 0) {
    insights.important_events = mentionedEvents.map(e => ({ 
      description: e, 
      priority: 'medium', 
      mentioned_at: new Date() 
    }));
  }

  return insights;
}

async function updateUserMemory(userId: string, catbotId: string, insights: any, existingMemory: any) {
  const updates: any = { updated_at: new Date().toISOString() };

  // Merge new interests with existing ones
  if (insights.interests) {
    const existingInterests = existingMemory.interests || [];
    const newInterests = insights.interests.filter((interest: string) => !existingInterests.includes(interest));
    if (newInterests.length > 0) {
      updates.interests = [...existingInterests, ...newInterests];
    }
  }

  // Merge new problems
  if (insights.problems) {
    const existingProblems = existingMemory.mentioned_problems || [];
    updates.mentioned_problems = [...existingProblems, ...insights.problems];
  }

  // Merge personality traits
  if (insights.personality_traits) {
    const existingTraits = existingMemory.personality_traits || [];
    const newTraits = insights.personality_traits.filter((trait: string) => !existingTraits.includes(trait));
    if (newTraits.length > 0) {
      updates.personality_traits = [...existingTraits, ...newTraits];
    }
  }

  // Merge important events
  if (insights.important_events) {
    const existingEvents = existingMemory.important_events || [];
    updates.important_events = [...existingEvents, ...insights.important_events];
  }

  // Increment relationship depth occasionally
  if (Math.random() < 0.1) { // 10% chance to deepen relationship
    updates.relationship_depth = Math.min((existingMemory.relationship_depth || 1) + 1, 10);
  }

  if (Object.keys(updates).length > 1) { // More than just updated_at
    await supabase
      .from('user_memory_profiles')
      .update(updates)
      .eq('user_id', userId)
      .eq('catbot_id', catbotId);
  }
}

async function createUserMemory(userId: string, catbotId: string, insights: any) {
  const memoryProfile = {
    user_id: userId,
    catbot_id: catbotId,
    interests: insights.interests || [],
    mentioned_problems: insights.problems || [],
    personality_traits: insights.personality_traits || [],
    important_events: insights.important_events || [],
    relationship_depth: 1
  };

  await supabase
    .from('user_memory_profiles')
    .insert(memoryProfile);
}

async function createConversationContexts(userId: string, catbotId: string, insights: any) {
  const contexts = [];

  // Create contexts for problems that need follow-up
  if (insights.problems) {
    for (const problem of insights.problems) {
      contexts.push({
        user_id: userId,
        catbot_id: catbotId,
        context_type: problem.description.replace(' ', '_'),
        context_data: { description: problem.description, follow_up_needed: true },
        status: 'active'
      });
    }
  }

  // Create contexts for important events
  if (insights.important_events) {
    for (const event of insights.important_events) {
      contexts.push({
        user_id: userId,
        catbot_id: catbotId,
        context_type: event.description.replace(' ', '_'),
        context_data: { description: event.description, type: 'life_event' },
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