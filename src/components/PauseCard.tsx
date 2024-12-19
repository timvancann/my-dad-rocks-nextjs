'use client';

import { SongType } from '@/lib/interface';
import React, { useActionState } from 'react';
import { removePauseFromPlaylist } from '@/actions/sanity';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFormStatus } from 'react-dom';
import { useSongDetailStore } from '@/store/store';
import { PendingIcon } from '@/components/PendingIcon';
import { MdAdd } from 'react-icons/md';

export const PauseCard = ({ pause }: { pause: SongType }) => {
  const setlist = useSongDetailStore(state => state.setlist);
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const [state, action] = useActionState(removePauseFromPlaylist, setlist?.songs || []);

  if (!setlist) return null;

  return (
    <div className={`flex flex-col grow gap-1 px-3 my-2 py-0 rounded-xl`}>
      <div className={'flex flex-row justify-between items-center'}>
        <div className={`flex flex-row items-center cursor-pointer ml-2`}>
          Pause
        </div>
        <form
          action={(data) => {
            const updatedList = setlist.songs.filter((item) => item._id !== pause._id);
            setSetlist({ ...setlist, songs: updatedList });
            action(data);
          }}
        >
          <input type="hidden" name="setlistId" value={setlist._id} />
          <input type="hidden" name="songId" value={pause._id} />
          <SubmitButton/>
        </form>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type={'submit'}
      disabled={pending}
      className={`flex bg-rosePine-base rounded-xl p-1 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed`}>
      {pending ? <PendingIcon />
        : <>
          <XMarkIcon className={'h-4 w-4 text-rosePine-love'} />
        </>
      }
    </button>
  );
};
