'use client';

import { useSongBySlug } from '@/hooks/convex';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StemUploader } from '@/components/StemUploader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

function UploadSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-32 mb-6" />
      <Skeleton className="h-12 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function StemUpload({ slug }: { slug: string }) {
  const song = useSongBySlug(slug);

  // Loading state
  if (song === undefined) {
    return <UploadSkeleton />;
  }

  // Not found
  if (song === null) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/practice/song/${slug}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Link href={`/practice/song/${slug}/stems`}>
          <Button variant="outline">
            <Headphones className="h-4 w-4 mr-2" />
            Go to Stem Player
          </Button>
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Stems</h1>
        <p className="text-gray-400">
          Upload individual instrument tracks for <span className="font-semibold">{song.title}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Use tools like Moises to separate your track into individual stems (vocals, drums, bass, guitar, etc.)
        </p>
      </div>

      {/* Uploader */}
      <StemUploader songId={song._id} songSlug={slug} />
    </div>
  );
}

export default function StemUploadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return <StemUpload slug={slug} />;
}
