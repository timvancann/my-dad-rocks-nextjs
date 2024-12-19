import { getGig } from '@/lib/sanity';
import React from 'react';
import GigVideo from '@/components/GigVideo';

export default async function Video(props: { params: Promise<{ gig_id: string }> }) {
  const params = await props.params;
  const gig = await getGig(params.gig_id);
  return (
    <div className={'flex flex-col items-center justify-center'}>
      <GigVideo gig={gig} />
    </div>
  );
}
