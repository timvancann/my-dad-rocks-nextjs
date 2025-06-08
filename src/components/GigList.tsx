'use client';
import { GigCard } from '@/components/GigCard';
import { GigsType } from '@/lib/interface';
import { THEME } from '@/themes';
import React from 'react';

export default function GigList({ gigs }: { gigs: GigsType[] }) {
  const [edit, setEdit] = React.useState(false);

  const upcomingGigs = gigs.filter((gig) => new Date(gig.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastGigs = gigs.filter((gig) => new Date(gig.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className={''}>
      <div className="mb-8">
        <h2 className={`text-lg font-bold ${THEME.secondary} mb-4 uppercase tracking-wider`}>Komende Gigs</h2>

        <div className="space-y-3">
          {upcomingGigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      </div>
      <div>
        <h2 className={`mb-4 text-lg font-bold uppercase tracking-wider text-gray-500`}>Afgelopen Gigs</h2>
        <div className="space-y-3">
          {pastGigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      </div>
    </div>
  );
}
