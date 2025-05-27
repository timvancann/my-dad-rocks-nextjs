import { getLyricsBySlug } from '@/actions/supabase';
import DisplayLyrics from '@/components/Lyrics';
import { notFound } from 'next/navigation';

export default async function Lyrics(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const song = await getLyricsBySlug(params.slug);

  if (!song) {
    notFound();
  }

  return <DisplayLyrics song={song} songId={song.id} />;
}
