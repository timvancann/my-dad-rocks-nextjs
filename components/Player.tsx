"use client";

import React, {ReactNode} from "react";
import {useSelectedSongContext} from "@/context/selected-song-context";
import {
  MediaController,
  MediaControlBar,
  MediaSeekBackwardButton,
  MediaPlayButton,
  MediaSeekForwardButton,
  MediaTimeRange,
  MediaDurationDisplay,
  MediaTimeDisplay,
} from "media-chrome/react"
import {ArrowUturnLeftIcon, ArrowUturnRightIcon, PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/16/solid";
import {CloseCircleIcon} from "@sanity/icons";
import {usePlaylistContext} from "@/context/playlist-context";


const PropSpan = ({children, slot}: { children: ReactNode, slot: string }) => {
  return (
    <span slot={slot}>
      {children}
    </span>
  )

}
export const Player = () => {
  const {selectedSong, setSelectedSong} = useSelectedSongContext();
  const {playlist, setPlaylist} = usePlaylistContext();

  if (!selectedSong) {
    return <div></div>
  }

  return (
    <MediaController audio
                     className={`sticky top-0 w-[90%] md:w-[60%] bg-gradient-to-b from-rosePine-base to-rosePine-overlay rounded-b-xl drop-shadow-2xl z-20`}>
      <audio
        slot="media"
        src={selectedSong.audio.asset.url}
        autoPlay
        onEnded={() => {
          // select next song in playlist if current is in playlist
          const currentIndex = playlist.findIndex(song => song.title === selectedSong.title);
          if (currentIndex === -1) {
            return;
          }
          const nextIndex = (currentIndex + 1) % playlist.length;
          setSelectedSong(playlist[nextIndex]);
        }}
      ></audio>
      <MediaControlBar className={`block `}>
        <div className={`flex flex-col gap-2`}>
          <div className={"flex flex-row items-center justify-center"}>
            <MediaTimeDisplay
              className={"text-rosePine-gold bg-transparent text-xs tracking-widest"}></MediaTimeDisplay>
            <MediaTimeRange className={`grow bg-transparent`}></MediaTimeRange>
            <MediaDurationDisplay
              className={`text-rosePine-gold bg-transparent text-xs tracking-widest`}></MediaDurationDisplay>
          </div>
          <div
            className={"flex text-center text-rosePine-gold justify-center items-center tracking-widest font-light"}>{selectedSong.title}</div>
          <div className={"flex flex-row items-center justify-center space-x-5"}>
            <MediaSeekBackwardButton className={"bg-transparent"}>
              <PropSpan slot={"icon"}> <ArrowUturnLeftIcon className={"w-10 h-10 p-1"}/></PropSpan>
            </MediaSeekBackwardButton>
            <MediaPlayButton className={"bg-transparent"}>
              <PropSpan slot={"play"}><PlayCircleIcon className={"w-20 h-20"}/></PropSpan>
              <PropSpan slot={"pause"}><PauseCircleIcon className={"w-20 h-20"}/></PropSpan>
            </MediaPlayButton>
            <MediaSeekForwardButton className={"bg-transparent"}>
              <PropSpan slot={"icon"}> <ArrowUturnRightIcon className={"w-10 h-10 p-1"}/></PropSpan>
            </MediaSeekForwardButton>
          </div>
          <button className={"absolute flex right-2 bottom-2"}
                  onClick={() => setSelectedSong(null)}
          ><CloseCircleIcon className={"w-8 h-8"}/></button>
        </div>
      </MediaControlBar>
    </MediaController>
  )
}
