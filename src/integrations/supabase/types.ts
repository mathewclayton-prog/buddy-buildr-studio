export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      catbot_generation_jobs: {
        Row: {
          completed_count: number
          created_at: string
          error: string | null
          id: string
          status: string
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_count?: number
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          total_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_count?: number
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          total_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catbot_likes: {
        Row: {
          catbot_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          catbot_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          catbot_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      catbot_spontaneous_thoughts: {
        Row: {
          catbot_id: string | null
          created_at: string | null
          id: string
          personality_match: string | null
          thought_category: string | null
          thought_content: string | null
          trigger_conditions: Json | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          catbot_id?: string | null
          created_at?: string | null
          id?: string
          personality_match?: string | null
          thought_category?: string | null
          thought_content?: string | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          catbot_id?: string | null
          created_at?: string | null
          id?: string
          personality_match?: string | null
          thought_category?: string | null
          thought_content?: string | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catbot_spontaneous_thoughts_catbot_id_fkey"
            columns: ["catbot_id"]
            isOneToOne: false
            referencedRelation: "catbots"
            referencedColumns: ["id"]
          },
        ]
      }
      catbots: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          interaction_count: number
          is_public: boolean
          last_active_at: string | null
          like_count: number
          name: string
          personality: string | null
          public_profile: string | null
          tags: string[] | null
          training_description: string | null
          updated_at: string
          user_id: string
          voice_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interaction_count?: number
          is_public?: boolean
          last_active_at?: string | null
          like_count?: number
          name: string
          personality?: string | null
          public_profile?: string | null
          tags?: string[] | null
          training_description?: string | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interaction_count?: number
          is_public?: boolean
          last_active_at?: string | null
          like_count?: number
          name?: string
          personality?: string | null
          public_profile?: string | null
          tags?: string[] | null
          training_description?: string | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          extracted_insights: Json | null
          id: string
          is_user: boolean
          memory_processed: boolean | null
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          extracted_insights?: Json | null
          id?: string
          is_user: boolean
          memory_processed?: boolean | null
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          extracted_insights?: Json | null
          id?: string
          is_user?: boolean
          memory_processed?: boolean | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          catbot_id: string
          created_at: string
          id: string
          is_active: boolean
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catbot_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catbot_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_catbot_id_fkey"
            columns: ["catbot_id"]
            isOneToOne: false
            referencedRelation: "catbots"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_contexts: {
        Row: {
          catbot_id: string
          context_data: Json | null
          context_type: string
          id: string
          last_referenced: string | null
          mentioned_at: string
          revival_triggers: Json | null
          status: string | null
          thread_connections: Json | null
          thread_priority: number | null
          user_id: string
        }
        Insert: {
          catbot_id: string
          context_data?: Json | null
          context_type: string
          id?: string
          last_referenced?: string | null
          mentioned_at?: string
          revival_triggers?: Json | null
          status?: string | null
          thread_connections?: Json | null
          thread_priority?: number | null
          user_id: string
        }
        Update: {
          catbot_id?: string
          context_data?: Json | null
          context_type?: string
          id?: string
          last_referenced?: string | null
          mentioned_at?: string
          revival_triggers?: Json | null
          status?: string | null
          thread_connections?: Json | null
          thread_priority?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_contexts_catbot_id_fkey"
            columns: ["catbot_id"]
            isOneToOne: false
            referencedRelation: "catbots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory_profiles: {
        Row: {
          catbot_id: string
          created_at: string
          current_emotional_state: Json | null
          emotional_history: Json | null
          id: string
          important_events: Json | null
          inside_jokes: Json | null
          interests: Json | null
          last_interaction_summary: string | null
          mentioned_problems: Json | null
          personality_traits: Json | null
          relationship_depth: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catbot_id: string
          created_at?: string
          current_emotional_state?: Json | null
          emotional_history?: Json | null
          id?: string
          important_events?: Json | null
          inside_jokes?: Json | null
          interests?: Json | null
          last_interaction_summary?: string | null
          mentioned_problems?: Json | null
          personality_traits?: Json | null
          relationship_depth?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catbot_id?: string
          created_at?: string
          current_emotional_state?: Json | null
          emotional_history?: Json | null
          id?: string
          important_events?: Json | null
          inside_jokes?: Json | null
          interests?: Json | null
          last_interaction_summary?: string | null
          mentioned_problems?: Json | null
          personality_traits?: Json | null
          relationship_depth?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memory_profiles_catbot_id_fkey"
            columns: ["catbot_id"]
            isOneToOne: false
            referencedRelation: "catbots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_catbot_creator_profile: {
        Args: { catbot_id: string }
        Returns: {
          avatar_url: string
          display_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
