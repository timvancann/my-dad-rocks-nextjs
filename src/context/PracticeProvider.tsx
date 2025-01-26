'use client';

import { StoreApi, createStore, useStore } from 'zustand';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { SetlistType, SongType } from '@/lib/interface';


export type SetlistStore = {
  setlist: SetlistType;
  allSongs: SongType[];
  addSong: (song: SongType) => void;
  removeSong: (song: SongType) => void;
  updateSongsInSetlist: (songs: SongType[]) => void;
};

const PracticeContext = createContext<StoreApi<SetlistStore> | undefined>(undefined);

type PracticeProviderProps = PropsWithChildren & {
  setlist: SetlistType;
  allSongs: SongType[];
}

export default function PracticeProvider({ children, setlist: setlist, allSongs }: PracticeProviderProps) {
  const [store] = useState(() => createStore<SetlistStore>((set) => ({
    setlist: setlist,
    allSongs: allSongs,
    addSong: (song: SongType) =>
      set((state) => ({ ...state, setlist: { ...state.setlist, songs: [...state.setlist.songs, song] } })),
    removeSong: (song: SongType) =>
      set((state) => ({ ...state, setlist: { ...state.setlist, songs: state.setlist.songs.filter(s => s._id !== song._id) } })),
    updateSongsInSetlist: (songs: SongType[]) =>
      set((state) => ({ ...state, setlist: { ...state.setlist, songs } }))
  })));

  return <PracticeContext.Provider value={store}>{children}</PracticeContext.Provider>;
}

export function usePracticeStore<T>(selector: (state: SetlistStore) => T) {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePracticeStore must be used within a PracticeProvider');
  }
  return useStore(context, selector);
}
