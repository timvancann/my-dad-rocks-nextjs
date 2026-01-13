'use client';

import { useGig } from '@/hooks/convex';
import GigVideo from '@/components/GigVideo';
import { notFound } from 'next/navigation';
import { use } from 'react';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';

export default function Video(props: { params: Promise<{ gig_id: string }> }) {
  const params = use(props.params);

  const gig = useGig(params.gig_id as Id<"gigs">);

  // Loading state
  if (gig === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Loading gig...</p>
      </div>
    );
  }

  // Not found
  if (gig === null) {
    notFound();
  }

  // Check if video playlist exists
  if (!gig.videoPlaylistUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-400">No video playlist available for this gig.</p>
      </div>
    );
  }

  return (
    <div className={'flex flex-col items-center justify-center'}>
      <h1 className="text-2xl font-bold mb-2">{gig.title}</h1>
      <p className="text-zinc-400 mb-4">{gig.date}</p>
      <GigVideo videoPlaylistUrl={gig.videoPlaylistUrl} />
    </div>
  );
}
