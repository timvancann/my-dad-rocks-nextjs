import { getAllSongs, getGig } from '@/lib/sanity';
import React from 'react';
import { Gig } from '@/components/Gig';

export default async function Page({ params }: { params: { gig_id: string } }) {
  const gig = await getGig(params.gig_id);
  const songs = await getAllSongs();

  return <Gig gig={gig} songs={songs} />;
}
