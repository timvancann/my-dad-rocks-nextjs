'use client';

import { SongType } from '@/lib/interface';
import React from 'react';
import { usePlaylistContext } from '@/context/playlist-context';
import { removePause, removePauseFromPlaylist, updateSetlistSongs } from '@/actions/sanity';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@sanity/icons';
import { useFormState, useFormStatus } from 'react-dom';

export const PauseCard = ({ pause }: { pause: SongType }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div className={`flex flex-col grow gap-1 px-3 py-0 rounded-xl "bg-transparent"}`}>
      <div className={'flex flex-row justify-between items-center'}>
        <motion.div
          layout
          className={`flex flex-row items-center cursor-pointer`}
          initial={{ opacity: 0.75 }}
          transition={{ duration: 0.2 }}
          whileHover={{
            scale: 1.02,
            opacity: 1,
            transition: { duration: 0.1, easings: 'easeInOut' }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1, easings: 'easeInOut' }
          }}
        >
          Pause
        </motion.div>
        <motion.div
          whileHover={{
            rotate: '180deg',
            transition: { duration: 0.125, easings: 'easeInOut' }
          }}
          whileTap={{
            scale: 0.9,
            transition: { duration: 0.125, easings: 'easeInOut' }
          }}
          onMouseDown={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <XMarkIcon className={'w-8 h-8'} /> : <EllipsisVerticalIcon className={'w-8 h-8'} />}
        </motion.div>
      </div>
      <PauseExtra isExpanded={isExpanded} setIsExpanded={setIsExpanded} song={pause} />
    </motion.div>
  );
};

const Button = () => {
  const { pending } = useFormStatus();
  return (
    <motion.button className={'py-2 text-rosePine-text/80'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={pending} type={'submit'}>
      <SongExtraItem icon={<MinusCircleIcon className={'w-6 h-6'} />} text={'Remove from playlist'} />
    </motion.button>
  );
};
const PauseExtra = ({ song, isExpanded, setIsExpanded }: { song: SongType; isExpanded: boolean; setIsExpanded: React.Dispatch<boolean> }) => {
  const { playlist, setPlaylist, setlistId } = usePlaylistContext();
  const [state, action] = useFormState(removePauseFromPlaylist, playlist);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className={'flex flex-col gap-2 justify-end items-end my-2 w-full px-2 py-2'}
          initial={{ opacity: 1, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.125, easings: 'easeInOut' }}
        >
          <form
            action={(data) => {
              const updatedList = playlist.filter((item) => item._id !== song._id);
              setPlaylist(updatedList);
              setIsExpanded(false);
              action(data);
            }}
          >
            <input type="hidden" name="setlistId" value={setlistId} />
            <input type="hidden" name="songId" value={song._id} />
            <Button />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SongExtraItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  return (
    <div className={'flex flex-row gap-4 items-center justify-end'}>
      <p className={'font-semibold text-sm'}> {text} </p>
      <span>{icon}</span>
    </div>
  );
};
