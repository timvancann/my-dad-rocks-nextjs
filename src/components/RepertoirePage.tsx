'use client';
import { SetlistType, SongType } from '@/lib/interface';
import { useAllSongsStore, useSongDetailStore } from '@/store/store';
import React, { useEffect } from 'react';
import { SongList } from '@/components/SongList';

interface RepertoirePageProps {
  songs: SongType[],
  setlist: SetlistType
}

export const RepertoirePage = ({ songs, setlist }: RepertoirePageProps) => {
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const setSongs = useAllSongsStore(state => state.setSongs);
  useEffect(() => {
    setSetlist(setlist);
    setSongs(songs);
  }, [setlist, songs, setSetlist, setSongs]);

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <SongList />
    </div>
  );
};
