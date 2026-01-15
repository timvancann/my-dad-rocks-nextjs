'use client';

import { useSongBySlug } from '@/hooks/convex';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DisplayLyrics from '@/components/Lyrics';

export default function LyricsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const songData = useSongBySlug(slug);

  // Loading state
  if (songData === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-4 text-zinc-400">Songtekst laden...</p>
      </div>
    );
  }

  // Not found
  if (songData === null) {
    notFound();
  }

  // Transform for DisplayLyrics component
  const song = {
    id: songData._id,
    title: songData.title,
    artist: songData.artist || '',
    lyrics: songData.lyrics || '',
  };

  return <DisplayLyrics song={song} songId={songData._id} />;
}
