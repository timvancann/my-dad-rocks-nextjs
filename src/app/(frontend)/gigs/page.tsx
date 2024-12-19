import React from 'react';
import GigList from '@/components/GigList';
import { getGigs } from '@/lib/sanity';

export default async function Home() {
  const data = await getGigs();

  return (
    <div className="md:flex md:flex-col items-center justify-center">
      <GigList gigs={data} />
    </div>
  );
}
