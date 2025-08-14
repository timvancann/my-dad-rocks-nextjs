import { SongType } from '@/lib/interface';
import { SongSection } from '@/types/song-section';
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
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  songSections: SongSection[];
  setSongSections: (sections: SongSection[]) => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  performancePlaylist: SongType[];
  setPerformancePlaylist: (songs: SongType[]) => void;
  currentPerformanceIndex: number;
  setCurrentPerformanceIndex: (index: number) => void;
  isPerformanceMode: boolean;
  setIsPerformanceMode: (enabled: boolean) => void;
};

export const usePlayerStore = create<PlayerContext>((set) => ({
  songIndex: 0,
  currentSong: null,
  playlist: [],
  isChangingSong: false,
  loopMarkers: { start: null, end: null },
  isLoopEnabled: false,
  isFullscreen: false,
  songSections: [],
  isDarkMode: true,
  performancePlaylist: [],
  currentPerformanceIndex: 0,
  isPerformanceMode: false,
  setSongIndex: (index: number) => set({ songIndex: index }),
  setCurrentSong: (song: SongType | null) => set({ currentSong: song }),
  setPlaylist: (playlist: SongType[]) => set({ playlist }),
  setIsChangingSong: (changing: boolean) => set({ isChangingSong: changing }),
  setLoopMarkers: (markers: LoopMarkers) => set({ loopMarkers: markers }),
  setIsLoopEnabled: (enabled: boolean) => set({ isLoopEnabled: enabled }),
  setIsFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),
  setSongSections: (sections: SongSection[]) => set({ songSections: sections }),
  setIsDarkMode: (isDarkMode: boolean) => set({ isDarkMode }),
  setPerformancePlaylist: (songs: SongType[]) => set({ performancePlaylist: songs }),
  setCurrentPerformanceIndex: (index: number) => set({ currentPerformanceIndex: index }),
  setIsPerformanceMode: (enabled: boolean) => set({ isPerformanceMode: enabled })
}));
