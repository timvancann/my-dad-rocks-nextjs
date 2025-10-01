import { getSongWithStatsBySlug } from '@/actions/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { THEME } from '@/themes';
import { Calendar, Clock, Guitar, Hash, Mic, Music, Star, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SongDetailsClient } from '@/components/SongDetailsClient';

function SongSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-12 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <div className="grid gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}


async function SongDetails({ slug }: { slug: string }) {
  const result = await getSongWithStatsBySlug(slug);
  
  if (!result) {
    notFound();
  }

  return <SongDetailsClient song={result.song} stats={result.stats} audioCues={result.audioCues || []} id={result.song._id} />;
}

async function SongPageWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<SongSkeleton />}>
      <SongDetails slug={slug} />
    </Suspense>
  );
}

export default SongPageWrapper;
