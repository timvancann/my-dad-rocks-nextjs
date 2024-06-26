"use client";

import {SongType} from "@/lib/interface";
import {usePlaylistContext} from "@/context/playlist-context";
import {LayoutGroup, motion, Reorder} from "framer-motion";
import {TrashIcon} from "@sanity/icons";
import {FullDivider} from "@/components/Divider";
import React from "react";
import {SongCard} from "@/components/SongCard";

export const PlayList = () => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"flex flex-col mx-auto text-rosePine-text items-center justify-center p-2"}>
      <PlaylistHeader/>
      <LayoutGroup>
        <Reorder.Group axis={"y"} values={playlist} onReorder={setPlaylist}>
          {playlist.map(item => (
            <Reorder.Item value={item} key={item._id}>
              <SongCard song={item}/>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </LayoutGroup>
      {playlist.length > 0 && <FullDivider/>}
    </div>
  )

}
export const AllSongs = ({songs}: { songs: SongType[] }) => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"flex flex-col mx-auto text-rosePine-text items-center justify-center p-2"}>
      <SongsTitle title={"Overige nummers"}/>
      <LayoutGroup>
        {songs.map((item, index) => (
            (!playlist.includes(item)) &&
            <SongCard song={item} key={index}/>
          )
        )}
      </LayoutGroup>
    </div>
  )
}

const PlaylistHeader = () => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"flex flex-row w-full justify-between mb-3"}>
      <SongsTitle title={"Playlist"}/>
      {playlist.length > 0 && <motion.button
        className={"border border-rosePine-muted/60 rounded-full px-2 flex flex-row items-center justify-center tracking-wide bg-rosePine-highlightMed/50 hover:bg-rosePine-foam hover:text-rosePineDawn-text transition-colors"}
        whileHover={{scale: 1.1,}}
        whileTap={{scale: 0.9,}}
        onClick={() => setPlaylist([])}
      ><TrashIcon className={"h-6 w-6 "}/></motion.button>}
    </div>
  )
}

const SongsTitle = ({title}: { title: string }) => {
  return (
    <h1
      className={"flex text-left self-start uppercase tracking-widest font-light text-xl text-rosePine-gold m-2"}>{title}</h1>
  )
}
