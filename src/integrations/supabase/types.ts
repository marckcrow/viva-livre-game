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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          days_required: number
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          days_required: number
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          days_required?: number
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          alias: string
          category: string
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          moderation_note: string | null
          user_id: string
        }
        Insert: {
          alias?: string
          category?: string
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          moderation_note?: string | null
          user_id: string
        }
        Update: {
          alias?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          moderation_note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_log: {
        Row: {
          cigarette_count: number | null
          consumption_date: string
          consumption_type: string
          created_at: string
          drink_type: string | null
          id: string
          notes: string | null
          quantity: number
          user_id: string
        }
        Insert: {
          cigarette_count?: number | null
          consumption_date?: string
          consumption_type?: string
          created_at?: string
          drink_type?: string | null
          id?: string
          notes?: string | null
          quantity: number
          user_id: string
        }
        Update: {
          cigarette_count?: number | null
          consumption_date?: string
          consumption_type?: string
          created_at?: string
          drink_type?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          created_at: string
          days_clean: number
          id: string
          last_check_in: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_clean?: number
          id?: string
          last_check_in?: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_clean?: number
          id?: string
          last_check_in?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reduction_plan: {
        Row: {
          created_at: string
          current_cigarettes_per_day: number | null
          current_phase: number
          id: string
          initial_cigarettes_per_day: number | null
          phase_start_date: string
          plan_start_date: string
          tobacco_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_cigarettes_per_day?: number | null
          current_phase?: number
          id?: string
          initial_cigarettes_per_day?: number | null
          phase_start_date?: string
          plan_start_date?: string
          tobacco_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_cigarettes_per_day?: number | null
          current_phase?: number
          id?: string
          initial_cigarettes_per_day?: number | null
          phase_start_date?: string
          plan_start_date?: string
          tobacco_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stoic_control_items: {
        Row: {
          control_type: string
          created_at: string
          description: string
          entry_date: string
          id: string
          user_id: string
        }
        Insert: {
          control_type: string
          created_at?: string
          description: string
          entry_date: string
          id?: string
          user_id: string
        }
        Update: {
          control_type?: string
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      stoic_daily_checkins: {
        Row: {
          control_level: string
          created_at: string
          entry_date: string
          id: string
          mood: string
          mood_intensity: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          control_level: string
          created_at?: string
          entry_date: string
          id?: string
          mood: string
          mood_intensity: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          control_level?: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: string
          mood_intensity?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stoic_priorities: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          entry_date: string
          id: string
          priority_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          entry_date: string
          id?: string
          priority_level: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          priority_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stoic_profiles: {
        Row: {
          created_at: string
          current_day: number
          id: string
          journey_completed_at: string | null
          journey_started_at: string | null
          preferred_evening_time: string | null
          preferred_morning_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          id?: string
          journey_completed_at?: string | null
          journey_started_at?: string | null
          preferred_evening_time?: string | null
          preferred_morning_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number
          id?: string
          journey_completed_at?: string | null
          journey_started_at?: string | null
          preferred_evening_time?: string | null
          preferred_morning_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stoic_user_virtues: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          intended_action: string | null
          rating: number | null
          reflection: string | null
          user_id: string
          virtue_id: string
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          intended_action?: string | null
          rating?: number | null
          reflection?: string | null
          user_id: string
          virtue_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          intended_action?: string | null
          rating?: number | null
          reflection?: string | null
          user_id?: string
          virtue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stoic_user_virtues_virtue_id_fkey"
            columns: ["virtue_id"]
            isOneToOne: false
            referencedRelation: "stoic_virtues"
            referencedColumns: ["id"]
          },
        ]
      }
      stoic_virtues: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
