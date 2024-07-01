"use client";

import {SongType} from "@/lib/interface";
import {usePlaylistContext} from "@/context/playlist-context";
import {LayoutGroup, motion, Reorder, useDragControls} from "framer-motion";
import {TrashIcon} from "@sanity/icons";
import {FullDivider} from "@/components/Divider";
import React from "react";
import {SongCard} from "@/components/SongCard";
import {updateSetlistSongs} from "@/actions/sanity";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor, TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext, useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {MdDragIndicator} from "react-icons/md";


export const PlayList = () => {
  const {playlist, setPlaylist, setlistId} = usePlaylistContext();

  const getSongIndex = (id: UniqueIdentifier) => {
    return playlist.findIndex(song => song._id === id);
  }

  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over) return;
    if (active.id == over.id) return;
    setPlaylist((items) => {
      const originalPosition = getSongIndex(active.id);
      const newPosition = getSongIndex(over?.id);
      let newOrder = arrayMove(items, originalPosition, newPosition);
      updateSetlistSongs(newOrder, setlistId);
      return newOrder
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {}),
    useSensor(TouchSensor, {}),
  )

  return (
    <div className={"text-rosePine-text items-center justify-center p-2"}>
      <PlaylistHeader/>
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
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
    <SongCard song={song}/>
  </div>
}

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

const SongsTitle = ({
                      title
                    }: {
  title: string
}) => {
  return (
    <h1
      className={"flex text-left self-start uppercase tracking-widest font-light text-xl text-rosePine-gold m-2"}>{title}</h1>
  )
}
