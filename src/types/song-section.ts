export interface SongSection {
  id: string;
  song_id: string;
  name: string;
  start_time: number;
  color: string;
  position: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateSongSectionData {
  song_id: string;
  name: string;
  start_time: number;
  color?: string;
  position?: number;
}

export interface UpdateSongSectionData {
  name?: string;
  start_time?: number;
  color?: string;
  position?: number;
}