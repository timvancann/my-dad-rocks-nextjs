import { SetlistType, SongType } from '@/lib/interface';
import { motion } from 'framer-motion';
import React from 'react';
import { usePlayerStore, useSongDetailStore } from '@/store/store';
import { SongDetailDrawer } from '@/components/Drawer';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
}

export const SongCard = ({ song, playlist }: SongCardProps) => {
  const selectedSong = usePlayerStore(state => state.currentSong);
  const setSelectedSong = usePlayerStore(state => state.setCurrentSong);
  const setlist = useSongDetailStore(state => state.setlist);
  const setPlaylist = usePlayerStore(state => state.setPlaylist);

  const setSetlist = useSongDetailStore(state => state.setSetlist);
  const isSelected = selectedSong?.title === song.title;

  return (
    <div
      className={`flex flex-col grow gap-1 px-3 py-0 rounded-xl ${isSelected ? 'bg-rosePine-overlay' : 'bg-transparent'}`}>
      <div className={'flex flex-row justify-between items-center'}>
        <div
          className={`flex flex-row items-center cursor-pointer`}
          onClick={() => {
            setSelectedSong(song);
            setPlaylist(playlist);
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
        </div>
        <SongDetailDrawer song={song} setSetlist={setSetlist} setlist={setlist} />
      </div>
    </div>
  );
};

