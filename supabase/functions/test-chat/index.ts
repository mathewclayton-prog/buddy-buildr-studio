import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { catbotId, question, promptVersion = 'enhanced', configOverride, openaiParams = {} } = await req.json();

    if (!catbotId || !question) {
      throw new Error('catbotId and question are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch catbot data
    const { data: catbot, error: catbotError } = await supabase
      .from('catbots')
      .select('*')
      .eq('id', catbotId)
      .single();

    if (catbotError || !catbot) {
      throw new Error('Catbot not found');
    }

    // Fetch training data
    const { data: trainingData } = await supabase
      .from('catbot_training_data')
      .select('training_description')
      .eq('catbot_id', catbotId)
      .single();

    // Apply config override if provided
    const effectiveConfig = {
      name: configOverride?.name ?? catbot.name,
      public_profile: configOverride?.public_profile ?? catbot.public_profile,
      training_description: configOverride?.training_description ?? trainingData?.training_description,
      greeting: configOverride?.greeting ?? catbot.greeting,
      advanced_definition: configOverride?.advanced_definition ?? catbot.advanced_definition,
      suggested_starters: configOverride?.suggested_starters ?? catbot.suggested_starters,
      tags: configOverride?.tags ?? catbot.tags
    };

    // Build system prompt based on version
    let systemPrompt = '';
    
    if (promptVersion === 'enhanced') {
      systemPrompt = buildEnhancedPrompt(effectiveConfig);
    } else {
      systemPrompt = buildLegacyPrompt(effectiveConfig);
    }

    // Apply OpenAI parameter overrides with defaults
    const effectiveParams = {
      model: openaiParams.model ?? 'gpt-4o-mini',
      max_tokens: openaiParams.max_tokens ?? 100,
      temperature: openaiParams.temperature ?? 0.8,
      presence_penalty: openaiParams.presence_penalty ?? 0.1,
      frequency_penalty: openaiParams.frequency_penalty ?? 0.1,
    };

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: effectiveParams.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: effectiveParams.max_tokens,
        temperature: effectiveParams.temperature,
        presence_penalty: effectiveParams.presence_penalty,
        frequency_penalty: effectiveParams.frequency_penalty,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;

    const responseTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      response: aiResponse,
      responseTimeMs: responseTime,
      tokensUsed: tokensUsed,
      promptTokens: promptTokens,
      completionTokens: completionTokens,
      promptVersion: promptVersion,
      openaiParams: effectiveParams
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test chat error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      responseTimeMs: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEnhancedPrompt(config: any): string {
  let prompt = `You are ${config.name}.`;

  if (config.public_profile) {
    prompt += `\n\nAbout you: ${config.public_profile}`;
  }

  if (config.training_description) {
    prompt += `\n\nPersonality and background: ${config.training_description}`;
  }

  if (config.advanced_definition) {
    prompt += `\n\nAdditional context: ${config.advanced_definition}`;
  }

  if (config.tags && config.tags.length > 0) {
    prompt += `\n\nYou embody these traits: ${config.tags.join(', ')}`;
  }

  prompt += '\n\nRespond naturally in character. Keep your responses engaging and true to your personality.';
  prompt += '\n\nCRITICAL: Responses must be complete and self-contained within 2-4 sentences (about 50 words).';
  prompt += '\nNever begin numbered lists or multi-part explanations that extend beyond this limit.';
  prompt += '\nIf the user asks a complex question, give a concise summary and offer to dive deeper into specific parts.';
  prompt += '\nEnd every response with a complete thought. Do not leave sentences unfinished.';

  return prompt;
}

function buildLegacyPrompt(config: any): string {
  let prompt = `You are a character named ${config.name}.`;

  if (config.public_profile) {
    prompt += ` ${config.public_profile}`;
  }

  if (config.training_description) {
    prompt += ` ${config.training_description}`;
  }

  prompt += ' Respond as this character would.';
  prompt += ' CRITICAL: Give complete, self-contained responses in 2-4 sentences. Never start a long answer that continues beyond this limit.';
  prompt += ' If a topic requires more detail, briefly acknowledge that and offer to elaborate on specific aspects.';
  prompt += ' End every response with a complete thought. Do not leave sentences unfinished.';

  return prompt;
}
