// db.ts
import Dexie, { type EntityTable } from 'dexie';

interface AudioFile {
  id: string;
  title: string;
  version: number;
  blob: Blob;
}

interface Song {
  id: string;
  artist: string;
  title: string;
  slug: string;
  spotify_id: string | null;
  audio_url: string | null;
  video_id: string | null;
  tempo: number | null;
  key: string | null;
  lyrics: string | null;
  is_demo: boolean;
  type: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

interface Gig {
  id: string;
  date: string;
  location: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

interface Setlist {
  id: string;
  gig_id: string;
  song_id: string;
  order_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

interface SongSection {
  id: string;
  song_id: string;
  name: string;
  start_time: number;
  end_time: number | null;
  color: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

interface OfflineSync {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  record_id: string;
  data: any;
  created_at: string;
  synced: boolean;
}

interface AppMetadata {
  key: string;
  value: any;
  updated_at: string;
}

const db = new Dexie('MyDadRocksDB') as Dexie & {
  audioFiles: EntityTable<AudioFile, 'id'>;
  songs: EntityTable<Song, 'id'>;
  gigs: EntityTable<Gig, 'id'>;
  setlists: EntityTable<Setlist, 'id'>;
  songSections: EntityTable<SongSection, 'id'>;
  offlineSync: EntityTable<OfflineSync, 'id'>;
  appMetadata: EntityTable<AppMetadata, 'key'>;
};

// Schema declaration:
db.version(1).stores({
  audioFiles: '++id, title, version'
});

// Version 2: Add full offline support
db.version(2).stores({
  audioFiles: '++id, title, version',
  songs: '++id, slug, artist, title, spotify_id, type, synced_at',
  gigs: '++id, date, synced_at',
  setlists: '++id, gig_id, song_id, [gig_id+order_index], synced_at',
  songSections: '++id, song_id, [song_id+order_index], synced_at',
  offlineSync: '++id, type, table, record_id, synced, created_at',
  appMetadata: '++key, updated_at'
});

export { db };
export type { 
  AudioFile, 
  Song, 
  Gig, 
  Setlist, 
  SongSection, 
  OfflineSync,
  AppMetadata
};
