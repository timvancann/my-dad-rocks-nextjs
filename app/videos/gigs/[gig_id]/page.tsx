import { getGig } from '@/lib/sanity';
import React from 'react';
import GigVideo from '@/components/GigVideo';

export default async function Video({ params }: { params: { gig_id: string } }) {
  const gig = await getGig(params.gig_id);
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <GigVideo gig={gig} />
    </div>
  );
}
