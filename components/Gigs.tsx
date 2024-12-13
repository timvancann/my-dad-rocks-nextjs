import { GigsType } from '@/lib/interface';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { SongCardDivider } from '@/components/SongCardDivider';
import { GigCard } from '@/components/GigCard';

export default function Gigs({ gigs }: { gigs: GigsType[] }) {
  return (
    <div className={'text-rosePine-text items-center justify-center'}>
      <SongsTitle title={'Optredens'} />
      {gigs.map((gig, index) => {
        return (
          <div key={index}>
            {index > 0 && <SongCardDivider />}
            <GigCard gig={gig} />
          </div>
        );
      })}
    </div>
  );
}
