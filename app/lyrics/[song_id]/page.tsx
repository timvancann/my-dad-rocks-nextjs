import { getLyrics } from "@/lib/sanity";
import DisplayLyrics from "@/components/Lyrics";


export default async function Lyrics({ params }: { params: { song_id: string } }) {
  const song = await getLyrics(params.song_id)

  return <DisplayLyrics song={song} songId={params.song_id} />
}
