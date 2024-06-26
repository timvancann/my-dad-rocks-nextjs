import React, {Suspense} from "react";
import SelectedSongContextProvider from "@/context/selected-song-context";
import {Player} from "@/components/Player";
import PlaylistContextProvider from "@/context/playlist-context";
import {AllSongs, PlayList} from "@/components/SongList";
import {SetlistType, SongType} from "@/lib/interface";
import {getAllSongs, getSetlist} from "@/lib/sanity";

export default async function Home() {
  const data: SongType[] = await getAllSongs();
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