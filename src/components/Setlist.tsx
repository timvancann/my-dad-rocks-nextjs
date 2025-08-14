'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { LayoutGroup } from 'motion/react';

import { removeSongFromSetlist, updateSetlistSongs } from '@/actions/supabase';
import { SongCard } from '@/components/SongCard';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Coffee, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MdDragIndicator } from 'react-icons/md';

type SetlistProps = {
  setlist: SetlistType;
  removeSong: (song: SongType) => void;
  updateSongsInSetlist: (songs: SongType[]) => void;
  onAddSong?: () => void;
};

export const Setlist = ({ setlist, removeSong, updateSongsInSetlist, onAddSong }: SetlistProps) => {
  const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(TouchSensor, {}));

  const removeFromSetlistFn = async (song: SongType) => {
    removeSong(song);
    removeSongFromSetlist(setlist._id, song._id);
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
    updateSetlistSongs(setlist._id, moved);
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Add Song Button */}
      {onAddSong && (
        <div className="mb-3">
          <Button
            onClick={onAddSong}
            className={`w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-gray-200`}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nummer toevoegen
          </Button>
        </div>
      )}
      
      <LayoutGroup>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors} id="builder-dnd">
          <SortableContext items={setlist.songs.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            {setlist.songs.map((item, index) =>
              (item as any)._type === 'pause' ? (
                <ReorderablePauseCard key={index} song={item} setlist={setlist} removeFromSetlistFn={() => removeFromSetlistFn(item)} />
              ) : (
                <ReorderableSongCard key={index} song={item} setlist={setlist} removeFromSetlistFn={() => removeFromSetlistFn(item)} />
              )
            )}
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
  const positionInSetlist = setlist.songs.findIndex((s) => s._id === song._id);
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className={`relative rounded-lg shadow-lg ${isSelected ? THEME.cardActive : THEME.card} overflow-hidden border transition-all ${isSelected ? 'border-red-900/30' : 'border-zinc-800/30'}`}
    >
      {isSelected && <div className="absolute right-0 top-0 -mr-12 -mt-12 h-24 w-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/5 blur-xl"></div>}
      <div className="relative flex items-center p-1">
        <div {...listeners} className="ml-1 mr-3 flex touch-none flex-col gap-3 text-center text-gray-600">
          <div className={`h-4 w-5 rounded-full ${THEME.highlight} text-xs ${THEME.text}`}>{positionInSetlist + 1}</div>
          <GripVertical className="h-4 w-4" />
        </div>
        <SongCard song={song} playlist={setlist.songs} removeFromSetlistFn={removeFromSetlistFn} />
      </div>
    </div>
  );
};
const ReorderablePauseCard = ({ song, setlist, removeFromSetlistFn }: ReorderableSongCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song._id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style} className={`flex cursor-default items-center`}>
      <div {...listeners} className="ml-2 flex h-10 w-8 touch-none items-center">
        <MdDragIndicator className="h-6 w-6 pl-2" />
      </div>
      <div className="flex-1 justify-between">
        <div className="flex rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
          <div className="flex grow items-center">
            <div className="mr-3 rounded-md bg-zinc-800/80 p-2">
              <Coffee className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">Break Time</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Drinken, stemmen, genieten.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-800/40" onClick={removeFromSetlistFn}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
