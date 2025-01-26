'use client';

import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Repertoire } from '@/components/RepertoirePage';
import { usePracticeStore } from '@/context/PracticeProvider';

export default function RepertoirePage() {
  const store = usePracticeStore(state => state)
  return (
    <div className="items-center justify-center mx-2">
      <div><SongsTitle title={'Repertoire'} /></div>
      <Repertoire filterSetlist={false} songs={store.allSongs} addSong={store.addSong} setlist={store.setlist} />
    </div >
  );
}

