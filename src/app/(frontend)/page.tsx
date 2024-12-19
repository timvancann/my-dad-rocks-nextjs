import React from 'react';
import { SetlistType } from '@/lib/interface';
import { getSetlist } from '@/lib/sanity';
import { PracticePage } from '@/components/PracticePage';


export default async function Home() {
  const setlist: SetlistType = await getSetlist('Practice');

  return (
    <PracticePage setlist={setlist} />
  );
}
