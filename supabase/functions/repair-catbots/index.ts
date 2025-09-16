import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find catbots that need repair (placeholder names or missing avatars)
    const { data: catbotsToRepair, error: queryError } = await supabase
      .from('catbots')
      .select('*')
      .eq('user_id', userId)
      .or('name.like.%Complex Cat%,name.like.%Simple Cat%,avatar_url.is.null')
      .limit(10); // Process 10 at a time to avoid rate limits

    if (queryError) {
      throw new Error(`Failed to query catbots: ${queryError.message}`);
    }

    if (!catbotsToRepair || catbotsToRepair.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No catbots need repair',
          repaired: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${catbotsToRepair.length} catbots to repair for user:`, userId);

    let repairedCount = 0;

    for (const catbot of catbotsToRepair) {
      try {
        let needsUpdate = false;
        const updates: any = {};

        // Fix placeholder names by regenerating the character
        if (catbot.name.includes('Complex Cat') || catbot.name.includes('Simple Cat')) {
          console.log(`Regenerating character data for catbot ID: ${catbot.id}`);
          
          try {
            const newCharacter = await regenerateCharacterData(catbot.tags[0] || 'domestic', openAIApiKey);
            updates.name = newCharacter.name;
            updates.description = newCharacter.description;
            updates.training_description = newCharacter.training_description;
            updates.tags = newCharacter.tags;
            needsUpdate = true;
          } catch (error) {
            console.error(`Failed to regenerate character for ${catbot.id}:`, error);
          }
        }

        // Generate missing avatar
        if (!catbot.avatar_url) {
          console.log(`Generating avatar for catbot: ${updates.name || catbot.name}`);
          
          try {
            const avatarUrl = await generateAvatarWithTimeout(
              updates.name || catbot.name,
              updates.description || catbot.description,
              catbot.personality,
              supabase
            );
            
            if (avatarUrl) {
              updates.avatar_url = avatarUrl;
              needsUpdate = true;
            }
          } catch (error) {
            console.error(`Failed to generate avatar for ${catbot.id}:`, error);
          }
        }

        // Apply updates if needed
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('catbots')
            .update(updates)
            .eq('id', catbot.id);

          if (updateError) {
            console.error(`Failed to update catbot ${catbot.id}:`, updateError);
          } else {
            repairedCount++;
            console.log(`Repaired catbot: ${updates.name || catbot.name}`);
          }
        }

        // Delay between operations
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error repairing catbot ${catbot.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Repaired ${repairedCount} catbots`,
        repaired: repairedCount,
        total: catbotsToRepair.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in repair-catbots function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function regenerateCharacterData(category: string, apiKey: string) {
  const prompts = {
    domestic: "Create a relatable house cat character with charming personality and everyday habits.",
    modern: "Create a modern cat character with contemporary interests and relatable traits.",
    historical: "Create a historical cat character with rich backstory and period details.",
    fantasy: "Create a fantasy cat character with magical elements and mystical background.",
    professional: "Create a professional specialist cat with detailed career background.",
    unique: "Create a unique conceptual cat character with special abilities."
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Create a cat character profile. Respond with valid JSON only:
{
  "name": "unique cat name",
  "description": "150-250 character description",
  "training_description": "500-1000 word backstory",
  "tags": ["keyword1", "keyword2"]
}`
          },
          {
            role: 'user',
            content: prompts[category as keyof typeof prompts] || prompts.domestic
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch (e) {
      // Fallback
      return {
        name: `Repaired ${category} Cat ${Date.now()}`,
        description: "A charming feline character with a unique personality.",
        training_description: "This cat has been given a fresh start with new character details.",
        tags: [category, 'repaired']
      };
    }

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function generateAvatarWithTimeout(name: string, description: string, personality: string, supabase: any): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    return await generateAvatar(name, description, personality, supabase, controller.signal);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Avatar generation timeout for:', name);
      return null;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateAvatar(name: string, description: string, personality: string, supabase: any, signal?: AbortSignal): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const cleanDescription = description.replace(/[^\w\s]/gi, '').substring(0, 100);
  
  const personalityDescriptors = {
    friendly: "warm and approachable",
    mysterious: "enigmatic and captivating", 
    wise: "intelligent and serene",
    playful: "energetic and cheerful",
    serious: "dignified and composed"
  };
  
  const prompt = `A beautiful cat portrait representing ${name}. ${personalityDescriptors[personality as keyof typeof personalityDescriptors] || "charming"}. ${cleanDescription}. Professional digital art style, detailed fur, expressive eyes, centered composition.`;
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '512x512',
      quality: 'standard'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Image API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.data || !data.data[0]) {
    throw new Error('No image generated');
  }

  const imageUrl = data.data[0].url;
  
  // Download and upload to Supabase Storage
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  
  const fileName = `catbot-repaired-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  const filePath = `catbots/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, imageBlob, {
      contentType: 'image/png',
    });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}