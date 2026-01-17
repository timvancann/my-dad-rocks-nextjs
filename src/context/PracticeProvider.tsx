'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { createContext, PropsWithChildren, useContext, useState, useEffect, useMemo } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { useSongs, useSetlistByTitle } from '@/hooks/convex';

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

// Transform Convex song to SongType
function transformSong(song: any): SongType {
  return {
    _id: song._id,
    title: song.title,
    artist: song.artist,
    slug: song.slug,
    artwork: song.artworkUrl || '',
    artworkUrl: song.artworkUrl,
    audio: song.audioUrl,
    audioUrl: song.audioUrl,
    dualGuitar: song.dualGuitar ?? false,
    dualVocal: song.dualVocal ?? false,
    canPlayWithoutSinger: song.canPlayWithoutSinger ?? false,
    duration: song.durationSeconds ?? 0,
    durationSeconds: song.durationSeconds,
    notes: song.notes,
    timesPlayed: song.timesPlayed,
    timesPracticed: song.timesPracticed,
    masteryLevel: song.masteryLevel,
    lastPracticedAt: song.lastPracticedAt,
    lastPlayedAt: song.lastPlayedAt,
    firstLearnedAt: song.firstLearnedAt,
    stemCount: song.stemCount,
  };
}

// Transform Convex setlist to SetlistType
function transformSetlist(setlist: any): SetlistType {
  if (!setlist) {
    return { _id: '', title: 'Practice', songs: [] };
  }

  const songs = (setlist.items || [])
    .filter((item: any) => item.song && item.itemType === 'song')
    .map((item: any) => transformSong(item.song));

  return {
    _id: setlist._id,
    title: setlist.title,
    songs,
    items: setlist.items,
  };
}

export default function PracticeProvider({ children }: PropsWithChildren) {
  const convexSongs = useSongs();
  const convexSetlist = useSetlistByTitle('Practice');

  // Transform Convex data to expected types
  const allSongs = useMemo(() => {
    if (!convexSongs) return [];
    return convexSongs.map(transformSong);
  }, [convexSongs]);

  const setlist = useMemo(() => {
    return transformSetlist(convexSetlist);
  }, [convexSetlist]);

  const [store] = useState(() =>
    createStore<SetlistStore>((set) => ({
      setlist: { _id: '', title: 'Practice', songs: [] },
      allSongs: [],
      addSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: [...state.setlist.songs, song] } })),
      removeSong: (song: SongType) => set((state) => ({ ...state, setlist: { ...state.setlist, songs: state.setlist.songs.filter((s) => s._id !== song._id) } })),
      updateSongsInSetlist: (songs: SongType[]) => set((state) => ({ ...state, setlist: { ...state.setlist, songs } })),
      isAddSongModalOpen: false,
      openAddSongModal: () => set((state) => ({ ...state, isAddSongModalOpen: true })),
      closeAddSongModal: () => set((state) => ({ ...state, isAddSongModalOpen: false }))
    }))
  );

  // Update the store when data changes
  useEffect(() => {
    store.setState({ allSongs, setlist });
  }, [allSongs, setlist, store]);

  return <PracticeContext.Provider value={store}>{children}</PracticeContext.Provider>;
}

export function usePracticeStore<T>(selector: (state: SetlistStore) => T) {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePracticeStore must be used within a PracticeProvider');
  }
  return useStore(context, selector);
}
