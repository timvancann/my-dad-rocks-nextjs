"use client";

import React from "react";
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
import {ArrowUturnLeftIcon, PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/16/solid";

export const Player = () => {
  const {selectedSong} = useSelectedSongContext()

  if (!selectedSong) {
    return <div>No song selected</div>
  }

  return (
    <MediaController audio className={`sticky top-0 backdrop-blur-lg my-4 grow w-[90%] md:w-[60%] bg-transparent bg-gradient-to-b from-rosePine-base to-rosePine-overlay rounded-xl drop-shadow-2xl`}>
      <div className={"flex text-center text-rosePine-gold justify-center items-center tracking-widest font-light"}>{selectedSong.title}</div>
      <audio
        slot="media"
        src={selectedSong.audio.asset.url}
      ></audio>
      <MediaControlBar className={`block`}>
        <div className={`flex flex-col `}>
          <div className={"flex flex-row items-center justify-center"}>
            <MediaTimeDisplay className={"text-rosePine-gold bg-transparent text-xs tracking-widest"}></MediaTimeDisplay>
            <MediaTimeRange className={`grow bg-transparent`}></MediaTimeRange>
            <MediaDurationDisplay className={`text-rosePine-gold bg-transparent text-xs tracking-widest`}></MediaDurationDisplay>
          </div>
          <div className={"flex flex-row items-center justify-center space-x-5"}>
            <MediaSeekBackwardButton className={"bg-transparent"}><ArrowUturnLeftIcon slot={"icon"} className={"w-10 h-10 p-1"}/></MediaSeekBackwardButton>
            <MediaPlayButton className={"bg-transparent"}>
              <PlayCircleIcon slot={"play"} className={"w-20 h-20"}/>
              <PauseCircleIcon slot={"pause"} className={"w-20 h-20"}/>
            </MediaPlayButton>
            <MediaSeekForwardButton className={"bg-transparent"}></MediaSeekForwardButton>
          </div>
        </div>
      </MediaControlBar>
    </MediaController>
  )
}
