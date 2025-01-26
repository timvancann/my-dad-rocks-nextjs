'use client';

import { SongType } from '@/lib/interface';
import React from 'react';
import { usePlayerStore } from '@/store/store';
import { SongDetailDrawer } from '@/components/Drawer';
import { usePlaylistPlayer } from '@/hooks/useAudioTime';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
  removeFromSetlistFn?: () => void
  addToSetlistFn?: () => void
}

export const SongCard = ({ song, playlist, removeFromSetlistFn, addToSetlistFn }: SongCardProps) => {
  const selectedSong = usePlayerStore(state => state.currentSong);
  const setSelectedSong = usePlayerStore(state => state.setCurrentSong);
  const setPlaylist = usePlayerStore(state => state.setPlaylist);

  const isSelected = selectedSong?.title === song.title;

  const { playTrack } = usePlaylistPlayer();


  return (
    <div
      className={`flex flex-col grow gap-1 px-3 py-0 rounded-xl ${isSelected ? 'bg-rosePine-overlay' : 'bg-transparent'}`}>
      <div className={'flex flex-row justify-between items-center'}>
        <div
          className={`flex flex-row items-center cursor-pointer`}
          onClick={() => {
            playTrack(song);
            setSelectedSong(song);
            setPlaylist(playlist);
          }}
        >
          <img src={`${song.artwork}?h=64`}
            alt={song.title}
            className={`w-16 h-16 m-1 p-1 mr-2 ${isSelected ? 'border border-rosePine-gold' : 'border-0'}`} />
          <div className={'mr-6'}>
            <h1
              className={`${isSelected ? 'font-extrabold text-rosePine-gold' : 'text-rosePine-text font-bold'}`}>{song.title}</h1>
            <h2
              className={`text-sm ${isSelected ? 'font-bold text-rosePine-gold' : 'text-rosePine-text font-normal'}`}>{song.artist}</h2>
          </div>
        </div>
        <SongDetailDrawer song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
      </div>
    </div>
  );
};

