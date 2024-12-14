'use client';

import { SongType } from '@/lib/interface';
import { LayoutGroup } from 'framer-motion';
import React, { useEffect } from 'react';
import { SongCard } from '@/components/SongCard';
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
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from 'react-icons/md';
import { PauseCard } from '@/components/PauseCard';
import { useSongDetailStore } from '@/store/store';
import { Divider } from '@/components/Divider';

export const Setlist = () => {
  let setlist = useSongDetailStore(state => state.setlist);
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(TouchSensor, {}));

  const getSongIndex = (id: UniqueIdentifier) => {
    return setlist.songs.findIndex((song) => song.id === id);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id == over.id) return;
    const moved = arrayMove(setlist.songs, getSongIndex(active.id), getSongIndex(over.id));
    setSetlist({ ...setlist, songs: moved });
    // await updateSetlistSongs(updatedPlaylist, setlist._id);
  };


  return (
    <div className={'text-rosePine-text items-center justify-center p-2'}>
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
          <SortableContext items={setlist.songs} strategy={verticalListSortingStrategy}>
            {setlist.songs.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Divider />}
                <ReorderableSongCard song={item} />
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
};
const ReorderableSongCard = ({ song }: ReorderableSongCardProps) => {
  const setlist = useSongDetailStore(state => state.setlist);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id });

  if (!setlist) return null;


  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style} className={'flex flex-row grow items-center'}>
      <MdDragIndicator {...listeners} className="w-6- h-6 touch-none" />
      {song.title?.startsWith('Pauze') ? <PauseCard pause={song} /> : <SongCard song={song} playlist={setlist.songs} />}
    </div>
  );
};

