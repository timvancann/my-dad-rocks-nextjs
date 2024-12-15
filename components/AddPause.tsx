'use client';

import { addPause } from '@/actions/sanity';
import React from 'react';
import { motion } from 'framer-motion';
import { useFormState, useFormStatus } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSongDetailStore } from '@/store/store';

const initialState = {
  message: '',
  payload: null
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <motion.button
      className={`flex bg-rosePine-button text-rosePine-text p-2 rounded-lg bg-rosePine-highlightMed px-4 ${pending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-center justify-center items-center`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.1, easings: 'easeInOut' }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1, easings: 'easeInOut' }
      }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      disabled={pending}
      type={'submit'}
    >
      {pending ? 'Adding pause...' : 'Add Pause'}
    </motion.button>
  );
};

export const AddPause = ({ gigId }: { gigId: string }) => {
  const setlist = useSongDetailStore(state => state.setlist);
  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const [state, action] = useFormState(addPause, { message: '', songs: setlist?.songs || [] });

  if (!setlist) return null;

  return (
    <form
      className={''}
      action={(data) => {
        const id = data.get('id') as string;
        const updatedPlaylist = { ...setlist, ...{ id: id, _id: id, title: 'Pauze' } };
        setSetlist(updatedPlaylist);
        action(data);
      }}
    >
      <input type="hidden" name="id" value={uuidv4()} />
      <input type="hidden" name="setlistId" value={setlist._id} />
      <input type="hidden" name="gigId" value={gigId} />
      <SubmitButton />
    </form>
  );
};
