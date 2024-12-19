'use client';

import { SongCard } from '@/components/SongCard';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Divider } from '@/components/Divider';
import { useAllSongsStore } from '@/store/store';

export const SongList = () => {
  const songs = useAllSongsStore(state => state.songs);

  return (
    <div className={'text-rosePine-text items-center justify-center'}>
      <div><SongsTitle title={'Repertoire'} /></div>
      {songs.map((item, index) => (
        <div key={index}>
          {index > 0 && <Divider />}
          <SongCard song={item} playlist={songs} />
        </div>
      ))}
    </div>
  );
};
