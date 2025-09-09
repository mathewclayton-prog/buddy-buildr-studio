import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { character, userMessage, conversationHistory } = await req.json();

    console.log('🤖 Generating AI response for character:', character.name);

    // Build the character prompt
    const personalityDesc = character.personalityTraits.join(", ");
    
    const systemPrompt = `You are ${character.name}, a ${personalityDesc} character. ${character.description}

Key personality traits:
${character.personalityTraits.map((trait: string) => `- ${trait}`).join('\n')}

Instructions:
- Stay in character at all times
- Keep responses concise (1-3 sentences)
- Match your personality traits in your tone and word choice
- Be engaging and conversational
- Don't mention that you're an AI or model`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 6 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
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
        max_tokens: 150,
        temperature: 0.7,
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
          max_tokens: 150,
          temperature: 0.7,
        })
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('✅ Generated AI response:', generatedResponse);

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    // Try to get character from the already parsed request
    let character = null;
    try {
      const body = await req.clone().json();
      character = body.character;
    } catch (e) {
      console.error('Failed to parse request for fallback:', e);
    }
    
    const fallbackResponse = getFallbackResponse(character);
    
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

function getFallbackResponse(character: any): string {
  if (!character) {
    return "I'm having trouble processing that right now. Could you try again? 😸";
  }

  const personality = character.personalityTraits?.[0]?.toLowerCase() || "friendly";
  
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