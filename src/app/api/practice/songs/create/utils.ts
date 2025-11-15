import { randomUUID } from 'crypto';

export type StorageBucket = 'artwork' | 'songs';
export type SongUploadKind = 'coverArt' | 'audio';

export function resolveExtension({
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

export function createObjectPath(slug: string, extension: string) {
  const normalizedSlug = slug || 'song';
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : randomUUID();
  const fileName = `${normalizedSlug}-${uuid}.${extension}`;
  return {
    fileName,
    objectPath: `songs/${fileName}`
  };
}
