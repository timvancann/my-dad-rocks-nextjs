'use client';

import React, { createContext } from 'react';
import { SongType } from '@/lib/interface';

type SelectedSongContextType = {
  selectedSong: SongType | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<SongType | null>>;
};

export const SelectedSongContext = createContext<SelectedSongContextType | null>(null);

export default function SelectedSongContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedSong, setSelectedSong] = React.useState<SongType | null>(null);
  return <SelectedSongContext.Provider value={{ selectedSong, setSelectedSong }}>{children}</SelectedSongContext.Provider>;
}

export function useSelectedSongContext() {
  const context = React.useContext(SelectedSongContext);
  if (context === null) {
    throw new Error('useSelectedSongContext must be used within an SelectedSongContextProvider');
  }
  return context;
}
