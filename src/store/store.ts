import { create } from 'zustand';
import { GigType, SetlistType, SongType } from '@/lib/interface';

type PlayerContext = {
  currentSong: SongType | null,
  setCurrentSong: (song: SongType | null) => void;
  playlist: SongType[],
  setPlaylist: (setlist: SongType[]) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  currentSong: null,
  playlist: [],
  setCurrentSong: (song: SongType | null) => set({ currentSong: song }),
  setPlaylist: (playlist: SongType[]) => set({ playlist })
}));

type SongDetailContext = {
  song?: SongType | null;
  setSong: (song: SongType | null) => void;
  setlist: SetlistType
  setSetlist: (setlist: SetlistType) => void;
};

export const useSongDetailStore = create<SongDetailContext>((set) => ({
  setlist: { songs: [], _id: '', title: 'Practice' } as SetlistType,
  setSong: (song: SongType | null) => set({ song }),
  setSetlist: (setlist: SetlistType) => set({ setlist })
}));

type AllSongsContext = {
  songs: SongType[];
  setSongs: (songs: SongType[]) => void;
};

export const useAllSongsStore = create<AllSongsContext>((set) => ({
  songs: [],
  setSongs: (songs: SongType[]) => set({ songs })
}));
