"use client";

import {usePlaylistContext} from "@/context/playlist-context";
import {addPause} from "@/actions/sanity";
import React, {useEffect} from "react";
import {motion} from "framer-motion";
import {useFormState, useFormStatus} from "react-dom";
import {v4 as uuidv4} from 'uuid';


const initialState = {
  message: "",
  payload: null
}

const SubmitButton = () => {
  const {pending} = useFormStatus()
  return <motion.button
    className={`flex bg-rosePine-button text-rosePine-text p-2 rounded-lg bg-rosePine-highlightMed px-4 ${pending ? "cursor-not-allowed opacity-50" : "cursor-pointer"} text-center justify-center items-center`}
    whileHover={{
      scale: 1.02,
      transition: {duration: 0.1, easings: "easeInOut"}
    }}
    whileTap={{
      scale: 0.98,
      transition: {duration: 0.1, easings: "easeInOut"}
    }}
    animate={{opacity: 1}}
    transition={{duration: 0.2}}
    disabled={pending}
    type={"submit"}
  >
    {pending ? "Adding pause..." : "Add Pause"}
  </motion.button>
}

export const AddPause = ({gigId}: { gigId: string }) => {
  const {setlistId, setPlaylist, playlist} = usePlaylistContext();
  const [state, action] = useFormState(addPause, {message: "", songs: playlist})

  return <form className={""}
               action={(data) => {
                 // add song with data.id to playlist
                 const id = data.get("id") as string;
                 const updatedPlaylist = [...playlist, {id: id, _id: id, title: "Pauze"}]
                 setPlaylist(updatedPlaylist)
                 action(data)
               }}
  >
    <input type="hidden" name="id" value={uuidv4()}/>
    <input type="hidden" name="setlistId" value={setlistId}/>
    <input type="hidden" name="gigId" value={gigId}/>
    <SubmitButton/>
  </form>
}
