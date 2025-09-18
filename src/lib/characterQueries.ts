import { supabase } from "@/integrations/supabase/client";

// Interface for public character data (browsing/cards)
export interface PublicCharacter {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  interaction_count: number;
  tags: string[];
}

// Interface for private training data (owner only)
export interface CharacterTrainingData {
  training_description?: string | null;
  personality?: string | null;
}

// Interface for chat functionality (combines public + training data)
export interface CharacterForChat {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  training_description?: string | null;
  personality?: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Interface for editing (combines public + training data)
export interface CharacterForEdit {
  id: string;
  name: string;
  description?: string | null; // legacy field for backward compatibility
  public_profile?: string | null;
  training_description?: string | null;
  personality?: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches public characters for browsing/discovery
 * Only includes fields needed for public display (no sensitive training data)
 */
export async function getPublicCharacters(): Promise<PublicCharacter[]> {
  const { data, error } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
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
    .select('id, name, description, public_profile, avatar_url, created_at, updated_at, is_public, like_count, interaction_count, tags')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user characters:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches private training data for a character (owner only)
 */
export async function getCharacterTrainingData(characterId: string): Promise<CharacterTrainingData | null> {
  const { data, error } = await supabase
    .from('catbot_training_data')
    .select('training_description, personality')
    .eq('catbot_id', characterId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching character training data:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches character data for chat functionality
 * Combines public data with training data (for character owner) or just public data
 */
export async function getCharacterForChat(characterId: string): Promise<CharacterForChat | null> {
  // First get the public character data
  const { data: publicData, error: publicError } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, avatar_url, created_at, user_id')
    .eq('id', characterId)
    .single();

  if (publicError) {
    console.error('Error fetching character for chat:', publicError);
    if (publicError.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw publicError;
  }

  // Try to get training data (will only work if user owns the character)
  const trainingData = await getCharacterTrainingData(characterId);

  return {
    ...publicData,
    training_description: trainingData?.training_description || null,
    personality: trainingData?.personality || null,
  };
}

/**
 * Fetches character data for editing
 * Includes all fields needed for the edit form (owner only)
 */
export async function getCharacterForEdit(characterId: string, userId: string): Promise<CharacterForEdit | null> {
  // First get the public character data (with ownership check)
  const { data: publicData, error: publicError } = await supabase
    .from('catbots')
    .select('id, name, description, public_profile, avatar_url, is_public, created_at, updated_at')
    .eq('id', characterId)
    .eq('user_id', userId) // Ensure user owns the character
    .single();

  if (publicError) {
    console.error('Error fetching character for edit:', publicError);
    if (publicError.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw publicError;
  }

  // Get training data (will work since user owns the character)
  const trainingData = await getCharacterTrainingData(characterId);

  return {
    ...publicData,
    training_description: trainingData?.training_description || null,
    personality: trainingData?.personality || null,
  };
}

/**
 * Creates or updates training data for a character
 */
export async function upsertCharacterTrainingData(
  characterId: string, 
  trainingData: CharacterTrainingData
): Promise<void> {
  const { error } = await supabase
    .from('catbot_training_data')
    .upsert({
      catbot_id: characterId,
      training_description: trainingData.training_description,
      personality: trainingData.personality,
    });

  if (error) {
    console.error('Error upserting character training data:', error);
    throw error;
  }
}