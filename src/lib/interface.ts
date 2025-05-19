export interface SongType {
  _id: string;
  _type?: string;
  title: string;
  artist?: string;
  artwork: string;
  audio?: string;
  dualGuitar: boolean;
  dualVocal: boolean;
  duration: number;
  notes?: string;
  version?: number;
}

export interface SetlistType {
  _id: string;
  title: string;
  songs: SongType[];
}

export interface GigType {
  _id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  video_playlist: string;
  setlist: SetlistType;
}

export interface GigsType {
  _id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  venue: string;
  video_playlist: string;
}
