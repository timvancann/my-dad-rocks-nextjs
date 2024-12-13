'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { SongCard } from '@/components/SongCard';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { SongCardDivider } from '@/components/SongCardDivider';
import { usePlayerStore } from '@/store/store';

type AllSongsProps = {
  songs: SongType[];
  setlist: SetlistType;
}

export const AllSongs = ({ songs, setlist }: AllSongsProps) => {
  usePlayerStore(state => state.setSetlist)(setlist);

  return (
    <div className={'text-rosePine-text items-center justify-center'}>
      <div><SongsTitle title={'Repertoire'} /></div>
      {songs.map((item, index) => (
        <div key={index}>
          {index > 0 && <SongCardDivider />}
          <SongCard song={item} />
        </div>
      ))}
    </div>
  );
};
