"use client"

import React, {createContext} from 'react'
import {SongType} from "@/lib/interface";

type PlaylistContextType = {
  playlist: SongType[]
  setPlaylist: React.Dispatch<React.SetStateAction<SongType[]>>

}

export const PlaylistContext = createContext<PlaylistContextType | null>(null);

export default function PlaylistContextProvider({children}: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = React.useState<SongType[]>([])
  return (
    <PlaylistContext.Provider
      value={{playlist, setPlaylist}}>
      {children}
    </PlaylistContext.Provider>)
}

export function usePlaylistContext() {
  const context = React.useContext(PlaylistContext)
  if (context === null) {
    throw new Error('usePlaylistContext must be used within an PlaylistContextProvider')
  }
  return context
}
