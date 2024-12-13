import React from 'react';
import Gigs from '@/components/Gigs';
import { getGigs } from '@/lib/sanity';

export default async function Home() {
  const data = await getGigs();

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <Gigs gigs={data} />
    </div>
  );
}
