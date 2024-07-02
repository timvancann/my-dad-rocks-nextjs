"use client";

import {SongType} from "@/lib/interface";
import {usePlaylistContext} from "@/context/playlist-context";
import {LayoutGroup} from "framer-motion";
import {SongCard} from "@/components/SongCard";
import React from "react";
import {SongsTitle} from "@/components/PlaylistTitle";

export const AllSongs = ({songs}: { songs: SongType[] }) => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"text-rosePine-text items-center justify-center p-2"}>
      <SongsTitle title={"Overige nummers"}/>
      <LayoutGroup>
        {songs.map((item, index) => (
            (!playlist.map(s => s._id).includes(item._id)) &&
            <SongCard song={item} key={index}/>
          )
        )}
      </LayoutGroup>
    </div>
  )
}

