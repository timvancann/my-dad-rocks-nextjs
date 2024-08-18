"use client";

import {SongType} from "@/lib/interface";
import {usePlaylistContext} from "@/context/playlist-context";
import {LayoutGroup, motion} from "framer-motion";
import {TrashIcon} from "@sanity/icons";
import {FullDivider} from "@/components/Divider";
import React from "react";
import {SongCard} from "@/components/SongCard";
import {updateSetlistSongs} from "@/actions/sanity";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {MdDragIndicator} from "react-icons/md";
import {SongsTitle} from "@/components/PlaylistTitle";
import {PauseCard} from "@/components/PauseCard";


export const PlayList = () => {
  const {playlist, setPlaylist, setlistId} = usePlaylistContext();

  const getSongIndex = (id: UniqueIdentifier) => {
    return playlist.findIndex(song => song.id === id);
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over) return;
    if (active.id == over.id) return;
    const updatedPlaylist = arrayMove(playlist, getSongIndex(active.id), getSongIndex(over.id));
    setPlaylist(updatedPlaylist);
    await updateSetlistSongs(updatedPlaylist, setlistId);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {}),
    useSensor(TouchSensor, {}),
  )

  return (
    <div className={"text-rosePine-text items-center justify-center p-2"}>
      <PlaylistHeader/>
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
          <SortableContext items={playlist} strategy={verticalListSortingStrategy}>
            {playlist.map((item, index) => (
              <ReorderableSongCard song={item} key={item._id}/>
            ))}
          </SortableContext>
        </DndContext>
      </LayoutGroup>
      {playlist.length > 0 && <FullDivider/>}
    </div>
  );
}

const ReorderableSongCard = ({song}: { song: SongType }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition
  } = useSortable({id: song.id});

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }
  return <div ref={setNodeRef}
              {...attributes}
              style={style}
              className={"flex flex-row grow items-center"}>
    <MdDragIndicator
      {...listeners}
      className="w-6- h-6 touch-none"
    />
    {song.title?.startsWith("Pauze") ? <PauseCard pause={song}/> : <SongCard song={song}/>}
  </div>
}

const PlaylistHeader = () => {
  const {playlist, setPlaylist, setlistId} = usePlaylistContext();
  return (
    <div className={"flex flex-row w-full justify-between mb-3"}>
      <SongsTitle title={"Playlist"}/>
      {playlist.length > 0 && <motion.button
        className={"border border-rosePine-muted/60 rounded-full px-2 flex flex-row items-center justify-center tracking-wide bg-rosePine-highlightMed/50 hover:bg-rosePine-foam hover:text-rosePineDawn-text transition-colors"}
        whileHover={{scale: 1.1,}}
        whileTap={{scale: 0.9,}}
        onClick={() => {
          setPlaylist([]);
          updateSetlistSongs([], setlistId)
        }}
      ><TrashIcon className={"h-6 w-6 "}/></motion.button>}
    </div>
  )
}

