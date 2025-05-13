'use client';

import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { Clock, Mic } from 'lucide-react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { SongDetailDrawer } from './Drawer';

interface SongCardProps {
  song: SongType;
  playlist: SongType[];
  removeFromSetlistFn?: () => void;
  addToSetlistFn?: () => void;
}

export const SongCard = ({ song, playlist, removeFromSetlistFn, addToSetlistFn }: SongCardProps) => {
  const selectedSong = usePlayerStore((state) => state.currentSong);
  const setSongIndex = usePlayerStore((state) => state.setSongIndex);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);

  const isSelected = selectedSong?._id === song._id;

  return (
    <div className={'flex grow items-center justify-between'}>
      <div
        className="flex grow cursor-pointer"
        onClick={() => {
          const currentIndex = playlist.findIndex((s) => s._id === song._id);
          setPlaylist(playlist);
          setSongIndex(currentIndex);
        }}
      >
        <div className="relative mr-3 p-1">
          {isSelected && <div className="absolute -inset-0.5 z-0 rounded-full border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black"></div>}
          <img src={song.artwork} alt={song.title} className={`relative z-10 h-14 w-14 ${isSelected ? 'rounded-full ring-1 ring-red-500/30' : 'rounded-md'}`} />
          {/* Center hole of vinyl for playing song */}
          {isSelected && <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>}
        </div>
        <div className="flex-1 grow">
          <h3 className={`truncate font-semibold ${isSelected ? THEME.primary : ''}`}>{song.title}</h3>
          <p className={`truncate text-xs ${THEME.textSecondary}`}>{song.artist}</p>
          <div className="flex items-center">
            <div className="mt-1 flex gap-1.5">
              {song.dualGuitar && (
                <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                  <TbGuitarPickFilled className={`h-3 w-3 ${THEME.primary}`} />
                </div>
              )}
              {song.dualVocal && (
                <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                  <Mic className={`h-3 w-3 ${THEME.secondary}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="ml-1 flex items-center gap-0.5 whitespace-nowrap text-xs text-gray-500">
          <Clock className="h-3 w-3" /> {new Date(song.duration * 1000).toISOString().slice(15, 19)}
        </span>
        <div className="mt-4 flex justify-end rounded-full text-gray-500">
          <SongDetailDrawer song={song} removeFromSetlistFn={removeFromSetlistFn} addToSetlistFn={addToSetlistFn} />
        </div>
      </div>
    </div>
  );
};
