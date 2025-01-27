'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { SetlistStore } from './PracticeProvider';

const GigContext = createContext<StoreApi<SetlistStore> | undefined>(undefined);

type GigProviderProps = PropsWithChildren & {
  setlist: SetlistType;
  allSongs: SongType[];
};

export default function GigProvider({ children, setlist, allSongs }: GigProviderProps) {
  const [store] = useState(() =>
    createStore<SetlistStore>((set) => ({
      setlist: setlist,
      allSongs: allSongs,
      addSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: [...state.setlist.songs, song] } })),
      removeSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: state.setlist.songs.filter((s) => s._id !== song._id) } })),
      updateSongsInSetlist: (songs: SongType[]) => set((state) => ({ ...state, setlist: { ...state.setlist, songs } }))
    }))
  );

  return <GigContext.Provider value={store}>{children}</GigContext.Provider>;
}

export function useGigStore<T>(selector: (state: SetlistStore) => T) {
  const context = useContext(GigContext);
  if (!context) {
    throw new Error('useGigStore must be used within a GigProvider');
  }
  return useStore(context, selector);
}
