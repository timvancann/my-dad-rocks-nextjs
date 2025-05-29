import { SongType } from '@/lib/interface';
import { create } from 'zustand';

type LoopMarkers = {
  start: number | null;
  end: number | null;
};

type PlayerContext = {
  songIndex: number;
  setSongIndex: (index: number) => void;
  currentSong: SongType | null;
  setCurrentSong: (song: SongType | null) => void;
  playlist: SongType[];
  setPlaylist: (setlist: SongType[]) => void;
  isChangingSong: boolean;
  setIsChangingSong: (changing: boolean) => void;
  loopMarkers: LoopMarkers;
  setLoopMarkers: (markers: LoopMarkers) => void;
  isLoopEnabled: boolean;
  setIsLoopEnabled: (enabled: boolean) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  songIndex: 0,
  currentSong: null,
  playlist: [],
  isChangingSong: false,
  loopMarkers: { start: null, end: null },
  isLoopEnabled: false,
  setSongIndex: (index: number) => set({ songIndex: index }),
  setCurrentSong: (song: SongType | null) => set({ currentSong: song }),
  setPlaylist: (playlist: SongType[]) => set({ playlist }),
  setIsChangingSong: (changing: boolean) => set({ isChangingSong: changing }),
  setLoopMarkers: (markers: LoopMarkers) => set({ loopMarkers: markers }),
  setIsLoopEnabled: (enabled: boolean) => set({ isLoopEnabled: enabled })
}));
