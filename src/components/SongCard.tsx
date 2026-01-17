'use client';

import { SongType } from '@/lib/interface';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { Clock, Headphones, Mic, StickyNote, UserMinus } from 'lucide-react';
import { useState, useRef } from 'react';
import { TbGuitarPickFilled } from 'react-icons/tb';
import { SongMenu } from './SongMenu';

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
  const isChangingSong = usePlayerStore((state) => state.isChangingSong);
  const [showNotes, setShowNotes] = useState(false);
  const lastClickTime = useRef(0);

  const isSelected = selectedSong?._id === song._id;
  const isLoading = isSelected && isChangingSong;

  return (
    <div className="w-full">
      <div className={'flex grow items-center justify-between'}>
        <div
          className="flex grow cursor-pointer"
          onClick={() => {
            // Debounce rapid clicks
            const now = Date.now();
            if (now - lastClickTime.current < 150) {
              return;
            }
            lastClickTime.current = now;

            // Don't allow clicking during transitions
            if (isChangingSong) {
              return;
            }

            const currentIndex = playlist.findIndex((s) => s._id === song._id);
            setPlaylist(playlist);
            setSongIndex(currentIndex);
          }}
        >
          <div className="relative mr-3 p-1">
            {isSelected && <div className="absolute -inset-0.5 z-0 rounded-full border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black"></div>}
            <img 
              src={song.artwork} 
              alt={song.title} 
              className={`relative z-10 h-14 w-14 ${isSelected ? 'rounded-full ring-1 ring-red-500/30' : 'rounded-md'} ${isLoading ? 'opacity-50' : ''} transition-opacity`} 
            />
            {/* Center hole of vinyl for playing song */}
            {isSelected && !isLoading && <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>}
            {/* Loading spinner for current song */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex-1 grow">
            <h3 className={`truncate font-semibold ${isSelected ? THEME.primary : ''}`}>{song.title}</h3>
            <p className={`truncate text-xs ${THEME.textSecondary}`}>{song.artist}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="flex gap-1.5">
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
                {song.canPlayWithoutSinger && (
                  <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                    <UserMinus className="h-3 w-3 text-cyan-400" />
                  </div>
                )}
                {(song.stemCount ?? 0) > 0 && (
                  <div className={`flex items-center gap-1 ${THEME.highlight} rounded-full p-1 text-xs`}>
                    <Headphones className="h-3 w-3 text-purple-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`flex items-center gap-0.5 whitespace-nowrap text-xs ${THEME.textSecondary}`}>
            <Clock className="h-3 w-3" /> {new Date(song.duration * 1000).toISOString().slice(15, 19)}
          </span>
          <div className="mt-1">
            <SongMenu 
              song={song} 
              removeFromSetlistFn={removeFromSetlistFn} 
              addToSetlistFn={addToSetlistFn}
              onShowNotes={() => setShowNotes(!showNotes)}
            />
          </div>
        </div>
      </div>
      {/* Notes expansion */}
      {showNotes && song.notes && (
        <div className={`mt-2 p-3 rounded-md ${THEME.highlight} border ${THEME.border} text-sm ${THEME.text}`}>
          <div className="flex items-start gap-2">
            <StickyNote className={`h-4 w-4 ${THEME.secondary} mt-0.5 shrink-0`} />
            <p className="whitespace-pre-wrap">{song.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};