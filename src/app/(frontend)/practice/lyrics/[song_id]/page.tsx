import { getLyrics } from '@/actions/supabase';
import DisplayLyrics from '@/components/Lyrics';
import { notFound } from 'next/navigation';

export default async function Lyrics(props: { params: Promise<{ song_id: string }> }) {
  const params = await props.params;
  const song = await getLyrics(params.song_id);

  if (!song) {
    notFound();
  }

  return <DisplayLyrics song={song} songId={params.song_id} />;
}
