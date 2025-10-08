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
      analytics_events: {
        Row: {
          catbot_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          catbot_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          catbot_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_catbot_id_fkey"
            columns: ["catbot_id"]
            isOneToOne: false
            referencedRelation: "catbots"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
        }
        Relationships: []
      }
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
      catbot_training_data: {
        Row: {
          catbot_id: string
          created_at: string
          id: string
          personality: string | null
          training_description: string | null
          updated_at: string
        }
        Insert: {
          catbot_id: string
          created_at?: string
          id?: string
          personality?: string | null
          training_description?: string | null
          updated_at?: string
        }
        Update: {
          catbot_id?: string
          created_at?: string
          id?: string
          personality?: string | null
          training_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catbots: {
        Row: {
          advanced_definition: string | null
          avatar_url: string | null
          created_at: string
          creation_mode: string | null
          description: string | null
          greeting: string | null
          id: string
          interaction_count: number
          is_public: boolean
          last_active_at: string | null
          like_count: number
          long_description: string | null
          name: string
          public_profile: string | null
          suggested_starters: string[] | null
          tags: string[] | null
          updated_at: string
          use_new_prompt: boolean | null
          user_id: string
          voice_id: string | null
        }
        Insert: {
          advanced_definition?: string | null
          avatar_url?: string | null
          created_at?: string
          creation_mode?: string | null
          description?: string | null
          greeting?: string | null
          id?: string
          interaction_count?: number
          is_public?: boolean
          last_active_at?: string | null
          like_count?: number
          long_description?: string | null
          name: string
          public_profile?: string | null
          suggested_starters?: string[] | null
          tags?: string[] | null
          updated_at?: string
          use_new_prompt?: boolean | null
          user_id: string
          voice_id?: string | null
        }
        Update: {
          advanced_definition?: string | null
          avatar_url?: string | null
          created_at?: string
          creation_mode?: string | null
          description?: string | null
          greeting?: string | null
          id?: string
          interaction_count?: number
          is_public?: boolean
          last_active_at?: string | null
          like_count?: number
          long_description?: string | null
          name?: string
          public_profile?: string | null
          suggested_starters?: string[] | null
          tags?: string[] | null
          updated_at?: string
          use_new_prompt?: boolean | null
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
      page_views: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          id: string
          page_path: string
          referrer: string | null
          session_id: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          session_id: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          ended_at: string | null
          event_count: number | null
          id: string
          last_activity_at: string | null
          page_count: number | null
          session_id: string
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          event_count?: number | null
          id?: string
          last_activity_at?: string | null
          page_count?: number | null
          session_id: string
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          event_count?: number | null
          id?: string
          last_activity_at?: string | null
          page_count?: number | null
          session_id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_onboarding_funnel: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          conversion_rate: number
          drop_off_rate: number
          step: string
          user_count: number
        }[]
      }
      calculate_bounce_rate: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          bounce_rate: number
          bounced_sessions: number
          total_sessions: number
        }[]
      }
      calculate_session_duration: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          avg_duration_minutes: number
          median_duration_minutes: number
          total_sessions: number
        }[]
      }
      calculate_stickiness: {
        Args: { p_date?: string }
        Returns: {
          dau: number
          mau: number
          stickiness_ratio: number
        }[]
      }
      get_active_hours_heatmap: {
        Args: Record<PropertyKey, never>
        Returns: {
          activity_count: number
          day_of_week: number
          hour_of_day: number
        }[]
      }
      get_bounce_rate_trend: {
        Args: { p_days_back?: number }
        Returns: {
          bounce_rate: number
          date: string
          total_sessions: number
        }[]
      }
      get_catbot_creator_profile: {
        Args: { catbot_id: string }
        Returns: {
          avatar_url: string
          display_name: string
        }[]
      }
      get_cohort_retention: {
        Args: { p_weeks_back?: number }
        Returns: {
          cohort_size: number
          cohort_week: string
          week_0: number
          week_1: number
          week_2: number
          week_3: number
          week_4: number
        }[]
      }
      get_live_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_now: number
          messages_last_hour: number
          sessions_today: number
          signups_today: number
        }[]
      }
      get_messages_per_session_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_messages: number
          median_messages: number
          total_sessions_with_messages: number
        }[]
      }
      get_recent_activity: {
        Args: { p_limit?: number }
        Returns: {
          catbot_name: string
          created_at: string
          event_type: string
          metadata: Json
          user_id: string
        }[]
      }
      get_session_duration_distribution: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          duration_bucket: string
          session_count: number
        }[]
      }
      get_time_to_first_message: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_hours: number
          median_hours: number
          total_users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_session_activity: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
