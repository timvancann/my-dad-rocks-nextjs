import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string
          title: string
          artist: string | null
          artwork_url: string | null
          audio_url: string | null
          dual_guitar: boolean
          dual_vocal: boolean
          lyrics: string | null
          duration_seconds: number | null
          key_signature: string | null
          tempo_bpm: number | null
          difficulty_level: number | null
          tags: string[] | null
          notes: string | null
          tabs_chords: string | null
          last_played_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          artwork_url?: string | null
          audio_url?: string | null
          dual_guitar?: boolean
          dual_vocal?: boolean
          lyrics?: string | null
          duration_seconds?: number | null
          key_signature?: string | null
          tempo_bpm?: number | null
          difficulty_level?: number | null
          tags?: string[] | null
          notes?: string | null
          tabs_chords?: string | null
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string | null
          artwork_url?: string | null
          audio_url?: string | null
          dual_guitar?: boolean
          dual_vocal?: boolean
          lyrics?: string | null
          duration_seconds?: number | null
          key_signature?: string | null
          tempo_bpm?: number | null
          difficulty_level?: number | null
          tags?: string[] | null
          notes?: string | null
          tabs_chords?: string | null
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      setlists: {
        Row: {
          id: string
          title: string
          type: string
          description: string | null
          total_duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type?: string
          description?: string | null
          total_duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          description?: string | null
          total_duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      setlist_items: {
        Row: {
          id: string
          setlist_id: string
          item_type: string
          song_id: string | null
          custom_title: string | null
          custom_duration_minutes: number | null
          notes: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          setlist_id: string
          item_type: string
          song_id?: string | null
          custom_title?: string | null
          custom_duration_minutes?: number | null
          notes?: string | null
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          setlist_id?: string
          item_type?: string
          song_id?: string | null
          custom_title?: string | null
          custom_duration_minutes?: number | null
          notes?: string | null
          position?: number
          created_at?: string
        }
      }
      gigs: {
        Row: {
          id: string
          title: string
          venue_name: string | null
          venue_address: string | null
          date: string
          start_time: string | null
          end_time: string | null
          contact_person: string | null
          contact_phone: string | null
          contact_email: string | null
          payment_amount: number | null
          payment_status: string
          video_playlist_url: string | null
          setlist_id: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          venue_name?: string | null
          venue_address?: string | null
          date: string
          start_time?: string | null
          end_time?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          payment_amount?: number | null
          payment_status?: string
          video_playlist_url?: string | null
          setlist_id?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          venue_name?: string | null
          venue_address?: string | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          payment_amount?: number | null
          payment_status?: string
          video_playlist_url?: string | null
          setlist_id?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      song_stats: {
        Row: {
          id: string
          song_id: string
          times_played: number
          times_practiced: number
          mastery_level: number
          last_practiced_at: string | null
          first_learned_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          times_played?: number
          times_practiced?: number
          mastery_level?: number
          last_practiced_at?: string | null
          first_learned_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          times_played?: number
          times_practiced?: number
          mastery_level?: number
          last_practiced_at?: string | null
          first_learned_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          title: string
          date: string
          start_time: string | null
          end_time: string | null
          setlist_id: string | null
          notes: string | null
          attendees: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          start_time?: string | null
          end_time?: string | null
          setlist_id?: string | null
          notes?: string | null
          attendees?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          setlist_id?: string | null
          notes?: string | null
          attendees?: string[] | null
          created_at?: string
        }
      }
      practice_session_songs: {
        Row: {
          id: string
          session_id: string
          song_id: string
          quality_rating: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          song_id: string
          quality_rating?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          song_id?: string
          quality_rating?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      song_links: {
        Row: {
          id: string
          song_id: string
          link_type: 'youtube' | 'youtube_music' | 'spotify' | 'other'
          url: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          link_type: 'youtube' | 'youtube_music' | 'spotify' | 'other'
          url: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          link_type?: 'youtube' | 'youtube_music' | 'spotify' | 'other'
          url?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}