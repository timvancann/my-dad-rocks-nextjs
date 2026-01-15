'use client';

import GigList from '@/components/GigList';
import { useGigs } from '@/hooks/convex';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { THEME } from '@/themes';
import { GigsType } from '@/lib/interface';

export default function GigsPage() {
  const convexGigs = useGigs();

  // Loading state
  if (convexGigs === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Gigs laden...</p>
      </div>
    );
  }

  // Transform Convex gigs to expected format
  const gigs: GigsType[] = convexGigs.map(gig => ({
    _id: gig._id,
    title: gig.title,
    date: gig.date,
    time: gig.startTime || '',
    venue: gig.venueName || '',
    address: gig.venueAddress || '',
    video_playlist: gig.videoPlaylistUrl || '',
  }));

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gigs</h1>
        <Link
          href="/practice/gigs/new"
          className={`inline-flex items-center gap-2 px-4 py-2 ${THEME.primaryBg} hover:${THEME.primaryBgDark} text-white rounded-md font-medium transition-colors`}
        >
          <Plus className="h-4 w-4" />
          Nieuwe Gig
        </Link>
      </div>
      <GigList gigs={gigs} />
    </div>
  );
}
