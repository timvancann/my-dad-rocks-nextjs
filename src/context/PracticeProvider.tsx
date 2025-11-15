'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { createContext, PropsWithChildren, useContext, useState, useEffect } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { useSongs } from '@/hooks/useSongs';

export type SetlistStore = {
  setlist: SetlistType;
  allSongs: SongType[];
  addSong: (song: SongType) => void;
  removeSong: (song: SongType) => void;
  updateSongsInSetlist: (songs: SongType[]) => void;
  isAddSongModalOpen: boolean;
  openAddSongModal: () => void;
  closeAddSongModal: () => void;
};

const PracticeContext = createContext<StoreApi<SetlistStore> | undefined>(undefined);

type PracticeProviderProps = PropsWithChildren & {
  setlist: SetlistType;
  allSongs: SongType[];
};

export default function PracticeProvider({ children, setlist: setlist, allSongs: initialSongs }: PracticeProviderProps) {
  const { data: allSongs } = useSongs(initialSongs);

  const [store] = useState(() =>
    createStore<SetlistStore>((set) => ({
      setlist: setlist,
      allSongs: initialSongs,
      addSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: [...state.setlist.songs, song] } })),
      removeSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: state.setlist.songs.filter((s) => s._id !== song._id) } })),
      updateSongsInSetlist: (songs: SongType[]) => set((state) => ({ ...state, setlist: { ...state.setlist, songs } })),
      isAddSongModalOpen: false,
      openAddSongModal: () => set((state) => ({ ...state, isAddSongModalOpen: true })),
      closeAddSongModal: () => set((state) => ({ ...state, isAddSongModalOpen: false }))
    }))
  );

  // Update the store when songs data changes
  useEffect(() => {
    if (allSongs) {
      store.setState({ allSongs });
    }
  }, [allSongs, store]);

  return <PracticeContext.Provider value={store}>{children}</PracticeContext.Provider>;
}

export function usePracticeStore<T>(selector: (state: SetlistStore) => T) {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePracticeStore must be used within a PracticeProvider');
  }
  return useStore(context, selector);
}
