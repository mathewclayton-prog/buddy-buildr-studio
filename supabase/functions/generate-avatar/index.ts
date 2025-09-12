import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { name, description, personality, userId } = await req.json();

    if (!name || !description || !personality || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, description, personality, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct intelligent prompt from catbot details
    const personalityDescriptor = getPersonalityDescriptor(personality);
    const prompt = `A portrait of ${name}, a ${personalityDescriptor} cat character. ${description}. Digital art style, friendly expression, clear background, high quality, detailed fur texture, expressive eyes. Professional character illustration.`;

    console.log('Generating avatar with prompt:', prompt);

    // Generate image using OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png',
        n: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageData = data.data[0];

    // Convert base64 to blob for upload
    const base64Data = imageData.b64_json || imageData.revised_prompt;
    if (!imageData.b64_json) {
      throw new Error('No image data received from OpenAI');
    }

    // Convert base64 to file
    const imageBuffer = Uint8Array.from(atob(imageData.b64_json), c => c.charCodeAt(0));
    const fileName = `avatar_${userId}_${Date.now()}.png`;
    const filePath = `catbots/${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log('Avatar generated successfully:', urlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: urlData.publicUrl,
        prompt: prompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-avatar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getPersonalityDescriptor(personality: string): string {
  const descriptors: Record<string, string> = {
    'Playful': 'energetic and playful',
    'Affectionate': 'loving and affectionate',
    'Independent': 'independent and confident',
    'Curious': 'curious and inquisitive',
    'Calm': 'calm and serene',
    'Mischievous': 'mischievous and clever',
    'Lazy': 'relaxed and laid-back',
    'Protective': 'protective and alert',
    'Social': 'social and friendly',
    'Shy': 'gentle and shy'
  };
  
  return descriptors[personality] || 'charming';
}