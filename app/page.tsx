import React from "react";
import SelectedSongContextProvider from "@/context/selected-song-context";
import {Player} from "@/components/Player";
import PlaylistContextProvider from "@/context/playlist-context";
import {client} from "@/lib/sanity";
import {SongType} from "@/lib/interface";
import {AllSongs, PlayList} from "@/components/SongList";
import SongData from "@/components/SongData";


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
  return await client.fetch(qry);
}

export default async function Home() {
  const data = await getData();

  return (
    <div className={"flex flex-col mx-auto  items-center justify-center"}>
      <SelectedSongContextProvider>
        <PlaylistContextProvider>
          <Player/>
          <PlayList/>
          <AllSongs songs={data}/>
        </PlaylistContextProvider>
      </SelectedSongContextProvider>
    </div>
  );
}