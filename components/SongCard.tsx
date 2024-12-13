import { SongType } from '@/lib/interface';
import { motion } from 'framer-motion';
import React from 'react';
import { EllipsisVerticalIcon } from '@sanity/icons';
import { usePlayerStore, useSongDetailStore } from '@/store/store';

interface SongCardProps {
  song: SongType;
}

export const SongCard = ({ song }: SongCardProps) => {
  const selectedSong = usePlayerStore(state => state.currentSong);
  const setSelectedSong = usePlayerStore(state => state.setCurrentSong);
  const isSelected = selectedSong?.title === song.title;

  const setSongDetail = useSongDetailStore(state => state.setSong);

  return (
    <motion.div
      className={`flex flex-col grow gap-1 px-3 py-0 rounded-xl ${isSelected ? 'bg-rosePine-overlay' : 'bg-transparent'}`}>
      <div className={'flex flex-row justify-between items-center'}>
        <motion.div
          layout
          className={`flex flex-row items-center cursor-pointer`}
          onClick={() => setSelectedSong(song)}
          transition={{ duration: 0.2 }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.1, easings: 'easeInOut' }
          }}
        >
          <img src={song.artwork} alt={song.title}
               className={`w-16 h-16 m-1 p-1 mr-2 ${isSelected ? 'border border-rosePine-gold' : 'border-0'}`} />
          <div className={'mr-6'}>
            <h1
              className={`${isSelected ? 'font-extrabold text-rosePine-gold' : 'text-rosePine-text font-bold'}`}>{song.title}</h1>
            <h2
              className={`text-sm ${isSelected ? 'font-bold text-rosePine-gold' : 'text-rosePine-text font-normal'}`}>{song.artist}</h2>
          </div>
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
          onMouseDown={() => setSongDetail(song)}
        >
          <EllipsisVerticalIcon className={'w-6 h-8'} />
        </motion.div>
      </div>
    </motion.div>
  );
};

