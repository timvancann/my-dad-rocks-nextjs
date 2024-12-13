import { getAllSongs, getGig } from '@/lib/sanity';
import { Player } from '@/components/Player';
import React from 'react';
import Gig from '@/components/Gig';

export default async function Gigs({ params }: { params: { gig_id: string } }) {
  const gig = await getGig(params.gig_id);
  const songs = await getAllSongs();
  return (
    <div className={'flex flex-col mx-auto items-center justify-center'}>
          <Player />
          <Gig gig={gig} />
          {/*<PlayList />*/}
          {/*<AddPause gigId={gig._id} />*/}
          {/*<AllSongs songs={songs} />*/}
    </div>
  );
}
