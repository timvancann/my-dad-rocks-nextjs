import { GigsType } from '@/lib/interface';
import React from 'react';
import { SongsTitle } from '@/components/PlaylistTitle';
import { Divider } from '@/components/Divider';
import { GigCard } from '@/components/GigCard';

export default function GigList({ gigs }: { gigs: GigsType[] }) {
  return (
    <div className={'text-rosePine-text items-center justify-center'}>
      <SongsTitle title={'Optredens'} />
      {gigs.map((gig, index) => {
        return (
          <div key={index}>
            {index > 0 && <Divider />}
            <GigCard gig={gig} />
          </div>
        );
      })}
    </div>
  );
}
