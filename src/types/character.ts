export interface Character {
  id: string;
  name: string;
  description: string;
  personalityTraits: string[];
  avatar?: string;
  avatarColor?: string;
  createdAt: Date;
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