import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TagGenerationRequest {
  name: string;
  description?: string;
  personality?: string;
  public_profile?: string;
  training_description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, personality, public_profile, training_description }: TagGenerationRequest = await req.json();

    // Combine all available text for analysis
    const textToAnalyze = [
      name,
      description,
      public_profile,
      personality,
      training_description
    ].filter(Boolean).join('\n\n');

    if (!textToAnalyze.trim()) {
      return new Response(JSON.stringify({ tags: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a tag generation expert. Analyze character descriptions and generate relevant tags for discoverability.

CATEGORIES TO CONSIDER:
- Themes/Fandoms: "Harry Potter", "Star Wars", "Gaming", "Anime", "Movies", "Books", "Fantasy", "Sci-Fi"
- Personality: "Funny", "Wise", "Sarcastic", "Friendly", "Mysterious", "Cheerful", "Grumpy", "Adventurous"
- Character Types: "Villain", "Hero", "Teacher", "Mentor", "Companion", "Guide", "Storyteller"
- Traits/Interests: "Magic", "Cooking", "Science", "Music", "Art", "Sports", "Nature", "Technology"
- Roles: "Assistant", "Therapist", "Coach", "Entertainer", "Educator"

RULES:
- Generate 3-8 relevant tags maximum
- Use existing popular categories when possible
- Keep tags short (1-2 words)
- Focus on the most distinctive and searchable characteristics
- Return ONLY a JSON array of strings
- No explanations or additional text`
          },
          {
            role: 'user',
            content: `Analyze this character and generate appropriate tags:

Name: ${name}
${description ? `Description: ${description}` : ''}
${public_profile ? `Public Profile: ${public_profile}` : ''}
${personality ? `Personality: ${personality}` : ''}
${training_description ? `Training Description: ${training_description}` : ''}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated tags response:', generatedText);

    // Parse the JSON response
    let tags: string[] = [];
    try {
      tags = JSON.parse(generatedText);
      
      // Ensure it's an array and clean up the tags
      if (Array.isArray(tags)) {
        tags = tags
          .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
          .map(tag => tag.trim())
          .slice(0, 8); // Limit to 8 tags max
      } else {
        console.error('Generated response is not an array:', tags);
        tags = [];
      }
    } catch (parseError) {
      console.error('Failed to parse generated tags:', parseError);
      tags = [];
    }

    console.log('Final processed tags:', tags);

    return new Response(JSON.stringify({ tags }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-tags function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});