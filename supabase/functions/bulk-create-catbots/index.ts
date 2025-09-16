import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CatbotData {
  name: string;
  personality: string;
  public_profile: string;
  description: string;
  training_description: string;
  voice_id: string;
  is_public: boolean;
  tags: string[];
  avatar_url?: string;
}

const availableVoices = [
  '9BWtsMINqrJLrRacOk9x', // Aria
  'CwhRBWXzGAHq8TQ4Fs17', // Roger
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'FGY2WhTYpPnrIDTdsKH5', // Laura
  'IKne3meq5aSn9XLyUdCD', // Charlie
  'JBFqnCBsd6RMkjVDRZzb', // George
  'N2lVS1w4EtoT3dr4eOWO', // Callum
  'SAz9YHcvj6GT2YYXdXww', // River
  'TX3LPaxmHKxFdv7VOQHJ', // Liam
  'XB0fDUnXU5powFXDhCwa', // Charlotte
];

const personalities = ['friendly', 'mysterious', 'wise', 'playful', 'serious'];

function getRandomVoice(): string {
  return availableVoices[Math.floor(Math.random() * availableVoices.length)];
}

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

    // Create a job record
    const { data: job, error: jobError } = await supabase
      .from('catbot_generation_jobs')
      .insert({
        user_id: userId,
        status: 'running',
        total_count: 25,
        completed_count: 0
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    // Start background task
    EdgeRuntime.waitUntil(generateCatbotsInBackground(job.id, userId, supabase, openAIApiKey));

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Catbot generation started'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-create-catbots function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateCatbotsInBackground(jobId: string, userId: string, supabase: any, openAIApiKey: string) {
  try {
    console.log('Starting bulk catbot creation for user:', userId);

    // Reduced batch size to avoid rate limits
    const complexCategories = [
      { category: 'historical', count: 3, personality: 'wise' },
      { category: 'fantasy', count: 3, personality: 'mysterious' },
      { category: 'professional', count: 3, personality: 'serious' },
      { category: 'unique', count: 3, personality: 'playful' }
    ];

    // Simple character categories
    const simpleCategories = [
      { category: 'domestic', count: 6, personality: 'friendly' },
      { category: 'modern', count: 7, personality: 'playful' }
    ];

    let completedCount = 0;
    let rateLimitHit = false;

    // Generate complex catbots first (12 total)
    for (const catGroup of complexCategories) {
      for (let i = 0; i < catGroup.count; i++) {
        if (rateLimitHit) {
          console.log('Rate limit detected, stopping generation');
          break;
        }
        
        try {
          const catbot = await generateComplexCatbot(catGroup.category, catGroup.personality, openAIApiKey);
          
          // Insert catbot first (without avatar)
          const { error: insertError } = await supabase
            .from('catbots')
            .insert({
              user_id: userId,
              name: catbot.name,
              public_profile: catbot.public_profile,
              description: catbot.description,
              training_description: catbot.training_description,
              personality: catbot.personality,
              tags: catbot.tags,
              voice_id: catbot.voice_id,
              is_public: catbot.is_public
            });

          if (insertError) {
            console.error('Error inserting catbot:', insertError);
            continue;
          }

          completedCount++;
          console.log(`Generated complex catbot ${completedCount}/25: ${catbot.name}`);
          
          // Update job progress immediately
          await supabase
            .from('catbot_generation_jobs')
            .update({ completed_count: completedCount })
            .eq('id', jobId);
          
          // Try to generate avatar with timeout (non-blocking)
          try {
            const avatarUrl = await generateAvatarWithTimeout(catbot.name, catbot.description, catbot.personality, supabase);
            if (avatarUrl) {
              await supabase
                .from('catbots')
                .update({ avatar_url: avatarUrl })
                .eq('name', catbot.name)
                .eq('user_id', userId);
            }
          } catch (avatarError) {
            console.error('Avatar generation failed (non-blocking):', avatarError);
            if (avatarError.message?.includes('rate_limit')) {
              rateLimitHit = true;
            }
          }
          
          // Longer delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating complex catbot ${completedCount + 1}:`, error);
          if (error.message?.includes('rate_limit') || error.message?.includes('quota')) {
            rateLimitHit = true;
            break;
          }
        }
      }
      if (rateLimitHit) break;
    }

    // Generate simple catbots (13 total)
    for (const catGroup of simpleCategories) {
      for (let i = 0; i < catGroup.count; i++) {
        if (rateLimitHit) {
          console.log('Rate limit detected, stopping generation');
          break;
        }
        
        try {
          const catbot = await generateSimpleCatbot(catGroup.category, catGroup.personality, openAIApiKey);
          
          // Insert catbot first (without avatar)
          const { error: insertError } = await supabase
            .from('catbots')
            .insert({
              user_id: userId,
              name: catbot.name,
              public_profile: catbot.public_profile,
              description: catbot.description,
              training_description: catbot.training_description,
              personality: catbot.personality,
              tags: catbot.tags,
              voice_id: catbot.voice_id,
              is_public: catbot.is_public
            });

          if (insertError) {
            console.error('Error inserting catbot:', insertError);
            continue;
          }

          completedCount++;
          console.log(`Generated simple catbot ${completedCount}/25: ${catbot.name}`);
          
          // Update job progress immediately
          await supabase
            .from('catbot_generation_jobs')
            .update({ completed_count: completedCount })
            .eq('id', jobId);
          
          // Try to generate avatar with timeout (non-blocking)
          try {
            const avatarUrl = await generateAvatarWithTimeout(catbot.name, catbot.description, catbot.personality, supabase);
            if (avatarUrl) {
              await supabase
                .from('catbots')
                .update({ avatar_url: avatarUrl })
                .eq('name', catbot.name)
                .eq('user_id', userId);
            }
          } catch (avatarError) {
            console.error('Avatar generation failed (non-blocking):', avatarError);
            if (avatarError.message?.includes('rate_limit')) {
              rateLimitHit = true;
            }
          }
          
          // Longer delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error generating simple catbot ${completedCount + 1}:`, error);
          if (error.message?.includes('rate_limit') || error.message?.includes('quota')) {
            rateLimitHit = true;
            break;
          }
        }
      }
      if (rateLimitHit) break;
    }

    // Mark job as completed or rate limited
    const finalStatus = rateLimitHit ? 'rate_limited' : 'completed';
    await supabase
      .from('catbot_generation_jobs')
      .update({ 
        status: finalStatus,
        completed_count: completedCount,
        error: rateLimitHit ? 'OpenAI rate limit reached. Avatars can be generated later.' : null
      })
      .eq('id', jobId);

    console.log(`Successfully created ${completedCount} catbots. Status: ${finalStatus}`);

  } catch (error) {
    console.error('Error in background generation:', error);
    
    // Mark job as failed
    await supabase
      .from('catbot_generation_jobs')
      .update({ 
        status: 'failed',
        error: error.message
      })
      .eq('id', jobId);
  }
}

async function generateComplexCatbot(category: string, personality: string, apiKey: string): Promise<CatbotData> {
  const categoryPrompts = {
    historical: "Create a sophisticated cat character inspired by historical periods or figures. Think Renaissance artists, medieval knights, ancient scholars, or historical explorers reimagined as cats.",
    fantasy: "Design an enchanting cat character from magical realms. Consider wizards, mythical creatures, elemental beings, or fantasy adventurers with rich backstories.",
    professional: "Develop a cat character with a distinguished career or expertise. Think professors, scientists, artists, chefs, or other professionals with depth and personality.",
    unique: "Craft a truly unique cat character with unusual traits, backgrounds, or abilities. Be creative with their story, quirks, and distinctive characteristics."
  };

  const prompt = categoryPrompts[category as keyof typeof categoryPrompts] || categoryPrompts.unique;
  
  const systemMessage = `You are a creative character designer. Create a detailed, engaging cat character profile with the personality trait: ${personality}.

${prompt}

Return a JSON object with these exact fields:
{
  "name": "Character name (2-3 words max)",
  "public_profile": "Brief, engaging description for browsing (150-200 chars max)",
  "description": "Detailed character description for display (400-600 chars)",
  "training_description": "Comprehensive AI training instructions and personality details (800-1500 chars)",
  "tags": ["3-5 relevant tags"]
}

Make the public_profile catchy and intriguing. The description should be rich and detailed. The training_description should include personality, speaking style, background, and interaction guidelines.`;

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
          { role: 'user', content: `Create a ${category} cat character with ${personality} personality.` }
        ],
        max_tokens: 1000,
        temperature: 0.8,
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
        name: parsed.name || `${personality} Cat`,
        personality: personality,
        public_profile: parsed.public_profile?.substring(0, 250) || parsed.description?.substring(0, 200) || `A ${personality} cat with unique charm`,
        description: parsed.description?.substring(0, 600) || parsed.public_profile || `A fascinating ${personality} cat character`,
        training_description: parsed.training_description?.substring(0, 10000) || `You are a ${personality} cat character. Respond in character with warmth and personality.`,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [personality, category],
        voice_id: getRandomVoice(),
        is_public: Math.random() > 0.3
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        name: `${personality} Cat`,
        personality: personality,
        public_profile: `A charming ${personality} cat from the ${category} realm`,
        description: `A delightful ${personality} cat character with a rich background and engaging personality`,
        training_description: `You are a ${personality} cat character from a ${category} background. Respond warmly and in character.`,
        tags: [personality, category],
        voice_id: getRandomVoice(),
        is_public: Math.random() > 0.3
      };
    }
  } catch (error) {
    console.error('Error generating complex catbot:', error);
    return {
      name: `${personality} Cat`,
      personality: personality,
      public_profile: `A wonderful ${personality} cat character`,
      description: `A ${personality} cat with a unique personality and engaging backstory`,
      training_description: `You are a ${personality} cat character. Be warm, friendly, and respond in character.`,
      tags: [personality, category],
      voice_id: getRandomVoice(),
      is_public: Math.random() > 0.3
    };
  }
}

async function generateSimpleCatbot(category: string, personality: string, apiKey: string): Promise<CatbotData> {
  const categoryPrompts = {
    domestic: "Create a relatable, everyday cat character. Think house cats with charming personalities, neighborhood cats with stories, or family pets with endearing quirks.",
    modern: "Design a contemporary cat character that fits modern life. Consider cats with social media presence, tech-savvy cats, urban cats, or cats with modern hobbies."
  };

  const prompt = categoryPrompts[category as keyof typeof categoryPrompts] || categoryPrompts.domestic;
  
  const systemMessage = `You are a character designer creating approachable, lovable cat characters. Create a ${personality} cat character.

${prompt}

Return a JSON object with these exact fields:
{
  "name": "Simple, friendly name (1-2 words)",
  "public_profile": "Warm, inviting description (100-150 chars max)",
  "description": "Friendly character description (300-400 chars)",
  "training_description": "Clear personality and interaction style guide (500-800 chars)",
  "tags": ["2-4 simple, relatable tags"]
}

Keep descriptions warm, accessible, and engaging. Focus on personality and relatability.`;

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
          { role: 'user', content: `Create a ${category} cat with ${personality} personality.` }
        ],
        max_tokens: 800,
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
        name: parsed.name || `${personality}`,
        personality: personality,
        public_profile: parsed.public_profile?.substring(0, 250) || `A ${personality} cat you'll love chatting with`,
        description: parsed.description?.substring(0, 600) || `A friendly ${personality} cat with lots of personality`,
        training_description: parsed.training_description?.substring(0, 10000) || `You are a ${personality} cat. Be friendly, warm, and engaging in conversations.`,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [personality, 'friendly'],
        voice_id: getRandomVoice(),
        is_public: Math.random() > 0.2
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        name: personality,
        personality: personality,
        public_profile: `A delightful ${personality} cat`,
        description: `A ${personality} cat with a warm, engaging personality`,
        training_description: `You are a ${personality} cat. Be friendly and conversational.`,
        tags: [personality, 'friendly'],
        voice_id: getRandomVoice(),
        is_public: Math.random() > 0.2
      };
    }
  } catch (error) {
    console.error('Error generating simple catbot:', error);
    return {
      name: personality,
      personality: personality,
      public_profile: `A lovely ${personality} cat`,
      description: `A ${personality} cat ready for friendly conversations`,
      training_description: `You are a ${personality} cat. Be warm and engaging.`,
      tags: [personality, 'chat'],
      voice_id: getRandomVoice(),
      is_public: Math.random() > 0.2
    };
  }
}

async function generateAvatarWithTimeout(name: string, description: string, personality: string, supabase: any): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for images

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
  
  // Clean up description for prompt
  const cleanDescription = description.replace(/[^\w\s]/gi, '').substring(0, 100);
  
  const personalityDescriptors = {
    friendly: "warm and approachable",
    mysterious: "enigmatic and captivating", 
    wise: "intelligent and serene",
    playful: "energetic and cheerful",
    serious: "dignified and composed"
  };
  
  const prompt = `A beautiful, expressive cat portrait representing ${name}. ${personalityDescriptors[personality as keyof typeof personalityDescriptors] || "charming"}. ${cleanDescription}. Professional digital art style, detailed fur texture, expressive eyes, high quality rendering, centered composition.`;
  
  console.log(`Generating avatar for ${name} with prompt:`, prompt);
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: 'dall-e-2',
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
  
  const fileName = `catbot-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
  const filePath = `catbots/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, imageBlob, {
      contentType: 'image/png',
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}