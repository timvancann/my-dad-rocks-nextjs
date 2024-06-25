import React from "react";
import Songs from "@/components/Songs";
import SelectedSongContextProvider from "@/context/selected-song-context";
import {Player} from "@/components/Player";


export default function Home() {
  return (
    <div className={"flex flex-col mx-auto w-full items-center justify-center"}>
      <SelectedSongContextProvider>
        <Player/>
        <Songs/>
      </SelectedSongContextProvider>
    </div>
  );
}