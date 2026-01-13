'use client';

import { SetlistType, SongType } from '@/lib/interface';
import { THEME } from '@/themes';
import { Coffee } from 'lucide-react';
import { useAddSetlistItem } from '@/hooks/convex';
import type { Id } from '../../convex/_generated/dataModel';

type AddPauseProps = {
  setlist: SetlistType;
  addSong: (song: SongType) => void;
};

export const AddPause = ({ setlist, addSong }: AddPauseProps) => {
  const addSetlistItem = useAddSetlistItem();

  const addToSetlistFn = async () => {
    // Create a pause item for local state
    const pause = {
      _id: `pause-${Date.now()}`,
      title: `Pauze`,
      _type: 'pause'
    } as SongType;

    // Update local state immediately
    addSong(pause);

    // Add to Convex if setlist has an ID
    if (setlist._id) {
      try {
        await addSetlistItem({
          setlistId: setlist._id as Id<'setlists'>,
          itemType: 'pause',
          position: setlist.songs.length,
        });
      } catch (error) {
        console.error('Error adding pause to setlist:', error);
      }
    }
  };

  return (
    <button
      onClick={addToSetlistFn}
      className={`my-2 flex shrink items-center gap-1 rounded px-2 py-1 ${THEME.highlight} text-sm`}
    >
      <Coffee className={`h-4 w-4 ${THEME.secondary}`} />
      <span className={THEME.secondary}>Pauze toevoegen</span>
    </button>
  );
};
