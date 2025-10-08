// Content moderation utilities for client-side validation

const PROHIBITED_KEYWORDS = [
  // Sexual/explicit content
  'porn', 'xxx', 'sex', 'nude', 'nsfw', 'explicit', 'erotic', 'adult', 'hentai',
  'sexy', 'seductive', 'aroused', 'orgasm', 'masturbat', 'genitalia', 'penis', 'vagina',
  
  // Violence
  'kill', 'murder', 'torture', 'abuse', 'violent', 'gore', 'blood', 'death', 'weapon',
  'gun', 'knife', 'bomb', 'suicide', 'harm',
  
  // Hate speech
  'racist', 'nazi', 'hate', 'slur', 'bigot',
  
  // Illegal activities
  'drug', 'illegal', 'trafficking', 'terrorism', 'exploit'
];

export interface ValidationResult {
  isValid: boolean;
  flaggedWords: string[];
  message?: string;
}

/**
 * Validates text content for prohibited keywords
 * Returns validation result with flagged words if any
 */
export function validateContent(text: string): ValidationResult {
  const lowerText = text.toLowerCase();
  const flaggedWords: string[] = [];

  for (const keyword of PROHIBITED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      flaggedWords.push(keyword);
    }
  }

  if (flaggedWords.length > 0) {
    return {
      isValid: false,
      flaggedWords,
      message: 'Your content contains inappropriate language. Please revise and ensure it follows our community guidelines.'
    };
  }

  return {
    isValid: true,
    flaggedWords: []
  };
}

/**
 * Validates character creation data
 * Checks name, description, and training data
 */
export function validateCharacterContent(data: {
  name?: string;
  publicProfile?: string;
  trainingDescription?: string;
  greeting?: string;
  longDescription?: string;
  advancedDefinition?: string;
}): ValidationResult {
  const textsToValidate = [
    data.name,
    data.publicProfile,
    data.trainingDescription,
    data.greeting,
    data.longDescription,
    data.advancedDefinition
  ].filter(Boolean);

  const allText = textsToValidate.join(' ');
  return validateContent(allText);
}
