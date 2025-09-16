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
  description: string;
  training_description: string;
  voice_id: string;
  is_public: boolean;
  tags: string[];
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

    console.log('Starting bulk catbot creation for user:', userId);

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('catbot_generation_jobs')
      .insert({
        user_id: userId,
        status: 'running',
        total_count: 63,
        completed_count: 0
      })
      .select('id')
      .single();

    if (jobError) {
      throw jobError;
    }

    const jobId = job.id;

    // Start background generation
    EdgeRuntime.waitUntil(generateCatbotsInBackground(userId, jobId, openAIApiKey, supabase));

    // Return job ID immediately
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId,
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

async function generateCatbotsInBackground(
  userId: string, 
  jobId: string, 
  openAIApiKey: string, 
  supabase: any
) {
  try {
    // Complex character categories
    const complexCategories = [
      { category: 'historical', count: 8, personality: 'wise' },
      { category: 'fantasy', count: 8, personality: 'mysterious' },
      { category: 'professional', count: 8, personality: 'serious' },
      { category: 'unique', count: 8, personality: 'playful' }
    ];

    // Simple character categories
    const simpleCategories = [
      { category: 'domestic', count: 15, personality: 'friendly' },
      { category: 'modern', count: 16, personality: 'playful' }
    ];

    let completedCount = 0;

    // Generate and insert complex catbots
    for (const catGroup of complexCategories) {
      for (let i = 0; i < catGroup.count; i++) {
        try {
          const catbot = await generateComplexCatbot(catGroup.category, catGroup.personality, openAIApiKey);
          
          // Insert individual catbot
          const { error: insertError } = await supabase
            .from('catbots')
            .insert({
              ...catbot,
              user_id: userId
            });

          if (!insertError) {
            completedCount++;
            console.log(`Generated complex catbot ${completedCount}/63: ${catbot.name}`);
            
            // Update job progress
            await supabase
              .from('catbot_generation_jobs')
              .update({ completed_count: completedCount })
              .eq('id', jobId);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error generating complex catbot:`, error);
        }
      }
    }

    // Generate and insert simple catbots
    for (const catGroup of simpleCategories) {
      for (let i = 0; i < catGroup.count; i++) {
        try {
          const catbot = await generateSimpleCatbot(catGroup.category, catGroup.personality, openAIApiKey);
          
          // Insert individual catbot
          const { error: insertError } = await supabase
            .from('catbots')
            .insert({
              ...catbot,
              user_id: userId
            });

          if (!insertError) {
            completedCount++;
            console.log(`Generated simple catbot ${completedCount}/63: ${catbot.name}`);
            
            // Update job progress
            await supabase
              .from('catbot_generation_jobs')
              .update({ completed_count: completedCount })
              .eq('id', jobId);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error generating simple catbot:`, error);
        }
      }
    }

    // Mark job as completed
    await supabase
      .from('catbot_generation_jobs')
      .update({ 
        status: 'completed',
        completed_count: completedCount
      })
      .eq('id', jobId);

    console.log(`Background generation completed: ${completedCount}/63 catbots created`);

  } catch (error) {
    console.error('Background generation failed:', error);
    
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
  const prompts = {
    historical: `Create a historical cat character with deep backstory. Choose from: Renaissance artist cat, Ancient Egyptian temple guardian, Medieval court advisor, Viking explorer cat, Wild West sheriff cat, Victorian detective cat, Ancient Greek philosopher cat, or Roman general cat. Include transformation story, detailed historical context, and rich personality development. 1500-2000 words.`,
    
    fantasy: `Create a fantasy cat character with magical abilities. Choose from: Elemental wizard cat, Time-traveling familiar, Interdimensional guardian, Ancient dragon in cat form, Celestial messenger cat, Shadow realm walker, Crystal cave keeper, or Starlight weaver cat. Include magical backstory, powers, responsibilities, and detailed world-building. 1500-2000 words.`,
    
    professional: `Create a professional specialist cat with detailed career background. Choose from: Quantum physicist cat, Master chef with culinary empire, Detective with complex case history, Surgeon with medical adventures, Architect of impossible buildings, Marine biologist explorer, or Astronaut cat. Include education, achievements, memorable cases/projects, and expertise. 1500-2000 words.`,
    
    unique: `Create a unique conceptual cat character. Choose from: Sentient AI in cat form, Dream walker who enters human dreams, Emotion collector cat, Memory keeper of lost civilizations, Guardian of the internet, Translator between species, or Living constellation cat. Include origin story, special abilities, philosophical outlook, and unique perspective. 1500-2000 words.`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a creative writer creating detailed cat character profiles. Generate a JSON response with: name (unique, creative), description (200-300 char public profile), training_description (1500-2000 word detailed backstory), and tags (3-5 relevant keywords). Make each character unique and memorable with rich personality, specific details, mannerisms, and engaging backstory.`
        },
        {
          role: 'user',
          content: prompts[category as keyof typeof prompts]
        }
      ],
      max_tokens: 3000,
      temperature: 0.8
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Fallback if JSON parsing fails
    parsed = {
      name: `Complex Cat ${Date.now()}`,
      description: "A mysterious and complex feline character with a rich backstory.",
      training_description: "This is a placeholder for a complex character description that would normally be much longer.",
      tags: [category, personality, 'complex']
    };
  }

  return {
    name: parsed.name,
    personality,
    description: parsed.description,
    training_description: parsed.training_description,
    voice_id: availableVoices[Math.floor(Math.random() * availableVoices.length)],
    is_public: Math.random() > 0.25, // 75% public
    tags: parsed.tags || [category, personality]
  };
}

async function generateSimpleCatbot(category: string, personality: string, apiKey: string): Promise<CatbotData> {
  const prompts = {
    domestic: `Create a relatable house cat character. Include favorite spots, daily routines, quirky habits, relationships with family, and personality traits. 500-800 words. Make them charming and accessible.`,
    
    modern: `Create a modern cat character with contemporary interests. Could be a gamer cat, social media influencer cat, tech-savvy cat, artist cat, or fitness enthusiast cat. Include modern references and relatable personality. 500-800 words.`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are creating simple, relatable cat character profiles. Generate a JSON response with: name (cute, simple), description (150-200 char public profile), training_description (500-800 word backstory), and tags (2-4 relevant keywords). Make characters warm and approachable.`
        },
        {
          role: 'user',
          content: prompts[category as keyof typeof prompts]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Fallback if JSON parsing fails
    parsed = {
      name: `Simple Cat ${Date.now()}`,
      description: "A friendly and approachable house cat.",
      training_description: "This is a simple, relatable cat character with everyday charm.",
      tags: [category, personality]
    };
  }

  return {
    name: parsed.name,
    personality,
    description: parsed.description,
    training_description: parsed.training_description,
    voice_id: availableVoices[Math.floor(Math.random() * availableVoices.length)],
    is_public: Math.random() > 0.25, // 75% public
    tags: parsed.tags || [category, personality]
  };
}