'use client';

import { useGigs } from '@/hooks/convex';
import { Loader2 } from 'lucide-react';

export default function VideosPage() {
  const gigs = useGigs();

  if (gigs === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Loading gigs...</p>
      </div>
    );
  }

  return (
    <div className={'mx-auto flex flex-col items-center justify-center'}>
      {(gigs || [])
        .filter((gig) => (gig as any).videoPlaylist !== null)
        .map((gig) => {
          return (
            <a key={gig._id} href={`/practice/videos/gigs/${gig._id}`} className={'mx-auto my-4'}>
              <h1>{gig.title}</h1>
              <h2>{gig.date}</h2>
            </a>
          );
        })}
    </div>
  );
}
