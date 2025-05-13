'use client';

import { useAudioTime, usePlaylistPlayer } from '@/hooks/useAudioTime';
import { usePlayerStore } from '@/store/store';
import { THEME } from '@/themes';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
export const PlayerMini = () => {
  const selectedSong = usePlayerStore((state) => state.currentSong);

  const { previousTrack, nextTrack, playPauseTrack, paused, duration, isLoading } = usePlaylistPlayer();

  const [progress, setProgress] = useState('0%');
  const time = useAudioTime();

  useEffect(() => {
    if (duration > 0) {
      setProgress((time / duration) * 100 + '%');
    }
  }, [time, duration]);

  if (!selectedSong) return null;

  return (
    <div className={`fixed bottom-16 left-0 right-0 ${THEME.card} border-t backdrop-blur-xl ${THEME.border} z-40 p-2.5 shadow-lg`}>
      <div className="flex items-center">
        <div className="relative mr-2.5">
          {/* Vinyl-inspired animation for album */}
          <div className="absolute -inset-[1px] animate-spin rounded-full bg-gradient-to-br from-amber-500 to-red-800" style={{ animationDuration: '5s' }}></div>
          <div className="absolute left-1/2 top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>
          <img src={selectedSong.artwork} alt="Now Playing" className="relative z-10 h-12 w-12 animate-spin rounded-full border-2 border-zinc-800" style={{ animationDuration: '15s' }} />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-700 bg-zinc-900"></div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-medium">{selectedSong.title}</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className={`truncate text-xs ${THEME.textSecondary}`}>{selectedSong.artist}</p>
            <p className="text-xs text-gray-500">
              {new Date(time * 1000).toISOString().slice(15, 19)} / {new Date(duration * 1000).toISOString().slice(15, 19)}
            </p>
          </div>
          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-600 to-amber-500" style={{ width: progress }}></div>
          </div>
        </div>
        <div className="ml-3 flex items-center space-x-3">
          <button className="p-1.5" onClick={previousTrack}>
            <SkipBack className="h-5 w-5" />
          </button>
          <button className={`${THEME.primaryBg} rounded-full p-1.5 text-white shadow-lg shadow-red-900/30`} onClick={playPauseTrack}>
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button className="p-1.5" onClick={nextTrack}>
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
