export interface SongType {
  _id: string;
  title: string;
  artist: string;
  cover_art: any;
  audio: any;
  last_played_at: string;
}

export interface SetlistType {
  _id: string;
  title: string;
  songs?: SongType[];
}