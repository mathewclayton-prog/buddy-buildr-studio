import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, Character } from "@/types/character";

export class ChatService {
  static async getUserChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        catbot_id,
        title,
        updated_at,
        catbots (
          id,
          name,
          avatar_url,
          personality
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createChatSession(catbotId: string, userId: string, title: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        catbot_id: catbotId,
        user_id: userId,
        title,
        is_active: true
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async getChatMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, content, is_user, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.is_user,
      timestamp: new Date(msg.created_at),
    })) as ChatMessage[];
  }

  static async saveMessage(sessionId: string, content: string, isUser: boolean) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content,
        is_user: isUser
      })
      .select('id, content, is_user, created_at')
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      isUser: data.is_user,
      timestamp: new Date(data.created_at),
    } as ChatMessage;
  }

  static async updateSessionTimestamp(sessionId: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  }

  static async getExistingSession(catbotId: string, userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('catbot_id', catbotId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}