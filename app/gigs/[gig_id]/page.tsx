import {client, getAllSongs} from "@/lib/sanity";
import {GigType, SongType} from "@/lib/interface";
import SelectedSongContextProvider from "@/context/selected-song-context";
import PlaylistContextProvider from "@/context/playlist-context";
import {Player} from "@/components/Player";
import {AllSongs, PlayList} from "@/components/SongList";
import React from "react";
import Gig from "@/components/Gig";

async function getData(id: string) {
  const qry = `
  *[_type == "gig" && _id == "${id}"]|order(data desc){
    _id,
    title,
    date,
    address,
  setlist->{
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
    last_played_at    
  },
  }
}[0]`
  return await client.fetch<GigType>(qry);
}

export default async function Gigs({params}: { params: { gig_id: string } }) {
  const gig = await getData(params.gig_id)
  const songs = await getAllSongs();
  return (
    <div className={"flex flex-col mx-auto items-center justify-center"}>
      <SelectedSongContextProvider>
        <PlaylistContextProvider setlist={gig.setlist}>
          <Player/>
          <Gig gig={gig}/>
          <PlayList/>
          <AllSongs songs={songs}/>
        </PlaylistContextProvider>
      </SelectedSongContextProvider>
    </div>
  );
}
