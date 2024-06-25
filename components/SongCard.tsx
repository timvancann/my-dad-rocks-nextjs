"use client";

import {SongType} from "@/lib/interface";
import {motion, AnimatePresence, LayoutGroup} from "framer-motion";
import {urlFor} from "@/lib/sanity";
import {ChatBubbleBottomCenterIcon, EllipsisVerticalIcon} from "@heroicons/react/16/solid";
import React from "react";
import {MinusCircleIcon, PlusCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useSelectedSongContext} from "@/context/selected-song-context";
import {usePlaylistContext} from "@/context/playlist-context";
import {FullDivider} from "@/components/Divider";
import {TrashIcon} from "@sanity/icons";

export const SongList = ({songs, isSetlist, title}: { songs: SongType[], isSetlist: boolean, title: string }) => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (
    <div className={"flex flex-col mx-auto text-rosePine-text items-center justify-center p-2"}>
      <div className={"flex flex-row w-full justify-between mb-3"}>
        <h1
          className={"flex text-left self-start uppercase tracking-widest font-light text-xl text-rosePine-gold m-2"}>{title}</h1>
        {isSetlist && playlist.length> 0 && <motion.button
          className={"border border-rosePine-muted/60 rounded-full px-2 flex flex-row items-center justify-center tracking-wide bg-rosePine-highlightMed/50 hover:bg-rosePine-foam hover:text-rosePineDawn-text transition-colors"}
          whileHover={{scale: 1.1,}}
          whileTap={{scale: 0.9,}}
          onClick={() => setPlaylist([])}
        ><TrashIcon className={"h-6 w-6 "}/></motion.button>}
      </div>
      <ul>
        <LayoutGroup>
          {
            songs.map((item, index) => (
              <React.Fragment key={index}>
                {(isSetlist || !playlist.includes(item)) &&
                  <li>
                    <SongCard song={item}/>
                  </li>
                }
              </React.Fragment>
            ))
          }
        </LayoutGroup>
      </ul>
      {isSetlist && playlist.length > 0 && <FullDivider/>}
    </div>

  )
}

const SongCard = ({song}: { song: SongType }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {selectedSong, setSelectedSong} = useSelectedSongContext();

  const isSelected = selectedSong?.title === song.title;

  return (
    <div
      className={`flex flex-col gap-1 px-3 py-0 min-w-[400px] rounded-xl ${isSelected ? "bg-rosePine-base/75" : "bg-transparent"}`}>
      <div className={"flex flex-row justify-between items-center z-10"}>
        <motion.div
          layout
          className={`flex flex-row items-center w-full cursor-pointer `}
          onClick={() => setSelectedSong(song)}
          initial={{
            opacity: 0.75,
          }}
          transition={{
            duration: 0.2
          }}
          whileHover={{
            scale: 1.02,
            opacity: 1,
            transition: {
              duration: 0.1,
              easings: "easeInOut"
            }
          }}
          whileTap={{
            scale: 0.98,
            transition: {
              duration: 0.1,
              easings: "easeInOut"
            }
          }}
        >
          <img src={urlFor(song.cover_art).url()} alt={song.title}
               className={`w-16 h-16 m-1 p-1 mr-4 ${isSelected ? "border border-rosePine-gold" : "border-0"}`}/>
          <div className={"flex flex-col flex-grow mr-10"}>
            <h1
              className={`flex ${isSelected ? "font-extrabold text-rosePine-gold" : "text-rosePine-text font-bold"}`}>{song.title}</h1>
            <h2
              className={`flex text-sm ${isSelected ? "font-bold text-rosePine-gold" : "text-rosePine-text font-normal"}`}>{song.artist}</h2>
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
      <SongExtra isExpanded={isExpanded} setIsExpanded={setIsExpanded} song={song}/>
    </div>
  )
}

const SongExtra = ({song, isExpanded, setIsExpanded}: {
  song: SongType,
  isExpanded: boolean,
  setIsExpanded: React.Dispatch<boolean>
}) => {
  const {playlist, setPlaylist} = usePlaylistContext();
  return (<AnimatePresence>
      {isExpanded && <motion.div
        className={"flex flex-col gap-2 justify-end items-end my-2 w-full px-2 py-2"}
        initial={{opacity: 1, y: -100,}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: -100,}}
        transition={{duration: 0.125, easings: "easeInOut",}}
      >
        <p className={"text-xs tracking-[0.2rem] -mt-2 font-light"}>{song.last_played_at || "never played"}</p>
        <motion.a href={`/lyrics/${song._id}`} className={"py-2 text-rosePine-text/80"}
                  whileHover={{scale: 1.1,}}
                  whileTap={{scale: 0.9,}}
        >
          <SongExtraItem icon={<ChatBubbleBottomCenterIcon className={"w-6 h-6"}/>} text={"Lyrics"}/>
        </motion.a>
        {!playlist.includes(song) &&
          <motion.button className={"py-2 text-rosePine-text/80"}
                         whileHover={{scale: 1.1,}}
                         whileTap={{scale: 0.9,}}
                         onClick={() => {
                           if (playlist.includes(song)) {
                             return
                           }
                           setPlaylist([...playlist, song])
                           setIsExpanded(false)
                         }}
          >
            <SongExtraItem icon={<PlusCircleIcon className={"w-6 h-6"}/>} text={"Add to playlist"}/>
          </motion.button>
        }
        {playlist.includes(song) &&
          <motion.button className={"py-2 text-rosePine-text/80"}
                         whileHover={{scale: 1.1,}}
                         whileTap={{scale: 0.9,}}
                         onClick={() => {
                           setPlaylist(playlist.filter((item) => item.title !== song.title));
                           setIsExpanded(false)
                         }}
          >
            <SongExtraItem icon={<MinusCircleIcon className={"w-6 h-6"}/>} text={"Remove from playlist"}/>
          </motion.button>
        }
        {/*<SongExtraItem icon={<CheckCircleIcon className={"w-6 h-6"}/>} text={"Mark played"}/>*/}
      </motion.div>}
    </AnimatePresence>

  )
}

const SongExtraItem = ({
                         icon, text
                       }: {
  icon: React.ReactNode, text
    :
    string
}) => {
  return (
    <div className={"flex flex-row gap-4"}>
      <p className={"font-semibold text-sm"}> {text} </p>
      {icon}
    </div>
  )
}
