"use client";
// import {client} from "@/lib/sanity";
import {usePlaylistContext} from "@/context/playlist-context";
import {SongList} from "@/components/SongCard";
//
// async function getData() {
//   const qry = `
//    *[_type == "setlist" && title == "Practice"]{
//    _id,
//      songs,
//      title
//  }[0]
//   `
//   return await client.fetch(qry);
// }

export default function Setlist() {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"mb-10"}>
      <SongList songs={playlist}/>
    </div>)
}