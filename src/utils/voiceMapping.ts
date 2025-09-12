// Voice mapping utilities for character voices

export const AVAILABLE_VOICES = {
  female: {
    'XB0fDUnXU5powFXDhCwa': {
      name: 'Charlotte',
      description: 'Warm and friendly female voice',
      gender: 'female' as const
    },
    'EXAVITQu4vr4xnSDxMaL': {
      name: 'Sarah', 
      description: 'Energetic and playful female voice',
      gender: 'female' as const
    },
    'FGY2WhTYpPnrIDTdsKH5': {
      name: 'Laura',
      description: 'Smooth and mysterious female voice', 
      gender: 'female' as const
    }
  },
  male: {
    'onwK4e9ZLuTAKqWW03F9': {
      name: 'Daniel',
      description: 'Warm and natural male voice',
      gender: 'male' as const
    },
    'nPczCjzI2devNBz1zQrb': {
      name: 'Brian',
      description: 'Deep and confident male voice',
      gender: 'male' as const
    },
    'iP95p4xoKVk53GoZ742B': {
      name: 'Chris',
      description: 'Friendly and approachable male voice',
      gender: 'male' as const
    }
  }
} as const;

export const ELEVENLABS_VOICE_IDS = {
  // Female voices
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'Laura': 'FGY2WhTYpPnrIDTdsKH5',
  // Male voices
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
  'Brian': 'nPczCjzI2devNBz1zQrb',
  'Chris': 'iP95p4xoKVk53GoZ742B'
} as const;

export const VOICE_DESCRIPTIONS = {
  'Charlotte': 'Warm and friendly female voice',
  'Sarah': 'Energetic and playful female voice',
  'Laura': 'Smooth and mysterious female voice',
  'Daniel': 'Warm and natural male voice',
  'Brian': 'Deep and confident male voice',
  'Chris': 'Friendly and approachable male voice'
} as const;

export type VoiceId = keyof typeof AVAILABLE_VOICES.female | keyof typeof AVAILABLE_VOICES.male;
export type VoiceName = keyof typeof ELEVENLABS_VOICE_IDS;
export type Gender = 'female' | 'male';

export function getVoiceById(voiceId: VoiceId): {name: string, description: string, gender: Gender} | null {
  // Check female voices
  if (voiceId in AVAILABLE_VOICES.female) {
    return AVAILABLE_VOICES.female[voiceId as keyof typeof AVAILABLE_VOICES.female];
  }
  // Check male voices
  if (voiceId in AVAILABLE_VOICES.male) {
    return AVAILABLE_VOICES.male[voiceId as keyof typeof AVAILABLE_VOICES.male];
  }
  return null;
}

export function getVoiceId(voiceName: VoiceName): string {
  return ELEVENLABS_VOICE_IDS[voiceName];
}

export function getVoiceDescription(voiceName: VoiceName): string {
  return VOICE_DESCRIPTIONS[voiceName];
}

export function getAllVoicesByGender(): {female: Array<{id: VoiceId, name: string, description: string}>, male: Array<{id: VoiceId, name: string, description: string}>} {
  return {
    female: Object.entries(AVAILABLE_VOICES.female).map(([id, voice]) => ({
      id: id as VoiceId,
      name: voice.name,
      description: voice.description
    })),
    male: Object.entries(AVAILABLE_VOICES.male).map(([id, voice]) => ({
      id: id as VoiceId, 
      name: voice.name,
      description: voice.description
    }))
  };
}