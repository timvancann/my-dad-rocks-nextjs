import { getSongWithStatsBySlug } from '@/actions/supabase';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StemPlayerControls } from '@/components/StemPlayerControls';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Stem } from '@/types/stems';

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

async function StemPlayer({ slug }: { slug: string }) {
  const result = await getSongWithStatsBySlug(slug);

  if (!result) {
    notFound();
  }

  const { song, audioCues } = result;

  // Convert audio cues to stems
  const stems: Stem[] = audioCues.map((cue) => ({
    id: cue.id,
    title: cue.title,
    url: cue.cue_url,
    duration: cue.duration_seconds,
    description: cue.description,
    sortOrder: cue.sort_order ?? 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link href={`/practice/song/${slug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Song Details
        </Button>
      </Link>

      {/* Stem Player */}
      <StemPlayerControls stems={stems} songTitle={song.title} />
    </div>
  );
}

async function StemPlayerPageWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <Suspense fallback={<StemPlayerSkeleton />}>
      <StemPlayer slug={slug} />
    </Suspense>
  );
}

export default StemPlayerPageWrapper;
