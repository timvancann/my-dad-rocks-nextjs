import { NextResponse } from 'next/server';
import { searchSpotifyTracks } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const title = typeof payload?.title === 'string' ? payload.title : undefined;
    const artist = typeof payload?.artist === 'string' ? payload.artist : undefined;

    const results = await searchSpotifyTracks({ title, artist });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onbekende fout';
    const status = /credentials/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
