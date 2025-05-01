'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { LayoutGroup } from 'motion/react';

import { removeSongFromSetlist, updateSetlistSongs } from '@/actions/sanity';
import { PauseCard } from '@/components/PauseCard';
import { SongCard } from '@/components/SongCard';
import { usePlayerStore } from '@/store/store';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from 'react-icons/md';

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
    <div className='flex flex-col'>
    <LayoutGroup>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
        <SortableContext items={setlist.songs.map((s) => s._id)} strategy={verticalListSortingStrategy}>
          {setlist.songs.map((item, index) => (
            <ReorderableSongCard key={index} song={item} setlist={setlist} removeFromSetlistFn={() => removeFromSetlistFn(item)} />
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
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const isSelected = selectedSong?._id === song._id;
  let selectedStyle = isSelected ? 'bg-rosePine-overlay' : 'bg-transparent';
  return (
    <div ref={setNodeRef} {...attributes} style={style} className={`flex items-center ${selectedStyle}`}>
      <div {...listeners} className="ml-2 flex h-10 w-8 touch-none items-center">
        <MdDragIndicator className="h-6 w-6 pl-2" />
      </div>
      <div className='flex-1'>
      {song.title?.startsWith('Pauze') ? <PauseCard removeFromSetlistFn={removeFromSetlistFn} /> : <SongCard song={song} playlist={setlist.songs} removeFromSetlistFn={removeFromSetlistFn} />}
      </div>
    </div>
  );
};
