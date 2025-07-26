export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      band_members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string | null
          id: string
          is_checked: boolean | null
          name: string
          position: number
          updated_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          name: string
          position?: number
          updated_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      gigs: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string | null
          setlist_id: string | null
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
          venue_address: string | null
          venue_name: string | null
          video_playlist_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          setlist_id?: string | null
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          video_playlist_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          setlist_id?: string | null
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          video_playlist_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gigs_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_session_songs: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          quality_rating: number | null
          session_id: string | null
          song_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          session_id?: string | null
          song_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          session_id?: string | null
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_session_songs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_session_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          notes: string | null
          setlist_id: string | null
          start_time: string | null
          title: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          setlist_id?: string | null
          start_time?: string | null
          title: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          setlist_id?: string | null
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          album: string | null
          band: string | null
          coverart: string | null
          created_at: string
          id: string
          title: string | null
        }
        Insert: {
          album?: string | null
          band?: string | null
          coverart?: string | null
          created_at?: string
          id?: string
          title?: string | null
        }
        Update: {
          album?: string | null
          band?: string | null
          coverart?: string | null
          created_at?: string
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      setlist_items: {
        Row: {
          created_at: string | null
          custom_duration_minutes: number | null
          custom_title: string | null
          id: string
          item_type: string
          notes: string | null
          position: number
          setlist_id: string | null
          song_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_duration_minutes?: number | null
          custom_title?: string | null
          id?: string
          item_type: string
          notes?: string | null
          position: number
          setlist_id?: string | null
          song_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_duration_minutes?: number | null
          custom_title?: string | null
          id?: string
          item_type?: string
          notes?: string | null
          position?: number
          setlist_id?: string | null
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlist_items_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_items_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          total_duration_minutes: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          total_duration_minutes?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          total_duration_minutes?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      song_links: {
        Row: {
          created_at: string | null
          id: string
          link_type: string
          song_id: string
          title: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_type: string
          song_id: string
          title?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_type?: string
          song_id?: string
          title?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_links_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_sections: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number | null
          song_id: string | null
          start_time: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          song_id?: string | null
          start_time: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          song_id?: string | null
          start_time?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_sections_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_stats: {
        Row: {
          created_at: string | null
          first_learned_at: string | null
          id: string
          last_practiced_at: string | null
          mastery_level: number | null
          song_id: string | null
          times_played: number | null
          times_practiced: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_learned_at?: string | null
          id?: string
          last_practiced_at?: string | null
          mastery_level?: number | null
          song_id?: string | null
          times_played?: number | null
          times_practiced?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_learned_at?: string | null
          id?: string
          last_practiced_at?: string | null
          mastery_level?: number | null
          song_id?: string | null
          times_played?: number | null
          times_practiced?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_stats_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: true
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string | null
          artwork_url: string | null
          audio_url: string | null
          created_at: string | null
          difficulty_level: number | null
          dual_guitar: boolean | null
          dual_vocal: boolean | null
          duration_seconds: number | null
          id: string
          key_signature: string | null
          last_played_at: string | null
          lyrics: string | null
          notes: string | null
          slug: string | null
          tabs_chords: string | null
          tags: string[] | null
          tempo_bpm: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist?: string | null
          artwork_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          dual_guitar?: boolean | null
          dual_vocal?: boolean | null
          duration_seconds?: number | null
          id?: string
          key_signature?: string | null
          last_played_at?: string | null
          lyrics?: string | null
          notes?: string | null
          slug?: string | null
          tabs_chords?: string | null
          tags?: string[] | null
          tempo_bpm?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string | null
          artwork_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          dual_guitar?: boolean | null
          dual_vocal?: boolean | null
          duration_seconds?: number | null
          id?: string
          key_signature?: string | null
          last_played_at?: string | null
          lyrics?: string | null
          notes?: string | null
          slug?: string | null
          tabs_chords?: string | null
          tags?: string[] | null
          tempo_bpm?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_band_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_song_practiced: {
        Args: { p_song_id: string }
        Returns: undefined
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