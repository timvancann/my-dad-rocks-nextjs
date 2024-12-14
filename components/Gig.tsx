'use client';
import { GigCard } from '@/components/GigCard';
import { EditIcon } from '@sanity/icons';
import { Setlist } from '@/components/Setlist';
import { AddPause } from '@/components/AddPause';
import { SongList } from '@/components/SongList';
import React, { useEffect } from 'react';
import { GigType, SongType } from '@/lib/interface';
import { useAllSongsStore, useSongDetailStore } from '@/store/store';

type GigProps = {
  gig: GigType;
  songs: SongType[];
}
export const Gig = ({ gig, songs }: GigProps) => {
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const setSongs = useAllSongsStore(state => state.setSongs);
  const setlist = useSongDetailStore(state => state.setlist);

  useEffect(() => {
    setSetlist(gig.setlist);
  }, [gig, setSetlist]);

  useEffect(() => {
    setSongs(getDifferenceBetweenSongLists(
      songs,
      setlist.songs
    ));
  }, [setSongs, songs, setlist]);


  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex w-full px-4 justify-between'}>
        <GigCard gig={gig} />
        <button className={'bg-rosePine-highlightLow rounded-xl p-2 m-2'}>
          <EditIcon />
        </button>
      </div>
      <Setlist />
      <AddPause gigId={gig._id} />
      <SongList />
    </div>
  );
};

const getDifferenceBetweenSongLists = (allSongs: SongType[], songs: SongType[]): SongType[] => {
  return allSongs.filter(s => !songs.some(song => song._id === s._id));
};
