"use client"

import React, { createContext, useContext } from 'react'
import { SetlistType, SongType } from "@/lib/interface";

type PlaylistContextType = {
  playlist: SongType[]
  setPlaylist: React.Dispatch<React.SetStateAction<SongType[]>>
  setlistId: string
  allSongs: SongType[]
}

export const PlaylistContext = createContext<PlaylistContextType | null>(null);

export default function PlaylistContextProvider({ children, setlist, songs }: { children: React.ReactNode, setlist: SetlistType, songs: SongType[] }) {
  const [playlist, setPlaylist] = React.useState<SongType[]>(setlist.songs);
  const [setlistId, setSetlistId] = React.useState<string>(setlist._id);
  const [allSongs, _] = React.useState<SongType[]>(songs);
  return (
    <PlaylistContext.Provider
      value={{ playlist, setPlaylist, setlistId, allSongs }}>
      {children}
    </PlaylistContext.Provider >)
}

export function usePlaylistContext() {
  const context = React.useContext(PlaylistContext)
  if (context === null) {
    throw new Error('usePlaylistContext must be used within an PlaylistContextProvider')
  }
  return context
}
