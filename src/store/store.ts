import { SongType } from '@/lib/interface';
import { create } from 'zustand';

type PlayerContext = {
  currentSong: SongType | null;
  setCurrentSong: (song: SongType | null) => void;
  playlist: SongType[];
  setPlaylist: (setlist: SongType[]) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  currentSong: null,
  playlist: [],
  setCurrentSong: (song: SongType | null) => set({ currentSong: song }),
  setPlaylist: (playlist: SongType[]) => set({ playlist })
}));
