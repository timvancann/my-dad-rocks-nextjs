"use client";

import {SongType} from "@/lib/interface";
import {motion, AnimatePresence, LayoutGroup} from "framer-motion";
import {urlFor} from "@/lib/sanity";
import {ChatBubbleBottomCenterIcon, EllipsisVerticalIcon} from "@heroicons/react/16/solid";
import React from "react";
import {CheckCircleIcon, MinusCircleIcon, PlusCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";

export const Songs = ({songs}: { songs: SongType[] }) => {
  return (
    <div className={"flex  bg-rosePine-base mx-auto text-rosePine-text max-w-xl flex-col gap-1 items-center justify-center"}>
      <ul>
        <LayoutGroup>
          {
            songs.map((item, index) => (
              <React.Fragment key={index}>
                <li>
                  <SongCard song={item}/>
                </li>
                <li>
                  <Divider/>
                </li>
              </React.Fragment>
            ))
          }
        </LayoutGroup>
      </ul>
    </div>

  )
}

const SongCard = ({song}: { song: SongType }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={"flex flex-col gap-1"}>
      <div className={"flex flex-row justify-between items-center z-10"}>
        <motion.div
          layout
          className={"flex flex-row items-center w-full cursor-pointer"}
          initial={{
            opacity: 0.8,
          }}
          transition={{
            duration: 0.2
          }}
          whileHover={{
            scale: 1.01,
            opacity: 1,
            transition: {
              duration: 0.1,
              easings: "easeInOut"
            }
          }}
          whileTap={{
            scale: 0.99,
            transition: {
              duration: 0.1,
              easings: "easeInOut"
            }
          }}
        >
          <img src={urlFor(song.cover_art).url()} alt={song.title} className={"w-20 h-20 p-2"}/>
          <div className={"flex flex-col flex-grow"}>
            <h1 className={"flex font-bold"}>{song.title}</h1>
            <h2 className={"flex text-sm"}>{song.artist}</h2>
          </div>
        </motion.div>
        <motion.div
          whileHover={{
            rotate: "180deg",
            transition: {
              duration: 0.125,
              easings: "easeInOut"
            }
          }}
          whileTap={{
            scale: 0.9,
            transition: {
              duration: 0.125,
              easings: "easeInOut"
            }
          }}
          onMouseDown={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ?
            <XMarkIcon className={"w-8 h-8"}/>
            :
            <EllipsisVerticalIcon className={"w-8 h-8"}/>
          }
        </motion.div>
      </div>
      <SongExtra isExpanded={isExpanded} song={song}/>
    </div>
  )
}

const SongExtra = ({song, isExpanded}: { song: SongType, isExpanded: boolean }) => {
  return (<AnimatePresence>
      {isExpanded && <motion.div
        className={"flex flex-col gap-6 justify-end items-end pb-4 bg-gradient-to-b from-rosePine-base to-rosePine-surface/70"}
        initial={{
          opacity: 0,
          y: -40,
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        exit={{
          opacity: 0,
          y: -40
        }}
        transition={{
          duration: 0.25,
          easings: "easeInOut",
        }}
      >
        <p className={"text-xs tracking-[0.2rem] -mt-2 font-light"}>{song.last_played_at || "never played"}</p>
        <SongExtraItem icon={<ChatBubbleBottomCenterIcon className={"w-6 h-6"}/>} text={"Lyrics"}/>
        <SongExtraItem icon={<PlusCircleIcon className={"w-6 h-6"}/>} text={"Add to playlist"}/>
        <SongExtraItem icon={<MinusCircleIcon className={"w-6 h-6"}/>} text={"Remove from playlist"}/>
        <SongExtraItem icon={<CheckCircleIcon className={"w-6 h-6"}/>} text={"Mark played"}/>
      </motion.div>}
    </AnimatePresence>

  )
}

const SongExtraItem = ({icon, text}: { icon: React.ReactNode, text: string }) => {
  return (
    <div className={"flex flex-row gap-4 text-rosePine-text/80"}>
      <p className={"font-semibold text-sm"}> {text} </p>
      {icon}
    </div>
  )
}


const Divider = () => {
  return <div className={"flex bg-rosePine-overlay h-[1px] w-5/6"}/>
}
