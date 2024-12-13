'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { LayoutGroup } from 'framer-motion';
import React from 'react';
import { SongCard } from '@/components/SongCard';
import { updateSetlistSongs } from '@/actions/sanity';
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
import { SongCardDivider } from '@/components/SongCardDivider';

type PlaylistProps = {
  setlist: SetlistType;
};

export const Setlist = ({ setlist }: PlaylistProps) => {
  useSongDetailStore(state => state.setSetlist)(setlist);

  const [playlist, setPlaylist] = React.useState<SongType[]>(setlist.songs);
  const getSongIndex = (id: UniqueIdentifier) => {
    return playlist.findIndex((song) => song.id === id);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id == over.id) return;
    const updatedPlaylist = arrayMove(playlist, getSongIndex(active.id), getSongIndex(over.id));
    setPlaylist(updatedPlaylist);
    await updateSetlistSongs(updatedPlaylist, setlist._id);
  };

  const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(TouchSensor, {}));

  return (
    <div className={'text-rosePine-text items-center justify-center p-2'}>
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
          <SortableContext items={playlist} strategy={verticalListSortingStrategy}>
            {playlist.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <SongCardDivider />}
                <ReorderableSongCard song={item} playlist={playlist} />
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
  playlist: SongType[];
};
const ReorderableSongCard = ({ song, playlist }: ReorderableSongCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style} className={'flex flex-row grow items-center'}>
      <MdDragIndicator {...listeners} className="w-6- h-6 touch-none" />
      {song.title?.startsWith('Pauze') ? <PauseCard pause={song} /> : <SongCard song={song} playlist={playlist} />}
    </div>
  );
};

