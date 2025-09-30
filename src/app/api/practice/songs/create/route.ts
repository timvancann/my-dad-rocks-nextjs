import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/supabase-service';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

if (!serviceRoleKey) {
  throw new Error('NEXT_PRIVATE_SUPABASE_SERVICE_KEY is not configured');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

type UploadedAsset = {
  bucket: 'artwork' | 'songs';
  path: string;
  publicUrl: string;
};

async function uploadToBucket(file: File, bucket: 'artwork' | 'songs', slug: string): Promise<UploadedAsset> {
  const extension = file.name.split('.').pop()?.toLowerCase() || file.type.split('/').pop() || 'bin';
  const fileName = `${slug || 'song'}-${randomUUID()}.${extension}`;
  const objectPath = `songs/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });

  if (error) {
    throw new Error(`Upload to ${bucket} bucket failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  if (!data?.publicUrl) {
    throw new Error('Kon geen publieke URL genereren voor het geüploade bestand');
  }

  return {
    bucket,
    path: objectPath,
    publicUrl: data.publicUrl
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title')?.toString().trim();
  const artist = formData.get('artist')?.toString().trim();
  const durationValue = formData.get('duration_seconds')?.toString();
  const coverArt = formData.get('coverArt');
  const audioFile = formData.get('audioFile');

  if (!title || !artist) {
    return NextResponse.json({ error: 'Titel en artiest zijn verplicht' }, { status: 400 });
  }

  const slugBase = generateSlug(title);
  const uploadedAssets: UploadedAsset[] = [];

  try {
    let artworkUrl: string | undefined;
    let audioUrl: string | undefined;

    if (coverArt instanceof File && coverArt.size > 0) {
      const asset = await uploadToBucket(coverArt, 'artwork', slugBase);
      uploadedAssets.push(asset);
      artworkUrl = asset.publicUrl;
    }

    if (audioFile instanceof File && audioFile.size > 0) {
      const asset = await uploadToBucket(audioFile, 'songs', slugBase);
      uploadedAssets.push(asset);
      audioUrl = asset.publicUrl;
    }

    const durationSeconds = durationValue ? Number(durationValue) : undefined;

    const { createSong } = await import('@/lib/supabase-service');
    const newSong = await createSong({
      title,
      artist,
      artwork_url: artworkUrl,
      audio_url: audioUrl,
      duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined
    });

    return NextResponse.json({ song: newSong });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onbekende fout';

    if (uploadedAssets.length) {
      await Promise.all(
        uploadedAssets.map(asset => supabase.storage.from(asset.bucket).remove([asset.path]))
      ).catch(() => {});
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
