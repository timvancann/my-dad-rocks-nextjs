'use client';

import { addPause } from '@/actions/sanity';
import { SetlistType, SongType } from '@/lib/interface';
import { THEME } from '@/themes';
import { Coffee } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type AddPauseProps = {
  setlist: SetlistType;
  addSong: (song: SongType) => void;
};

export const AddPause = ({ setlist, addSong }: AddPauseProps) => {
  const addToSetlistFn = async (song: SongType) => {
    addSong(song);
    addPause(song, setlist);
  };

  return (
    <button
      onClick={() => {
        const pause = { _id: uuidv4(), title: `Pauze in ${setlist._id}`, _type: 'pause' } as SongType;
        addToSetlistFn(pause);
      }}
      className={`my-2 flex shrink items-center gap-1 rounded px-2 py-1 ${THEME.highlight} text-sm`}
    >
      <Coffee className={`h-4 w-4 ${THEME.secondary}`} />
      <span className={THEME.secondary}>Pauze toevoegen</span>
    </button>
  );
};
