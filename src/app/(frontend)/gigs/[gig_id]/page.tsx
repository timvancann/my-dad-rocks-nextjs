import { getAllSongs, getGig } from '@/lib/sanity';
import React from 'react';
import { Gig } from '@/components/Gig';

export default async function Page(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  const gig = await getGig(params.gig_id);
  const songs = await getAllSongs();

  return <Gig gig={gig} songs={songs} />;
}
