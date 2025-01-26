'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { LayoutGroup } from 'motion/react';

import React, { useEffect, useState } from 'react';
import { SongCard } from '@/components/SongCard';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from 'react-icons/md';
import { PauseCard } from '@/components/PauseCard';
import { Divider } from '@/components/Divider';
import { removeSongFromSetlist, updateSetlistSongs } from '@/actions/sanity';

type SetlistProps = {
  setlist: SetlistType;
  removeSong: (song: SongType) => void;
  updateSongsInSetlist: (songs: SongType[]) => void;
};

export const Setlist = ({ setlist, removeSong, updateSongsInSetlist }: SetlistProps) => {
  const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(TouchSensor, {}));

  const removeFromSetlistFn = async (song: SongType) => {
    removeSong(song);
    removeSongFromSetlist(setlist, song);
  };

  const getSongIndex = (id: UniqueIdentifier) => {
    return setlist.songs.findIndex((song) => song._id === id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id == over.id) return;

    const moved = arrayMove(setlist.songs, getSongIndex(active.id), getSongIndex(over.id));
    updateSongsInSetlist(moved);
    updateSetlistSongs(moved, setlist._id);
  };

  return (
    <div className={'text-rosePine-text items-center justify-center p-2'}>
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
          <SortableContext items={setlist.songs.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            {setlist.songs.map((item, index) => (
              <div key={index}>
                {index > 0 && <Divider />}
                <ReorderableSongCard song={item} setlist={setlist} removeFromSetlistFn={() => removeFromSetlistFn(item)} />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </LayoutGroup>
    </div>
  );
};

type ReorderableSongCardProps = {
  song: SongType;
  setlist: SetlistType;
  removeFromSetlistFn: () => void;
};
const ReorderableSongCard = ({ song, setlist, removeFromSetlistFn }: ReorderableSongCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song._id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style} className={'flex flex-row grow items-center'}>
      <MdDragIndicator {...listeners} className="w-6 h-6 touch-none" />
      {song.title?.startsWith('Pauze') ? <PauseCard removeFromSetlistFn={removeFromSetlistFn} /> : <SongCard song={song} playlist={setlist.songs} removeFromSetlistFn={removeFromSetlistFn} />}
    </div>
  );
};
