import { SongType } from '@/lib/interface';
import { create } from 'zustand';

type PlayerContext = {
  songIndex: number;
  setSongIndex: (index: number) => void;
  currentSong: SongType | null;
  setCurrentSong: (song: SongType | null) => void;
  playlist: SongType[];
  setPlaylist: (setlist: SongType[]) => void;
  isChangingSong: boolean;
  setIsChangingSong: (changing: boolean) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  songIndex: 0,
  currentSong: null,
  playlist: [],
  isChangingSong: false,
  setSongIndex: (index: number) => set({ songIndex: index }),
  setCurrentSong: (song: SongType | null) => set({ currentSong: song }),
  setPlaylist: (playlist: SongType[]) => set({ playlist }),
  setIsChangingSong: (changing: boolean) => set({ isChangingSong: changing })
}));
