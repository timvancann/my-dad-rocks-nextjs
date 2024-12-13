'use client';
import { PlayerMini } from '@/components/PlayerMini';
import { Navbar } from '@/components/Navbar';
import { SongDetailCard } from '@/components/SongDetailCard';
import React from 'react';
import { useSongDetailStore } from '@/store/store';

export const Footer = () => {
  const song = useSongDetailStore(state => state.song)
  return (
    <>
      <Navbar />
      <PlayerMini/>
      {song && <SongDetailCard song={song}/>}
    </>
  );
};
