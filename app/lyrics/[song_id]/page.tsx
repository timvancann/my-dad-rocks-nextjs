import {PortableText} from "@portabletext/react";
import {getLyrics} from "@/actions/sanity";


export default async function Lyrics({params}: { params: { song_id: string } }) {
  const song = await getLyrics(params.song_id)
  return <div className={"justify-center items-center flex flex-col my-4"}>
    <h1 className={"flex text-lg tracking-widest font-bold text-rosePine-text"}>{song.artist} - {song.title}</h1>
    <div className={"text-rosePine-text mt-4 mx-4"}>

      <PortableText value={song.lyrics}/>
    </div>
  </div>
}