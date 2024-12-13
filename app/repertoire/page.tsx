import React from 'react';
import { SetlistType, SongType } from '@/lib/interface';
import { getAllSongs, getSetlist } from '@/lib/sanity';
import { AllSongs } from '@/components/AllSongs';

export default async function Home() {
  const songs: SongType[] = await getAllSongs();
  const setlist: SetlistType = await getSetlist('Practice');

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <AllSongs songs={songs} setlist={setlist} />
    </div>
  );
}
