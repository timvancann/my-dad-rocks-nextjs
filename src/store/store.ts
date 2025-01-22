import { create } from 'zustand';
import { Track } from '@payload-types';

type PlayerContext = {
  currentSong: Track | null;
  setCurrentSong: (song: Track | null) => void;
  playlist: Track[];
  setPlaylist: (setlist: Track[]) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  currentSong: null,
  playlist: [],
  setCurrentSong: (song: Track | null) => set({ currentSong: song }),
  setPlaylist: (playlist: Track[]) => set({ playlist })
}));
