'use client';

import { addPause } from '@/actions/sanity';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSongDetailStore } from '@/store/store';
import { SetlistType, SongType } from '@/lib/interface';
import { PendingIcon } from '@/components/PendingIcon';
import { MdAdd, MdSend } from 'react-icons/md';

export const AddPause = ({ gigId }: { gigId: string }) => {
  const setlist = useSongDetailStore(state => state.setlist);
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const [state, action] = useFormState(addPause, { message: '', songs: setlist?.songs || [] });


  if (!setlist) return null;

  return (
    <div className={"mx-4" }>
      <form
        className={''}
        action={(data) => {
          const id = data.get('id') as string;
          const playlist = [...setlist.songs, { _id: id, title: 'Pauze' } as SongType];
          const updatedSetlist = { ...setlist, songs: playlist } as SetlistType;
          action(data);
          setSetlist(updatedSetlist);
        }}
      >
        <input type="hidden" name="id" value={uuidv4()} />
        <input type="hidden" name="setlistId" value={setlist._id} />
        <input type="hidden" name="gigId" value={gigId} />
        <SubmitButton />
      </form>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type={'submit'}
      disabled={pending}
      className={`flex bg-rosePine-base rounded-xl p-2 drop-shadow-lg items-center gap-2 border border-rosePine-highlightMed`}>
      {pending ? <PendingIcon />
        : <>
          <span className={'text-xs'}>Pauze</span>
          <MdAdd className={'h-6 w-6 text-rosePine-love'} />
        </>
      }
    </button>
  );
};
