'use client';

import React, { useEffect, useState } from 'react';
import { TrackCard } from '@/components/TrackCard';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { LayoutGroup } from 'motion/react';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MdDragIndicator } from 'react-icons/md';
import { PauseCard } from '@/components/PauseCard';
import { CSS } from '@dnd-kit/utilities';
import { Setlist, Track } from '@payload-types';
import { Divider } from './Divider';
import { UPDATE_SETLISTS } from '@/queries/updateSetlist';
import { DocumentNode, useMutation } from '@apollo/client';

interface TracklistProps {
  setlist: Setlist;
  refetch: DocumentNode[]
}

export type SetlistItem = {
  itemType: 'track' | 'break';
  id: string;
  track: Track;
  notes?: string;
};

export const Tracklist = ({ setlist, refetch }: TracklistProps) => {
  const sensors = useSensors(useSensor(PointerSensor, {}), useSensor(TouchSensor, {}));

  const getSongIndex = (lst: { id?: string | null }[], id: UniqueIdentifier) => {
    return lst.findIndex((item) => {
      return item.id === id;
    });
  };

  const [updateSetlist] = useMutation(UPDATE_SETLISTS, {
    refetchQueries: refetch
  })

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id == over.id) return;
    if (setlist.items == null) return;

    const moved = arrayMove(setlist.items, getSongIndex(setlist.items, active.id), getSongIndex(setlist.items, over.id));

    updateSetlist({
      variables: {
        id: setlist.id,
        items: moved.map((item) => {
          return { id: item.id, itemType: item.itemType };
        })
      }
    });
  };

  const removeFromSetlist = (id: string) => {
    const filtered = setlist.items?.filter((item) => item.id !== id);

    updateSetlist({
      variables: {
        id: setlist.id,
        items: filtered?.map((item) => {
          return { id: item.id, itemType: item.itemType };
        })
      }
    });
  };

  return (
    <div className={'text-rosePine-text items-center justify-center p-2'}>
      <LayoutGroup>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          sensors={sensors} id="builder-dnd">
          <SortableContext
            items={setlist.items as SetlistItem[]}
            strategy={verticalListSortingStrategy}>
            {(setlist.items as SetlistItem[])?.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Divider />}
                <ReorderableSongCard
                  setlistItem={item}
                  playlist={setlist.items as SetlistItem[]}
                  removeFromSetlist={() => removeFromSetlist(item.id)} />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </LayoutGroup>
    </div>
  );
};

type ReorderableSongCardProps = {
  setlistItem: SetlistItem;
  playlist: SetlistItem[];
  removeFromSetlist: () => void;
};

const ReorderableSongCard = ({ setlistItem, playlist, removeFromSetlist }: ReorderableSongCardProps) => {
  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({ id: setlistItem.id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={'flex flex-row grow items-center'}>
      <MdDragIndicator {...listeners} className="w-6- h-6 touch-none" />
      {setlistItem.itemType === 'track' ? (
        <TrackCard track={setlistItem.track} playlist={playlist.filter(i => i.itemType === "track").map(i => i.track)
        } removeFromSetlist={removeFromSetlist} />
      ) : (
        <PauseCard id={setlistItem.id} removeFromSetlist={removeFromSetlist} />
      )}
    </div>
  );
};
