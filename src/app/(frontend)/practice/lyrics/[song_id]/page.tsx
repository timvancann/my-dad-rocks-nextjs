import DisplayLyrics from '@/components/Lyrics';
import { getLyrics } from '@/lib/sanity';

export default async function Lyrics(props: { params: Promise<{ song_id: string }> }) {
  const params = await props.params;
  const song = await getLyrics(params.song_id);

  return <DisplayLyrics song={song} songId={params.song_id} />;
}
