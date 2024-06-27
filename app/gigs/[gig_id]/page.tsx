import {getAllSongs, getGig} from "@/lib/sanity";
import SelectedSongContextProvider from "@/context/selected-song-context";
import PlaylistContextProvider from "@/context/playlist-context";
import {Player} from "@/components/Player";
import {AllSongs, PlayList} from "@/components/SongList";
import React from "react";
import Gig from "@/components/Gig";


export default async function Gigs({params}: { params: { gig_id: string } }) {
  const gig = await getGig(params.gig_id)
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
