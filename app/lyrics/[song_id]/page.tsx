import {client} from "@/lib/sanity";
import {PortableText} from "@portabletext/react";

async function getData(id: string) {
  const qry = `
*[_type == "song" && _id == "${id}"][0]{
  title, artist, lyrics
  }`
  return await client.fetch(qry);
}

type LyricType = {
  title: string,
  artist: string,
  lyrics?: any
}
export default async function Lyrics({params}: { params: { song_id: string } }) {
  const song: LyricType = await getData(params.song_id)
  return <div className={"justify-center items-center flex flex-col my-4"}>
    <h1 className={"flex text-lg tracking-widest font-bold text-rosePine-text"}>{song.artist} - {song.title}</h1>
    <div className={"text-rosePine-text mt-4 mx-4"}>

      <PortableText value={song.lyrics}/>
    </div>
  </div>
}