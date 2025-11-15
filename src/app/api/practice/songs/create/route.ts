import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/slug';
import { createObjectPath, resolveExtension, SongUploadKind, StorageBucket } from './utils';

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
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  kind?: SongUploadKind;
};

type ClientUploadedAsset = {
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  kind: SongUploadKind;
};

type CreateSongJsonPayload = {
  title?: string;
  artist?: string;
  duration_seconds?: number;
  spotifyImageUrl?: string;
  uploadedAssets?: ClientUploadedAsset[];
};

type StorageCleanupTarget = Pick<UploadedAsset, 'bucket' | 'path'>;

function groupCleanupTargets(targets: StorageCleanupTarget[]) {
  return targets.reduce<Record<StorageBucket, string[]>>(
    (acc, target) => {
      acc[target.bucket].push(target.path);
      return acc;
    },
    { artwork: [], songs: [] }
  );
}

async function cleanupUploadedAssets(targets: StorageCleanupTarget[]) {
  if (!targets.length) {
    return;
  }

  const grouped = groupCleanupTargets(targets);

  await Promise.all(
    (Object.entries(grouped) as [StorageBucket, string[]][])
      .filter(([, paths]) => paths.length > 0)
      .map(async ([bucket, paths]) => {
        await supabase.storage.from(bucket).remove(paths);
      })
  );
}

async function uploadBufferToBucket(
  buffer: Buffer,
  bucket: StorageBucket,
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

async function uploadFileToBucket(file: File, bucket: StorageBucket, slug: string): Promise<UploadedAsset> {
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

async function handleMultipartRequest(request: Request) {
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

    await cleanupUploadedAssets(uploadedAssets);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleJsonRequest(request: Request) {
  let payload: CreateSongJsonPayload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Ongeldige JSON payload' }, { status: 400 });
  }

  const title = payload.title?.toString().trim();
  const artist = payload.artist?.toString().trim();

  if (!title || !artist) {
    return NextResponse.json({ error: 'Titel en artiest zijn verplicht' }, { status: 400 });
  }

  const durationSeconds = typeof payload.duration_seconds === 'number'
    ? payload.duration_seconds
    : Number(payload.duration_seconds ?? undefined);

  const slugBase = generateSlug(title);
  const uploadedAssets = Array.isArray(payload.uploadedAssets) ? payload.uploadedAssets : [];
  const cleanupTargets: StorageCleanupTarget[] = uploadedAssets.map(asset => ({ bucket: asset.bucket, path: asset.path }));

  let artworkUrl = uploadedAssets.find(asset => asset.kind === 'coverArt')?.publicUrl;
  let audioUrl = uploadedAssets.find(asset => asset.kind === 'audio')?.publicUrl;

  try {
    if (!artworkUrl && payload.spotifyImageUrl) {
      const asset = await uploadRemoteImageToBucket(payload.spotifyImageUrl, slugBase);
      cleanupTargets.push({ bucket: asset.bucket, path: asset.path });
      artworkUrl = asset.publicUrl;
    }

    const { createSong } = await import('@/lib/supabase-service');
    const newSong = await createSong({
      title,
      artist,
      artwork_url: artworkUrl,
      audio_url: audioUrl,
      duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined
    });

    return NextResponse.json({ song: newSong });
  } catch (error) {
    await cleanupUploadedAssets(cleanupTargets);
    const message = error instanceof Error ? error.message : 'Onbekende fout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('multipart/form-data')) {
    return handleMultipartRequest(request);
  }

  return handleJsonRequest(request);
}
