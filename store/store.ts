import { create } from 'zustand';
import { SetlistType, SongType } from '@/lib/interface';

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
  song: SongType | null,
  setSong: (song: SongType | null) => void;
  setlist: SetlistType | null,
  setSetlist: (setlist: SetlistType) => void;
};

export const useSongDetailStore = create<SongDetailContext>((set) => ({
  song: null,
  setSong: (song: SongType | null) => set({ song }),
  setlist: null,
  setSetlist: (setlist: SetlistType) => set({ setlist })
}));
