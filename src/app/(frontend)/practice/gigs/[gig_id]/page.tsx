'use client';

import { Gig } from '@/components/Gig';
import { useGig } from '@/hooks/convex';
import { useParams, notFound } from 'next/navigation';
import { GigType, SongType, SetlistType } from '@/lib/interface';
import { Loader2 } from 'lucide-react';
import type { Id } from '../../../../../../convex/_generated/dataModel';

// Transform Convex song to SongType
function transformSong(song: any): SongType {
  return {
    _id: song._id,
    title: song.title,
    artist: song.artist,
    slug: song.slug,
    artwork: song.artworkUrl || '',
    artworkUrl: song.artworkUrl,
    audio: song.audioUrl,
    audioUrl: song.audioUrl,
    dualGuitar: song.dualGuitar ?? false,
    dualVocal: song.dualVocal ?? false,
    canPlayWithoutSinger: song.canPlayWithoutSinger ?? false,
    duration: song.durationSeconds ?? 0,
    durationSeconds: song.durationSeconds,
    notes: song.notes,
    timesPlayed: song.timesPlayed,
    timesPracticed: song.timesPracticed,
    masteryLevel: song.masteryLevel,
  };
}

export default function GigPage() {
  const params = useParams();
  const gigId = params.gig_id as string;

  const convexGig = useGig(gigId as Id<'gigs'>);

  // Loading state
  if (convexGig === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Gig laden...</p>
      </div>
    );
  }

  // Not found
  if (convexGig === null) {
    notFound();
  }

  // Transform Convex setlist to SetlistType
  const setlistItems = convexGig.setlist?.items || [];
  const setlistSongs = setlistItems
    .filter((item: any) => item.song && item.itemType === 'song')
    .map((item: any) => transformSong(item.song));

  const setlist: SetlistType = {
    _id: convexGig.setlist?._id || '',
    title: convexGig.setlist?.title || '',
    songs: setlistSongs,
  };

  // Transform Convex gig to GigType
  const gig: GigType = {
    _id: convexGig._id,
    title: convexGig.title,
    date: convexGig.date,
    time: convexGig.startTime || '',
    venue: convexGig.venueName || '',
    address: convexGig.venueAddress || '',
    video_playlist: convexGig.videoPlaylistUrl || '',
    setlist,
  };

  return <Gig gig={gig} />;
}
