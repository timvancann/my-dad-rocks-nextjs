'use client';

import { useSongWithDetails } from '@/hooks/convex';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StemPlayerControls } from '@/components/StemPlayerControls';
import type { Stem } from '@/types/stems';
import { use } from 'react';

function StemPlayerSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-32 mb-6" />
      <Skeleton className="h-12 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <div className="grid gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function StemPlayer({ slug }: { slug: string }) {
  const result = useSongWithDetails(slug);

  // Loading state
  if (result === undefined) {
    return <StemPlayerSkeleton />;
  }

  // Not found
  if (result === null) {
    notFound();
  }

  const song = result;
  const audioCues = result.audioCues;

  // Convert audio cues to stems
  const stems: Stem[] = (audioCues || []).map((cue) => ({
    id: cue._id,
    title: cue.title,
    url: cue.cueUrl || '',
    duration: cue.durationSeconds ?? null,
    description: cue.description ?? null,
    sortOrder: cue.sortOrder ?? 0,
  }));

  return (
    <div className="container mx-auto p-0 max-w-4xl">
      {/* Stem Player */}
      <StemPlayerControls
        stems={stems}
        songTitle={song.title}
        artworkUrl={song.artworkUrl ?? undefined}
        slug={slug}
      />
    </div>
  );
}

export default function StemPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return <StemPlayer slug={slug} />;
}
