import React from 'react';
import { Setlist } from '@/components/Setlist';
import { SetlistType } from '@/lib/interface';
import { getSetlist } from '@/lib/sanity';
import { SongsTitle } from '@/components/PlaylistTitle';


export default async function Home() {
  const setlist: SetlistType = await getSetlist('Practice');

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <SongsTitle title={'Oefenlijst'} />
      <Setlist setlist={setlist} />
    </div>
  );
}
