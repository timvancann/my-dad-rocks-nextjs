import React from "react";
import SelectedSongContextProvider from "@/context/selected-song-context";
import { Player } from "@/components/Player";
import PlaylistContextProvider from "@/context/playlist-context";
import { PlayList } from "@/components/Playlist";
import { SetlistType, SongType } from "@/lib/interface";
import { getAllSongs, getSetlist } from "@/lib/sanity";
import { AllSongs } from "@/components/AllSongs";

export default async function Home() {
  const songs: SongType[] = await getAllSongs();
  const setlist: SetlistType = await getSetlist("Practice");

  return (
    <div
      className="flex flex-col items-center justify-center">
      <SelectedSongContextProvider>
        <PlaylistContextProvider setlist={setlist} songs={songs}>
          <Player />
          <PlayList />
          <AllSongs songs={songs} />
        </PlaylistContextProvider>
      </SelectedSongContextProvider>
    </div>
  );
}
