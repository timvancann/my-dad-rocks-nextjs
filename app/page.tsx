import React from "react";
import Songs from "@/components/Songs";
import SelectedSongContextProvider from "@/context/selected-song-context";
import {Player} from "@/components/Player";
import PlaylistContextProvider from "@/context/playlist-context";
import Setlist from "@/components/Setlist";


export default function Home() {
  return (
    <div className={"flex flex-col mx-auto w-full items-center justify-center"}>
      <SelectedSongContextProvider>
        <PlaylistContextProvider>
          <Player/>
          <Setlist/>
          <Songs/>
        </PlaylistContextProvider>
      </SelectedSongContextProvider>
    </div>
  );
}