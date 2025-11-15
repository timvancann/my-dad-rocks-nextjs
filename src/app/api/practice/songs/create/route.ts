import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/supabase-service';

export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum execution time in seconds

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

function resolveExtension({
  fileName,
  contentType,
  fallback
}: {
  fileName?: string | null;
  contentType?: string | null;
  fallback: string;
}): string {
  const fromName = fileName?.split('.')?.pop()?.toLowerCase();
  if (fromName) {
    return fromName;
  }

  const type = contentType?.toLowerCase() ?? '';
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  if (type.includes('bmp')) return 'bmp';
  if (type.includes('svg')) return 'svg';
  if (type.includes('avif')) return 'avif';
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  if (type.includes('mpeg')) return 'mp3';
  if (type.includes('mp3')) return 'mp3';
  if (type.includes('wav')) return 'wav';
  if (type.includes('flac')) return 'flac';
  if (type.includes('ogg')) return 'ogg';
  if (type.includes('aac')) return 'aac';
  if (type.includes('aiff')) return 'aiff';

  return fallback;
}

function createObjectPath(slug: string, extension: string) {
  const normalizedSlug = slug || 'song';
  const fileName = `${normalizedSlug}-${randomUUID()}.${extension}`;
  return {
    fileName,
    objectPath: `songs/${fileName}`
  };
}

async function uploadBufferToBucket(
  buffer: Buffer,
  bucket: 'artwork' | 'songs',
  slug: string,
  contentType: string,
  extension: string
): Promise<UploadedAsset> {
  const { objectPath } = createObjectPath(slug, extension);

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    cacheControl: '3600',
    upsert: false,
    contentType
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

async function uploadFileToBucket(file: File, bucket: 'artwork' | 'songs', slug: string): Promise<UploadedAsset> {
  const extension = resolveExtension({ fileName: file.name, contentType: file.type, fallback: bucket === 'artwork' ? 'jpg' : 'bin' });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadBufferToBucket(buffer, bucket, slug, file.type || 'application/octet-stream', extension);
}

async function uploadRemoteImageToBucket(url: string, slug: string): Promise<UploadedAsset> {
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify artwork download mislukt: ${response.status} ${text}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let fileName: string | undefined;
  try {
    const remoteUrl = new URL(url);
    fileName = remoteUrl.pathname.split('/').pop() ?? undefined;
  } catch (error) {
    fileName = undefined;
  }

  const extension = resolveExtension({ fileName, contentType, fallback: 'jpg' });

  return uploadBufferToBucket(buffer, 'artwork', slug, contentType, extension);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title')?.toString().trim();
  const artist = formData.get('artist')?.toString().trim();
  const durationValue = formData.get('duration_seconds')?.toString();
  const coverArt = formData.get('coverArt');
  const audioFile = formData.get('audioFile');
  const spotifyImageUrl = formData.get('spotifyImageUrl')?.toString();

  if (!title || !artist) {
    return NextResponse.json({ error: 'Titel en artiest zijn verplicht' }, { status: 400 });
  }

  const slugBase = generateSlug(title);
  const uploadedAssets: UploadedAsset[] = [];

  try {
    let artworkUrl: string | undefined;
    let audioUrl: string | undefined;

    if (coverArt instanceof File && coverArt.size > 0) {
      const asset = await uploadFileToBucket(coverArt, 'artwork', slugBase);
      uploadedAssets.push(asset);
      artworkUrl = asset.publicUrl;
    }

    if (!artworkUrl && spotifyImageUrl) {
      const asset = await uploadRemoteImageToBucket(spotifyImageUrl, slugBase);
      uploadedAssets.push(asset);
      artworkUrl = asset.publicUrl;
    }

    if (audioFile instanceof File && audioFile.size > 0) {
      const asset = await uploadFileToBucket(audioFile, 'songs', slugBase);
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
