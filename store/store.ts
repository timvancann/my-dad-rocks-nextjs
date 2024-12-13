import { create } from 'zustand';
import { SetlistType, SongType } from '@/lib/interface';

type PlayerContext = {
  currentSong?: SongType,
  setlist?: SetlistType,
  setCurrentSong: (song: SongType) => void;
  setSetlist: (setlist: SetlistType) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  currentSong: undefined,
  setlist: undefined,
  setCurrentSong: (song: SongType) => set({ currentSong: song }),
  setSetlist: (setlist: SetlistType) => set({ setlist })
}));

type SongDetailContext = {
  song?: SongType | null,
  setSong: (song: SongType | null) => void;
};

export const useSongDetailStore = create<SongDetailContext>((set) => ({
  song: null,
  setSong: (song: SongType | null) => set({ song })
}));
