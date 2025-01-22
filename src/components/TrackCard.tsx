'use client';
import React from 'react';
import { usePlayerStore } from '@/store/store';
import { usePlaylistPlayer } from '@/hooks/useAudioTime';
import { Track } from '@payload-types';
import { SongDetailDrawer } from '@/components/Drawer';
import { TrackCoverArt } from '@/components/TrackCoverArt';
import { SetlistItem } from './Tracklist';

interface SongCardProps {
  track: Track;
  playlist: Track[];
  addToSetlist?: () => void;
  removeFromSetlist?: () => void;
}

export const TrackCard = ({ track, playlist, removeFromSetlist, addToSetlist }: SongCardProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSelectedSong = usePlayerStore((state) => state.setCurrentSong);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);

  const isSelected = selectedSong && selectedSong?.id === track.id;

  const { playTrack } = usePlaylistPlayer();

  return (
    <div className={`flex flex-col grow gap-1 my-1 p-1 rounded-xl ${isSelected ? 'bg-rosePine-red' : 'bg-transparent'}`}>
      <div className={'flex flex-row justify-between items-center'}>
        <div
          className={`flex flex-1 items-center cursor-pointer`}
          onClick={() => {
            playTrack(track);
            setSelectedSong(track);
            setPlaylist(playlist)
          }}
        >
          <TrackCoverArt track={track} className={`mr-2 ${isSelected ? 'border border-rosePine-gold' : 'border-0'}`} />
          <ArtistTitle track={track} isSelected={isSelected || false} />
        </div>
        <SongDetailDrawer track={track} removeFromSetlist={removeFromSetlist} addToSetlist={addToSetlist} />
      </div>
    </div >
  );
};

type ArtistTitleProps = {
  track: Track;
  isSelected: boolean;
};
const ArtistTitle = ({ track, isSelected }: ArtistTitleProps) => {
  return (
    <div className={'mr-6 flex-1'}>
      <h1 className={`${isSelected ? 'font-extrabold text-rosePine-gold' : 'text-rosePine-text font-bold'}`}>{track.title}</h1>
      <h2 className={`text-sm ${isSelected ? 'font-bold text-rosePine-gold' : 'text-rosePine-text font-normal'}`}>{track.artist}</h2>
    </div>
  );
};
