import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find catbots with missing public_profile
    const { data: catbots, error: fetchError } = await supabase
      .from('catbots')
      .select('id, name, description, training_description, personality, tags')
      .eq('user_id', userId)
      .or('public_profile.is.null,public_profile.eq.');

    if (fetchError) {
      console.error('Error fetching catbots:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch catbots' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!catbots || catbots.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No catbots need backfilling', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${catbots.length} catbots needing backfill`);
    let updatedCount = 0;

    // Process each catbot
    for (const catbot of catbots) {
      try {
        let publicProfile = '';
        let description = catbot.description || '';
        let trainingDescription = catbot.training_description || '';

        // If we have existing description or training, derive public_profile from it
        if (catbot.description) {
          publicProfile = catbot.description.substring(0, 200);
        } else if (catbot.training_description) {
          publicProfile = catbot.training_description.substring(0, 200);
        } else {
          // Generate new content using AI
          const generatedContent = await generateMissingContent(
            catbot.name,
            catbot.personality || 'friendly',
            catbot.tags || [],
            openAIApiKey
          );

          publicProfile = generatedContent.public_profile;
          description = generatedContent.description;
          trainingDescription = generatedContent.training_description;
        }

        // Update the catbot
        const { error: updateError } = await supabase
          .from('catbots')
          .update({
            public_profile: publicProfile,
            description: description || catbot.description,
            training_description: trainingDescription || catbot.training_description
          })
          .eq('id', catbot.id);

        if (updateError) {
          console.error(`Error updating catbot ${catbot.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated catbot: ${catbot.name}`);
        }

        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing catbot ${catbot.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully backfilled ${updatedCount} catbots`,
        updated: updatedCount,
        total: catbots.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in backfill-catbot-profiles function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateMissingContent(
  name: string,
  personality: string,
  tags: string[],
  apiKey: string
): Promise<{ public_profile: string; description: string; training_description: string }> {
  const systemMessage = `You are helping to backfill missing content for a cat character. Based on the provided information, generate appropriate content.

Return a JSON object with these exact fields:
{
  "public_profile": "Brief, engaging description for browsing (150-200 chars max)",
  "description": "Detailed character description for display (400-600 chars)",
  "training_description": "Comprehensive AI training instructions and personality details (800-1500 chars)"
}

Make the content engaging and consistent with the character's name and personality.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `Generate content for cat named "${name}" with personality "${personality}" and tags: ${tags.join(', ')}` }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        public_profile: parsed.public_profile?.substring(0, 250) || `A ${personality} cat named ${name}`,
        description: parsed.description?.substring(0, 600) || `${name} is a ${personality} cat with a wonderful personality`,
        training_description: parsed.training_description?.substring(0, 10000) || `You are ${name}, a ${personality} cat. Be warm and engaging in conversations.`
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        public_profile: `A ${personality} cat named ${name}`,
        description: `${name} is a delightful ${personality} cat ready for engaging conversations`,
        training_description: `You are ${name}, a ${personality} cat character. Respond warmly and in character with your personality.`
      };
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return {
      public_profile: `A ${personality} cat named ${name}`,
      description: `${name} is a charming ${personality} cat with lots of personality`,
      training_description: `You are ${name}, a ${personality} cat. Be friendly and engaging.`
    };
  }
}