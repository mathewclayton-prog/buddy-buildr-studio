export interface Character {
  id: string;
  name: string;
  publicProfile: string; // max 250 chars, what users see when browsing
  trainingDescription: string; // max 2000 chars, private AI training instructions
  personalityTraits: string[];
  avatar?: string;
  avatarColor?: string;
  createdAt: Date;
}

// Helper interface for creating new characters
export interface CreateCharacterRequest {
  name: string;
  publicProfile: string;
  trainingDescription: string;
  personalityTraits: string[];
  avatar?: string;
  avatarColor?: string;
}

// Helper interface for public display (browsing/preview)
export interface CharacterPreview {
  id: string;
  name: string;
  publicProfile: string;
  personalityTraits: string[];
  avatar?: string;
  avatarColor?: string;
  createdAt: Date;
}

// Helper interface for chat functionality (includes training data)
export interface CharacterForChat {
  id: string;
  name: string;
  trainingDescription: string;
  personalityTraits: string[];
  avatar?: string;
  avatarColor?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: ChatMessage[];
  createdAt: Date;
}