'use client';

import { addPause } from '@/actions/sanity';
import { SetlistType, SongType } from '@/lib/interface';
import { MdAdd } from 'react-icons/md';
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
    <div className={'mx-4'}>
      <button
        onClick={() => {
          const pause = { _id: uuidv4(), title: `Pauze in ${setlist._id}`, _type: 'pause' } as SongType;
          addToSetlistFn(pause);
        }}
        className={`flex items-center gap-2 rounded-xl border border-rosePine-highlightMed bg-rosePine-base p-2 drop-shadow-lg`}
      >
        <span className={'text-xs'}>Pauze</span>
        <MdAdd className={'h-6 w-6 text-rosePine-love'} />
      </button>
    </div>
  );
};
