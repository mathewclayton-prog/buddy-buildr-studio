// Voice mapping utilities for character personalities

export const PERSONALITY_VOICES = {
  'friendly': 'Charlotte', // Warm and friendly
  'playful': 'Sarah', // Energetic and fun
  'mysterious': 'Laura', // Smooth and enigmatic
  'wise': 'Alice', // Calm and thoughtful
  'serious': 'Jessica', // Professional and clear
  'default': 'Charlotte'
} as const;

export const ELEVENLABS_VOICE_IDS = {
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'Laura': 'FGY2WhTYpPnrIDTdsKH5',
  'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'Jessica': 'cgSgspJ2msm6clMCkdW9'
} as const;

export const VOICE_DESCRIPTIONS = {
  'Charlotte': 'Warm and friendly female voice',
  'Sarah': 'Energetic and playful female voice',
  'Laura': 'Smooth and mysterious female voice',
  'Alice': 'Calm and thoughtful female voice',
  'Jessica': 'Professional and clear female voice'
} as const;

export type PersonalityType = keyof typeof PERSONALITY_VOICES;
export type VoiceName = keyof typeof ELEVENLABS_VOICE_IDS;

export function getVoiceForPersonality(personality: string): VoiceName {
  const normalizedPersonality = personality.toLowerCase() as PersonalityType;
  return PERSONALITY_VOICES[normalizedPersonality] || PERSONALITY_VOICES.default;
}

export function getVoiceId(voiceName: VoiceName): string {
  return ELEVENLABS_VOICE_IDS[voiceName];
}

export function getVoiceDescription(voiceName: VoiceName): string {
  return VOICE_DESCRIPTIONS[voiceName];
}