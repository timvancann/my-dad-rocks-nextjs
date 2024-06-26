import React from "react";
import SelectedSongContextProvider from "@/context/selected-song-context";
import {Player} from "@/components/Player";
import PlaylistContextProvider from "@/context/playlist-context";
import {client} from "@/lib/sanity";
import {AllSongs, PlayList} from "@/components/SongList";
import {SetlistType, SongType} from "@/lib/interface";


async function getData() {
  const qry = `
  *[_type == "song"]|order(title){
    _id,
    title,
    artist,
    cover_art,
    audio{
      asset->{
      _id,
      url
    }},
    last_played_at
  }`
  return await client.fetch<SongType[]>(qry);
}

async function getSetlist(title: string) {
  const qry = `
   *[_type == "setlist" && title == "${title}"]{
   _id,
     title,
    "songs": songs[]->{ 
    _id,
    title,
    artist,
    cover_art,
    audio{
      asset->{
      _id,
      url
    }},
    last_played_at    },
 }[0]
  `;
  return await client.fetch<SetlistType>(qry);
}

export default async function Home() {
  const data: SongType[] = await getData();
  const setlist: SetlistType = await getSetlist("Practice");

  return (
    <div className={"flex flex-col mx-auto  items-center justify-center"}>
      <SelectedSongContextProvider>
        <PlaylistContextProvider setlist={setlist}>
          <Player/>
          <PlayList/>
          <AllSongs songs={data}/>
        </PlaylistContextProvider>
      </SelectedSongContextProvider>
    </div>
  );
}