import React from 'react';
import { SetlistType, SongType } from '@/lib/interface';
import { getAllSongs, getSetlist } from '@/lib/sanity';
import { RepertoirePage } from '@/components/RepertoirePage';

export default async function Home() {
  const songs: SongType[] = await getAllSongs();
  const setlist: SetlistType = await getSetlist('Practice');

  return (
    <RepertoirePage songs={songs} setlist={setlist} />
  );
}

