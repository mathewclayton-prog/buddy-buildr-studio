import { Character, ChatSession } from "@/types/character";

const CHARACTERS_KEY = "characterai_characters";
const CHAT_SESSIONS_KEY = "characterai_chat_sessions";

export const storageService = {
  // Character management
  getCharacters(): Character[] {
    try {
      const stored = localStorage.getItem(CHARACTERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveCharacter(character: Character): void {
    const characters = this.getCharacters();
    const existingIndex = characters.findIndex(c => c.id === character.id);
    
    if (existingIndex >= 0) {
      characters[existingIndex] = character;
    } else {
      characters.push(character);
    }
    
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  },

  deleteCharacter(id: string): void {
    const characters = this.getCharacters().filter(c => c.id !== id);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  },

  getCharacter(id: string): Character | undefined {
    return this.getCharacters().find(c => c.id === id);
  },

  // Chat session management
  getChatSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  },

  getChatSession(characterId: string): ChatSession | undefined {
    return this.getChatSessions().find(s => s.characterId === characterId);
  },

  deleteChatSession(id: string): void {
    const sessions = this.getChatSessions().filter(s => s.id !== id);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  }
};