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
import IntrinsicAttributes = React.JSX.IntrinsicAttributes;


const PropSpan = ({children, slot}: { children: ReactNode, slot: string }) => {
  return (
    <span slot={slot}>
      {children}
    </span>
  )

}
export const Player = () => {
  const {selectedSong} = useSelectedSongContext()

  if (!selectedSong) {
    return <div>No song selected</div>
  }

  return (
    <MediaController audio
                     className={`sticky top-0 backdrop-blur-lg my-4 grow w-[90%] md:w-[60%] bg-transparent bg-gradient-to-b from-rosePine-base to-rosePine-overlay rounded-xl drop-shadow-2xl z-20`}>
      <audio
        slot="media"
        src={selectedSong.audio.asset.url}
        autoPlay
      ></audio>
      <MediaControlBar className={`block`}>
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
        </div>
      </MediaControlBar>
    </MediaController>
  )
}
