import { supabase } from "@/integrations/supabase/client";

// Interface for public character data (browsing/cards)
export interface PublicCharacter {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  personality: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  interaction_count: number;
  tags: string[];
}

// Interface for chat functionality (includes training data)
export interface CharacterForChat {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  training_description?: string | null;
  personality: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Interface for editing (includes all fields)
export interface CharacterForEdit {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  training_description?: string | null;
  personality: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches public characters for browsing/discovery
 * Only includes fields needed for public display
 */
export async function getPublicCharacters(): Promise<PublicCharacter[]> {
  const { data, error } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, personality, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public characters:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches user's own characters for management
 * Includes public fields for display in user's dashboard
 */
export async function getUserCharacters(userId: string): Promise<PublicCharacter[]> {
  const { data, error } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, personality, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user characters:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches character data for chat functionality
 * Includes training_description for AI interactions
 */
export async function getCharacterForChat(characterId: string): Promise<CharacterForChat | null> {
  const { data, error } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, training_description, personality, avatar_url, created_at')
    .eq('id', characterId)
    .single();

  if (error) {
    console.error('Error fetching character for chat:', error);
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Fetches character data for editing
 * Includes all fields needed for the edit form
 */
export async function getCharacterForEdit(characterId: string, userId: string): Promise<CharacterForEdit | null> {
  const { data, error } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, training_description, personality, avatar_url, is_public, created_at, updated_at')
    .eq('id', characterId)
    .eq('user_id', userId) // Ensure user owns the character
    .single();

  if (error) {
    console.error('Error fetching character for edit:', error);
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }

  return data;
}