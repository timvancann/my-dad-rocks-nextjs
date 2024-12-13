import { GigCard } from '@/components/GigCard';
import { EditIcon } from '@sanity/icons';
import { Setlist } from '@/components/Setlist';
import { AddPause } from '@/components/AddPause';
import { AllSongs } from '@/components/AllSongs';
import React from 'react';
import { GigType, SongType } from '@/lib/interface';

type GigProps = {
  gig: GigType;
  songs: SongType[];
}
export const Gig = ({ gig, songs }: GigProps) => {
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <div className={'flex w-full px-4 justify-between'}>
        <GigCard gig={gig} />
        <button className={'bg-rosePine-highlightLow rounded-xl p-2 m-2'}>
          <EditIcon />
        </button>
      </div>
      <Setlist setlist={gig.setlist} />
      <AddPause gigId={gig._id} />
      <AllSongs songs={songs} setlist={gig.setlist} />
    </div>
  );
};
