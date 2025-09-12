import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for different cat personalities (backwards compatibility)
const PERSONALITY_VOICES = {
  'friendly': 'Charlotte', // Warm and friendly
  'playful': 'Sarah', // Energetic and fun
  'mysterious': 'Laura', // Smooth and enigmatic
  'wise': 'Alice', // Calm and thoughtful
  'serious': 'Jessica', // Professional and clear
  'default': 'Charlotte'
};

// All available voice IDs (female and male)
const ELEVENLABS_VOICE_IDS = {
  // Female voices
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'Laura': 'FGY2WhTYpPnrIDTdsKH5',
  // Male voices  
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
  'Brian': 'nPczCjzI2devNBz1zQrb',
  'Chris': 'iP95p4xoKVk53GoZ742B',
  // Legacy female voices
  'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'Jessica': 'cgSgspJ2msm6clMCkdW9'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, personality = 'friendly', voiceId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Select voice - prefer explicit voiceId over personality mapping
    let selectedVoiceId = voiceId;
    let voiceName = 'Custom';
    
    if (!selectedVoiceId) {
      // Fallback to personality-based voice selection
      voiceName = PERSONALITY_VOICES[personality as keyof typeof PERSONALITY_VOICES] || PERSONALITY_VOICES.default;
      selectedVoiceId = ELEVENLABS_VOICE_IDS[voiceName as keyof typeof ELEVENLABS_VOICE_IDS];
    } else {
      // Find voice name from ID for logging
      const voiceEntry = Object.entries(ELEVENLABS_VOICE_IDS).find(([_, id]) => id === selectedVoiceId);
      voiceName = voiceEntry ? voiceEntry[0] : 'Unknown';
    }

    console.log(`🎵 Generating speech for personality: ${personality}, voice: ${voiceName}, text length: ${text.length}`);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert audio buffer to base64 reliably using Deno std encoder
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Audio = base64Encode(uint8Array);

    console.log(`✅ Successfully generated ${arrayBuffer.byteLength} bytes of audio`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voiceUsed: voiceName,
        personality: personality
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('❌ Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});